import { requireUid } from '@/shared/lib/auth';
import { db } from '@/shared/lib/firebase';
import { DEFAULT_GROUPS, HOLIDAY_GROUP_ID, mergeDefaultGroups, type Group } from '@/shared/types/group';
import { DEFAULT_SETTINGS, type AppSettings } from '@/shared/types/settings';
import type { Task } from '@/shared/types/task';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import type { StorageAdapter } from './adapter';

const SETTINGS_DOC = 'app';

type Cache = {
  tasks: Task[] | null;
  groups: Group[] | null;
  settings: AppSettings | null;
};

const cache: Cache = {
  tasks: null,
  groups: null,
  settings: null,
};

function userRef() {
  return doc(db, 'users', requireUid());
}

function tasksCol() {
  return collection(userRef(), 'tasks');
}

function groupsCol() {
  return collection(userRef(), 'groups');
}

function settingsRef() {
  return doc(collection(userRef(), 'settings'), SETTINGS_DOC);
}

function omitUndefined<T>(value: T): T {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, omitUndefined(item)]),
  ) as T;
}

function sameJson(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function normalizeTask(task: Task): Task {
  if (!task.holiday) return task;
  const { holiday: _holiday, ...rest } = task;
  return { ...rest, groupId: HOLIDAY_GROUP_ID };
}

async function seedIfNeeded() {
  const hasDefaults = cache.groups
    ? DEFAULT_GROUPS.every((group) => cache.groups?.some((item) => item.id === group.id))
    : false;
  if (hasDefaults && cache.settings) return;

  const [groupSnap, settingsSnap] = await Promise.all([getDocs(groupsCol()), getDoc(settingsRef())]);

  if (groupSnap.empty) {
    const batch = writeBatch(db);
    DEFAULT_GROUPS.forEach((group) => {
      batch.set(doc(groupsCol(), group.id), group);
    });
    await batch.commit();
    cache.groups = DEFAULT_GROUPS;
  } else {
    const merged = mergeDefaultGroups(groupSnap.docs.map((item) => item.data() as Group));
    const missing = merged.filter((group) => !groupSnap.docs.some((item) => item.id === group.id));
    if (missing.length > 0) {
      const batch = writeBatch(db);
      missing.forEach((group) => {
        batch.set(doc(groupsCol(), group.id), group);
      });
      await batch.commit();
    }
    cache.groups = merged;
  }

  if (!settingsSnap.exists()) {
    await setDoc(settingsRef(), DEFAULT_SETTINGS);
    cache.settings = DEFAULT_SETTINGS;
  } else {
    cache.settings = { ...DEFAULT_SETTINGS, ...(settingsSnap.data() as AppSettings) };
  }
}

export const firestoreAdapter: StorageAdapter = {
  async listTasks() {
    if (cache.tasks) return cache.tasks;
    const snap = await getDocs(tasksCol());
    cache.tasks = snap.docs.map((item) => normalizeTask(item.data() as Task));
    return cache.tasks;
  },

  async writeTasks(tasks) {
    const previous = cache.tasks ?? (await firestoreAdapter.listTasks());
    const previousMap = new Map(previous.map((task) => [task.id, task]));
    const nextIds = new Set(tasks.map((task) => task.id));
    const batch = writeBatch(db);
    let writes = 0;

    tasks.forEach((task) => {
      const before = previousMap.get(task.id);
      if (before && sameJson(before, task)) return;
      batch.set(doc(tasksCol(), task.id), omitUndefined(task));
      writes += 1;
    });

    previous.forEach((task) => {
      if (nextIds.has(task.id)) return;
      batch.delete(doc(tasksCol(), task.id));
      writes += 1;
    });

    if (writes > 0) await batch.commit();
    cache.tasks = tasks;
  },

  async listGroups() {
    await seedIfNeeded();
    return cache.groups ?? DEFAULT_GROUPS;
  },

  async writeGroups(groups) {
    const batch = writeBatch(db);
    groups.forEach((group) => {
      batch.set(doc(groupsCol(), group.id), group);
    });
    await batch.commit();
    cache.groups = groups;
  },

  async getSettings() {
    await seedIfNeeded();
    return cache.settings ?? DEFAULT_SETTINGS;
  },

  async writeSettings(settings) {
    await setDoc(settingsRef(), settings);
    cache.settings = settings;
  },
};

export function subscribeUserData(onChange: () => void): Unsubscribe {
  const unsubs = [
    onSnapshot(tasksCol(), (snap) => {
      cache.tasks = snap.docs.map((item) => normalizeTask(item.data() as Task));
      onChange();
    }),
    onSnapshot(groupsCol(), (snap) => {
      if (!snap.empty) {
        cache.groups = mergeDefaultGroups(snap.docs.map((item) => item.data() as Group));
      }
      onChange();
    }),
    onSnapshot(settingsRef(), (snap) => {
      cache.settings = snap.exists()
        ? { ...DEFAULT_SETTINGS, ...(snap.data() as AppSettings) }
        : DEFAULT_SETTINGS;
      onChange();
    }),
  ];

  return () => unsubs.forEach((stop) => stop());
}

export function clearStorageCache() {
  cache.tasks = null;
  cache.groups = null;
  cache.settings = null;
}
