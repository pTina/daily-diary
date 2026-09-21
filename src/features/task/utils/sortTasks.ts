import type { TaskInstance } from '@/shared/types/task';

export function sortTasks(tasks: TaskInstance[]): TaskInstance[] {
  return [...tasks].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    if (!a.time && b.time) return -1;
    if (a.time && !b.time) return 1;
    if (a.time && b.time && a.time !== b.time) return a.time.localeCompare(b.time);
    return a.title.localeCompare(b.title, 'ko');
  });
}

export function nextOrder(tasks: { order: number }[]): number {
  return tasks.reduce((max, task) => Math.max(max, task.order), -1) + 1;
}
