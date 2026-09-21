import { DayCell } from '@/features/calendar/components/DayCell';
import { useMonthMatrix } from '@/features/calendar/hooks/useMonthMatrix';
import type { Group } from '@/shared/types/group';
import type { TaskInstance } from '@/shared/types/task';

type Props = {
  currentMonth: string;
  selectedDate: string;
  mode: 'month' | 'week';
  tasks: TaskInstance[];
  groups: Group[];
  compact: boolean;
};

export function MonthGrid({ currentMonth, selectedDate, mode, tasks, groups, compact }: Props) {
  const { weekdays, weeks } = useMonthMatrix(currentMonth, mode, selectedDate);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-paper">
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
