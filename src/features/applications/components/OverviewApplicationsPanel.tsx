import { type FormEvent } from "react";
import { Search, X } from "lucide-react";

import { EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";

import { getCloudNames, getMigrationStatus, getStatusBadgeClass } from "../utils/status";
import type { Application } from "../types/application.types";

interface OverviewApplicationsPanelProps {
  applications: Application[];
  totalCount: number;
  isFetching: boolean;
  search: string;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e: FormEvent<HTMLFormElement>) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  cloudFilter: string;
  onCloudFilterChange: (value: string) => void;
  domainFilter: string;
  onDomainFilterChange: (value: string) => void;
  domains: string[];
  onClearFilters: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function OverviewApplicationsPanel({
  applications,
  totalCount,
  isFetching,
  search,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  statusFilter,
  onStatusFilterChange,
  cloudFilter,
  onCloudFilterChange,
  domainFilter,
  onDomainFilterChange,
  domains,
  onClearFilters,
  page,
  totalPages,
  onPageChange,
}: OverviewApplicationsPanelProps) {
  return (
    <div className="ods-card">
      {/* Toolbar: search + filters */}
      <div className="ods-card-header" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
        <form onSubmit={onSearchSubmit} style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: 260 }}>
          <div className="ods-search" style={{ flex: 1 }}>
            <Search className="ods-search-icon" size={15} />
            <input
              type="search"
              className="form-control form-control-sm"
              value={searchInput}
              placeholder="Search application, domain or Carto ID..."
              onChange={(e) => onSearchInputChange(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <select className="form-select form-select-sm" style={{ width: "auto" }} value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="In progress">In progress</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>

          <select className="form-select form-select-sm" style={{ width: "auto" }} value={cloudFilter}
            onChange={(e) => onCloudFilterChange(e.target.value)}>
            <option value="all">All clouds</option>
            <option value="Azure">Azure</option>
            <option value="Blue">Blue</option>
          </select>

          <select className="form-select form-select-sm" style={{ width: "auto" }} value={domainFilter}
            onChange={(e) => onDomainFilterChange(e.target.value)}>
            <option value="all">All domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClearFilters}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <X size={13} /> Clear
          </button>
        </div>
      </div>

      {/* Result count */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 1.25rem", background: "var(--ods-gray-100)", borderBottom: "1px solid var(--ods-gray-200)", fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-600)" }}>
        <span>
          <strong style={{ color: "var(--ods-gray-900)" }}>{totalCount}</strong> applications shown
        </span>
        {isFetching && <span style={{ color: "var(--ods-orange)" }}>Refreshing...</span>}
      </div>

      {/* Table */}
      <div className="ods-card-body" style={{ padding: 0 }}>
        <div className="ods-table-wrapper">
          <table className="ods-table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Domain</th>
                <th>Cloud</th>
                <th>DevOps Owner</th>
                <th>Migration</th>
                <th>Progress</th>
                <th>Assessment</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      compact
                      icon="📋"
                      text={search ? `No applications found for "${search}".` : "No applications found."}
                    />
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const migStatus = getMigrationStatus(app);
                  const progress  = app.migration?.migration_progress ?? 0;
                  const owners    = app.owners ?? [];
                  const getOwner  = (type: string) => owners.find((o) => o.owner_type?.toLowerCase() === type.toLowerCase());

                  return (
                    <tr key={app.id}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                          <strong style={{ color: "var(--ods-gray-900)", fontSize: "var(--ods-font-size-sm)" }}>
                            {app.application_name}
                          </strong>
                          <span style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-500)" }}>
                            Carto: {app.carto_id || "NA"}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: "var(--ods-gray-700)" }}>{app.confirmed_domain || app.domain || "NA"}</td>
                      <td>
                        <span style={{ fontSize: "var(--ods-font-size-xs)", background: "var(--ods-gray-100)", color: "var(--ods-gray-700)", padding: "0.2rem 0.5rem", border: "1px solid var(--ods-gray-300)", whiteSpace: "nowrap" }}>
                          {getCloudNames(app)}
                        </span>
                      </td>
                      <td style={{ color: "var(--ods-gray-600)" }}>{getOwner("DevOps")?.owner_name || "NA"}</td>
                      <td><span className={getStatusBadgeClass(migStatus)}>{migStatus}</span></td>
                      <td style={{ minWidth: 90 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          <span style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-600)", textAlign: "right" }}>{progress}%</span>
                          <div style={{ height: 6, background: "var(--ods-gray-200)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, progress))}%`, background: progress >= 100 ? "var(--ods-success)" : "var(--ods-orange)", transition: "width 0.3s ease" }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "var(--ods-gray-600)" }}>{app.meta_data?.assessment_status || "NA"}</td>
                      <td style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-500)", whiteSpace: "nowrap" }}>
                        {formatDate(app.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1.25rem", borderTop: "1px solid var(--ods-gray-200)" }}>
        <span style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-600)" }}>
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
            Previous
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled={page >= totalPages || applications.length === 0}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
