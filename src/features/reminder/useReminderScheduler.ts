import { expandAll } from '@/features/task/utils/expandRecurrence';
import { addDays, combineDateTime, todayISO } from '@/shared/lib/dateUtils';
import { storage } from '@/shared/storage';
import { useTaskSources } from '@/features/task/hooks/useTasks';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => storage.getSettings(),
  });
}

export function useReminderScheduler() {
  const { data: tasks = [] } = useTaskSources();
  const { data: settings } = useSettings();

  useEffect(() => {
    if (!settings || Notification.permission !== 'granted') return;

    const tick = async () => {
      const from = todayISO();
      const to = addDays(from, 1);
      const instances = expandAll(tasks, from, to);
      const now = Date.now();
      const fired = new Set(settings.firedReminderKeys);
      let changed = false;

      for (const task of instances) {
        if (!task.reminder?.enabled || task.done) continue;
        const base = task.time
          ? combineDateTime(task.instanceDate, task.time)
          : combineDateTime(task.instanceDate, settings.defaultReminderTime);
        const fireAt = base.getTime() - task.reminder.offsetMin * 60 * 1000;
        const key = `${task.sourceId}:${task.instanceDate}:${fireAt}`;
        if (fired.has(key) || now < fireAt || now - fireAt > 60 * 1000) continue;

        new Notification(task.title, {
          body: task.time ? `${task.time} · 할 일 알림` : '종일 할 일 알림',
        });
        fired.add(key);
        changed = true;
      }

      if (changed) {
        await storage.writeSettings({
          ...settings,
          firedReminderKeys: [...fired].slice(-200),
        });
      }
    };

    void tick();
    const timer = window.setInterval(() => void tick(), 30_000);
    return () => window.clearInterval(timer);
  }, [settings, tasks]);
}
