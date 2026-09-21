import type { SheetSnap } from '@/store/useUiStore';
import { useUiStore } from '@/store/useUiStore';
import type { ReactNode } from 'react';
import { Drawer } from 'vaul';

type Props = {
  children: ReactNode;
};

export const SNAP_POINTS = [0.22, 0.48, 0.78] as const;

const POINT_BY_SNAP: Record<Exclude<SheetSnap, 'closed'>, number> = {
  peek: SNAP_POINTS[0],
  half: SNAP_POINTS[1],
  full: SNAP_POINTS[2],
};

function snapFromPoint(point: number | string | null): SheetSnap {
  if (point === SNAP_POINTS[0]) return 'peek';
  if (point === SNAP_POINTS[2]) return 'full';
  if (point === SNAP_POINTS[1]) return 'half';
  return 'half';
}

export function BottomSheet({ children }: Props) {
  const sheetSnap = useUiStore((state) => state.sheetSnap);
  const setSheetSnap = useUiStore((state) => state.setSheetSnap);
  const open = sheetSnap !== 'closed';

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setSheetSnap('closed');
          return;
        }
        if (useUiStore.getState().sheetSnap === 'closed') {
          setSheetSnap('half');
        }
      }}
      modal={false}
      handleOnly
      dismissible
      shouldScaleBackground={false}
      noBodyStyles
      repositionInputs={false}
      autoFocus={false}
      snapPoints={[...SNAP_POINTS]}
      activeSnapPoint={open ? POINT_BY_SNAP[sheetSnap] : SNAP_POINTS[1]}
      setActiveSnapPoint={(point) => {
        if (!open || point == null) return;
        setSheetSnap(snapFromPoint(point));
      }}
    >
      {!open ? (
        <Drawer.Trigger asChild>
          <button
            type="button"
            className="absolute inset-x-0 bottom-0 z-20 flex h-8 items-center justify-center rounded-t-3xl border-t border-line bg-paper shadow-[0_-16px_40px_rgba(43,45,49,0.08)]"
            aria-label="할 일 시트 열기"
          >
            <span className="h-1 w-12 rounded-full bg-line-strong" />
          </button>
        </Drawer.Trigger>
      ) : null}
      <Drawer.Portal>
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-20 flex h-full max-h-[97%] flex-col rounded-t-3xl border-t border-line bg-paper outline-none shadow-[0_-16px_40px_rgba(43,45,49,0.08)]"
        >
          <Drawer.Title className="sr-only">할 일</Drawer.Title>
          <Drawer.Handle
            className="mt-3.5 mb-1 h-1 w-12 bg-line-strong opacity-100"
            aria-label="할 일 시트 높이 조절"
          />
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
