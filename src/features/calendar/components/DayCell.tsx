import type { CalendarCell } from '@/features/calendar/hooks/useMonthMatrix';
import { parseISODate, todayISO } from '@/shared/lib/dateUtils';
import { useMediaQuery } from '@/shared/lib/useMediaQuery';
import { useUiStore } from '@/store/useUiStore';
import type { MouseEvent } from 'react';

export type DayHoliday = {
  title: string;
  sourceId: string;
  instanceDate: string;
};

type Props = {
  cell: CalendarCell;
  holiday?: DayHoliday | null;
};

export function DayCell({ cell, holiday = null }: Props) {
  const selectedDate = useUiStore((state) => state.selectedDate);
  const setSelectedDate = useUiStore((state) => state.setSelectedDate);
  const openDayPanel = useUiStore((state) => state.openDayPanel);
  const openTaskForm = useUiStore((state) => state.openTaskForm);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isToday = cell.date === todayISO();
  const selected = cell.date === selectedDate;
  const day = parseISODate(cell.date).getDate();
  const sunday = parseISODate(cell.date).getDay() === 0;
  const holidayDate = Boolean(holiday);

  const onHolidayClick = (event: MouseEvent<HTMLSpanElement>) => {
    if (!holiday) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedDate(cell.date);
    openTaskForm(holiday.sourceId, holiday.instanceDate);
  };

  return (
    <button
      type="button"
      onClick={() => {
        setSelectedDate(cell.date);
        openDayPanel();
      }}
      onDoubleClick={() => {
        if (!isDesktop) return;
        setSelectedDate(cell.date);
        openTaskForm();
      }}
      className={`flex min-h-[62px] flex-col border-r border-b border-line px-1.5 py-1.5 text-left transition-colors lg:min-h-0 lg:h-full lg:px-2 lg:py-2 ${
        selected ? 'ring-2 ring-accent ring-inset' : ''
      } ${cell.inMonth ? 'bg-paper/80' : 'bg-canvas/70'}`}
    >
      <span className="flex h-7 min-w-0 items-center gap-0.5">
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm tabular-nums ${
            isToday
              ? 'bg-accent font-semibold text-ink'
              : holidayDate || (cell.inMonth && sunday)
                ? 'text-sunday'
                : cell.inMonth
                  ? 'text-ink'
                  : 'text-faint'
          }`}
        >
          {day}
        </span>
        {holiday ? (
          <span
            className="min-w-0 truncate text-[10px] leading-none text-sunday"
            onClick={onHolidayClick}
          >
            {holiday.title}
          </span>
        ) : null}
      </span>
    </button>
  );
}
