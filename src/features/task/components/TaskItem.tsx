import type { Group } from '@/shared/types/group';
import type { TaskInstance } from '@/shared/types/task';
import { Checkbox } from '@/shared/ui/Checkbox';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Props = {
  task: TaskInstance;
  group: Group;
  onToggle: () => void;
  onOpen: () => void;
};

export function TaskItem({ task, group, onToggle, onOpen }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.instanceId,
    data: { groupId: task.groupId },
  });
  const memo = task.memo?.trim();

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative flex gap-3 rounded-xl bg-paper py-2 pr-2 pl-3 ${memo ? 'items-start' : 'items-center'} ${isDragging ? 'z-10 shadow-panel' : ''}`}
    >
      <span
        className="absolute inset-y-2 left-0 w-[3px] rounded-full"
        style={{ backgroundColor: group.color }}
        aria-hidden
      />
      <Checkbox
        id={`done-${task.instanceId}`}
        checked={task.done}
        ariaLabel={`${group.name} ${task.title} 완료`}
        onChange={onToggle}
      />
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 py-0.5 text-left"
        aria-label={`${group.name}, ${task.time ? `${task.time} ` : ''}${task.title}${memo ? `, 메모 ${memo}` : ''}${task.done ? ', 완료됨' : ''}`}
      >
        <span className="flex items-baseline gap-2">
          {task.time ? (
            <span className={`text-xs tabular-nums ${task.done ? 'text-faint' : 'text-muted'}`}>
              {task.time}
            </span>
          ) : null}
          <span className={`truncate text-sm ${task.done ? 'text-faint line-through' : 'text-ink'}`}>
            {task.title}
          </span>
        </span>
        {memo ? (
          <span className={`mt-3 block whitespace-pre-wrap break-words text-sm ${task.done ? 'text-faint' : 'text-muted'}`}>
            {memo}
          </span>
        ) : null}
      </button>
      <button
        type="button"
        className="grid h-8 w-8 place-items-center text-faint hover:text-muted"
        aria-label="순서 변경"
        {...attributes}
        {...listeners}
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
          <circle cx="5" cy="4" r="1.1" />
          <circle cx="11" cy="4" r="1.1" />
          <circle cx="5" cy="8" r="1.1" />
          <circle cx="11" cy="8" r="1.1" />
          <circle cx="5" cy="12" r="1.1" />
          <circle cx="11" cy="12" r="1.1" />
        </svg>
      </button>
    </div>
  );
}
