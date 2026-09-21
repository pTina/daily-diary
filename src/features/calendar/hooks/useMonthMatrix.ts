import {
  addDays,
  isSameMonth,
  startOfWeek,
  toISODate,
  weekdayLabels,
} from '@/shared/lib/dateUtils';

export type CalendarCell = {
  date: string;
  inMonth: boolean;
};

export function useMonthMatrix(currentMonth: string, mode: 'month' | 'week', selectedDate: string) {
  const weekdays = weekdayLabels();

  if (mode === 'week') {
    const start = startOfWeek(selectedDate);
    const week = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index);
      return { date, inMonth: isSameMonth(date, currentMonth) };
    });
    return { weekdays, weeks: [week] };
  }

  const first = `${currentMonth}-01`;
  const start = startOfWeek(first);
  const weeks: CalendarCell[][] = [];

  for (let cursor = 0; cursor < 42; cursor += 7) {
    const week = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, cursor + index);
      return { date, inMonth: isSameMonth(date, currentMonth) };
    });
    weeks.push(week);
    const last = week[6];
    const nextMonthStart = addMonthsStart(currentMonth);
    if (last.date >= nextMonthStart && weeks.length >= 5) break;
  }

  return { weekdays, weeks };
}

function addMonthsStart(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month, 1);
  return toISODate(date);
}
