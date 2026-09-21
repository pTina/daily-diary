import type { Group } from '@/shared/types/group';
import type { AppSettings } from '@/shared/types/settings';
import type { Task } from '@/shared/types/task';

export type StorageAdapter = {
  listTasks: () => Promise<Task[]>;
  writeTasks: (tasks: Task[]) => Promise<void>;
  listGroups: () => Promise<Group[]>;
  writeGroups: (groups: Group[]) => Promise<void>;
  getSettings: () => Promise<AppSettings>;
  writeSettings: (settings: AppSettings) => Promise<void>;
};
