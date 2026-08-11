import {
  useEffect,
  useState,
} from "react";
import {
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { EmptyState, PageHeader, PageLoader } from "@/components/ui";

import { useAuditLogs } from "../hooks/useAuditLogs";

import type { AuditLog } from "../types/audit-log.types";


const PAGE_SIZE = 10;

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] =
    useState("");
  const [search, setSearch] =
    useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => {
        setSearch(searchInput.trim());
        setPage(1);
      },
      400,
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useAuditLogs({
    page,
    pageSize: PAGE_SIZE,
    search,
  });

  const auditLogs = data?.items ?? [];
  const currentPage = data?.page ?? page;
  const total = data?.total ?? 0;

  const totalPages = Math.max(
    1,
    data?.total_pages ??
      Math.ceil(total / PAGE_SIZE),
  );

  const formatDate = (
    value?: string,
  ): string => {
    if (!value) {
      return "NA";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "NA";
    }

    return date.toLocaleString();
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const getActionBadgeClass = (action: string): string => {
    const a = action.trim().toLowerCase();
    if (a === "create") return "ods-badge ods-badge-success";
    if (a === "delete") return "ods-badge ods-badge-danger";
    return "ods-badge ods-badge-info";
  };

  if (isLoading) {
    return <PageLoader label="Loading audit logs..." />;
  }

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load audit logs"
        text={
          error instanceof Error
            ? error.message
            : "Something went wrong while loading audit logs."
        }
        action={
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={() => {
              void refetch();
            }}
          >
            Try again
          </button>
        }
      />
    );
  }

  return (
    <div>

      <PageHeader
        title="Audit Logs"
        subtitle="Track user actions and system events."
        actions={
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
        }
      />

      {/* ── Main panel ──────────────────────────────────────── */}
      <div className="ods-card">

        {/* ── Toolbar ───────────────────────────────────────── */}
        <div className="ods-card-header" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
          <div className="ods-search" style={{ flex: 1, minWidth: 260 }}>
            <Search className="ods-search-icon" size={15} />
            <input
              type="search"
              className="form-control form-control-sm"
              value={searchInput}
              placeholder="Search user, action, module or details..."
              aria-label="Search audit logs"
              onChange={(event) => {
                setSearchInput(event.target.value);
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                style={{
                  position:  "absolute",
                  right:     "0.5rem",
                  top:       "50%",
                  transform: "translateY(-50%)",
                  background:"none",
                  border:    "none",
                  color:     "var(--ods-gray-500)",
                  cursor:    "pointer",
                  padding:   "0.25rem",
                  display:   "flex",
                  alignItems:"center",
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ── Result count ──────────────────────────────────── */}
        <div className="ods-list-toolbar">
          <span className="ods-list-count">
            <strong style={{ color: "var(--ods-gray-900)" }}>{total}</strong> audit log{total === 1 ? "" : "s"}
          </span>
        </div>

        {/* ── Table ─────────────────────────────────────────── */}
        <div className="ods-card-body" style={{ padding: 0 }}>
          <div className="ods-table-wrapper">
            <table className="ods-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Details</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        compact
                        icon="📋"
                        text={search ? `No audit logs found for "${search}".` : "No audit logs found."}
                      />
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log: AuditLog, index: number) => (
                    <tr key={log.id}>
                      <td style={{ color: "var(--ods-gray-500)" }}>
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>

                      <td style={{ color: "var(--ods-gray-700)" }}>
                        {log.user?.email ?? log.user_email ?? "System"}
                      </td>

                      <td>
                        <span className={getActionBadgeClass(log.action ?? "")}>
                          {log.action ?? "NA"}
                        </span>
                      </td>

                      <td style={{ color: "var(--ods-gray-600)" }}>
                        {log.module ?? log.entity_type ?? log.resource_type ?? "NA"}
                      </td>

                      <td style={{ color: "var(--ods-gray-600)", maxWidth: 200 }}>
                        <span
                          style={{
                            display:      "block",
                            overflow:     "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace:   "nowrap",
                          }}
                          title={log.description ?? log.details ?? "NA"}
                        >
                          {log.description ?? log.details ?? "NA"}
                        </span>
                      </td>

                      <td style={{ color: "var(--ods-gray-500)", whiteSpace: "nowrap" }}>
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ────────────────────────────────────── */}
        <div className="ods-pagination">
          <span className="ods-pagination-info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>

          <div className="ods-pagination-actions">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={currentPage <= 1 || isFetching}
              onClick={() => {
                setPage((current) => Math.max(1, current - 1));
              }}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={currentPage >= totalPages || auditLogs.length === 0 || isFetching}
              onClick={() => {
                setPage((current) => Math.min(totalPages, current + 1));
              }}
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
