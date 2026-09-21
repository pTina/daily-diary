import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function CalendarViewport({ children }: Props) {
  return (
    <div className="relative min-h-0 min-w-0 flex-1 bg-paper">
      <div className="flex h-full min-h-0 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
