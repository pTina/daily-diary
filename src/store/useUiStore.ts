import { nowMonth, todayISO } from '@/shared/lib/dateUtils';
import { HOLIDAY_GROUP_ID, PERSONAL_GROUP_ID, WORK_GROUP_ID } from '@/shared/types/group';
import type { RecurrenceScope, TaskDraft } from '@/shared/types/task';
import { create } from 'zustand';

type Modal =
  | { name: 'closed' }
  | { name: 'task-form'; sourceId?: string; instanceDate?: string }
  | { name: 'recurrence-scope'; mode: 'edit' | 'delete'; sourceId: string; instanceDate: string }
  | { name: 'delete-confirm'; sourceId: string; instanceDate?: string }
  | { name: 'settings' };

type UiState = {
  selectedDate: string;
  currentMonth: string;
  groupFilters: Record<string, boolean>;
  dayPanelOpen: boolean;
  modal: Modal;
  pendingDraft: TaskDraft | null;
  pendingScope: RecurrenceScope;
  setSelectedDate: (date: string) => void;
  setCurrentMonth: (month: string) => void;
  toggleGroupFilter: (groupId: string) => void;
  openDayPanel: () => void;
  closeDayPanel: () => void;
  openTaskForm: (sourceId?: string, instanceDate?: string) => void;
  openRecurrenceScope: (mode: 'edit' | 'delete', sourceId: string, instanceDate: string) => void;
  openDeleteConfirm: (sourceId: string, instanceDate?: string) => void;
  openSettings: () => void;
  setPendingDraft: (draft: TaskDraft | null) => void;
  setPendingScope: (scope: RecurrenceScope) => void;
  closeModal: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  selectedDate: todayISO(),
  currentMonth: nowMonth(),
  groupFilters: {
    [WORK_GROUP_ID]: true,
    [PERSONAL_GROUP_ID]: true,
    [HOLIDAY_GROUP_ID]: true,
  },
  dayPanelOpen: false,
  modal: { name: 'closed' },
  pendingDraft: null,
  pendingScope: 'all',
  setSelectedDate: (selectedDate) =>
    set({
      selectedDate,
      currentMonth: selectedDate.slice(0, 7),
    }),
  setCurrentMonth: (currentMonth) => set({ currentMonth }),
  toggleGroupFilter: (groupId) =>
    set((state) => ({
      groupFilters: {
        ...state.groupFilters,
        [groupId]: !state.groupFilters[groupId],
      },
    })),
  openDayPanel: () => set({ dayPanelOpen: true }),
  closeDayPanel: () => set({ dayPanelOpen: false }),
  openTaskForm: (sourceId, instanceDate) =>
    set({ modal: { name: 'task-form', sourceId, instanceDate } }),
  openRecurrenceScope: (mode, sourceId, instanceDate) =>
    set({ modal: { name: 'recurrence-scope', mode, sourceId, instanceDate } }),
  openDeleteConfirm: (sourceId, instanceDate) =>
    set({ modal: { name: 'delete-confirm', sourceId, instanceDate } }),
  openSettings: () => set({ modal: { name: 'settings' } }),
  setPendingDraft: (pendingDraft) => set({ pendingDraft }),
  setPendingScope: (pendingScope) => set({ pendingScope }),
  closeModal: () => set({ modal: { name: 'closed' }, pendingDraft: null, pendingScope: 'all' }),
}));
