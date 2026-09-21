import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { useUiStore } from '@/store/useUiStore';

type Props = {
  onConfirm: () => void;
};

export function DeleteConfirmDialog({ onConfirm }: Props) {
  const modal = useUiStore((state) => state.modal);
  const closeModal = useUiStore((state) => state.closeModal);

  return (
    <Modal
      open={modal.name === 'delete-confirm'}
      title="할 일을 삭제할까요?"
      onClose={closeModal}
      fullScreenOnMobile={false}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="tertiary" onClick={closeModal}>
            취소
          </Button>
          <Button onClick={onConfirm}>삭제</Button>
        </div>
      }
    >
      <p className="text-sm text-muted">삭제하면 되돌릴 수 없습니다.</p>
    </Modal>
  );
}
