import { addDays, addMonthsToDate, addYearsToDate, compareISODate, eachDayInclusive } from '@/shared/lib/dateUtils';
import { lunarToSolar } from '@/shared/lib/lunarCalendar';
import type { Task, TaskInstance } from '@/shared/types/task';

export function toInstance(
  task: Task,
  instanceDate = task.date,
  spanStart = instanceDate,
  spanEnd = instanceDate,
): TaskInstance {
  return {
    ...task,
    date: instanceDate,
    sourceId: task.id,
    instanceDate,
    instanceId: `${task.id}__${spanStart}__${instanceDate}`,
    isRecurring: Boolean(task.recurrence),
    spanStart,
    spanEnd,
  };
}

function spanLength(task: Task): number {
  if (!task.endDate || compareISODate(task.endDate, task.date) <= 0) return 1;
  return eachDayInclusive(task.date, task.endDate).length;
}

function spanInstances(task: Task, start: string, from: string, to: string): TaskInstance[] {
  const end = addDays(start, spanLength(task) - 1);
  return eachDayInclusive(start, end)
    .filter((day) => compareISODate(day, from) >= 0 && compareISODate(day, to) <= 0)
    .map((day) => toInstance(task, day, start, end));
}

export function expandRecurrence(task: Task, from: string, to: string): TaskInstance[] {
  if (!task.recurrence) {
    return spanInstances(task, task.date, from, to);
  }

  if (task.calendar === 'lunar' && task.recurrence.freq === 'yearly' && task.lunar) {
    return expandLunarYearly(task, from, to);
  }

  const instances: TaskInstance[] = [];
  const until =
    task.recurrence.until && compareISODate(task.recurrence.until, task.date) >= 0
      ? task.recurrence.until
      : undefined;
  const exdates = new Set(task.recurrence.exdates ?? []);
  let cursor = task.date;
  let guard = 0;

  while (guard < 400) {
    if (until && compareISODate(cursor, until) > 0) break;
    if (compareISODate(cursor, to) > 0) break;
    if (!exdates.has(cursor)) {
      instances.push(...spanInstances(task, cursor, from, to));
    }
    cursor = nextOccurrence(cursor, task.recurrence.freq);
    guard += 1;
  }

  return instances;
}

export function expandAll(tasks: Task[], from: string, to: string): TaskInstance[] {
  return tasks.flatMap((task) => expandRecurrence(task, from, to));
}

function nextOccurrence(date: string, freq: NonNullable<Task['recurrence']>['freq']): string {
  if (freq === 'daily') return addDays(date, 1);
  if (freq === 'weekly') return addDays(date, 7);
  if (freq === 'yearly') return addYearsToDate(date, 1);
  return addMonthsToDate(date, 1);
}

function recurrenceUntil(task: Task): string | undefined {
  return task.recurrence?.until && compareISODate(task.recurrence.until, task.date) >= 0
    ? task.recurrence.until
    : undefined;
}

function expandLunarYearly(task: Task, from: string, to: string): TaskInstance[] {
  const lunar = task.lunar;
  if (!lunar) return spanInstances(task, task.date, from, to);

  const until = recurrenceUntil(task);
  const exdates = new Set(task.recurrence?.exdates ?? []);
  const fromYear = Number(from.slice(0, 4));
  const toYear = Number(to.slice(0, 4));
  const startYear = Number(task.date.slice(0, 4));
  const seen = new Set<string>();
  const instances: TaskInstance[] = [];

  const add = (solar: string | null) => {
    if (!solar || seen.has(solar)) return;
    if (compareISODate(solar, task.date) < 0) return;
    if (until && compareISODate(solar, until) > 0) return;
    seen.add(solar);
    if (exdates.has(solar)) return;
    instances.push(...spanInstances(task, solar, from, to));
  };

  add(task.date);
  for (let year = Math.min(startYear, fromYear) - 1; year <= toYear + 1; year += 1) {
    add(lunarToSolar(year, lunar));
  }
  return instances;
}
