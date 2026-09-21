import type { SheetSnap } from '@/store/useUiStore';
import { useUiStore } from '@/store/useUiStore';
import type { ReactNode } from 'react';
import { useRef } from 'react';

type Props = {
  children: ReactNode;
};

const SNAP_RATIO: Record<SheetSnap, number> = {
  peek: 0.22,
  half: 0.48,
  full: 0.78,
};

export function BottomSheet({ children }: Props) {
  const sheetSnap = useUiStore((state) => state.sheetSnap);
  const setSheetSnap = useUiStore((state) => state.setSheetSnap);
  const startY = useRef(0);
  const startSnap = useRef<SheetSnap>('half');

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    startY.current = event.clientY;
    startSnap.current = sheetSnap;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const delta = startY.current - event.clientY;
    if (delta > 48) {
      setSheetSnap(startSnap.current === 'peek' ? 'half' : 'full');
    } else if (delta < -48) {
      setSheetSnap(startSnap.current === 'full' ? 'half' : 'peek');
    }
  };

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-3xl border-t border-line bg-paper shadow-[0_-16px_40px_rgba(43,45,49,0.08)] transition-[height] duration-300 ease-out"
      style={{ height: `${SNAP_RATIO[sheetSnap] * 100}%` }}
    >
      <button
        type="button"
        className="flex h-8 w-full items-center justify-center"
        aria-label="할 일 시트 높이 조절"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <span className="h-1 w-12 rounded-full bg-line-strong" />
      </button>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
