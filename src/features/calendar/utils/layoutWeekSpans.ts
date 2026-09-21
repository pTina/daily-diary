import type { CalendarCell } from '@/features/calendar/hooks/useMonthMatrix';
import { compareISODate } from '@/shared/lib/dateUtils';
import { isBirthdayGroup, isHolidayGroup } from '@/shared/types/group';
import type { TaskInstance } from '@/shared/types/task';

export type WeekSpan = {
  key: string;
  task: TaskInstance;
  lane: number;
  startCol: number;
  dayCount: number;
  continuesLeft: boolean;
  continuesRight: boolean;
};

export function layoutWeekSpans(week: CalendarCell[], tasks: TaskInstance[]): WeekSpan[] {
  const weekStart = week[0]?.date;
  const weekEnd = week[6]?.date;
  if (!weekStart || !weekEnd) return [];

  const unique = new Map<string, TaskInstance>();
  for (const task of tasks) {
    if (compareISODate(task.spanEnd, weekStart) < 0 || compareISODate(task.spanStart, weekEnd) > 0) continue;
    const key = `${task.sourceId}__${task.spanStart}`;
    if (!unique.has(key)) unique.set(key, task);
  }

  const items = [...unique.values()].sort((a, b) => {
    const rank = (task: TaskInstance) =>
      isBirthdayGroup(task.groupId) || isHolidayGroup(task.groupId) ? 0 : 1;
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    const startA = maxDate(a.spanStart, weekStart);
    const startB = maxDate(b.spanStart, weekStart);
    if (startA !== startB) return startA.localeCompare(startB);
    return b.spanEnd.localeCompare(a.spanEnd);
  });

  const laneEnds: string[] = [];
  const spans: WeekSpan[] = [];

  for (const task of items) {
    const start = maxDate(task.spanStart, weekStart);
    const end = minDate(task.spanEnd, weekEnd);
    const startCol = week.findIndex((cell) => cell.date === start);
    const endCol = week.findIndex((cell) => cell.date === end);
    if (startCol < 0 || endCol < 0) continue;

    let lane = laneEnds.findIndex((occupied) => occupied < start);
    if (lane < 0) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }

    spans.push({
      key: `${task.sourceId}__${task.spanStart}`,
      task,
      lane,
      startCol,
      dayCount: endCol - startCol + 1,
      continuesLeft: compareISODate(task.spanStart, weekStart) < 0,
      continuesRight: compareISODate(task.spanEnd, weekEnd) > 0,
    });
  }

  return spans;
}

function maxDate(a: string, b: string) {
  return compareISODate(a, b) >= 0 ? a : b;
}

function minDate(a: string, b: string) {
  return compareISODate(a, b) <= 0 ? a : b;
}
