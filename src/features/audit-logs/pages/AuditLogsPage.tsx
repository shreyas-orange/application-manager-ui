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

import "../styles/audit-logs.css";

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

  if (isLoading) {
    return (
      <div className="list-state">
        Loading audit logs...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="list-state list-state--error">
        <h2>Unable to load audit logs</h2>

        <p>
          {error instanceof Error
            ? error.message
            : "Something went wrong while loading audit logs."}
        </p>

        <button
          type="button"
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
    <section className="audit-logs-page">
      <div className="list-page-header">
        <div>
          <h1>Audit Logs</h1>
        </div>

        <button
          type="button"
          className="secondary-button"
          disabled={isFetching}
          onClick={() => {
            void refetch();
          }}
        >
          <RefreshCw
            size={17}
            className={
              isFetching
                ? "spin-icon"
                : undefined
            }
          />

          {isFetching
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      <div className="list-toolbar">
        <div className="audit-search">
          <Search
            size={18}
            className="audit-search__icon"
          />

          <input
            type="search"
            value={searchInput}
            placeholder="Search user, action, module or details..."
            aria-label="Search audit logs"
            onChange={(event) => {
              setSearchInput(
                event.target.value,
              );
            }}
          />

          {searchInput && (
            <button
              type="button"
              className="audit-search__clear"
              aria-label="Clear search"
              onClick={clearSearch}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <span className="list-count">
          {total} audit log
          {total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="table-container">
        <table className="data-table">
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
                <td
                  colSpan={6}
                  className="empty-table-cell"
                >
                  {search
                    ? `No audit logs found for "${search}".`
                    : "No audit logs found."}
                </td>
              </tr>
            ) : (
              auditLogs.map((log, index) => (
                <tr key={log.id}>
                  <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>

                  <td>
                    {log.user?.email ??
                      log.user_email ??
                      "System"}
                  </td>

                  <td>
                    <span className="audit-action-badge">
                      {log.action ?? "—"}
                    </span>
                  </td>

                  <td>
                    {log.module ??
                      log.entity_type ??
                      log.resource_type ??
                      "—"}
                  </td>

                  <td>
                    {log.description ??
                      log.details ??
                      "—"}
                  </td>

                  <td>
                    {formatDate(
                      log.created_at,
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          type="button"
          disabled={
            currentPage <= 1 ||
            isFetching
          }
          onClick={() => {
            setPage((current) =>
              Math.max(1, current - 1),
            );
          }}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of{" "}
          {totalPages}
        </span>

        <button
          type="button"
          disabled={
            currentPage >= totalPages ||
            auditLogs.length === 0 ||
            isFetching
          }
          onClick={() => {
            setPage((current) =>
              Math.min(
                totalPages,
                current + 1,
              ),
            );
          }}
        >
          Next
        </button>
      </div>
    </section>
  );
}