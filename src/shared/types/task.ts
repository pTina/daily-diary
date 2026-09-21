export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly';

export type RecurrenceScope = 'this' | 'future' | 'all';

export type Task = {
  id: string;
  title: string;
  groupId: string;
  date: string;
  time?: string;
  done: boolean;
  order: number;
  recurrence?: {
    freq: RecurrenceFreq;
    until?: string;
    exdates: string[];
  };
  reminder?: { enabled: boolean; offsetMin: number };
  memo?: string;
};

export type TaskInstance = Task & {
  sourceId: string;
  instanceDate: string;
  instanceId: string;
  isRecurring: boolean;
};

export type TaskDraft = {
  title: string;
  groupId: string;
  date: string;
  timeEnabled: boolean;
  time: string;
  recurrenceEnabled: boolean;
  freq: RecurrenceFreq;
  until: string;
  reminderEnabled: boolean;
  offsetMin: number;
  memo: string;
};
