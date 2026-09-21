import { DayCell } from '@/features/calendar/components/DayCell';
import { useMonthMatrix } from '@/features/calendar/hooks/useMonthMatrix';
import { addMonths } from '@/shared/lib/dateUtils';
import type { Group } from '@/shared/types/group';
import type { TaskInstance } from '@/shared/types/task';
import { useUiStore } from '@/store/useUiStore';
import { useRef, type MouseEvent, type PointerEvent } from 'react';

type Props = {
  currentMonth: string;
  selectedDate: string;
  mode: 'month' | 'week';
  tasks: TaskInstance[];
  groups: Group[];
  compact: boolean;
};

const SWIPE_THRESHOLD = 50;

export function MonthGrid({ currentMonth, selectedDate, mode, tasks, groups, compact }: Props) {
  const { weekdays, weeks } = useMonthMatrix(currentMonth, mode, selectedDate);
  const setCurrentMonth = useUiStore((state) => state.setCurrentMonth);
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    start.current = { x: event.clientX, y: event.clientY };
    swiped.current = false;
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;
    swiped.current = true;
    setCurrentMonth(addMonths(currentMonth, dx < 0 ? 1 : -1));
  };

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!swiped.current) return;
    event.preventDefault();
    event.stopPropagation();
    swiped.current = false;
  };

  return (
    <div
      className="flex min-h-0 flex-1 flex-col bg-paper touch-pan-y"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        start.current = null;
      }}
      onClickCapture={onClickCapture}
    >
      <div className="grid grid-cols-7 border-b border-line">
        {weekdays.map((label, index) => (
          <div
            key={label}
            className={`py-2 text-center text-xs font-medium ${index === 0 ? 'text-[#B56B6B]' : 'text-muted'}`}
          >
            {label}
          </div>
        ))}
      </div>
      <div
        className="grid min-h-0 flex-1 grid-cols-7 border-l border-t border-line"
        style={{ gridTemplateRows: `repeat(${weeks.length}, minmax(0, 1fr))` }}
      >
        {weeks.flatMap((week) =>
          week.map((cell) => (
            <DayCell
              key={cell.date}
              cell={cell}
              compact={compact}
              groups={groups}
              tasks={tasks.filter((task) => task.date === cell.date)}
            />
          )),
        )}
      </div>
    </div>
  );
}
