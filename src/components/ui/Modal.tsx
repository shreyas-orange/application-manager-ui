import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Disables the close button and backdrop/Escape dismissal — use while a mutation is pending. */
  closeDisabled?: boolean;
}

export function Modal({ open, onClose, title, description, children, closeDisabled }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !closeDisabled) onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeDisabled, onClose]);

  if (!open) return null;

  return (
    <div
      className="ods-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !closeDisabled) onClose();
      }}
    >
      <div className="ods-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="ods-modal-header">
          <div>
            <h2 className="ods-modal-title" id={titleId}>
              {title}
            </h2>
            {description && <p className="ods-modal-description">{description}</p>}
          </div>
          <button
            type="button"
            className="ods-modal-close"
            aria-label={`Close ${title}`}
            disabled={closeDisabled}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="ods-modal-body">{children}</div>
      </div>
    </div>
  );
}
