import type { ReactNode } from "react";

import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} closeDisabled={isLoading}>
      <p className="ods-confirm-message">{message}</p>
      <div className="ods-confirm-actions">
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={isLoading}
          onClick={onCancel}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
          disabled={isLoading}
          onClick={onConfirm}
        >
          {isLoading ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
