import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { taskApi, taskKeys } from '../api/taskApi';
import { expandAll } from '../utils/expandRecurrence';

export function useTasks(from: string, to: string) {
  return useQuery({
    queryKey: taskKeys.range(from, to),
    queryFn: taskApi.list,
    select: (tasks) => expandAll(tasks, from, to),
    placeholderData: keepPreviousData,
  });
}

export function useTaskSources() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: taskApi.list,
  });
}
