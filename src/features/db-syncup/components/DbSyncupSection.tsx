import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import type { Application } from "@/features/applications/types/application.types";

import DbSyncupEditDrawer from "./DbSyncupEditDrawer";
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

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const axiosError = error as {
      response?: {
        data?: {
          detail?: string;
          message?: string;
        };
      };
    };

    return (
      axiosError.response?.data?.detail ??
      axiosError.response?.data?.message ??
      "Something went wrong."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export default function DbSyncupSection({
  application,
}: {
  application: Application;
}) {
  const appId = application.id;
  const { data, isLoading, isError, error, refetch, isFetching } =
    useDbSyncups(appId);
  const createMutation = useCreateDbSyncup();
  const updateMutation = useUpdateDbSyncup();
  const deleteMutation = useDeleteDbSyncup();

  const [editingItem, setEditingItem] = useState<DbSyncup | null>(null);
  const [creating, setCreating] = useState(false);
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
      await updateMutation.mutateAsync({ syncupId, payload });
      setMessage("DB syncup updated successfully.");
    } else {
      await createMutation.mutateAsync(payload as CreateDbSyncupPayload);
      setMessage("DB syncup created successfully.");
    }
  };

  const handleDelete = async (item: DbSyncup) => {
    const confirmed = window.confirm(
      `Delete DB syncup record #${item.serial_number}?`,
    );
    if (!confirmed) return;

    setPageError("");
    setMessage("");

    try {
      await deleteMutation.mutateAsync(item.id);
      setMessage("DB syncup deleted successfully.");
    } catch (err) {
      setPageError(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "40vh",
          gap: "1rem",
        }}
      >
        <div className="ods-spinner" />
        <p style={{ color: "var(--ods-gray-600)", fontSize: "var(--ods-font-size-sm)" }}>
          Loading DB syncup...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="ods-empty-state">
        <span className="ods-empty-icon">⚠️</span>
        <div className="ods-empty-title">Unable to load DB syncup</div>
        <p className="ods-empty-text">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
        <button
          type="button"
          className="btn btn-primary mt-3"
          onClick={() => { void refetch(); }}
        >
          Try Again
        </button>
      </div>
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
          <div className="ods-empty-state">
            <span className="ods-empty-icon">🗄️</span>
            <div className="ods-empty-title">No DB syncup data</div>
            <p className="ods-empty-text">
              No DB syncup records found for this application yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="ods-card">
          <div className="ods-card-body" style={{ padding: 0 }}>
            <DbSyncupTable
              items={items}
              deletingId={deleteMutation.isPending ? (deleteMutation.variables ?? null) : null}
              onEdit={(item) => {
                setCreating(false);
                setPageError("");
                setEditingItem(item);
              }}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      {/* ── Edit / Create drawer ─────────────────────────────── */}
      <DbSyncupEditDrawer
        application={application}
        item={editingItem}
        isOpen={editingItem !== null || creating}
        nextSerialNumber={nextSerialNumber}
        onClose={() => {
          setEditingItem(null);
          setCreating(false);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
