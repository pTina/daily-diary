export type AppSettings = {
  defaultReminderTime: string;
  firedReminderKeys: string[];
};

export const DEFAULT_SETTINGS: AppSettings = {
  defaultReminderTime: '09:00',
  firedReminderKeys: [],
};
