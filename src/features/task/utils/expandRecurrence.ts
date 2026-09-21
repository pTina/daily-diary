import { addDays, addMonthsToDate, addYearsToDate, compareISODate, eachDayInclusive } from '@/shared/lib/dateUtils';
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
