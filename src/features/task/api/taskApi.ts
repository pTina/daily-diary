import { addDays } from '@/shared/lib/dateUtils';
import { storage } from '@/shared/storage';
import { isHolidayGroup } from '@/shared/types/group';
import type { RecurrenceScope, Task, TaskDraft } from '@/shared/types/task';
import { nextOrder } from '../utils/sortTasks';

export const taskKeys = {
  all: ['tasks'] as const,
  range: (from: string, to: string) => ['tasks', { from, to }] as const,
};

export const taskApi = {
  list: () => storage.listTasks(),

  async create(draft: TaskDraft) {
    const tasks = await storage.listTasks();
    const groupTasks = tasks.filter((task) => task.groupId === draft.groupId);
    const task = fromDraft(crypto.randomUUID(), draft, nextOrder(groupTasks));
    await storage.writeTasks([...tasks, task]);
    return task;
  },

  async update(next: Task) {
    const tasks = await storage.listTasks();
    await storage.writeTasks(tasks.map((task) => (task.id === next.id ? next : task)));
    return next;
  },

  async remove(id: string) {
    const tasks = await storage.listTasks();
    await storage.writeTasks(tasks.filter((task) => task.id !== id));
  },

  async toggleDone(id: string) {
    const tasks = await storage.listTasks();
    const next = tasks.map((task) =>
      task.id === id && !isHolidayGroup(task.groupId) ? { ...task, done: !task.done } : task,
    );
    await storage.writeTasks(next);
    return next.find((task) => task.id === id);
  },

  async replaceAll(tasks: Task[]) {
    await storage.writeTasks(tasks);
    return tasks;
  },

  async applyEdit(source: Task, draft: TaskDraft, instanceDate: string, scope: RecurrenceScope) {
    const tasks = await storage.listTasks();
    const edited = { ...fromDraft(source.id, draft, source.order), done: source.done };

    if (!source.recurrence || scope === 'all') {
      await storage.writeTasks(
        tasks.map((task) =>
          task.id === source.id
            ? {
                ...edited,
                date: source.recurrence ? source.date : draft.date,
                recurrence:
                  source.recurrence && edited.recurrence
                    ? { ...edited.recurrence, exdates: source.recurrence.exdates }
                    : edited.recurrence,
              }
            : task,
        ),
      );
      return;
    }

    if (scope === 'this') {
      const updated = tasks.map((task) =>
        task.id === source.id
          ? {
              ...task,
              recurrence: {
                ...task.recurrence!,
                exdates: [...task.recurrence!.exdates, instanceDate],
              },
            }
          : task,
      );
      const detached = fromDraft(crypto.randomUUID(), { ...draft, recurrenceEnabled: false }, source.order);
      detached.date = instanceDate;
      await storage.writeTasks([...updated, detached]);
      return;
    }

    const split = splitFuture(source, instanceDate);
    const remainder = tasks.filter((task) => task.id !== source.id);
    const created = fromDraft(crypto.randomUUID(), draft, source.order);
    created.date = instanceDate;
    await storage.writeTasks(split ? [...remainder, split, created] : [...remainder, created]);
  },

  async applyDelete(source: Task, instanceDate: string, scope: RecurrenceScope) {
    const tasks = await storage.listTasks();

    if (!source.recurrence || scope === 'all') {
      await storage.writeTasks(tasks.filter((task) => task.id !== source.id));
      return;
    }

    if (scope === 'this') {
      await storage.writeTasks(
        tasks.map((task) =>
          task.id === source.id
            ? {
                ...task,
                recurrence: {
                  ...task.recurrence!,
                  exdates: [...task.recurrence!.exdates, instanceDate],
                },
              }
            : task,
        ),
      );
      return;
    }

    const split = splitFuture(source, instanceDate);
    const remainder = tasks.filter((task) => task.id !== source.id);
    await storage.writeTasks(split ? [...remainder, split] : remainder);
  },
};

function fromDraft(id: string, draft: TaskDraft, order: number): Task {
  return {
    id,
    title: draft.title.trim(),
    groupId: draft.groupId,
    date: draft.date,
    endDate: draft.endDate && draft.endDate > draft.date ? draft.endDate : undefined,
    time: draft.timeEnabled ? draft.time : undefined,
    done: false,
    order,
    recurrence: draft.recurrenceEnabled
      ? { freq: draft.freq, ...(draft.until ? { until: draft.until } : {}), exdates: [] }
      : undefined,
    reminder: draft.reminderEnabled ? { enabled: true, offsetMin: draft.offsetMin } : undefined,
    memo: draft.memo.trim() || undefined,
  };
}

function splitFuture(source: Task, instanceDate: string): Task | null {
  if (source.date === instanceDate) return null;
  return {
    ...source,
    recurrence: source.recurrence
      ? { ...source.recurrence, until: addDays(instanceDate, -1) }
      : undefined,
  };
}
