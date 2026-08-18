// src/features/dashboard/pages/DashboardPage.tsx
import { RefreshCw } from "lucide-react";

import { EmptyState, PageHeader, PageLoader } from "@/components/ui";

import { StatsGrid } from "../components/StatsGrid";
import { RecentUploadsTable } from "../components/RecentUploadsTable";
import { RecentAuditLogsTable } from "../components/RecentAuditLogsTable";
import DashboardChartsRow from "../components/DashboardChartsRow";
import NamespaceMigrationCard from "../components/NamespaceMigrationCard";
import { useDashboard } from "../hooks/useDashboard";
import { useNamespaceMigrationSummary } from "../hooks/useNamespaceMigrationSummary";

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data, isLoading, isError, error, isFetching, refetch } = useDashboard();

  const {
    data: nsSummary,
    isLoading: nsLoading,
    isError: nsError,
  } = useNamespaceMigrationSummary();

  // ── Loading state ────────────────────────────────────────────────
  if (isLoading) {
    return <PageLoader label="Loading dashboard..." />;
  }

  // ── Error state ──────────────────────────────────────────────────
  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load dashboard"
        text={
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the dashboard."
        }
        action={
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={() => { void refetch(); }}
          >
            Try Again
          </button>
        }
      />
    );
  }

  // ── Data ─────────────────────────────────────────────────────────
  const summary              = data?.summary;
  const migrationStatus      = data?.migration_status      ?? [];
  const cloudDistribution    = data?.cloud_distribution    ?? [];
  const applicationsByDomain = data?.applications_by_domain ?? [];
  const recentUploads        = data?.recent_uploads        ?? [];
  const recentAuditLogs      = [...(data?.recent_audit_logs ?? [])]
    .sort((left, right) => (
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    ))
    .slice(0, 5);

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div>

      <PageHeader
        title="Dashboard"
        subtitle="Overview of applications, migrations and uploads."
        actions={
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
        }
      />

      <StatsGrid summary={summary} />

      <DashboardChartsRow
        migrationStatus={migrationStatus}
        cloudDistribution={cloudDistribution}
        applicationsByDomain={applicationsByDomain}
      />

      <NamespaceMigrationCard summary={nsSummary} isLoading={nsLoading} isError={nsError} />

      <div style={{ marginBottom: "1.5rem" }}>
        <RecentUploadsTable uploads={recentUploads} />
      </div>

      {recentAuditLogs.length > 0 && <RecentAuditLogsTable logs={recentAuditLogs} />}

    </div>
  );
}
