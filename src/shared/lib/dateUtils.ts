const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const WEEKDAYS_LONG = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'] as const;

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function nowMonth(): string {
  return todayISO().slice(0, 7);
}

export function addDays(value: string, amount: number): string {
  const date = parseISODate(value);
  date.setDate(date.getDate() + amount);
  return toISODate(date);
}

export function addMonthsToDate(value: string, amount: number): string {
  const date = parseISODate(value);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return toISODate(date);
}

export function addMonths(yearMonth: string, amount: number): string {
  return addMonthsToDate(`${yearMonth}-01`, amount).slice(0, 7);
}

export function eachDayInclusive(from: string, to: string): string[] {
  if (!from) return [];
  const end = to && compareISODate(to, from) > 0 ? to : from;
  const days: string[] = [];
  let cursor = from;
  let guard = 0;
  while (compareISODate(cursor, end) <= 0 && guard < 400) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return days;
}

export function compareISODate(a: string, b: string): number {
  return a.localeCompare(b);
}

export function isSameMonth(isoDate: string, yearMonth: string): boolean {
  return isoDate.startsWith(yearMonth);
}

export function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${year}.${month}`;
}

export function formatPanelDate(isoDate: string): string {
  const date = parseISODate(isoDate);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS_LONG[date.getDay()]}`;
}

export function formatWeekdayParen(isoDate: string): string {
  if (!isoDate) return '';
  return `(${WEEKDAYS[parseISODate(isoDate).getDay()]})`;
}

export function weekdayLabels(): readonly string[] {
  return WEEKDAYS;
}

export function weekdayIndex(isoDate: string): number {
  return parseISODate(isoDate).getDay();
}

export function startOfWeek(isoDate: string): string {
  return addDays(isoDate, -weekdayIndex(isoDate));
}

export function combineDateTime(isoDate: string, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = parseISODate(isoDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function timeOptions(stepMin = 5): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += stepMin) {
      const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      options.push({ value, label: value });
    }
  }
  return options;
}

export function snapToTimeStep(value: string, stepMin = 5): string {
  const [hourText, minuteText] = value.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return '09:00';
  const snapped = Math.round(minute / stepMin) * stepMin;
  if (snapped === 60) {
    return `${String((hour + 1) % 24).padStart(2, '0')}:00`;
  }
  return `${String(hour).padStart(2, '0')}:${String(snapped).padStart(2, '0')}`;
}
