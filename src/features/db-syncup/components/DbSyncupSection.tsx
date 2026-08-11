import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import type { Application } from "@/features/applications/types/application.types";
import { getApiErrorMessage } from "@/lib/api-error";
import { EmptyState, PageLoader, useConfirmDialog } from "@/components/ui";

import DbSyncupEditDrawer from "./DbSyncupEditDrawer";
import DbSyncupHistoryModal from "./DbSyncupHistoryModal";
import DbSyncupTable from "./DbSyncupTable";
import {
  useCreateDbSyncup,
  useDbSyncups,
  useDeleteDbSyncup,
  useUpdateDbSyncup,
} from "../hooks/useDbSyncup";
import type {
  CreateDbSyncupPayload,
  DbSyncup,
  UpdateDbSyncupPayload,
} from "../types/db-syncup.types";

export default function DbSyncupSection({
  application,
  applicationId,
}: {
  application: Application;
  applicationId: number;
}) {
  const { confirm, dialog } = useConfirmDialog();

  const { data, isLoading, isError, error, refetch, isFetching } =
    useDbSyncups(applicationId);
  const createMutation = useCreateDbSyncup();
  const updateMutation = useUpdateDbSyncup();
  const deleteMutation = useDeleteDbSyncup();

  const [editingItem, setEditingItem] = useState<DbSyncup | null>(null);
  const [creating, setCreating] = useState(false);
  const [historyItem, setHistoryItem] = useState<DbSyncup | null>(null);
  const [message, setMessage] = useState("");
  const [pageError, setPageError] = useState("");

  const items = data ?? [];

  const nextSerialNumber =
    items.length > 0
      ? Math.max(...items.map((i) => i.serial_number)) + 1
      : 1;

  const handleSave = async (
    payload: CreateDbSyncupPayload | UpdateDbSyncupPayload,
    syncupId?: number,
  ) => {
    setPageError("");
    setMessage("");

    if (syncupId != null) {
      await updateMutation.mutateAsync({
        syncupId,
        payload: payload as UpdateDbSyncupPayload,
      });
      setMessage("DB syncup updated successfully.");
    } else {
      await createMutation.mutateAsync(payload as CreateDbSyncupPayload);
      setMessage("DB syncup created successfully.");
    }
  };

  const handleDelete = async (item: DbSyncup) => {
    const confirmed = await confirm({
      title: "Delete DB syncup record",
      message: `Delete DB syncup record #${item.serial_number}? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;

    setPageError("");
    setMessage("");

    try {
      await deleteMutation.mutateAsync(item.id);
      setMessage("DB syncup deleted successfully.");
    } catch (err) {
      setPageError(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return <PageLoader compact label="Loading DB syncup..." />;
  }

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load DB syncup"
        text={error instanceof Error ? error.message : "Something went wrong."}
        action={
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={() => { void refetch(); }}
          >
            Try Again
          </button>
        }
      />
    );
  }

  return (
    <div>
      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <span className="ods-list-count">
          <strong style={{ color: "var(--ods-gray-900)" }}>{items.length}</strong>{" "}
          syncup record{items.length === 1 ? "" : "s"}
        </span>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={isFetching}
            onClick={() => { void refetch(); }}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <RefreshCw
              size={14}
              style={{
                animation: isFetching
                  ? "ods-spin 0.7s linear infinite"
                  : "none",
              }}
            />
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditingItem(null);
              setPageError("");
              setCreating(true);
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <Plus size={15} />
            Add Syncup
          </button>
        </div>
      </div>

      {/* ── Alerts ────────────────────────────────────────────── */}
      {message && (
        <div className="ods-form-message success" style={{ margin: "0 0 1rem" }}>
          {message}
        </div>
      )}

      {pageError && (
        <div className="ods-form-message error" style={{ margin: "0 0 1rem" }}>
          {pageError}
        </div>
      )}

      {/* ── Table / empty state ───────────────────────────────── */}
      {items.length === 0 ? (
        <div className="ods-card" style={{ padding: "3rem" }}>
          <EmptyState
            icon="🗄️"
            title="No DB syncup data"
            text="No DB syncup records found for this application yet."
          />
        </div>
      ) : (
        <div className="ods-card">
          <div className="ods-card-body" style={{ padding: 0 }}>
            <DbSyncupTable
              items={items}
              deletingId={deleteMutation.isPending ? (deleteMutation.variables ?? null) : null}
              onRowClick={(item) => {
                setCreating(false);
                setPageError("");
                setEditingItem(item);
              }}
              onDelete={handleDelete}
              onHistory={(item) => setHistoryItem(item)}
            />
          </div>
        </div>
      )}

      {/* ── Edit / Create drawer ─────────────────────────────── */}
      <DbSyncupEditDrawer
        application={application}
        applicationId={applicationId}
        item={editingItem}
        isOpen={editingItem !== null || creating}
        nextSerialNumber={nextSerialNumber}
        wide={editingItem !== null}
        onClose={() => {
          setEditingItem(null);
          setCreating(false);
        }}
        onSave={handleSave}
      />

      {/* ── History modal ───────────────────────────────────── */}
      <DbSyncupHistoryModal
        syncup={historyItem}
        isOpen={historyItem !== null}
        onClose={() => setHistoryItem(null)}
      />

      {dialog}
    </div>
  );
}
