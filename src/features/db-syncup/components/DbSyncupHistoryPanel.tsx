import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Search, X } from "lucide-react";

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
      <td style={{ color: "var(--ods-gray-700)" }}>
        {entry.changed_by_full_name || entry.changed_by_name || entry.changed_by_email || "NA"}
      </td>
      <td style={{ color: "var(--ods-gray-500)", whiteSpace: "nowrap", fontSize: "var(--ods-font-size-xs)" }}>
        {formatDateTime(entry.changed_at || entry.created_at)}
      </td>
      <td style={valueCellStyle}>{entry.message || "NA"}</td>
    </tr>
  );
}

interface DbSyncupHistoryPanelProps {
  dbSyncupId: number;
}

export default function DbSyncupHistoryPanel({ dbSyncupId }: DbSyncupHistoryPanelProps) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const { data, isLoading, isError, isFetching } = useDbSyncupHistory({
    dbSyncupId,
    page,
    pageSize: PAGE_SIZE,
    startDate: fromDate || null,
    endDate: toDate || null,
    search: search || null,
  });

  const items = useMemo(() => {
    return (data?.items ?? []).filter((entry) => !isScoreField(entry.field_name));
  }, [data]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || fromDate || toDate);

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

      <div
        className="ods-card-body"
        style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end", borderBottom: "1px solid var(--ods-gray-200)" }}
      >
        <div>
          <label style={{ display: "block", fontSize: "var(--ods-font-size-xs)", fontWeight: 600, color: "var(--ods-gray-600)", marginBottom: "0.25rem" }}>
            From
          </label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={fromDate}
            max={toDate || undefined}
            onChange={(e) => handleFilterChange(setFromDate)(e.target.value)}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "var(--ods-font-size-xs)", fontWeight: 600, color: "var(--ods-gray-600)", marginBottom: "0.25rem" }}>
            To
          </label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => handleFilterChange(setToDate)(e.target.value)}
          />
        </div>
        <div style={{ flex: "1 1 360px", minWidth: 280 }}>
          <label style={{ display: "block", fontSize: "var(--ods-font-size-xs)", fontWeight: 600, color: "var(--ods-gray-600)", marginBottom: "0.25rem" }}>
            Search
          </label>
          <div className="ods-search" style={{ width: "100%" }}>
            <Search className="ods-search-icon" size={15} />
            <input
              type="search"
              placeholder="Search application, user, field, value or reason"
              aria-label="Search DB syncup history"
              className="form-control form-control-sm"
              style={{ paddingRight: searchInput ? "2.25rem" : undefined }}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                aria-label="Clear history search"
                title="Clear search"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPage(1);
                }}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  padding: "0.2rem",
                  border: 0,
                  background: "transparent",
                  color: "var(--ods-gray-500)",
                  cursor: "pointer",
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setFromDate("");
              setToDate("");
              setPage(1);
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="ods-card-body" style={{ padding: isLoading || isError || items.length === 0 ? undefined : 0 }}>
        {isLoading ? (
          <PageLoader compact label="Loading history..." />
        ) : isError ? (
          <EmptyState icon="⚠️" title="Unable to load history" />
        ) : items.length === 0 ? (
          <EmptyState
            icon="🗄️"
            text={hasActiveFilters ? "No changes match the selected filters." : "No changes recorded for this DB syncup yet."}
          />
        ) : (
          <div className="ods-table-wrapper">
            <table className="ods-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 90 }}>Action</th>
                  <th style={{ minWidth: 120 }}>Field</th>
                  <th style={{ minWidth: 140 }}>Changed By</th>
                  <th style={{ minWidth: 160 }}>Changed At</th>
                  <th style={{ minWidth: 240 }}>Message</th>
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
