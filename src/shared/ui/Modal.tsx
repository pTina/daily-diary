import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  fullScreenOnMobile?: boolean;
};

export function Modal({ open, title, onClose, children, footer, fullScreenOnMobile = true }: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <section
      className={`krds-modal fade shown in fixed inset-0 z-50 flex ${fullScreenOnMobile ? 'items-stretch lg:items-center' : 'items-center'} justify-center bg-[#2B2D31]/35 p-0 lg:p-6`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={`modal-dialog flex w-full flex-col bg-paper shadow-panel ${fullScreenOnMobile ? 'h-full lg:h-auto lg:max-h-[min(760px,90vh)] lg:max-w-[440px] lg:rounded-2xl' : 'max-h-[min(480px,86vh)] max-w-[400px] rounded-2xl'}`}
      >
        <div className="modal-content flex min-h-0 flex-1 flex-col">
          <div className="modal-header flex items-center justify-between border-b border-line px-5 py-4">
            <h2 id={titleId} className="modal-title text-lg font-semibold">
              {title}
            </h2>
            <button type="button" className="text-sm text-muted hover:text-ink" onClick={onClose}>
              닫기
            </button>
          </div>
          <div className="modal-conts min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer ? <div className="modal-btn border-t border-line px-5 py-4">{footer}</div> : null}
        </div>
      </div>
    </section>,
    document.body,
  );
}
