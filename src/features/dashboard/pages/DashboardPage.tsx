// src/features/dashboard/pages/DashboardPage.tsx
import {
  CheckCircle,
  CircleX,
  Clock3,
  FolderOpen,
  Hourglass,
  RefreshCw,
  Upload,
  Users,
} from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import DashboardCard    from "../components/DashboardCard";
import { useDashboard } from "../hooks/useDashboard";
import { useNamespaceMigrationSummary } from "../hooks/useNamespaceMigrationSummary";

// ─── Constants ────────────────────────────────────────────────────────────────
const MIGRATION_COLORS: Record<string, string> = {
  "Not Started": "var(--ods-gray-400)",
  Pending:       "#f59e0b",
  "In Progress": "var(--ods-orange)",
  Completed:     "var(--ods-success)",
  Failed:        "var(--ods-danger)",
};

const FALLBACK_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalizeMigrationStatus(status: string | null | undefined): string {
  if (!status?.trim()) return "Not Started";

  const s = status.trim().toLowerCase();

  if (["in progress", "in_progress", "ongoing", "started"].includes(s)) return "In Progress";
  if (["completed", "complete", "done", "production"].includes(s))      return "Completed";
  if (["not started", "not_started"].includes(s))                       return "Not Started";
  if (["pending", "yet to start", "yet_to_start"].includes(s))          return "Pending";
  if (["failed", "failure", "cancelled"].includes(s))                   return "Failed";

  return status.trim();
}

