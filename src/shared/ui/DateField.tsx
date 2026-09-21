import { formatWeekdayParen } from '@/shared/lib/dateUtils';

type Props = {
  id: string;
  label: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
};

export function DateField({ id, label, value, min, onChange }: Props) {
  return (
    <div className="form-group flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <div className="krds-input flex h-11 items-center justify-between rounded-lg border border-line-strong bg-paper pl-3 text-sm text-ink">
          <span className="min-w-0 truncate">
            {value ? `${value} ${formatWeekdayParen(value)}` : <span className="text-faint">날짜 선택</span>}
          </span>
          <span className="grid h-11 w-12 shrink-0 place-items-center">
            <CalendarIcon />
          </span>
        </div>
        <input
          id={id}
          type="date"
          value={value}
          min={min}
          aria-label={`${label}${value ? ` ${value} ${formatWeekdayParen(value)}` : ''}`}
          onChange={(event) => onChange(event.target.value)}
          className="date-field-input absolute inset-0 cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0 text-ink"
      fill="currentColor"
      aria-hidden
    >
      <path d="M7 2.8c0-.442.358-.8.8-.8s.8.358.8.8v.794H15.4V2.8c0-.442.358-.8.8-.8s.8.358.8.8v.794H20A2 2 0 0 1 22 5.594V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5.594A2 2 0 0 1 4 3.594h3V2.8Zm-3.4 5.2h16.8V5.594a.4.4 0 0 0-.4-.4H4a.4.4 0 0 0-.4.4V8Zm16.8 1.6H3.6V20c0 .221.179.4.4.4h16a.4.4 0 0 0 .4-.4V9.6ZM7.6 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4.4-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4.4 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
    </svg>
  );
}
