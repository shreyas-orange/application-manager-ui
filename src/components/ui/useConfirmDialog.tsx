import { useCallback, useState, type ReactNode } from "react";

import { ConfirmDialog } from "./ConfirmDialog";

interface ConfirmOptions {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

/**
 * Drop-in replacement for `window.confirm()` that renders through the
 * app's own Modal instead of the browser's native dialog.
 *
 *   const { confirm, dialog } = useConfirmDialog();
 *   const ok = await confirm({ title: "Delete user", message: "...", danger: true });
 *   if (!ok) return;
 *   // ...
 *   return <>{dialog}...</>
 */
export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const settle = (confirmed: boolean) => {
    pending?.resolve(confirmed);
    setPending(null);
  };

  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      title={pending?.title ?? ""}
      message={pending?.message ?? ""}
      confirmLabel={pending?.confirmLabel}
      cancelLabel={pending?.cancelLabel}
      danger={pending?.danger}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  );

  return { confirm, dialog };
}