function migrationColor(
  name: string,
  index: number,
): string {
  return (
    MIGRATION_COLORS[name] ??
    FALLBACK_COLORS[index % FALLBACK_COLORS.length]
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

// Maps upload status → ODS badge variant classes
function uploadStatusClass(status: string): string {
  const s = status.trim().toLowerCase();
  if (s === "completed" || s === "success")                          return "ods-badge ods-badge-success";
  if (s === "failed"    || s === "failure")                          return "ods-badge ods-badge-danger";
  if (s === "in progress" || s === "in_progress" || s === "processing") return "ods-badge ods-badge-warning";
  return "ods-badge ods-badge-neutral";
}

// Maps audit action → ODS badge variant classes
function auditActionClass(action: string): string {
  const a = action.trim().toLowerCase();
  if (a === "create") return "ods-badge ods-badge-success";
  if (a === "delete") return "ods-badge ods-badge-danger";
  return "ods-badge ods-badge-info";
}

const NS_COLORS: Record<string, string> = {
  Migrated:      "#198754",
  "In Progress": "#FFC107",
  Decommissioned: "#6C757D",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data, isLoading, isError, error, isFetching, refetch } =
    useDashboard();

  const {
    data: nsSummary,
    isLoading: nsLoading,
    isError: nsError,
  } = useNamespaceMigrationSummary();

  // ── Loading state ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        style={{
          display:         "flex",
          flexDirection:   "column",
          alignItems:      "center",
          justifyContent:  "center",
          minHeight:       "60vh",
          gap:             "1rem",
        }}
      >
        <div className="ods-spinner" />
        <p style={{ color: "var(--ods-gray-600)", fontSize: "var(--ods-font-size-sm)" }}>
          Loading dashboard...
        </p>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="ods-empty-state">
        <span className="ods-empty-icon">⚠️</span>
        <div className="ods-empty-title">Unable to load dashboard</div>
        <p className="ods-empty-text">
          {error instanceof Error
            ? error.message
            : "Something went wrong while loading the dashboard."}
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

  // ── Data ─────────────────────────────────────────────────────────
  const summary              = data?.summary;
  const migrationStatus      = data?.migration_status      ?? [];
  const cloudDistribution    = data?.cloud_distribution    ?? [];
  const applicationsByDomain = data?.applications_by_domain ?? [];
  const recentUploads        = data?.recent_uploads        ?? [];
  const recentAuditLogs      = data?.recent_audit_logs     ?? [];

  const migrationChartData = migrationStatus.map((item) => ({
    name:  normalizeMigrationStatus(item.status),
    value: item.count,
  }));

  const nsChartData = [
    {
      name: "Migrated",
      value: nsSummary?.migrated ?? 0,
      fill: NS_COLORS.Migrated,
    },
    {
      name: "In Progress",
      value: nsSummary?.in_progress ?? 0,
      fill: NS_COLORS["In Progress"],
    },
    {
      name: "Decommissioned",
      value: nsSummary?.decommissioned ?? 0,
      fill: NS_COLORS.Decommissioned,
    },
  ];

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div>

      {/* ── Page header ───────────────────────────────────────── */}
      <div className="ods-page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Overview of applications, migrations and uploads.
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
              animation: isFetching ? "ods-spin 0.7s linear infinite" : "none",
            }}
          />
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ── KPI stat cards ────────────────────────────────────── */}
      <div
        style={{
          display:               "grid",
          gridTemplateColumns:   "repeat(auto-fit, minmax(180px, 1fr))",
          gap:                   "1rem",
          marginBottom:          "1.5rem",
        }}
      >
        <DashboardCard
          title="Total Users"
          value={summary?.total_users ?? 0}
          description="Registered users"
          icon={<Users size={18} />}
        />
        <DashboardCard
          title="Total Applications"
          value={summary?.total_applications ?? 0}
          description="Registered applications"
          icon={<FolderOpen size={18} />}
        />
        <DashboardCard
          title="Total Uploads"
          value={summary?.total_uploads ?? 0}
          description="Uploaded files"
          icon={<Upload size={18} />}
        />
        <DashboardCard
          title="Completed"
          value={summary?.completed_migrations ?? 0}
          description="Completed migrations"
          icon={<CheckCircle size={18} />}
          variant="success"
        />
        <DashboardCard
          title="In Progress"
          value={summary?.in_progress_migrations ?? 0}
          description="Active migrations"
          icon={<Clock3 size={18} />}
          variant="warning"
        />
        <DashboardCard
          title="Pending"
          value={summary?.pending_migrations ?? 0}
          description="Pending migrations"
          icon={<Hourglass size={18} />}
          variant="warning"
        />
        <DashboardCard
          title="Failed Uploads"
          value={summary?.failed_uploads ?? 0}
          description="Failed uploads"
          icon={<CircleX size={18} />}
          variant="danger"
        />
      </div>

      {/* ── Charts row ────────────────────────────────────────── */}
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap:                 "1.5rem",
          marginBottom:        "1.5rem",
        }}
      >

        {/* Migration Status — Pie chart */}
        <div className="ods-card">
          <div className="ods-card-header">
            <h2 className="ods-card-title">Migration Status</h2>
          </div>
          <div className="ods-card-body">
            {migrationChartData.length === 0 ? (
              <p
                style={{
                  color:     "var(--ods-gray-500)",
                  fontSize:  "var(--ods-font-size-sm)",
                  textAlign: "center",
                  padding:   "2rem 0",
                }}
              >
                No migration data found.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={migrationChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="43%"
                    innerRadius={40}
                    outerRadius={68}
                    paddingAngle={2}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {migrationChartData.map((item, index) => (
                      <Cell
                        key={`${item.name}-${index}`}
                        fill={migrationColor(item.name, index)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [Number(value), "Applications"]}
                    contentStyle={{
                      border:       "1px solid var(--ods-gray-300)",
                      borderRadius: 0,
                      fontSize:     "0.8rem",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "0.75rem" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Cloud Distribution */}
        <div className="ods-card">
          <div className="ods-card-header">
            <h2 className="ods-card-title">Cloud Distribution</h2>
          </div>
          <div className="ods-card-body">
            {cloudDistribution.length === 0 ? (
              <p
                style={{
                  color:     "var(--ods-gray-500)",
                  fontSize:  "var(--ods-font-size-sm)",
                  textAlign: "center",
                  padding:   "2rem 0",
                }}
              >
                No cloud data found.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {cloudDistribution.map((item, index) => (
                  <div
                    key={`${item.cloud}-${index}`}
                    style={{
                      display:         "flex",
                      justifyContent:  "space-between",
                      alignItems:      "center",
                      padding:         "0.625rem 0.75rem",
                      background:      "var(--ods-gray-100)",
                      borderLeft:      "3px solid var(--ods-orange)",
                    }}
                  >
                    <span
                      style={{
                        fontSize:  "var(--ods-font-size-sm)",
                        color:     "var(--ods-gray-700)",
                      }}
                    >
                      {item.cloud || "Unknown"}
                    </span>
                    <strong
                      style={{
                        color:     "var(--ods-orange)",
                        fontSize:  "var(--ods-font-size-sm)",
                      }}
                    >
                      {item.count}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Applications by Domain */}
        <div className="ods-card">
          <div className="ods-card-header">
            <h2 className="ods-card-title">Applications by Domain</h2>
          </div>
          <div className="ods-card-body">
            {applicationsByDomain.length === 0 ? (
              <p
                style={{
                  color:     "var(--ods-gray-500)",
                  fontSize:  "var(--ods-font-size-sm)",
                  textAlign: "center",
                  padding:   "2rem 0",
                }}
              >
                No domain data found.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {applicationsByDomain.map((item, index) => (
                  <div
                    key={`${item.domain}-${index}`}
                    style={{
                      display:         "flex",
                      justifyContent:  "space-between",
                      alignItems:      "center",
                      padding:         "0.625rem 0.75rem",
                      background:      "var(--ods-gray-100)",
                      borderLeft:      "3px solid var(--ods-orange)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--ods-font-size-sm)",
                        color:    "var(--ods-gray-700)",
                      }}
                    >
                      {item.domain || "Unknown"}
                    </span>
                    <strong
                      style={{
                        color:    "var(--ods-orange)",
                        fontSize: "var(--ods-font-size-sm)",
                      }}
                    >
                      {item.count}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Namespace Migration ───────────────────────────────── */}
      <div className="ods-card" style={{ marginBottom: "1.5rem" }}>
        <div className="ods-card-header">
          <h2 className="ods-card-title">Namespace Migration</h2>
        </div>
        <div className="ods-card-body">
          {nsLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <div className="ods-spinner" />
            </div>
          ) : nsError || !nsSummary ? (
            <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", margin: 0 }}>
              Unable to load namespace migration summary.
            </p>
          ) : (
            <>
              {/* Stat cards */}
              <div
                style={{
                  display:               "grid",
                  gridTemplateColumns:   "repeat(auto-fit, minmax(170px, 1fr))",
                  gap:                   "1rem",
                  marginBottom:          "1.5rem",
                }}
              >
                <div className="ods-stat-card">
                  <div className="ods-stat-value">
                    {nsSummary.total_namespaces ?? 0}
                  </div>
                  <div className="ods-stat-label">Total Namespaces</div>
                </div>
                <div className="ods-stat-card success">
                  <div className="ods-stat-value">{nsSummary.migrated ?? 0}</div>
                  <div className="ods-stat-label">Migrated</div>
                </div>
                <div className="ods-stat-card warning">
                  <div className="ods-stat-value">{nsSummary.in_progress ?? 0}</div>
                  <div className="ods-stat-label">In Progress</div>
                </div>
                <div className="ods-stat-card">
                  <div className="ods-stat-value" style={{ color: NS_COLORS.Decommissioned }}>
                    {nsSummary.decommissioned ?? 0}
                  </div>
                  <div className="ods-stat-label">Decommissioned</div>
                </div>
              </div>

              {/* Pie chart */}
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={nsChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {nsChartData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--ods-white)",
                        border: "1px solid var(--ods-gray-200)",
                        borderRadius: 0,
                        fontSize: "var(--ods-font-size-sm)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Recent Uploads table ──────────────────────────────── */}
      <div className="ods-card" style={{ marginBottom: "1.5rem" }}>
        <div className="ods-card-header">
          <h2 className="ods-card-title">Recent Uploads</h2>
        </div>
        <div className="ods-card-body" style={{ padding: 0 }}>
          {recentUploads.length === 0 ? (
            <div className="ods-empty-state" style={{ padding: "2rem" }}>
              <span className="ods-empty-icon">📂</span>
              <p className="ods-empty-text">No recent uploads found.</p>
            </div>
          ) : (
            <div className="ods-table-wrapper">
              <table className="ods-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Status</th>
                    <th>Uploaded By</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUploads.map((upload) => (
                    <tr key={upload.id}>
                      <td>
                        <strong style={{ color: "var(--ods-gray-900)" }}>
                          {upload.file_name}
                        </strong>
                      </td>
                      <td>
                        <span className={uploadStatusClass(upload.status)}>
                          {upload.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--ods-gray-600)" }}>
                        {upload.uploaded_by || "—"}
                      </td>
                      <td style={{ color: "var(--ods-gray-600)" }}>
                        {formatDate(upload.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Audit Logs table ───────────────────────────── */}
      {recentAuditLogs.length > 0 && (
        <div className="ods-card">
          <div className="ods-card-header">
            <h2 className="ods-card-title">Recent Audit Logs</h2>
          </div>
          <div className="ods-card-body" style={{ padding: 0 }}>
            <div className="ods-table-wrapper">
              <table className="ods-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Performed By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAuditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span className={auditActionClass(log.action)}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ color: "var(--ods-gray-700)" }}>
                        {log.module ?? "—"}
                      </td>
                      <td style={{ color: "var(--ods-gray-600)" }}>
                        {log.user || "System"}
                      </td>
                      <td style={{ color: "var(--ods-gray-600)" }}>
                        {formatDate(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
