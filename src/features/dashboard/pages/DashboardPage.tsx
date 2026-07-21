import {
  CheckCircle,
  CircleX,
  Clock3,
  FolderOpen,
  Hourglass,
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

import DashboardCard from "../components/DashboardCard";
import { useDashboard } from "../hooks/useDashboard";

import "../styles/dashboard.css";

const MIGRATION_COLORS: Record<string, string> = {
  "Not Started": "#94a3b8",
  Pending: "#f59e0b",
  "In Progress": "#f97316",
  Completed: "#22c55e",
  Failed: "#ef4444",
};

function normalizeMigrationStatus(
  status: string | null | undefined,
): string {
  if (!status?.trim()) {
    return "Not Started";
  }

  const normalizedStatus = status.trim().toLowerCase();

  if (
    normalizedStatus === "in progress" ||
    normalizedStatus === "in_progress"
  ) {
    return "In Progress";
  }

  if (normalizedStatus === "completed") {
    return "Completed";
  }

  if (normalizedStatus === "pending") {
    return "Pending";
  }

  if (normalizedStatus === "failed") {
    return "Failed";
  }

  return status.trim();
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getUploadStatusClass(status: string): string {
  const normalizedStatus = status.trim().toLowerCase();

  if (
    normalizedStatus === "completed" ||
    normalizedStatus === "success"
  ) {
    return "dashboard-status dashboard-status--success";
  }

  if (
    normalizedStatus === "failed" ||
    normalizedStatus === "failure"
  ) {
    return "dashboard-status dashboard-status--failed";
  }

  if (
    normalizedStatus === "in progress" ||
    normalizedStatus === "in_progress" ||
    normalizedStatus === "processing"
  ) {
    return "dashboard-status dashboard-status--progress";
  }

  return "dashboard-status dashboard-status--pending";
}

function getAuditActionClass(action: string): string {
  const normalizedAction = action.trim().toLowerCase();

  if (normalizedAction === "create") {
    return "audit-log-action audit-log-action--create";
  }

  if (normalizedAction === "delete") {
    return "audit-log-action audit-log-action--delete";
  }

  return "audit-log-action audit-log-action--update";
}

export default function DashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="dashboard-state">
        Loading dashboard...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="dashboard-state dashboard-state--error">
        <h2>Unable to load dashboard</h2>

        <p>
          {error instanceof Error
            ? error.message
            : "Something went wrong while loading the dashboard."}
        </p>

        <button
          type="button"
          className="dashboard-refresh"
          onClick={() => {
            void refetch();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const summary = data?.summary;

  const migrationStatus = data?.migration_status ?? [];
  const cloudDistribution = data?.cloud_distribution ?? [];
  const applicationsByDomain =
    data?.applications_by_domain ?? [];
  const recentUploads = data?.recent_uploads ?? [];
  const recentAuditLogs = data?.recent_audit_logs ?? [];

  const migrationChartData = migrationStatus.map((item) => ({
    name: normalizeMigrationStatus(item.status),
    value: item.count,
  }));

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">

        <button
          type="button"
          className="dashboard-refresh"
          disabled={isFetching}
          onClick={() => {
            void refetch();
          }}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="dashboard-grid">
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
          title="Completed Migrations"
          value={summary?.completed_migrations ?? 0}
          description="Successfully completed"
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

      <div className="dashboard-content-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Migration Status</h2>
          </div>

          {migrationChartData.length === 0 ? (
            <p className="dashboard-empty">
              No migration status data found.
            </p>
          ) : (
            <div className="migration-chart">
              <ResponsiveContainer width="100%" height={210}>
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
                    label={({ name, value }) =>
                      `${name}: ${value}`
                    }
                  >
                    {migrationChartData.map((item, index) => (
                      <Cell
                        key={`${item.name}-${index}`}
                        fill={
                          MIGRATION_COLORS[item.name] ??
                          "#64748b"
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) => [
                      Number(value),
                      "Applications",
                    ]}
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Cloud Distribution</h2>
          </div>

          {cloudDistribution.length === 0 ? (
            <p className="dashboard-empty">
              No cloud distribution data found.
            </p>
          ) : (
            <div className="dashboard-stat-list">
              {cloudDistribution.map((item, index) => (
                <div
                  className="dashboard-stat-row"
                  key={`${item.cloud}-${index}`}
                >
                  <span>{item.cloud || "Unknown"}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Applications by Domain</h2>
          </div>

          {applicationsByDomain.length === 0 ? (
            <p className="dashboard-empty">
              No domain data found.
            </p>
          ) : (
            <div className="dashboard-stat-list">
              {applicationsByDomain.map((item, index) => (
                <div
                  className="dashboard-stat-row"
                  key={`${item.domain}-${index}`}
                >
                  <span>{item.domain || "Unknown"}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-bottom-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Recent Uploads</h2>
          </div>

          {recentUploads.length === 0 ? (
            <p className="dashboard-empty">
              No recent uploads found.
            </p>
          ) : (
            <div className="dashboard-table-wrapper">
              <table className="dashboard-table">
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
                        <strong>{upload.file_name}</strong>
                      </td>

                      <td>
                        <span
                          className={getUploadStatusClass(
                            upload.status,
                          )}
                        >
                          {upload.status}
                        </span>
                      </td>

                      <td>{upload.uploaded_by || "—"}</td>

                      <td>
                        {formatDate(upload.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Recent Audit Logs</h2>
          </div>

          {recentAuditLogs.length === 0 ? (
            <p className="dashboard-empty">
              No recent audit logs found.
            </p>
          ) : (
            <div className="audit-log-list">
              {recentAuditLogs.map((log, index) => (
                <article
                  className="audit-log-item"
                  key={`${log.created_at}-${index}`}
                >
                  <div className="audit-log-header">
                    <div>
                      <strong>{log.user || "System"}</strong>

                      <span className="audit-log-module">
                        {log.module || "Unknown module"}
                      </span>
                    </div>

                    <span
                      className={getAuditActionClass(
                        log.action,
                      )}
                    >
                      {log.action}
                    </span>
                  </div>

                  <p>{log.description || "—"}</p>

                  <time>
                    {formatDate(log.created_at)}
                  </time>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}