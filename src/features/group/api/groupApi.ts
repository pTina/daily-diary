import { storage } from '@/shared/storage';
import type { Group } from '@/shared/types/group';

export const groupKeys = {
  all: ['groups'] as const,
};

export const groupApi = {
  list: () => storage.listGroups(),
  async updateColor(groupId: string, color: string) {
    const groups = await storage.listGroups();
    const next = groups.map((group) => (group.id === groupId ? { ...group, color } : group));
    await storage.writeGroups(next);
    return next;
  },
  async write(groups: Group[]) {
    await storage.writeGroups(groups);
    return groups;
  },
};
