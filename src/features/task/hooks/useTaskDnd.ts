import type { Task, TaskInstance } from '@/shared/types/task';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTaskMutations } from './useTaskMutations';

export function useTaskDnd(
  grouped: Record<string, TaskInstance[]>,
  sources: Task[],
) {
  const { replaceAll } = useTaskMutations();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findInstance = (id: string) =>
    Object.values(grouped)
      .flat()
      .find((item) => item.instanceId === id);

  const applyOrders = (nextGroups: Record<string, TaskInstance[]>) => {
    const updates = new Map<string, { order: number; groupId: string }>();
    Object.entries(nextGroups).forEach(([groupId, items]) => {
      items.forEach((item, index) => {
        updates.set(item.sourceId, { order: index, groupId });
      });
    });

    const next = sources.map((task) => {
      const update = updates.get(task.id);
      return update ? { ...task, order: update.order, groupId: update.groupId } : task;
    });
    replaceAll.mutate(next);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeInstance = findInstance(String(active.id));
    if (!activeInstance) return;

    const overId = String(over.id);
    const toGroup = overId.startsWith('group:')
      ? overId.replace('group:', '')
      : findInstance(overId)?.groupId;
    if (!toGroup) return;

    const fromGroup = activeInstance.groupId;

    if (fromGroup === toGroup) {
      const list = [...(grouped[fromGroup] ?? [])];
      const oldIndex = list.findIndex((item) => item.instanceId === activeInstance.instanceId);
      const overIndex = overId.startsWith('group:')
        ? list.length - 1
        : list.findIndex((item) => item.instanceId === overId);
      if (oldIndex < 0 || overIndex < 0 || oldIndex === overIndex) return;
      const [moved] = list.splice(oldIndex, 1);
      list.splice(overIndex, 0, moved);
      applyOrders({ ...grouped, [fromGroup]: list });
      return;
    }

    const fromList = (grouped[fromGroup] ?? []).filter(
      (item) => item.instanceId !== activeInstance.instanceId,
    );
    const toList = [...(grouped[toGroup] ?? [])];
    const overIndex = overId.startsWith('group:')
      ? toList.length
      : toList.findIndex((item) => item.instanceId === overId);
    toList.splice(overIndex < 0 ? toList.length : overIndex, 0, {
      ...activeInstance,
      groupId: toGroup,
    });
    applyOrders({ ...grouped, [fromGroup]: fromList, [toGroup]: toList });
  };

  return { sensors, onDragEnd };
}
