import { X } from "lucide-react";

import type {
  CloudConfiguration,
  CreateCloudRequest,
} from "../types/cloud";

import CloudForm from "./CloudForm";

interface CloudModalProps {
  open: boolean;
  cloud?: CloudConfiguration | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateCloudRequest,
  ) => void;
}

export default function CloudModal({
  open,
  cloud,
  isSubmitting,
  onClose,
  onSubmit,
}: CloudModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="cloud-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="cloud-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cloud-modal-title"
      >
        <div className="cloud-modal-header">
          <div>
            <h2 id="cloud-modal-title">
              {cloud
                ? "Edit Cloud"
                : "Add Cloud"}
            </h2>

            <p>
              Configure a cloud provider
              connection.
            </p>
          </div>

          <button
            type="button"
            className="cloud-modal-close"
            aria-label="Close modal"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <CloudForm
          cloud={cloud}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}