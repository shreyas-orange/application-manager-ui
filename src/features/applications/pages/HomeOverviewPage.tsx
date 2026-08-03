// src/features/applications/pages/HomeOverviewPage.tsx
import {
  type FormEvent,
  useMemo,
  useState,
} from "react";
import {
  AppWindow,
  CheckCircle,
  CircleX,
  Clock3,
  Download,
  Hourglass,
  Search,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import { useAllApplications } from "../hooks/useAllApplications";
import type { Application } from "../types/application.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalizeValue(v: string | null | undefined): string {
  return String(v ?? "").trim().toLowerCase();
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function normalizeCloud(app: Application): string {
  const names =
    app.cloud_mappings
      ?.map((m) => m.cloud?.name?.trim())
      .filter(Boolean) ?? [];
  return names.length > 0 ? names.join(", ") : "—";
}

function getCloudPrimary(app: Application): "Azure" | "Blue" | "Other" {
  const lower =
    app.cloud_mappings
      ?.map((m) => m.cloud?.name?.trim().toLowerCase())
      .filter(Boolean) ?? [];
  if (lower.includes("azure")) return "Azure";
  if (lower.includes("blue") || lower.includes("bleu")) return "Blue";
  return "Other";
}

function getMigrationStatus(app: Application): string {
  return app.migration?.migration_status || app.application_status || "Pending";
}

function normalizeStatus(s: string): string {
  const lower = s.toLowerCase();
  if (["completed", "complete", "done", "production"].includes(lower)) return "Completed";
  if (["in progress", "in_progress", "ongoing", "started"].includes(lower)) return "In Progress";
  if (["failed", "failure", "cancelled"].includes(lower)) return "Failed";
  return "Pending";
}

function getStatusBadgeClass(status: string): string {
  const s = normalizeValue(status);
  if (["completed", "complete", "done", "production"].includes(s)) return "ods-badge ods-badge-success";
  if (["failed", "failure", "cancelled"].includes(s)) return "ods-badge ods-badge-danger";
  if (["in progress", "in_progress", "ongoing", "started"].includes(s)) return "ods-badge ods-badge-warning";
  return "ods-badge ods-badge-neutral";
}

function getMonthKey(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(key: string): string {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const STATUS_COLORS: Record<string, string> = {
  "Completed":  "#198754",
  "In Progress": "#FFC107",
  "Failed":     "#DC3545",
  "Pending":    "#6C757D",
};

const AZURE_COLOR = "#0078D4";
const BLUE_COLOR  = "#0052CC";

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomeOverviewPage() {
  const { data, isLoading, isError, error, isFetching } = useAllApplications();
  const applications = data?.items ?? [];

  // ── Filters ────────────────────────────────────────────────────
  const [searchInput, setSearchInput]   = useState("");
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cloudFilter, setCloudFilter]   = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [page, setPage]                 = useState(1);

  // ── Derived domain list ────────────────────────────────────────
  const domains = useMemo(() => {
    const values = new Set<string>();
    applications.forEach((app) => {
      const d = app.confirmed_domain || app.domain;
      if (d) values.add(d);
    });
    return Array.from(values).sort();
  }, [applications]);

  // ── Filtered list ──────────────────────────────────────────────
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const status = normalizeValue(getMigrationStatus(app));
      const domain = normalizeValue(app.confirmed_domain || app.domain);
      const cloudNames = app.cloud_mappings
        ?.map((m) => m.cloud?.name)
        .filter((n): n is string => Boolean(n))
        .map((n) => normalizeValue(n)) ?? [];

      const matchesSearch =
        !search ||
        normalizeValue(app.application_name).includes(normalizeValue(search)) ||
        normalizeValue(app.carto_id).includes(normalizeValue(search)) ||
        normalizeValue(app.domain).includes(normalizeValue(search));
      const matchesStatus = statusFilter === "all" || status === normalizeValue(statusFilter);
      const matchesDomain = domainFilter === "all" || domain === normalizeValue(domainFilter);
      const matchesCloud  = cloudFilter === "all" || cloudNames.includes(normalizeValue(cloudFilter));
      return matchesSearch && matchesStatus && matchesDomain && matchesCloud;
    });
  }, [applications, search, statusFilter, domainFilter, cloudFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const pagedApplications = filteredApplications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Summary counts (from filtered) ─────────────────────────────
  const summary = useMemo(() => {
    let inProgress = 0, completed = 0, failed = 0, pending = 0;
    filteredApplications.forEach((app) => {
      const s = normalizeStatus(getMigrationStatus(app));
      if (s === "Completed")     completed  += 1;
      else if (s === "In Progress") inProgress += 1;
      else if (s === "Failed")     failed     += 1;
      else                         pending    += 1;
    });
    return {
      total: filteredApplications.length,
      inProgress,
      completed,
      failed,
      pending,
    };
  }, [filteredApplications]);

  // ── Cloud counts ───────────────────────────────────────────────
  const cloudCounts = useMemo(() => {
    let azure = 0, blue = 0, other = 0;
    filteredApplications.forEach((app) => {
      const c = getCloudPrimary(app);
      if (c === "Azure") azure += 1;
      else if (c === "Blue") blue += 1;
      else other += 1;
    });
    return { azure, blue, other };
  }, [filteredApplications]);

  // ── Monthly migration bar chart ────────────────────────────────
  const monthlyData = useMemo(() => {
    const buckets: Record<string, { azure: number; blue: number }> = {};
    filteredApplications.forEach((app) => {
      const c = getCloudPrimary(app);
      if (c === "Other") return;
      const key =
        getMonthKey(app.migration?.tentative_start) ??
        getMonthKey(app.migration?.confirmed_end) ??
        getMonthKey(app.created_at);
      if (!key) return;
      if (!buckets[key]) buckets[key] = { azure: 0, blue: 0 };
      if (c === "Azure") buckets[key].azure += 1;
      else buckets[key].blue += 1;
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, counts]) => ({
        month,
        monthLabel: formatMonth(month),
        Azure: counts.azure,
        Blue:  counts.blue,
      }));
  }, [filteredApplications]);

  // ── Status pie chart data ──────────────────────────────────────
  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredApplications.forEach((app) => {
      const s = normalizeStatus(getMigrationStatus(app));
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredApplications]);

  // ── Handlers ───────────────────────────────────────────────────
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("all");
    setCloudFilter("all");
    setDomainFilter("all");
    setPage(1);
  };

  const handleExportCsv = () => {
    const headers = [
      "Application",
      "Carto ID",
      "Domain",
      "Cloud",
      "Migration Status",
      "Progress",
      "DevOps Owner",
      "Created",
    ];

    const rows = filteredApplications.map((app) => {
      const owners = app.owners ?? [];
      const getOwner = (type: string) =>
        owners.find((o) => o.owner_type?.toLowerCase() === type.toLowerCase());
      return [
        app.application_name,
        app.carto_id || "",
        app.confirmed_domain || app.domain || "",
        normalizeCloud(app),
        getMigrationStatus(app),
        String(app.migration?.migration_progress ?? 0),
        getOwner("DevOps")?.owner_name || "",
        formatDate(app.created_at),
      ];
    });

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Loading / Error ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem" }}>
        <div className="ods-spinner" />
        <p style={{ color: "var(--ods-gray-600)", fontSize: "var(--ods-font-size-sm)" }}>Loading overview...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="ods-empty-state">
        <span className="ods-empty-icon">⚠️</span>
        <div className="ods-empty-title">Unable to load overview</div>
        <p className="ods-empty-text">{error instanceof Error ? error.message : "Something went wrong."}</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div className="ods-page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">
            Application migration overview — {filteredApplications.length} of {applications.length} applications
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleExportCsv}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* ── Summary stat cards ──────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="ods-stat-card">
          <div className="ods-stat-value">{summary.total}</div>
          <div className="ods-stat-label">Total Applications</div>
        </div>
        <div className="ods-stat-card info">
          <div className="ods-stat-value">{cloudCounts.azure}</div>
          <div className="ods-stat-label">Azure</div>
        </div>
        <div className="ods-stat-card" style={{ borderTopColor: BLUE_COLOR }}>
          <div className="ods-stat-value" style={{ color: BLUE_COLOR }}>{cloudCounts.blue}</div>
          <div className="ods-stat-label">Blue</div>
        </div>
        <div className="ods-stat-card success">
          <div className="ods-stat-value">{summary.completed}</div>
          <div className="ods-stat-label">Completed</div>
        </div>
        <div className="ods-stat-card warning">
          <div className="ods-stat-value">{summary.inProgress}</div>
          <div className="ods-stat-label">In Progress</div>
        </div>
        <div className="ods-stat-card">
          <div className="ods-stat-value">{summary.pending}</div>
          <div className="ods-stat-label">Pending</div>
        </div>
        <div className="ods-stat-card danger">
          <div className="ods-stat-value">{summary.failed}</div>
          <div className="ods-stat-label">Failed</div>
        </div>
      </div>

      {/* ── Charts row ──────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Bar chart */}
        <div className="ods-card">
          <div className="ods-card-header">
            <h2 className="ods-card-title">Monthly Migration</h2>
          </div>
          <div className="ods-card-body">
            {monthlyData.length === 0 ? (
              <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", margin: 0 }}>No data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ods-gray-200)" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: "var(--ods-gray-600)" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--ods-gray-600)" }} />
                  <Tooltip contentStyle={{ background: "var(--ods-white)", border: "1px solid var(--ods-gray-200)", borderRadius: 0, fontSize: "var(--ods-font-size-sm)" }} />
                  <Legend />
                  <Bar dataKey="Azure" fill={AZURE_COLOR} />
                  <Bar dataKey="Blue" fill={BLUE_COLOR} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie chart */}
        <div className="ods-card">
          <div className="ods-card-header">
            <h2 className="ods-card-title">Status Breakdown</h2>
          </div>
          <div className="ods-card-body">
            {statusPieData.length === 0 ? (
              <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", margin: 0 }}>No data.</p>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" outerRadius={80} innerRadius={35} dataKey="value" labelLine={false}
                      label={({ name, percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}>
                      {statusPieData.map((e) => (
                        <Cell key={e.name} fill={STATUS_COLORS[e.name] ?? "#999"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--ods-white)", border: "1px solid var(--ods-gray-200)", borderRadius: 0, fontSize: "var(--ods-font-size-sm)" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {statusPieData.map((e) => (
                    <div key={e.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: 12, height: 12, background: STATUS_COLORS[e.name] ?? "#999", flexShrink: 0 }} />
                      <span style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-700)" }}>{e.name}</span>
                      <strong style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-900)" }}>{e.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Applications Table ──────────────────────────────────── */}
      <div className="ods-card">
        {/* Toolbar: search + filters */}
        <div className="ods-card-header" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: 260 }}>
            <div className="ods-search" style={{ flex: 1 }}>
              <Search className="ods-search-icon" size={15} />
              <input
                type="search"
                className="form-control form-control-sm"
                value={searchInput}
                placeholder="Search application, domain or Carto ID..."
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </form>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <select className="form-select form-select-sm" style={{ width: "auto" }} value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">All statuses</option>
              <option value="In progress">In progress</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>

            <select className="form-select form-select-sm" style={{ width: "auto" }} value={cloudFilter}
              onChange={(e) => { setCloudFilter(e.target.value); setPage(1); }}>
              <option value="all">All clouds</option>
              <option value="Azure">Azure</option>
              <option value="Blue">Blue</option>
            </select>

            <select className="form-select form-select-sm" style={{ width: "auto" }} value={domainFilter}
              onChange={(e) => { setDomainFilter(e.target.value); setPage(1); }}>
              <option value="all">All domains</option>
              {domains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleClearFilters}
              style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <X size={13} /> Clear
            </button>
          </div>
        </div>

        {/* Result count */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 1.25rem", background: "var(--ods-gray-100)", borderBottom: "1px solid var(--ods-gray-200)", fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-600)" }}>
          <span>
            <strong style={{ color: "var(--ods-gray-900)" }}>{filteredApplications.length}</strong> applications shown
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
                {pagedApplications.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="ods-empty-state" style={{ padding: "2rem" }}>
                        <span className="ods-empty-icon">📋</span>
                        <p className="ods-empty-text">
                          {search ? `No applications found for "${search}".` : "No applications found."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedApplications.map((app) => {
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
                              Carto: {app.carto_id || "—"}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: "var(--ods-gray-700)" }}>{app.confirmed_domain || app.domain || "—"}</td>
                        <td>
                          <span style={{ fontSize: "var(--ods-font-size-xs)", background: "var(--ods-gray-100)", color: "var(--ods-gray-700)", padding: "0.2rem 0.5rem", border: "1px solid var(--ods-gray-300)", whiteSpace: "nowrap" }}>
                            {normalizeCloud(app)}
                          </span>
                        </td>
                        <td style={{ color: "var(--ods-gray-600)" }}>{getOwner("DevOps")?.owner_name || "—"}</td>
                        <td><span className={getStatusBadgeClass(migStatus)}>{migStatus}</span></td>
                        <td style={{ minWidth: 90 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <span style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-600)", textAlign: "right" }}>{progress}%</span>
                            <div style={{ height: 6, background: "var(--ods-gray-200)", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, progress))}%`, background: progress >= 100 ? "var(--ods-success)" : "var(--ods-orange)", transition: "width 0.3s ease" }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ color: "var(--ods-gray-600)" }}>{app.meta_data?.assessment_status || "—"}</td>
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
            <button type="button" className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" disabled={page >= totalPages || filteredApplications.length === 0}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
