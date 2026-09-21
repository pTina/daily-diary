import { snapToTimeStep } from '@/shared/lib/dateUtils';
import { useEffect, useRef } from 'react';

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const ITEM_H = 44;
const PERIODS = ['오전', '오후'] as const;
const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const;

type Period = (typeof PERIODS)[number];

function parseTime(value: string) {
  const snapped = snapToTimeStep(value);
  const [hour24, minute] = snapped.split(':').map(Number);
  const period: Period = hour24 >= 12 ? '오후' : '오전';
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { period, hour, minute };
}

function toValue(period: Period, hour: number, minute: number) {
  let hour24 = hour % 12;
  if (period === '오후') hour24 += 12;
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function TimeWheel({ id, label, value, onChange }: Props) {
  const parsed = parseTime(value);

  const setPart = (part: Partial<ReturnType<typeof parseTime>>) => {
    const next = { ...parsed, ...part };
    onChange(toValue(next.period, next.hour, next.minute));
  };

  return (
    <div className="form-group flex flex-col gap-1.5">
      <p id={id} className="text-sm font-medium text-ink">
        {label}
      </p>
      <div
        className="relative overflow-hidden rounded-2xl bg-canvas"
        role="group"
        aria-labelledby={id}
      >
        <div className="pointer-events-none absolute inset-x-3 top-1/2 z-10 h-11 -translate-y-1/2 rounded-2xl border-2 border-accent bg-paper/80" />
        <div className="relative z-0 grid grid-cols-3 px-2">
          <WheelColumn
            items={[...PERIODS]}
            value={parsed.period}
            format={(item) => item}
            onChange={(period) => setPart({ period: period as Period })}
          />
          <WheelColumn
            items={[...HOURS]}
            value={parsed.hour}
            format={(item) => `${item}시`}
            onChange={(hour) => setPart({ hour: Number(hour) })}
          />
          <WheelColumn
            items={[...MINUTES]}
            value={parsed.minute}
            format={(item) => `${String(item).padStart(2, '0')}분`}
            onChange={(minute) => setPart({ minute: Number(minute) })}
          />
        </div>
      </div>
    </div>
  );
}

function WheelColumn<T extends string | number>({
  items,
  value,
  format,
  onChange,
}: {
  items: T[];
  value: T;
  format: (item: T) => string;
  onChange: (item: T) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const index = Math.max(0, items.indexOf(value));
    ref.current?.scrollTo({ top: index * ITEM_H });
  }, [items, value]);

  return (
    <div
      ref={ref}
      className="time-wheel h-[132px] overflow-y-auto snap-y snap-mandatory overscroll-contain"
      onScroll={(event) => {
        const index = Math.round(event.currentTarget.scrollTop / ITEM_H);
        const next = items[Math.min(items.length - 1, Math.max(0, index))];
        if (next !== value) onChange(next);
      }}
    >
      <div className="h-11" />
      {items.map((item) => (
        <button
          key={String(item)}
          type="button"
          tabIndex={-1}
          className={`flex h-11 w-full snap-center items-center justify-center text-base ${
            item === value ? 'font-medium text-ink' : 'font-normal text-faint'
          }`}
          onClick={() => {
            onChange(item);
            const index = items.indexOf(item);
            ref.current?.scrollTo({ top: index * ITEM_H, behavior: 'smooth' });
          }}
        >
          {format(item)}
        </button>
      ))}
      <div className="h-11" />
    </div>
  );
}
