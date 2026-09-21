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
  const openSettings = useUiStore((state) => state.openSettings);
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

      <div className="hidden items-center justify-end gap-3 lg:flex">
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
        <button
          type="button"
          onClick={openSettings}
          className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink"
          aria-label="설정"
        >
          <SettingsIcon />
        </button>
      </div>
    </header>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.2 12.9 5.5c.4.1.8.3 1.2.5l2.3-.6 1.5 1.5-.6 2.3c.2.4.4.8.5 1.2L20.8 12 18.5 12.9c-.1.4-.3.8-.5 1.2l.6 2.3-1.5 1.5-2.3-.6c-.4.2-.8.4-1.2.5L12 20.8 11.1 18.5c-.4-.1-.8-.3-1.2-.5l-2.3.6-1.5-1.5.6-2.3c-.2-.4-.4-.8-.5-1.2L3.2 12 5.5 11.1c.1-.4.3-.8.5-1.2l-.6-2.3 1.5-1.5 2.3.6c.4-.2.8-.4 1.2-.5L12 3.2Z" />
    </svg>
  );
}
