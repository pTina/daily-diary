import { SNAP_POINTS } from '@/features/task/components/BottomSheet';
import { useMediaQuery } from '@/shared/lib/useMediaQuery';
import type { SheetSnap } from '@/store/useUiStore';
import { useUiStore } from '@/store/useUiStore';
import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

function sheetCoverPx(snap: SheetSnap, viewportHeight: number) {
  if (snap === 'closed') return 32;
  if (snap === 'peek') return SNAP_POINTS[0] * viewportHeight;
  if (snap === 'half') return SNAP_POINTS[1] * viewportHeight;
  return SNAP_POINTS[2] * viewportHeight;
}

export function CalendarViewport({ children }: Props) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const sheetSnap = useUiStore((state) => state.sheetSnap);
  const currentMonth = useUiStore((state) => state.currentMonth);
  const slotRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [slotHeight, setSlotHeight] = useState(0);
  const [viewHeight, setViewHeight] = useState(() =>
    typeof window === 'undefined' ? 0 : (window.visualViewport?.height ?? window.innerHeight),
  );

  const canScroll = !isDesktop && sheetSnap !== 'full';

  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;

    const measure = () => {
      setSlotHeight(el.clientHeight);
      setViewHeight(window.visualViewport?.height ?? window.innerHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.visualViewport?.addEventListener('resize', measure);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.visualViewport?.removeEventListener('resize', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [currentMonth]);

  const viewportHeight = canScroll ? Math.max(0, slotHeight - sheetCoverPx(sheetSnap, viewHeight)) : undefined;

  return (
    <div ref={slotRef} className="relative min-h-0 min-w-0 flex-1 bg-paper">
      <div
        ref={scrollerRef}
        className={canScroll ? 'overflow-x-hidden overflow-y-auto overscroll-y-contain' : 'flex h-full min-h-0 flex-col overflow-hidden'}
        style={
          canScroll
            ? {
                height: viewportHeight,
                WebkitMaskImage: 'linear-gradient(to bottom, #000 calc(100% - 48px), transparent)',
                maskImage: 'linear-gradient(to bottom, #000 calc(100% - 48px), transparent)',
              }
            : undefined
        }
      >
        <div className="flex min-h-0 flex-col" style={{ height: canScroll ? slotHeight : '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
