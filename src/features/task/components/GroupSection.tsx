import { TaskItem } from '@/features/task/components/TaskItem';
import type { Group } from '@/shared/types/group';
import type { TaskInstance } from '@/shared/types/task';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

type Props = {
  group: Group;
  tasks: TaskInstance[];
  onToggle: (task: TaskInstance) => void;
  onOpen: (task: TaskInstance) => void;
};

export function GroupSection({ group, tasks, onToggle, onOpen }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `group:${group.id}` });

  return (
    <section ref={setNodeRef} className={`rounded-xl ${isOver ? 'bg-canvas' : ''}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: group.color }} aria-hidden />
        <h3 className="text-sm font-medium text-ink">{group.name}</h3>
        <span className="text-sm text-faint">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((task) => task.instanceId)} strategy={verticalListSortingStrategy}>
        {tasks.length === 0 ? (
          <p className="px-1 py-3 text-sm text-faint">할 일이 없습니다</p>
        ) : (
          <div className="grid gap-1">
            {tasks.map((task) => (
              <TaskItem
                key={task.instanceId}
                task={task}
                group={group}
                onToggle={() => onToggle(task)}
                onOpen={() => onOpen(task)}
              />
            ))}
          </div>
        )}
      </SortableContext>
    </section>
  );
}
