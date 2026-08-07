import { useState } from "react";
import { X } from "lucide-react";

import { useDbSyncupHistory } from "../hooks/useDbSyncupHistory";
import type { DbSyncup } from "../types/db-syncup.types";
import type { DbSyncHistoryEntry } from "../types/history.types";

const PAGE_SIZE = 20;

function formatDateTime(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actionBadge(action: string): string {
  const a = String(action ?? "").trim().toLowerCase();
  if (a === "created") return "ods-badge ods-badge-success";
  if (a === "deleted") return "ods-badge ods-badge-danger";
  if (a === "updated" || a === "modified") return "ods-badge ods-badge-warning";
  return "ods-badge ods-badge-neutral";
}

function displayValue(value: string | undefined | null): string {
  if (value === undefined || value === null || value === "") return "—";
  try {
    if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
      return JSON.stringify(JSON.parse(value));
    }
  } catch {
    // fall through to raw value
  }
  return value;
}

function HistoryRow({ entry }: { entry: DbSyncHistoryEntry }) {
  const fieldName = entry.field_name
    ? entry.field_name.replace(/_/g, " ")
    : "—";

  return (
    <tr>
      <td>
        <span className={actionBadge(entry.action)}>
          {entry.action || "—"}
        </span>
      </td>
      <td style={{ color: "var(--ods-gray-700)", textTransform: "capitalize" }}>
        {fieldName}
      </td>
      <td style={{ color: "var(--ods-gray-600)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={displayValue(entry.old_value)}>
        {displayValue(entry.old_value)}
      </td>
      <td style={{ color: "var(--ods-gray-600)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={displayValue(entry.new_value)}>
        {displayValue(entry.new_value)}
      </td>
      <td style={{ color: "var(--ods-gray-700)" }}>
        {entry.changed_by_full_name || entry.changed_by_name || entry.changed_by_email || "—"}
      </td>
      <td style={{ color: "var(--ods-gray-500)", whiteSpace: "nowrap", fontSize: "var(--ods-font-size-xs)" }}>
        {formatDateTime(entry.created_at)}
      </td>
    </tr>
  );
}

interface DbSyncupHistoryModalProps {
  syncup: DbSyncup | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DbSyncupHistoryModal({
  syncup,
  isOpen,
  onClose,
}: DbSyncupHistoryModalProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = useDbSyncupHistory({
    dbSyncupId: syncup?.id ?? null,
    page,
    pageSize: PAGE_SIZE,
  });

  if (!isOpen || !syncup) return null;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div
      className="ods-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="ods-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="db-syncup-history-title"
        style={{ maxWidth: 900 }}
      >
        <div className="ods-modal-header">
          <div>
            <h2 className="ods-modal-title" id="db-syncup-history-title">
              DB Syncup History
            </h2>
            <p style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-400)", margin: "0.25rem 0 0" }}>
              {syncup.application_name} · Serial #{syncup.serial_number} · {total} change{total === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            className="ods-modal-close"
            aria-label="Close history modal"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "1.25rem", flex: 1, overflowY: "auto" }}>
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", minHeight: "20vh" }}>
              <div className="ods-spinner" />
              <p style={{ color: "var(--ods-gray-600)", fontSize: "var(--ods-font-size-sm)" }}>
                Loading history...
              </p>
            </div>
          ) : isError ? (
            <div className="ods-empty-state">
              <span className="ods-empty-icon">⚠️</span>
              <div className="ods-empty-title">Unable to load history</div>
            </div>
          ) : items.length === 0 ? (
            <div className="ods-empty-state" style={{ padding: "2rem" }}>
              <span className="ods-empty-icon">🗄️</span>
              <p className="ods-empty-text">
                No changes recorded for this DB syncup yet.
              </p>
            </div>
          ) : (
            <div className="ods-table-wrapper">
              <table className="ods-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: 90 }}>Action</th>
                    <th style={{ minWidth: 120 }}>Field</th>
                    <th style={{ minWidth: 160 }}>Old Value</th>
                    <th style={{ minWidth: 160 }}>New Value</th>
                    <th style={{ minWidth: 140 }}>Changed By</th>
                    <th style={{ minWidth: 140 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((entry) => (
                    <HistoryRow key={entry.id} entry={entry} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !isError && totalPages > 1 && (
            <div className="ods-pagination">
              <span className="ods-pagination-info">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>
              <div className="ods-pagination-actions">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
