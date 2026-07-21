import DashboardCard from "../components/DashboardCard";
import { useDashboard } from "../hooks/useDashboard";

import "../styles/dashboard.css";

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

function formatMigrationStatus(
  status: string | null | undefined,
): string {
  const normalizedStatus = status?.trim();

  return normalizedStatus || "Not Started";
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
          onClick={() => {
            void refetch();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  const summary = data?.summary;

  const migrationStatus =
    data?.migration_status ?? [];

  const cloudDistribution =
    data?.cloud_distribution ?? [];

  const applicationsByDomain =
    data?.applications_by_domain ?? [];

  const recentUploads =
    data?.recent_uploads ?? [];

  const recentAuditLogs =
    data?.recent_audit_logs ?? [];

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
        />

        <DashboardCard
          title="Total Applications"
          value={summary?.total_applications ?? 0}
          description="Registered applications"
        />

        <DashboardCard
          title="Total Uploads"
          value={summary?.total_uploads ?? 0}
          description="Uploaded files"
        />

        <DashboardCard
          title="Completed Migrations"
          value={summary?.completed_migrations ?? 0}
          description="Successfully completed"
        />

        <DashboardCard
          title="In Progress"
          value={summary?.in_progress_migrations ?? 0}
          description="Active migrations"
        />

        <DashboardCard
          title="Pending"
          value={summary?.pending_migrations ?? 0}
          description="Pending migrations"
        />

        <DashboardCard
          title="Failed Uploads"
          value={summary?.failed_uploads ?? 0}
          description="Failed file uploads"
        />
      </div>

      <div className="dashboard-content-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Migration Status</h2>
          </div>

          <div className="dashboard-stat-list">
            {migrationStatus.length === 0 ? (
              <p className="dashboard-empty">
                No migration status data found.
              </p>
            ) : (
              migrationStatus.map((item, index) => {
                const status =
                  formatMigrationStatus(item.status);

                return (
                  <div
                    className="dashboard-stat-row"
                    key={`${status}-${index}`}
                  >
                    <span>{status}</span>
                    <strong>{item.count}</strong>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Cloud Distribution</h2>
          </div>

          <div className="dashboard-stat-list">
            {cloudDistribution.length === 0 ? (
              <p className="dashboard-empty">
                No cloud distribution data found.
              </p>
            ) : (
              cloudDistribution.map((item, index) => (
                <div
                  className="dashboard-stat-row"
                  key={`${item.cloud}-${index}`}
                >
                  <span>{item.cloud || "Unknown"}</span>
                  <strong>{item.count}</strong>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Applications by Domain</h2>
          </div>

          <div className="dashboard-stat-list">
            {applicationsByDomain.length === 0 ? (
              <p className="dashboard-empty">
                No domain data found.
              </p>
            ) : (
              applicationsByDomain.map((item, index) => (
                <div
                  className="dashboard-stat-row"
                  key={`${item.domain}-${index}`}
                >
                  <span>{item.domain || "Unknown"}</span>
                  <strong>{item.count}</strong>
                </div>
              ))
            )}
          </div>
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
                        {log.module}
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