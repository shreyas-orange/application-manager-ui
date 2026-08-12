import { useState } from "react";
import type { CSSProperties } from "react";

import { EmptyState, PageLoader } from "@/components/ui";

import {
  DB_SYNCUP_STATUS_OPTIONS,
  ENVIRONMENT_TYPE_OPTIONS,
} from "../constants";
import { useDbSyncupHistory } from "../hooks/useDbSyncupHistory";
import type { DbSyncHistoryEntry } from "../types/history.types";

const PAGE_SIZE = 20;

function formatDateTime(value: string | undefined): string {
  if (!value) return "NA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "NA";
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

function normalizeFieldName(fieldName: string | undefined | null): string {
  return String(fieldName ?? "").trim().toLowerCase().replace(/\s+/g, "_");
}

// The environment score is a backend-only field — never surface it in the UI.
function isScoreField(fieldName: string | undefined | null): boolean {
  return normalizeFieldName(fieldName) === "environment_score";
}

function environmentLabel(code: string): string {
  return ENVIRONMENT_TYPE_OPTIONS.find((o) => o.value === code)?.label ?? code;
}

function statusLabel(code: string): string {
  return DB_SYNCUP_STATUS_OPTIONS.find((o) => o.value === code)?.label ?? code;
}

/** Turns a raw environment-request snapshot (as recorded on CREATED/DELETED history rows) into a readable sentence. */
function formatSnapshot(snapshot: Record<string, unknown>, action: string): string {
  const environment = snapshot.environment ? environmentLabel(String(snapshot.environment)) : null;
  if (!environment) return "NA";

  const priority = snapshot.priority ? String(snapshot.priority) : null;
  const status = snapshot.request_status ? statusLabel(String(snapshot.request_status)) : null;
  const remarks = typeof snapshot.remarks === "string" && snapshot.remarks.trim() ? snapshot.remarks.trim() : null;

  const verb = normalizeFieldName(action) === "deleted" ? "Removed" : "Requested";
  const details = [
    priority ? `${priority} priority` : null,
    status ? `${status} status` : null,
  ].filter((part): part is string => Boolean(part));

  let message = `${verb} ${environment} environment`;
  if (details.length > 0) message += ` with ${details.join(" and ")}`;
  if (remarks) message += ` — "${remarks}"`;

  return message;
}

function displayValue(value: string | undefined | null, action: string): string {
  if (value === undefined || value === null || value === "") return "NA";

  const trimmed = value.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return formatSnapshot(parsed as Record<string, unknown>, action);
      }
    } catch {
      // fall through to raw value
    }
  }

  return value;
}

const valueCellStyle: CSSProperties = {
  color: "var(--ods-gray-600)",
  maxWidth: 320,
  whiteSpace: "normal",
  wordBreak: "break-word",
};

function HistoryRow({ entry }: { entry: DbSyncHistoryEntry }) {
  const fieldName = entry.field_name ? entry.field_name.replace(/_/g, " ") : "NA";

  return (
    <tr>
      <td>
        <span className={actionBadge(entry.action)}>{entry.action || "NA"}</span>
      </td>
      <td style={{ color: "var(--ods-gray-700)", textTransform: "capitalize" }}>{fieldName}</td>
      <td style={valueCellStyle}>{displayValue(entry.old_value, entry.action)}</td>
      <td style={valueCellStyle}>{displayValue(entry.new_value, entry.action)}</td>
      <td style={{ color: "var(--ods-gray-700)" }}>
        {entry.changed_by_full_name || entry.changed_by_name || entry.changed_by_email || "NA"}
      </td>
      <td style={{ color: "var(--ods-gray-500)", whiteSpace: "nowrap", fontSize: "var(--ods-font-size-xs)" }}>
        {formatDateTime(entry.created_at)}
      </td>
    </tr>
  );
}

interface DbSyncupHistoryPanelProps {
  dbSyncupId: number;
}

export default function DbSyncupHistoryPanel({ dbSyncupId }: DbSyncupHistoryPanelProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = useDbSyncupHistory({
    dbSyncupId,
    page,
    pageSize: PAGE_SIZE,
  });

  const items = (data?.items ?? []).filter((entry) => !isScoreField(entry.field_name));
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="ods-card">
      <div className="ods-card-header">
        <h2 className="ods-card-title">History</h2>
        {total > 0 && (
          <span className="ods-badge ods-badge-neutral no-dot">
            {total} change{total === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="ods-card-body" style={{ padding: isLoading || isError || items.length === 0 ? undefined : 0 }}>
        {isLoading ? (
          <PageLoader compact label="Loading history..." />
        ) : isError ? (
          <EmptyState icon="⚠️" title="Unable to load history" />
        ) : items.length === 0 ? (
          <EmptyState icon="🗄️" text="No changes recorded for this DB syncup yet." />
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
      </div>

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
  );
}
