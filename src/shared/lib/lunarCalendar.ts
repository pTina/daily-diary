import KoreanLunarCalendar from 'korean-lunar-calendar';
import type { LunarDate } from '@/shared/types/task';

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toISO(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function solarToLunar(iso: string): LunarDate | null {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return null;
  const calendar = new KoreanLunarCalendar();
  if (!calendar.setSolarDate(year, month, day)) return null;
  const lunar = calendar.getLunarCalendar();
  return { month: lunar.month, day: lunar.day, leap: Boolean(lunar.intercalation) };
}

export function lunarToSolar(year: number, lunar: LunarDate): string | null {
  const calendar = new KoreanLunarCalendar();
  const attempts: Array<[number, boolean]> = [[lunar.day, lunar.leap]];
  if (lunar.leap) attempts.push([lunar.day, false]);
  if (lunar.day > 29) attempts.push([29, lunar.leap]);
  if (lunar.day > 29 && lunar.leap) attempts.push([29, false]);

  for (const [day, leap] of attempts) {
    if (calendar.setLunarDate(year, lunar.month, day, leap)) {
      const solar = calendar.getSolarCalendar();
      return toISO(solar.year, solar.month, solar.day);
    }
  }
  return null;
}

export function formatLunarLabel(lunar: LunarDate): string {
  return `음력 ${lunar.leap ? '윤' : ''}${lunar.month}월 ${lunar.day}일`;
}
