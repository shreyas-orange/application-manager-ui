import { X } from "lucide-react";

import type {
  CloudConfiguration,
  CreateCloudRequest,
} from "../types/clouds.types";

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
      className="ods-modal-overlay"
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
        className="ods-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cloud-modal-title"
      >
        <div className="ods-modal-header">
          <div>
            <h2 className="ods-modal-title" id="cloud-modal-title">
              {cloud
                ? "Edit Cloud"
                : "Add Cloud"}
            </h2>
            <p style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-400)", margin: "0.25rem 0 0" }}>
              Configure a cloud provider connection.
            </p>
          </div>

          <button
            type="button"
            className="ods-modal-close"
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
