import { AlertTriangle } from 'lucide-react';
import { type ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Spinner } from './Spinner';

interface Props {
  open: boolean;
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const iconWrap =
    variant === 'danger'
      ? 'bg-rose-50 text-rose-600'
      : 'bg-blue-50 text-blue-600';

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onCancel}
      title={title}
      width="md"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading} className="gap-1.5">
            {loading && <Spinner className="h-3.5 w-3.5" />}
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconWrap}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="pt-1 text-sm text-slate-600">
          {message ?? 'This action cannot be undone.'}
        </div>
      </div>
    </Modal>
  );
}
