import { addDays, addMonthsToDate, compareISODate } from '@/shared/lib/dateUtils';
import type { Task, TaskInstance } from '@/shared/types/task';

export function toInstance(task: Task, instanceDate = task.date): TaskInstance {
  return {
    ...task,
    date: instanceDate,
    sourceId: task.id,
    instanceDate,
    instanceId: `${task.id}__${instanceDate}`,
    isRecurring: Boolean(task.recurrence),
  };
}

export function expandRecurrence(task: Task, from: string, to: string): TaskInstance[] {
  if (!task.recurrence) {
    if (compareISODate(task.date, from) >= 0 && compareISODate(task.date, to) <= 0) {
      return [toInstance(task)];
    }
    return [];
  }

  const instances: TaskInstance[] = [];
  const until = task.recurrence.until && compareISODate(task.recurrence.until, to) < 0
    ? task.recurrence.until
    : to;
  const exdates = new Set(task.recurrence.exdates);
  let cursor = task.date;
  let guard = 0;

  while (compareISODate(cursor, until) <= 0 && guard < 400) {
    if (compareISODate(cursor, from) >= 0 && !exdates.has(cursor)) {
      instances.push(toInstance(task, cursor));
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
  return addMonthsToDate(date, 1);
}
