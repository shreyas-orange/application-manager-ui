import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";

import type { Application } from "@/features/applications/types/application.types";
import { getApiErrorMessage } from "@/lib/api-error";
import { EmptyState, PageLoader, useConfirmDialog } from "@/components/ui";

import DbSyncupCreateDrawer from "./DbSyncupCreateDrawer";
import DbSyncupTable from "./DbSyncupTable";
import {
  useCreateDbSyncup,
  useDbSyncups,
  useDeleteDbSyncup,
} from "../hooks/useDbSyncup";
import type { CreateDbSyncupPayload, DbSyncup } from "../types/db-syncup.types";

export default function DbSyncupSection({
  application,
  applicationId,
}: {
  application: Application;
  applicationId: number;
}) {
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirmDialog();

  const { data, isLoading, isError, error, refetch, isFetching } =
    useDbSyncups(applicationId);
  const createMutation = useCreateDbSyncup();
  const deleteMutation = useDeleteDbSyncup();

  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [pageError, setPageError] = useState("");

  const items = data ?? [];

  const nextSerialNumber =
    items.length > 0
      ? Math.max(...items.map((item) => item.serial_number ?? item.id)) + 1
      : 1;

  const handleCreate = async (payload: CreateDbSyncupPayload) => {
    setPageError("");
    setMessage("");
    await createMutation.mutateAsync(payload);
    setMessage("Database migration created successfully.");
  };

  const handleDelete = async (item: DbSyncup) => {
    const confirmed = await confirm({
      title: "Delete database migration",
      message: `Delete database migration #${item.serial_number ?? item.id}? This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;

    setPageError("");
    setMessage("");

    try {
      await deleteMutation.mutateAsync(item.id);
      setMessage("Database migration deleted successfully.");
    } catch (err) {
      setPageError(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return <PageLoader compact label="Loading database migrations..." />;
  }

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load database migrations"
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
          database migration record{items.length === 1 ? "" : "s"}
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
              setPageError("");
              setCreating(true);
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <Plus size={15} />
            Add Database Migration
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
            title="No database migration data"
            text="No database migration records found for this application yet."
          />
        </div>
      ) : (
        <div className="ods-card">
          <div className="ods-card-body" style={{ padding: 0 }}>
            <DbSyncupTable
              items={items}
              deletingId={deleteMutation.isPending ? (deleteMutation.variables ?? null) : null}
              onRowClick={(item) => navigate(`/app/db-syncups/${item.id}?applicationId=${item.application_id}`)}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      {/* ── Create drawer ─────────────────────────────────────── */}
      <DbSyncupCreateDrawer
        application={application}
        isOpen={creating}
        nextSerialNumber={nextSerialNumber}
        onClose={() => setCreating(false)}
        onSave={handleCreate}
      />

      {dialog}
    </div>
  );
}
