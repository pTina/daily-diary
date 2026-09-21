export type Group = {
  id: string;
  name: string;
  color: string;
};

export const WORK_GROUP_ID = 'g_work';
export const PERSONAL_GROUP_ID = 'g_personal';
export const HOLIDAY_GROUP_ID = 'g_holiday';
export const BIRTHDAY_GROUP_ID = 'g_birthday';

export const DEFAULT_GROUPS: Group[] = [
  { id: WORK_GROUP_ID, name: '회사', color: '#C0E8DD' },
  { id: PERSONAL_GROUP_ID, name: '개인', color: '#A3C6EB' },
  { id: HOLIDAY_GROUP_ID, name: '휴일', color: '#F3D1C8' },
  { id: BIRTHDAY_GROUP_ID, name: '생일', color: '#F2CBD8' },
];

export function isHolidayGroup(groupId: string) {
  return groupId === HOLIDAY_GROUP_ID;
}

export function isBirthdayGroup(groupId: string) {
  return groupId === BIRTHDAY_GROUP_ID;
}

export function isNonTodoGroup(groupId: string) {
  return isHolidayGroup(groupId) || isBirthdayGroup(groupId);
}

export function mergeDefaultGroups(groups: Group[] | null | undefined): Group[] {
  const byId = new Map((groups ?? []).map((group) => [group.id, group]));
  for (const fallback of DEFAULT_GROUPS) {
    if (!byId.has(fallback.id)) byId.set(fallback.id, fallback);
  }
  const order = DEFAULT_GROUPS.map((group) => group.id);
  return [...byId.values()].sort((a, b) => {
    const indexA = order.indexOf(a.id);
    const indexB = order.indexOf(b.id);
    return (indexA < 0 ? 99 : indexA) - (indexB < 0 ? 99 : indexB);
  });
}

export const GROUP_COLOR_PRESETS = [
  '#C0E8DD',
  '#A3C6EB',
  '#F3D1C8',
  '#E4D4F0',
  '#F7E2B8',
  '#D7E4C0',
  '#F2CBD8',
  '#D2D8EA',
  '#E8A3A3',
];
