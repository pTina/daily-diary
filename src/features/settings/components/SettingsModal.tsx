import { SettingsForm } from '@/features/settings/components/SettingsForm';
import { Modal } from '@/shared/ui/Modal';
import { useUiStore } from '@/store/useUiStore';

export function SettingsModal() {
  const modal = useUiStore((state) => state.modal);
  const closeModal = useUiStore((state) => state.closeModal);

  return (
    <Modal open={modal.name === 'settings'} title="설정" onClose={closeModal}>
      <SettingsForm />
    </Modal>
  );
}
