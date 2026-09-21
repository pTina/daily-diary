import { CalendarHeader } from '@/features/calendar/components/CalendarHeader';
import { CalendarViewport } from '@/features/calendar/components/CalendarViewport';
import { MonthGrid } from '@/features/calendar/components/MonthGrid';
import { SettingsModal } from '@/features/settings/components/SettingsModal';
import { DayTaskModal } from '@/features/task/components/DayTaskModal';
import { DeleteConfirmDialog } from '@/features/task/components/DeleteConfirmDialog';
import { RecurrenceScopeDialog } from '@/features/task/components/RecurrenceScopeDialog';
import { TaskFormModal } from '@/features/task/components/TaskFormModal';
import { TaskPanel } from '@/features/task/components/TaskPanel';
import { useGroups } from '@/features/group/hooks/useGroups';
import { useReminderScheduler } from '@/features/reminder/useReminderScheduler';
import { useTaskMutations } from '@/features/task/hooks/useTaskMutations';
import { useTaskSources, useTasks } from '@/features/task/hooks/useTasks';
import { addDays, startOfWeek } from '@/shared/lib/dateUtils';
import { useMediaQuery } from '@/shared/lib/useMediaQuery';
import { isHolidayGroup } from '@/shared/types/group';
import type { RecurrenceScope, TaskDraft, TaskInstance } from '@/shared/types/task';
import { useUiStore } from '@/store/useUiStore';
import { useMemo } from 'react';

export function CalendarPage() {
  useReminderScheduler();
  const selectedDate = useUiStore((state) => state.selectedDate);
  const currentMonth = useUiStore((state) => state.currentMonth);
  const groupFilters = useUiStore((state) => state.groupFilters);
  const modal = useUiStore((state) => state.modal);
  const pendingDraft = useUiStore((state) => state.pendingDraft);
  const pendingScope = useUiStore((state) => state.pendingScope);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const openTaskForm = useUiStore((state) => state.openTaskForm);
  const openRecurrenceScope = useUiStore((state) => state.openRecurrenceScope);
  const openDeleteConfirm = useUiStore((state) => state.openDeleteConfirm);
  const setPendingDraft = useUiStore((state) => state.setPendingDraft);
  const setPendingScope = useUiStore((state) => state.setPendingScope);
  const closeModal = useUiStore((state) => state.closeModal);

  const from = startOfWeek(`${currentMonth}-01`);
  const to = addDays(from, 41);
  const { data: instances = [] } = useTasks(from, to);
  const { data: sources = [] } = useTaskSources();
  const { data: groups = [] } = useGroups();
  const mutations = useTaskMutations();

  const filteredInstances = useMemo(
    () => instances.filter((task) => groupFilters[task.groupId] !== false),
    [instances, groupFilters],
  );

  const findSource = (sourceId: string) => sources.find((task) => task.id === sourceId);

  const handleToggle = (task: TaskInstance) => {
    if (isHolidayGroup(task.groupId)) return;
    mutations.toggleDone.mutate(task.sourceId);
  };

  const handleCreate = (draft: TaskDraft) => {
    mutations.createTask.mutate(draft);
    closeModal();
  };

  const handleUpdate = (draft: TaskDraft, recurring: boolean) => {
    if (recurring && modal.name === 'task-form' && modal.sourceId) {
      setPendingDraft(draft);
      openRecurrenceScope('edit', modal.sourceId, modal.instanceDate ?? draft.date);
      return;
    }
    const source = modal.name === 'task-form' && modal.sourceId ? findSource(modal.sourceId) : undefined;
    if (!source) return;
    mutations.applyEdit.mutate({
      source,
      draft,
      instanceDate: modal.name === 'task-form' ? modal.instanceDate ?? source.date : source.date,
      scope: 'all',
    });
    closeModal();
  };

  const handleDeleteRequest = (recurring: boolean) => {
    if (modal.name !== 'task-form' || !modal.sourceId) return;
    if (recurring) {
      openRecurrenceScope('delete', modal.sourceId, modal.instanceDate ?? selectedDate);
      return;
    }
    openDeleteConfirm(modal.sourceId, modal.instanceDate);
  };

  const handleScope = (scope: RecurrenceScope) => {
    if (modal.name !== 'recurrence-scope') return;
    const source = findSource(modal.sourceId);
    if (!source) return;

    if (modal.mode === 'edit' && pendingDraft) {
      mutations.applyEdit.mutate({
        source,
        draft: pendingDraft,
        instanceDate: modal.instanceDate,
        scope,
      });
      closeModal();
      return;
    }

    if (modal.mode === 'delete') {
      setPendingScope(scope);
      openDeleteConfirm(modal.sourceId, modal.instanceDate);
    }
  };

  const handleDeleteConfirm = () => {
    if (modal.name !== 'delete-confirm') return;
    const source = findSource(modal.sourceId);
    if (!source) return;
    mutations.applyDelete.mutate({
      source,
      instanceDate: modal.instanceDate ?? source.date,
      scope: source.recurrence ? pendingScope : 'all',
    });
    closeModal();
  };

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <CalendarHeader />
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <CalendarViewport>
            <MonthGrid
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              mode="month"
              compact={!isDesktop}
              groups={groups}
              tasks={filteredInstances}
            />
          </CalendarViewport>
        </div>
        <div className="hidden w-[372px] shrink-0 border-l border-line lg:block">
          <TaskPanel
            date={selectedDate}
            groups={groups}
            sources={sources}
            instances={filteredInstances}
            groupFilters={groupFilters}
            onAdd={() => openTaskForm()}
            onOpen={(task) => openTaskForm(task.sourceId, task.instanceDate)}
            onToggle={handleToggle}
          />
        </div>
      </div>

      {!isDesktop ? (
        <>
          <DayTaskModal
            date={selectedDate}
            groups={groups}
            sources={sources}
            instances={filteredInstances}
            groupFilters={groupFilters}
            onAdd={() => openTaskForm()}
            onOpen={(task) => openTaskForm(task.sourceId, task.instanceDate)}
            onToggle={handleToggle}
          />
          <button
            type="button"
            onClick={() => openTaskForm()}
            className="fixed right-5 bottom-6 z-30 grid h-14 w-14 place-items-center rounded-full bg-ink text-2xl text-white shadow-panel"
            aria-label="할 일 추가"
          >
            +
          </button>
        </>
      ) : null}

      <SettingsModal />
      <TaskFormModal onCreate={handleCreate} onUpdate={handleUpdate} onDelete={handleDeleteRequest} />
      <RecurrenceScopeDialog onSelect={handleScope} />
      <DeleteConfirmDialog onConfirm={handleDeleteConfirm} />
    </div>
  );
}
