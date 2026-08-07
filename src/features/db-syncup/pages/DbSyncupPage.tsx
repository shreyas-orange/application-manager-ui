import { useState } from "react";
import { Plus, RefreshCw } from "lucide-react";

import { useAllApplications } from "@/features/applications/hooks/useAllApplications";
import { getApiErrorMessage } from "@/lib/api-error";

import DbSyncupEditDrawer from "../components/DbSyncupEditDrawer";
import DbSyncupHistoryModal from "../components/DbSyncupHistoryModal";
import DbSyncupTable from "../components/DbSyncupTable";
import {
  useAllDbSyncups,
  useCreateDbSyncup,
  useDeleteDbSyncup,
  useUpdateDbSyncup,
} from "../hooks/useDbSyncup";
import type {
  CreateDbSyncupPayload,
  DbSyncup,
  UpdateDbSyncupPayload,
} from "../types/db-syncup.types";

const PAGE_SIZE = 10;

export default function DbSyncupPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useAllDbSyncups();

  const applicationsQuery = useAllApplications();
  const applications = applicationsQuery.data?.items ?? [];
  const createMutation = useCreateDbSyncup();
  const updateMutation = useUpdateDbSyncup();
  const deleteMutation = useDeleteDbSyncup();

  const [page, setPage] = useState(1);
  const [editingItem, setEditingItem] = useState<DbSyncup | null>(null);
  const [creating, setCreating] = useState(false);
  const [historyItem, setHistoryItem] = useState<DbSyncup | null>(null);
  const [message, setMessage] = useState("");
  const [pageError, setPageError] = useState("");

  const items = data ?? [];
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = items.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const syncedApplicationIds = new Set(
    items.map((i) => i.application_id),
  );
  const availableApplications = applications.filter(
    (app) => !syncedApplicationIds.has(app.id),
  );

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
      setPageError(getApiErrorMessage(err));
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
          minHeight: "60vh",
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
          {error instanceof Error ? error.message : "Something went wrong while loading DB syncup."}
        </p>
        <button
          type="button"
          className="btn btn-primary mt-3"
          onClick={() => {
            void refetch();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="ods-page-header">
        <div>
          <h1 className="page-title">DB Syncup</h1>
          <p className="page-subtitle">
            View, create and manage database syncup records across applications.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={isFetching}
            onClick={() => {
              void refetch();
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <RefreshCw
              size={15}
              style={{
                animation: isFetching ? "ods-spin 0.7s linear infinite" : "none",
              }}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingItem(null);
              setPageError("");
              setCreating(true);
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} />
            Add Syncup
          </button>
        </div>
      </div>

      {/* ── Alerts ───────────────────────────────────────────── */}
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

      {/* ── Result count ────────────────────────────────────── */}
      <div className="ods-list-toolbar">
        <span className="ods-list-count">
          <strong style={{ color: "var(--ods-gray-900)" }}>{items.length}</strong>{" "}
          syncup record{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* ── Table / empty state ─────────────────────────────── */}
      {items.length === 0 ? (
        <div className="ods-card" style={{ padding: "3rem" }}>
          <div className="ods-empty-state">
            <span className="ods-empty-icon">🗄️</span>
            <div className="ods-empty-title">No DB syncup data</div>
            <p className="ods-empty-text">
              No DB syncup records found yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="ods-card">
          <div className="ods-card-body" style={{ padding: 0 }}>
            <DbSyncupTable
              items={pagedItems}
              deletingId={deleteMutation.isPending ? (deleteMutation.variables ?? null) : null}
              onEdit={(item) => {
                setCreating(false);
                setPageError("");
                setEditingItem(item);
              }}
              onDelete={handleDelete}
              onHistory={(item) => setHistoryItem(item)}
            />
          </div>

          {/* ── Pagination ──────────────────────────────────── */}
          <div className="ods-pagination">
            <span className="ods-pagination-info">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <div className="ods-pagination-actions">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage <= 1}
                onClick={() => {
                  setPage((current) => Math.max(1, current - 1));
                }}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => {
                  setPage((current) => Math.min(totalPages, current + 1));
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit / Create drawer ────────────────────────────── */}
      <DbSyncupEditDrawer
        application={null}
        item={editingItem}
        isOpen={editingItem !== null || creating}
        nextSerialNumber={nextSerialNumber}
        applications={availableApplications}
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
    </div>
  );
}