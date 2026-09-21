import type { CalendarCell } from '@/features/calendar/hooks/useMonthMatrix';
import type { Group } from '@/shared/types/group';
import type { TaskInstance } from '@/shared/types/task';
import { parseISODate, todayISO } from '@/shared/lib/dateUtils';
import { useUiStore } from '@/store/useUiStore';
import { useEffect, useRef, useState } from 'react';

type Props = {
  cell: CalendarCell;
  tasks: TaskInstance[];
  groups: Group[];
  compact: boolean;
};

const BAR_HEIGHT = 20;
const GAP = 4;
const PLUS_HEIGHT = 16;
const THREE_WITH_PLUS = BAR_HEIGHT * 3 + GAP * 3 + PLUS_HEIGHT;

export function DayCell({ cell, tasks, groups, compact }: Props) {
  const selectedDate = useUiStore((state) => state.selectedDate);
  const setSelectedDate = useUiStore((state) => state.setSelectedDate);
  const listRef = useRef<HTMLSpanElement>(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const isToday = cell.date === todayISO();
  const selected = cell.date === selectedDate;
  const maxVisible = compact ? 3 : visibleCount;
  const visible = tasks.slice(0, maxVisible);
  const overflow = Math.max(0, tasks.length - visible.length);
  const day = parseISODate(cell.date).getDate();
  const sunday = parseISODate(cell.date).getDay() === 0;

  useEffect(() => {
    if (compact) return;
    const el = listRef.current;
    if (!el) return;

    const measure = () => {
      setVisibleCount(el.clientHeight < THREE_WITH_PLUS ? 1 : 3);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [compact]);

  return (
    <button
      type="button"
      onClick={() => setSelectedDate(cell.date)}
      className={`flex min-h-[62px] flex-col gap-1 border-r border-b border-line px-1.5 py-1.5 text-left transition-colors lg:min-h-0 lg:h-full lg:px-2 lg:py-2 ${
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
      <span ref={listRef} className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
        {visible.map((task) => {
          const group = groups.find((item) => item.id === task.groupId);
          return compact ? (
            <span
              key={task.instanceId}
              className={`h-1.5 shrink-0 rounded-full ${task.done ? 'opacity-40' : ''}`}
              style={{ backgroundColor: group?.color ?? '#D8B4D6' }}
              aria-hidden
            />
          ) : (
            <span
              key={task.instanceId}
              className={`shrink-0 truncate rounded px-1.5 py-0.5 text-[11px] leading-4 ${
                task.done ? 'bg-[#EEF0F3] text-faint line-through' : 'text-ink'
              }`}
              style={task.done ? undefined : { backgroundColor: group?.color ?? '#D8B4D6' }}
              title={task.title}
            >
              {task.title}
            </span>
          );
        })}
        {overflow > 0 ? <span className="shrink-0 text-[11px] text-faint">+{overflow}</span> : null}
      </span>
    </button>
  );
}
