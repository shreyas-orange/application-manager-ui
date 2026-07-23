import {
  useEffect,
  useState,
} from "react";
import {
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { useAuditLogs } from "../hooks/useAuditLogs";


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
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
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
    return (
      <div
        style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          minHeight:      "60vh",
          gap:            "1rem",
        }}
      >
        <div className="ods-spinner" />
        <p style={{ color: "var(--ods-gray-600)", fontSize: "var(--ods-font-size-sm)" }}>
          Loading audit logs...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="ods-empty-state">
        <span className="ods-empty-icon">⚠️</span>
        <div className="ods-empty-title">Unable to load audit logs</div>
        <p className="ods-empty-text">
          {error instanceof Error
            ? error.message
            : "Something went wrong while loading audit logs."}
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
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">
            Track user actions and system events.
          </p>
        </div>

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
      </div>

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
                      <div className="ods-empty-state" style={{ padding: "2rem" }}>
                        <span className="ods-empty-icon">📋</span>
                        <p className="ods-empty-text">
                          {search
                            ? `No audit logs found for "${search}".`
                            : "No audit logs found."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log, index) => (
                    <tr key={log.id}>
                      <td style={{ color: "var(--ods-gray-500)" }}>
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>

                      <td style={{ color: "var(--ods-gray-700)" }}>
                        {log.user?.email ?? log.user_email ?? "System"}
                      </td>

                      <td>
                        <span className={getActionBadgeClass(log.action ?? "")}>
                          {log.action ?? "—"}
                        </span>
                      </td>

                      <td style={{ color: "var(--ods-gray-600)" }}>
                        {log.module ?? log.entity_type ?? log.resource_type ?? "—"}
                      </td>

                      <td style={{ color: "var(--ods-gray-600)", maxWidth: 200 }}>
                        <span
                          style={{
                            display:      "block",
                            overflow:     "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace:   "nowrap",
                          }}
                          title={log.description ?? log.details ?? "—"}
                        >
                          {log.description ?? log.details ?? "—"}
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
