import { groupApi, groupKeys } from '@/features/group/api/groupApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useGroups() {
  return useQuery({
    queryKey: groupKeys.all,
    queryFn: groupApi.list,
  });
}

export function useUpdateGroupColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, color }: { groupId: string; color: string }) =>
      groupApi.updateColor(groupId, color),
    onSuccess: (groups) => {
      queryClient.setQueryData(groupKeys.all, groups);
    },
  });
}
