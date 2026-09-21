import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi, taskKeys } from '../api/taskApi';
import type { RecurrenceScope, Task, TaskDraft } from '@/shared/types/task';

export function useTaskMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: taskKeys.all });
  };

  const toggleDone = useMutation({
    mutationFn: (id: string) => taskApi.toggleDone(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const snapshots = queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.all });
      snapshots.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData(
          key,
          data.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
        );
      });
      return { snapshots };
    },
    onError: (_error, _id, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: invalidate,
  });

  const createTask = useMutation({
    mutationFn: (draft: TaskDraft) => taskApi.create(draft),
    onSettled: invalidate,
  });

  const applyEdit = useMutation({
    mutationFn: (payload: {
      source: Task;
      draft: TaskDraft;
      instanceDate: string;
      scope: RecurrenceScope;
    }) => taskApi.applyEdit(payload.source, payload.draft, payload.instanceDate, payload.scope),
    onSettled: invalidate,
  });

  const applyDelete = useMutation({
    mutationFn: (payload: { source: Task; instanceDate: string; scope: RecurrenceScope }) =>
      taskApi.applyDelete(payload.source, payload.instanceDate, payload.scope),
    onSettled: invalidate,
  });

  const replaceAll = useMutation({
    mutationFn: (tasks: Task[]) => taskApi.replaceAll(tasks),
    onMutate: async (tasks) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const snapshots = queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.all });
      snapshots.forEach(([key]) => {
        queryClient.setQueryData(key, tasks);
      });
      return { snapshots };
    },
    onError: (_error, _tasks, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: invalidate,
  });

  return { toggleDone, createTask, applyEdit, applyDelete, replaceAll };
}
