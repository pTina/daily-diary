import { TaskPanel } from '@/features/task/components/TaskPanel';
import { formatPanelDate } from '@/shared/lib/dateUtils';
import { useMediaQuery } from '@/shared/lib/useMediaQuery';
import type { Group } from '@/shared/types/group';
import type { Task, TaskInstance } from '@/shared/types/task';
import { Modal } from '@/shared/ui/Modal';
import { useUiStore } from '@/store/useUiStore';

type Props = {
  date: string;
  groups: Group[];
  sources: Task[];
  instances: TaskInstance[];
  groupFilters: Record<string, boolean>;
  onAdd: () => void;
  onOpen: (task: TaskInstance) => void;
  onToggle: (task: TaskInstance) => void;
};

export function DayTaskModal({
  date,
  groups,
  sources,
  instances,
  groupFilters,
  onAdd,
  onOpen,
  onToggle,
}: Props) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const open = useUiStore((state) => state.dayPanelOpen);
  const closeDayPanel = useUiStore((state) => state.closeDayPanel);

  if (isDesktop) return null;

  return (
    <Modal
      open={open}
      title={formatPanelDate(date)}
      onClose={closeDayPanel}
      fullScreenOnMobile={false}
      size="panel"
    >
      <TaskPanel
        date={date}
        groups={groups}
        sources={sources}
        instances={instances}
        groupFilters={groupFilters}
        embedded
        onAdd={onAdd}
        onOpen={onOpen}
        onToggle={onToggle}
      />
    </Modal>
  );
}
