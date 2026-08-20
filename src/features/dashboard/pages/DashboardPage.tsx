// src/features/dashboard/pages/DashboardPage.tsx
import { RefreshCw } from "lucide-react";

import { EmptyState, PageHeader, PageLoader } from "@/components/ui";
import OverviewStatCards from "@/features/applications/components/OverviewStatCards";
import { usePublicApplications } from "@/features/applications/hooks/useAllApplications";
import { getApplicationOverviewSummary } from "@/features/applications/utils/application-overview";

import { RecentUploadsTable } from "../components/RecentUploadsTable";
import { RecentAuditLogsTable } from "../components/RecentAuditLogsTable";
import DashboardChartsRow from "../components/DashboardChartsRow";
import NamespaceMigrationCard from "../components/NamespaceMigrationCard";
import { useDashboard } from "../hooks/useDashboard";
import { useNamespaceMigrationSummary } from "../hooks/useNamespaceMigrationSummary";

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data, isLoading, isError, error, isFetching, refetch } = useDashboard();
  const applicationsQuery = usePublicApplications();

  const {
    data: nsSummary,
    isLoading: nsLoading,
    isError: nsError,
  } = useNamespaceMigrationSummary();
  const dashboardError = error ?? applicationsQuery.error;

  // ── Loading state ────────────────────────────────────────────────
  if (isLoading || applicationsQuery.isLoading) {
    return <PageLoader label="Loading dashboard..." />;
  }

  // ── Error state ──────────────────────────────────────────────────
  if (isError || applicationsQuery.isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load dashboard"
        text={
          dashboardError instanceof Error
            ? dashboardError.message
            : "Something went wrong while loading the dashboard."
        }
        action={
          <button
            type="button"
            className="btn btn-primary mt-3"
            onClick={() => {
              void refetch();
              void applicationsQuery.refetch();
            }}
          >
            Try Again
          </button>
        }
      />
    );
  }

  // ── Data ─────────────────────────────────────────────────────────
  const applicationSummary = getApplicationOverviewSummary(
    applicationsQuery.data?.items ?? [],
  );
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
            disabled={isFetching || applicationsQuery.isFetching}
            onClick={() => {
              void refetch();
              void applicationsQuery.refetch();
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <RefreshCw
              size={15}
              style={{
                animation: isFetching || applicationsQuery.isFetching
                  ? "ods-spin 0.7s linear infinite"
                  : "none",
              }}
            />
            {isFetching || applicationsQuery.isFetching ? "Refreshing..." : "Refresh"}
          </button>
        }
      />

      <OverviewStatCards
        total={applicationSummary.total}
        azure={applicationSummary.azure}
        blue={applicationSummary.blue}
        completed={applicationSummary.completed}
        inProgress={applicationSummary.inProgress}
        pending={applicationSummary.pending}
        failed={applicationSummary.failed}
      />

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
