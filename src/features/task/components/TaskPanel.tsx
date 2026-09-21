import { GroupSection } from '@/features/task/components/GroupSection';
import { useTaskDnd } from '@/features/task/hooks/useTaskDnd';
import { sortTasks } from '@/features/task/utils/sortTasks';
import { formatPanelDate } from '@/shared/lib/dateUtils';
import type { Group } from '@/shared/types/group';
import { isHolidayGroup } from '@/shared/types/group';
import type { Task, TaskInstance } from '@/shared/types/task';
import { Button } from '@/shared/ui/Button';
import { DndContext, closestCenter } from '@dnd-kit/core';

type Props = {
  date: string;
  groups: Group[];
  sources: Task[];
  instances: TaskInstance[];
  groupFilters: Record<string, boolean>;
  onAdd: () => void;
  onOpen: (task: TaskInstance) => void;
  onToggle: (task: TaskInstance) => void;
  showAddButton?: boolean;
  embedded?: boolean;
};

export function TaskPanel({
  date,
  groups,
  sources,
  instances,
  groupFilters,
  onAdd,
  onOpen,
  onToggle,
  showAddButton = true,
  embedded = false,
}: Props) {
  const visibleGroups = groups.filter((group) => groupFilters[group.id] !== false);
  const grouped = Object.fromEntries(
    visibleGroups.map((group) => [
      group.id,
      sortTasks(instances.filter((task) => task.groupId === group.id && task.date === date)),
    ]),
  ) as Record<string, TaskInstance[]>;
  const { sensors, onDragEnd } = useTaskDnd(grouped, sources);
  const todos = visibleGroups.flatMap((group) =>
    (grouped[group.id] ?? []).filter((task) => !isHolidayGroup(task.groupId)),
  );
  const total = todos.length;
  const done = todos.filter((task) => task.done).length;

  return (
    <aside className={embedded ? 'flex flex-col bg-paper' : 'flex h-full min-h-0 flex-col bg-paper'}>
      {embedded ? (
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-sm text-muted">
            {total}개 중 {done}개 완료
          </p>
          {showAddButton ? (
            <Button size="sm" variant="secondary" onClick={onAdd}>
              + 할 일 추가
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
          <div>
            <h2 className="text-lg font-semibold">{formatPanelDate(date)}</h2>
            <p className="mt-1 text-sm text-muted">
              {total}개 중 {done}개 완료
            </p>
          </div>
          {showAddButton ? (
            <Button size="sm" variant="secondary" className="hidden lg:inline-flex" onClick={onAdd}>
              + 할 일 추가
            </Button>
          ) : null}
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className={embedded ? '' : 'min-h-0 flex-1 overflow-y-auto px-5 pb-6'}>
          {visibleGroups.map((group, index) => (
            <div key={group.id} className={index === 0 ? '' : 'mt-6'}>
              <GroupSection
                group={group}
                tasks={grouped[group.id] ?? []}
                onOpen={onOpen}
                onToggle={onToggle}
              />
            </div>
          ))}
        </div>
      </DndContext>
    </aside>
  );
}
