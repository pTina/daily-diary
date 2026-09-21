import type { CalendarCell } from '@/features/calendar/hooks/useMonthMatrix';
import { parseISODate, todayISO } from '@/shared/lib/dateUtils';
import { useUiStore } from '@/store/useUiStore';

type Props = {
  cell: CalendarCell;
};

export function DayCell({ cell }: Props) {
  const selectedDate = useUiStore((state) => state.selectedDate);
  const setSelectedDate = useUiStore((state) => state.setSelectedDate);
  const openDayPanel = useUiStore((state) => state.openDayPanel);
  const isToday = cell.date === todayISO();
  const selected = cell.date === selectedDate;
  const day = parseISODate(cell.date).getDate();
  const sunday = parseISODate(cell.date).getDay() === 0;

  return (
    <button
      type="button"
      onClick={() => {
        setSelectedDate(cell.date);
        openDayPanel();
      }}
      className={`flex min-h-[62px] flex-col border-r border-b border-line px-1.5 py-1.5 text-left transition-colors lg:min-h-0 lg:h-full lg:px-2 lg:py-2 ${
        selected ? 'ring-2 ring-accent ring-inset' : ''
      } ${cell.inMonth ? 'bg-paper/80' : 'bg-canvas/70'}`}
    >
      <span className="flex h-7 items-center">
        <span
          className={`grid h-7 w-7 place-items-center rounded-full text-sm tabular-nums ${
            isToday
              ? 'bg-accent font-semibold text-ink'
              : cell.inMonth
                ? sunday
                  ? 'text-[#B56B6B]'
                  : 'text-ink'
                : 'text-faint'
          }`}
        >
          {day}
        </span>
      </span>
    </button>
  );
}
