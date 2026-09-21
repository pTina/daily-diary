import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import type { RecurrenceScope } from '@/shared/types/task';
import { useUiStore } from '@/store/useUiStore';

type Props = {
  onSelect: (scope: RecurrenceScope) => void;
};

export function RecurrenceScopeDialog({ onSelect }: Props) {
  const modal = useUiStore((state) => state.modal);
  const closeModal = useUiStore((state) => state.closeModal);
  const open = modal.name === 'recurrence-scope';
  const mode = open ? modal.mode : 'edit';

  return (
    <Modal
      open={open}
      title={mode === 'delete' ? '반복 항목 삭제' : '반복 항목 수정'}
      onClose={closeModal}
      fullScreenOnMobile={false}
    >
      <p className="mb-4 text-sm text-muted">적용 범위를 선택하세요.</p>
      <div className="grid gap-2">
        <Button variant="secondary" onClick={() => onSelect('this')}>
          이 항목만
        </Button>
        <Button variant="secondary" onClick={() => onSelect('future')}>
          이후 전체
        </Button>
        <Button variant="secondary" onClick={() => onSelect('all')}>
          전체
        </Button>
      </div>
    </Modal>
  );
}
