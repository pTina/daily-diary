import { DayCell } from '@/features/calendar/components/DayCell';
import { useMonthMatrix } from '@/features/calendar/hooks/useMonthMatrix';
import { layoutWeekSpans, type WeekSpan } from '@/features/calendar/utils/layoutWeekSpans';
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
const MAX_LANES = 3;
const BAR_HEIGHT = 20;
const BAR_GAP = 4;
const COMPACT_BAR = 16;
const COMPACT_GAP = 2;

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
      <div className="flex min-h-0 flex-1 flex-col border-l border-t border-line">
        {weeks.map((week) => (
          <WeekRow
            key={week[0]?.date}
            week={week}
            tasks={tasks}
            groups={groups}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

function WeekRow({
  week,
  tasks,
  groups,
  compact,
}: {
  week: { date: string; inMonth: boolean }[];
  tasks: TaskInstance[];
  groups: Group[];
  compact: boolean;
}) {
  const openTaskForm = useUiStore((state) => state.openTaskForm);
  const spans = layoutWeekSpans(week, tasks);
  const visible = spans.filter((span) => span.lane < MAX_LANES);
  const hidden = spans.filter((span) => span.lane >= MAX_LANES);
  const overflowByCol = week.map((_, col) =>
    hidden.filter((span) => col >= span.startCol && col < span.startCol + span.dayCount).length,
  );
  const barSize = compact ? COMPACT_BAR : BAR_HEIGHT;
  const barGap = compact ? COMPACT_GAP : BAR_GAP;

  return (
    <div className="relative grid min-h-0 flex-1 grid-cols-7">
      {week.map((cell) => (
        <DayCell key={cell.date} cell={cell} />
      ))}
      <div className="pointer-events-none absolute inset-x-0 top-9 bottom-1 lg:top-10">
        {visible.map((span) => {
          const group = groups.find((item) => item.id === span.task.groupId);
          const color = group?.color ?? '#D8B4D6';
          return (
            <button
              key={span.key}
              type="button"
              className={`pointer-events-auto absolute flex items-center overflow-hidden px-1 ${
                span.task.done ? 'bg-[#EEF0F3] text-faint line-through' : 'text-ink'
              }`}
              style={{
                left: `calc(${(span.startCol / 7) * 100}% + 4px)`,
                width: `calc(${(span.dayCount / 7) * 100}% - 8px)`,
                top: span.lane * (barSize + barGap),
                height: barSize,
                borderRadius: 999,
                backgroundColor: span.task.done ? undefined : color,
                fontSize: compact ? 8 : 9,
                lineHeight: '12px',
              }}
              title={span.task.title}
              onClick={(event) => {
                event.stopPropagation();
                openTaskForm(span.task.sourceId, span.task.spanStart);
              }}
            >
              <SpanLabel span={span} />
            </button>
          );
        })}
        {overflowByCol.map((count, col) =>
          count > 0 ? (
            <span
              key={`overflow-${week[col]?.date}`}
              className="absolute truncate px-1 text-[11px] text-faint"
              style={{
                left: `calc(${(col / 7) * 100}% + 4px)`,
                width: `calc(${100 / 7}% - 8px)`,
                top: MAX_LANES * (barSize + barGap),
              }}
            >
              +{count}
            </span>
          ) : null,
        )}
      </div>
    </div>
  );
}

function SpanLabel({ span }: { span: WeekSpan }) {
  return <span className="truncate">{span.task.title}</span>;
}
