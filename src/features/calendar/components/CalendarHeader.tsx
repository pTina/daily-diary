import { addMonths, formatMonthLabel, nowMonth, todayISO } from '@/shared/lib/dateUtils';
import { useGroups } from '@/features/group/hooks/useGroups';
import { Button } from '@/shared/ui/Button';
import { useUiStore } from '@/store/useUiStore';
import { Link } from 'react-router-dom';

export function CalendarHeader() {
  const currentMonth = useUiStore((state) => state.currentMonth);
  const groupFilters = useUiStore((state) => state.groupFilters);
  const setCurrentMonth = useUiStore((state) => state.setCurrentMonth);
  const setSelectedDate = useUiStore((state) => state.setSelectedDate);
  const toggleGroupFilter = useUiStore((state) => state.toggleGroupFilter);
  const { data: groups = [] } = useGroups();

  return (
    <header className="relative z-10 flex flex-col gap-3 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="hidden font-semibold tracking-tight lg:block">다이어리</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink"
            aria-label="이전 달"
            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          >
            ‹
          </button>
          <p className="min-w-24 text-center text-lg font-semibold tabular-nums">
            {formatMonthLabel(currentMonth)}
          </p>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink"
            aria-label="다음 달"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            ›
          </button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setSelectedDate(todayISO());
              setCurrentMonth(nowMonth());
            }}
          >
            오늘
          </Button>
        </div>
        <Link
          to="/settings"
          className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink lg:hidden"
          aria-label="설정"
        >
          <SettingsIcon />
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <div className="flex items-center gap-2">
          {groups.map((group) => {
            const on = groupFilters[group.id] !== false;
            return (
              <button
                key={group.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleGroupFilter(group.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  on ? 'border-line-strong bg-paper text-ink' : 'border-transparent bg-canvas text-faint'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: group.color }}
                  aria-hidden
                />
                {group.name}
              </button>
            );
          })}
        </div>
        <Link
          to="/settings"
          className="hidden h-9 w-9 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink lg:grid"
          aria-label="설정"
        >
          <SettingsIcon />
        </Link>
      </div>
    </header>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M4.8 6.4l1.6 1.6M17.6 16l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.8 17.6l1.6-1.6M17.6 8l1.6-1.6" />
    </svg>
  );
}
