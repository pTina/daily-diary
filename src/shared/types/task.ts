export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type RecurrenceScope = 'this' | 'future' | 'all';

export type CalendarType = 'solar' | 'lunar';

export type LunarDate = {
  month: number;
  day: number;
  leap: boolean;
};

export type Task = {
  id: string;
  title: string;
  groupId: string;
  date: string;
  endDate?: string;
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
  holiday?: boolean;
  calendar?: CalendarType;
  lunar?: LunarDate;
};

export type TaskInstance = Task & {
  sourceId: string;
  instanceDate: string;
  instanceId: string;
  isRecurring: boolean;
  spanStart: string;
  spanEnd: string;
};

export type TaskDraft = {
  title: string;
  groupId: string;
  date: string;
  endDate: string;
  timeEnabled: boolean;
  time: string;
  recurrenceEnabled: boolean;
  freq: RecurrenceFreq;
  until: string;
  reminderEnabled: boolean;
  offsetMin: number;
  memo: string;
  calendar: CalendarType;
};
