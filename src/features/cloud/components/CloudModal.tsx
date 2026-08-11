import { Modal } from "@/components/ui";

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
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={cloud ? "Edit Cloud" : "Add Cloud"}
      description="Configure a cloud provider connection."
      closeDisabled={isSubmitting}
    >
      <CloudForm
        cloud={cloud}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
