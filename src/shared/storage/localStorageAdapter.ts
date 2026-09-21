import { DEFAULT_GROUPS, HOLIDAY_GROUP_ID, mergeDefaultGroups } from '@/shared/types/group';
import { DEFAULT_SETTINGS, type AppSettings } from '@/shared/types/settings';
import type { Group } from '@/shared/types/group';
import type { Task } from '@/shared/types/task';
import type { StorageAdapter } from './adapter';

const KEYS = {
  tasks: 'diary:tasks',
  groups: 'diary:groups',
  version: 'diary:version',
  settings: 'diary:settings',
} as const;

const STORAGE_VERSION = '1';

const SEED_TASKS: Task[] = [
  { id: 't_close', title: '분기 마감 정리', groupId: 'g_work', date: '2026-09-21', done: false, order: 0 },
  { id: 't_weekly', title: '주간회의', groupId: 'g_work', date: '2026-09-21', time: '09:00', done: false, order: 1, reminder: { enabled: true, offsetMin: 10 } },
  { id: 't_dentist', title: '치과', groupId: 'g_personal', date: '2026-09-21', time: '14:00', done: false, order: 0 },
  { id: 't_parcel', title: '택배 발송', groupId: 'g_personal', date: '2026-09-21', done: true, order: 1 },
  { id: 't_standup', title: '스탠드업', groupId: 'g_work', date: '2026-09-22', time: '10:00', done: false, order: 0 },
  { id: 't_laundry', title: '빨래', groupId: 'g_personal', date: '2026-09-23', done: false, order: 0 },
  { id: 't_review', title: '코드 리뷰', groupId: 'g_work', date: '2026-09-24', time: '16:00', done: false, order: 0 },
  { id: 't_movie', title: '영화', groupId: 'g_personal', date: '2026-09-26', time: '19:30', done: false, order: 0 },
];

function readJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeTask(task: Task): Task {
  if (!task.holiday) return task;
  const { holiday: _holiday, ...rest } = task;
  return { ...rest, groupId: HOLIDAY_GROUP_ID };
}

function ensureSeeded() {
  if (!localStorage.getItem(KEYS.version)) {
    writeJson(KEYS.groups, DEFAULT_GROUPS);
    writeJson(KEYS.tasks, SEED_TASKS);
    writeJson(KEYS.settings, DEFAULT_SETTINGS);
    localStorage.setItem(KEYS.version, STORAGE_VERSION);
  }
}

export const localStorageAdapter: StorageAdapter = {
  async listTasks() {
    ensureSeeded();
    return (readJson<Task[]>(KEYS.tasks) ?? []).map(normalizeTask);
  },
  async writeTasks(tasks) {
    writeJson(KEYS.tasks, tasks);
  },
  async listGroups() {
    ensureSeeded();
    const merged = mergeDefaultGroups(readJson<Group[]>(KEYS.groups));
    writeJson(KEYS.groups, merged);
    return merged;
  },
  async writeGroups(groups) {
    writeJson(KEYS.groups, groups);
  },
  async getSettings() {
    ensureSeeded();
    return { ...DEFAULT_SETTINGS, ...readJson<AppSettings>(KEYS.settings) };
  },
  async writeSettings(settings) {
    writeJson(KEYS.settings, settings);
  },
};
