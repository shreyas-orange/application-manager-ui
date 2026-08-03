// src/features/applications/pages/ApplicationsPage.tsx
import {
  type FormEvent,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import {
  AppWindow,
  CheckCircle,
  CircleX,
  Clock3,
  Hourglass,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import RoadmapImportButton           from "@/features/roadmap/components/RoadmapImportButton";
import ApplicationSummaryCard        from "../components/ApplicationSummaryCard";
import { useApplications }           from "../hooks/useApplications";
import type {
  Application,
  ApplicationOwner,
} from "../types/application.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalizeValue(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

function getOwnerByType(
  owners: ApplicationOwner[] | undefined,
  ownerType: string,
): ApplicationOwner | undefined {
  return owners?.find(
    (o) => normalizeValue(o.owner_type) === normalizeValue(ownerType),
  );
}

function getOwnerName(app: Application, ownerType: string): string {
  return getOwnerByType(app.owners, ownerType)?.owner_name || "—";
}

function getCloudNames(app: Application): string {
  const names =
    app.cloud_mappings
      ?.map((m) => m.cloud?.name)
      .filter((n): n is string => Boolean(n)) ?? [];
  return names.length > 0 ? names.join(", ") : "—";
}

function getMigrationStatus(app: Application): string {
  return app.migration?.migration_status || app.application_status || "Pending";
}

function getStatusBadgeClass(status: string | null | undefined): string {
  const s = normalizeValue(status);
  if (["completed", "complete", "done", "production"].includes(s))
    return "ods-badge ods-badge-success";
  if (["failed", "failure", "cancelled"].includes(s))
    return "ods-badge ods-badge-danger";
  if (["in progress", "in_progress", "ongoing", "started"].includes(s))
    return "ods-badge ods-badge-warning";
  return "ods-badge ods-badge-neutral";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ApplicationsPage() {
  const navigate                  = useNavigate();
  const [searchInput, setSearchInput]   = useState("");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [cloudFilter, setCloudFilter]   = useState("all");

  const pageSize = 10;

  const { data, isLoading, isError, error, isFetching, refetch } =
    useApplications({ page, pageSize, search });

  const applications = data?.items ?? [];
  const total        = data?.total  ?? applications.length;
  const totalPages   = Math.max(1, Math.ceil(total / pageSize));

  // ── Derived domain list ──────────────────────────────────────────
  const domains = useMemo(() => {
    const values = new Set<string>();
    applications.forEach((app) => {
      const domain = app.confirmed_domain || app.domain;
      if (domain) values.add(domain);
    });
    return Array.from(values).sort();
  }, [applications]);

  // ── Filtered list ────────────────────────────────────────────────
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const status = normalizeValue(getMigrationStatus(app));
      const domain = normalizeValue(app.confirmed_domain || app.domain);
      const cloudNames = app.cloud_mappings
        ?.map((m) => m.cloud?.name)
        .filter((n): n is string => Boolean(n))
        .map((n) => normalizeValue(n)) ?? [];
      const matchesStatus =
        statusFilter === "all" || status === normalizeValue(statusFilter);
      const matchesDomain =
        domainFilter === "all" || domain === normalizeValue(domainFilter);
      const matchesCloud =
        cloudFilter === "all" || cloudNames.includes(normalizeValue(cloudFilter));
      return matchesStatus && matchesDomain && matchesCloud;
    });
  }, [applications, statusFilter, domainFilter, cloudFilter]);

  // ── Summary counts ───────────────────────────────────────────────
  const summary = useMemo(() => {
    let inProgress = 0, completed = 0, failed = 0, pending = 0;
    applications.forEach((app) => {
      const s = normalizeValue(app.migration?.migration_status);
      if (["completed", "complete", "done"].includes(s))          completed  += 1;
      else if (["in progress", "in_progress", "ongoing"].includes(s)) inProgress += 1;
      else if (["failed", "failure", "cancelled"].includes(s))    failed     += 1;
      else                                                         pending    += 1;
    });
    return { total, inProgress, completed, failed, pending };
  }, [applications, total]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("all");
    setDomainFilter("all");
    setCloudFilter("all");
    setPage(1);
  };

  const handleOpenApp = (app: Application) => {
    navigate(`/app/applications/${app.id}`, { state: { application: app } });
  };

  // ── Loading ──────────────────────────────────────────────────────
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
          Loading applications...
        </p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="ods-empty-state">
        <span className="ods-empty-icon">⚠️</span>
        <div className="ods-empty-title">Unable to load applications</div>
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

  // ── Render ───────────────────────────────────────────────────────
  return (
    <>
      <div>

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="ods-page-header">
          <div>
            <h1 className="page-title">Applications</h1>
            <p className="page-subtitle">
              Manage applications, migrations and owners.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={isFetching}
            onClick={() => { void refetch(); }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <RefreshCw
              size={15}
              style={{
                animation: isFetching
                  ? "ods-spin 0.7s linear infinite"
                  : "none",
              }}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ── Summary stat cards ──────────────────────────────── */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap:                 "1rem",
            marginBottom:        "1.5rem",
          }}
        >
          <ApplicationSummaryCard
            title="Total Applications"
            value={summary.total}
            description="All registered"
            icon={<AppWindow size={18} />}
          />
          <ApplicationSummaryCard
            title="In Progress"
            value={summary.inProgress}
            description="Active migrations"
            icon={<Clock3 size={18} />}
            variant="warning"
          />
          <ApplicationSummaryCard
            title="Completed"
            value={summary.completed}
            description="Completed migrations"
            icon={<CheckCircle size={18} />}
            variant="success"
          />
          <ApplicationSummaryCard
            title="Pending"
            value={summary.pending}
            description="Pending migrations"
            icon={<Hourglass size={18} />}
            variant="info"
          />
          <ApplicationSummaryCard
            title="Failed"
            value={summary.failed}
            description="Failed migrations"
            icon={<CircleX size={18} />}
            variant="danger"
          />
        </div>

        {/* ── Main panel ──────────────────────────────────────── */}
        <div className="ods-card">

          {/* ── Toolbar ───────────────────────────────────────── */}
          <div
            className="ods-card-header"
            style={{ flexWrap: "wrap", gap: "0.75rem" }}
          >

            {/* Search form */}
            <form
              onSubmit={handleSearch}
              style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: 260 }}
            >
              <div className="ods-search" style={{ flex: 1 }}>
                <Search className="ods-search-icon" size={15} />
                <input
                  type="search"
                  className="form-control form-control-sm"
                  value={searchInput}
                  placeholder="Search application, domain or Carto ID…"
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
            </form>

            {/* Filters */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <select
                className="form-select form-select-sm"
                style={{ width: "auto" }}
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="all">All statuses</option>
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>

              <select
                className="form-select form-select-sm"
                style={{ width: "auto" }}
                value={domainFilter}
                onChange={(e) => { setDomainFilter(e.target.value); setPage(1); }}
              >
                <option value="all">All domains</option>
                {domains.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                className="form-select form-select-sm"
                style={{ width: "auto" }}
                value={cloudFilter}
                onChange={(e) => { setCloudFilter(e.target.value); setPage(1); }}
              >
                <option value="">All clouds</option>
                <option value="Azure">Azure</option>
                <option value="Blue">Blue</option>
              </select>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleClearFilters}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <X size={13} />
                Clear
              </button>
            </div>
          </div>

          {/* ── Result count ──────────────────────────────────── */}
          <div
            style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
              padding:        "0.5rem 1.25rem",
              background:     "var(--ods-gray-100)",
              borderBottom:   "1px solid var(--ods-gray-200)",
              fontSize:       "var(--ods-font-size-xs)",
              color:          "var(--ods-gray-600)",
            }}
          >
            <span>
              <strong style={{ color: "var(--ods-gray-900)" }}>
                {filteredApplications.length}
              </strong>{" "}
              applications shown
            </span>
            <span>Total records: <strong>{total}</strong></span>
          </div>

          {/* ── Table ─────────────────────────────────────────── */}
          <div className="ods-card-body" style={{ padding: 0 }}>
            <div className="ods-table-wrapper">
              <table className="ods-table">
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Domain</th>
                    <th>DevOps Owner</th>
                    <th>App Manager</th>
                    <th>Cloud</th>
                    <th>Migration</th>
                    <th>Progress</th>
                    <th>Assessment</th>
                    <th>Nexus</th>
                    <th>Security (RootId) PROD</th>
                    <th>Security (Net Pol) PROD</th>
                    <th>Sov Type</th>
                    <th>DX-uid</th>
                    <th>MCP-id</th>
                    <th>Created</th>
                    <th>Action</th>
                    <th>Roadmap</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={17}>
                        <div
                          className="ods-empty-state"
                          style={{ padding: "2rem" }}
                        >
                          <span className="ods-empty-icon">📋</span>
                          <p className="ods-empty-text">
                            No applications found.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => {
                      const migStatus = getMigrationStatus(app);
                      const progress  =
                        app.migration?.migration_progress ?? 0;

                      return (
                        <tr key={app.id}>

                          {/* Application name */}
                          <td>
                            <div
                              style={{
                                display:       "flex",
                                flexDirection: "column",
                                gap:           "0.15rem",
                              }}
                            >
                              <strong
                                style={{
                                  color:    "var(--ods-gray-900)",
                                  fontSize: "var(--ods-font-size-sm)",
                                }}
                              >
                                {app.application_name}
                              </strong>
                              <span
                                style={{
                                  fontSize: "var(--ods-font-size-xs)",
                                  color:    "var(--ods-gray-500)",
                                }}
                              >
                                Carto: {app.carto_id || "—"}
                              </span>
                              <span
                                style={{
                                  fontSize: "var(--ods-font-size-xs)",
                                  color:    "var(--ods-gray-400)",
                                }}
                              >
                                Basicat: {app.basicat || "—"}
                              </span>
                            </div>
                          </td>

                          {/* Domain */}
                          <td style={{ color: "var(--ods-gray-700)" }}>
                            {app.confirmed_domain || app.domain || "—"}
                          </td>

                          {/* Owners */}
                          <td style={{ color: "var(--ods-gray-600)" }}>
                            {getOwnerName(app, "DevOps")}
                          </td>
                          <td style={{ color: "var(--ods-gray-600)" }}>
                            {getOwnerName(app, "Application Manager")}
                          </td>

                          {/* Cloud */}
                          <td>
                            <span
                              style={{
                                fontSize:      "var(--ods-font-size-xs)",
                                background:    "var(--ods-gray-100)",
                                color:         "var(--ods-gray-700)",
                                padding:       "0.2rem 0.5rem",
                                border:        "1px solid var(--ods-gray-300)",
                                whiteSpace:    "nowrap",
                              }}
                            >
                              {getCloudNames(app)}
                            </span>
                          </td>

                          {/* Migration status badge */}
                          <td>
                            <span className={getStatusBadgeClass(migStatus)}>
                              {migStatus}
                            </span>
                          </td>

                          {/* Progress bar */}
                          <td style={{ minWidth: 100 }}>
                            <div
                              style={{
                                display:       "flex",
                                flexDirection: "column",
                                gap:           "0.25rem",
                              }}
                            >
                              <span
                                style={{
                                  fontSize:  "var(--ods-font-size-xs)",
                                  color:     "var(--ods-gray-600)",
                                  textAlign: "right",
                                }}
                              >
                                {progress}%
                              </span>
                              <div
                                style={{
                                  height:     6,
                                  background: "var(--ods-gray-200)",
                                  overflow:   "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height:     "100%",
                                    width:      `${Math.min(100, Math.max(0, progress))}%`,
                                    background: progress >= 100
                                      ? "var(--ods-success)"
                                      : "var(--ods-orange)",
                                    transition: "width 0.3s ease",
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Assessment */}
                          <td style={{ color: "var(--ods-gray-600)" }}>
                            {app.meta_data?.assessment_status || "—"}
                          </td>

                          {/* Nexus */}
                          <td style={{ color: "var(--ods-gray-600)" }}>
                            {app.security?.nexus_status || "—"}
                          </td>

                          {/* Security (RootId) PROD */}
                          <td style={{ color: "var(--ods-gray-600)" }}>
                            {app.security?.security_prod_status || "—"}
                          </td>

                          {/* Security (Net Pol) PROD */}
                          <td style={{ color: "var(--ods-gray-600)" }}>
                            {app.security?.network_policy_status || "—"}
                          </td>

                          {/* Sov Type */}
                          <td style={{ color: "var(--ods-gray-600)" }}>
                            {app.sov_type || "—"}
                          </td>

                          {/* DX-uid */}
                          <td style={{ color: "var(--ods-gray-600)" }}>
                            {app.meta_data?.dx_uid || "—"}
                          </td>

                          {/* MCP-id */}
                          <td style={{ color: "var(--ods-gray-600)" }}>
                            {app.meta_data?.mcp_id || "—"}
                          </td>

                          {/* Created at */}
                          <td
                            style={{
                              fontSize:  "var(--ods-font-size-xs)",
                              color:     "var(--ods-gray-500)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatDate(app.created_at)}
                          </td>

                          {/* Action */}
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => handleOpenApp(app)}
                            >
                              View / Edit
                            </button>
                          </td>

                          {/* Roadmap */}
                          <td>
                            {!app.has_roadmap && (
                              <RoadmapImportButton
                                applicationId={app.id}
                                replaceExisting={false}
                                label="Upload Roadmap"
                                onSuccess={() => { void refetch(); }}
                              />
                            )}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pagination ────────────────────────────────────── */}
          <div
            style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
              padding:        "0.75rem 1.25rem",
              borderTop:      "1px solid var(--ods-gray-200)",
            }}
          >
            <span
              style={{
                fontSize: "var(--ods-font-size-sm)",
                color:    "var(--ods-gray-600)",
              }}
            >
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={page >= totalPages || applications.length === 0}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>

        </div>
      </div>

    </>
  );
}
