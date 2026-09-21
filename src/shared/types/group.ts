export type Group = {
  id: string;
  name: string;
  color: string;
};

export const WORK_GROUP_ID = 'g_work';
export const PERSONAL_GROUP_ID = 'g_personal';

export const DEFAULT_GROUPS: Group[] = [
  { id: WORK_GROUP_ID, name: '회사', color: '#C0E8DD' },
  { id: PERSONAL_GROUP_ID, name: '개인', color: '#A3C6EB' },
];

export const GROUP_COLOR_PRESETS = [
  '#C0E8DD',
  '#A3C6EB',
  '#F3D1C8',
  '#E4D4F0',
  '#F7E2B8',
  '#D7E4C0',
  '#F2CBD8',
  '#D2D8EA',
];
