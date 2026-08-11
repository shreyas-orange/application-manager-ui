// src/features/applications/pages/AnalyticsPage.tsx
import { useMemo, useState } from "react";

import { EmptyState, PageHeader, PageLoader } from "@/components/ui";
import { formatMonthYear, getMonthKey } from "@/lib/format";

import { useAllApplications } from "../hooks/useAllApplications";
import { getCloudPrimary, getMigrationStatus, normalizeStatus } from "../utils/status";
import MonthlyMigrationCard from "../components/MonthlyMigrationCard";
import StatusBreakdownCard from "../components/StatusBreakdownCard";
import NamespaceAnalyticsCard from "../components/NamespaceAnalyticsCard";

// ─── Colors ───────────────────────────────────────────────────────────────────
const CLOUD_COLORS: Record<string, string> = {
  Azure: "#0078D4",
  Blue:  "#0052CC",
};

type CloudChoice = "Azure" | "Blue";

// ─── Component ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { data, isLoading, isError, error } = useAllApplications();
  const applications = useMemo(() => data?.items ?? [], [data]);
  const [activeCloud, setActiveCloud] = useState<CloudChoice>("Azure");

  // ── Filtered apps for active cloud ─────────────────────────────
  const cloudApps = useMemo(
    () => applications.filter((a) => getCloudPrimary(a) === activeCloud),
    [applications, activeCloud],
  );

  // ── Monthly migration data ─────────────────────────────────────
  const monthlyData = useMemo(() => {
    const buckets: Record<string, number> = {};

    cloudApps.forEach((app) => {
      const key =
        getMonthKey(app.migration?.tentative_start) ??
        getMonthKey(app.migration?.confirmed_end) ??
        getMonthKey(app.created_at);
      if (!key) return;
      buckets[key] = (buckets[key] ?? 0) + 1;
    });

    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month,
        monthLabel: formatMonthYear(month),
        count,
      }));
  }, [cloudApps]);

  // ── Status breakdown ───────────────────────────────────────────
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    cloudApps.forEach((app) => {
      const s = normalizeStatus(getMigrationStatus(app));
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [cloudApps]);

  const cloudColor = CLOUD_COLORS[activeCloud];

  // ── Namespace migration analytics ──────────────────────────
  const nsAnalytics = useMemo(() => {
    let totalNs = 0;
    let migrated = 0;
    let inProgress = 0;
    let decommissioned = 0;

    cloudApps.forEach((app) => {
      const mig = app.migration;
      if (!mig) return;

      totalNs += mig.total_ns ?? 0;
      decommissioned += mig.ns_decommissioned ?? 0;

      if (mig.ns_migrated != null) {
        migrated += mig.ns_migrated;
        inProgress += mig.ns_in_progress ?? 0;
      } else {
        const doneCount = mig.ns_migration_progress
          ?.split("\n").map((s) => s.trim()).filter(Boolean).length ?? 0;
        migrated += doneCount;
        inProgress += Math.max(0, (mig.total_ns ?? 0) - doneCount);
      }
    });

    return { total_namespaces: totalNs, migrated, in_progress: inProgress, decommissioned };
  }, [cloudApps]);

  // ── Loading / Error ────────────────────────────────────────────
  if (isLoading) {
    return <PageLoader label="Loading analytics..." />;
  }

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load analytics"
        text={error instanceof Error ? error.message : "Something went wrong."}
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle={`${activeCloud} migration overview — ${cloudApps.length} applications`}
        actions={
          <div
            style={{
              display:      "flex",
              border:       "1px solid var(--ods-gray-300)",
              overflow:     "hidden",
            }}
          >
            {(["Azure", "Blue"] as CloudChoice[]).map((cloud) => (
              <button
                key={cloud}
                type="button"
                onClick={() => setActiveCloud(cloud)}
                style={{
                  padding:       "0.5rem 1.25rem",
                  fontSize:      "var(--ods-font-size-sm)",
                  fontWeight:    activeCloud === cloud ? 700 : 400,
                  background:    activeCloud === cloud ? CLOUD_COLORS[cloud] : "var(--ods-white)",
                  color:         activeCloud === cloud ? "#fff" : "var(--ods-gray-700)",
                  border:        "none",
                  borderRight:   cloud === "Azure" ? "1px solid var(--ods-gray-300)" : "none",
                  cursor:        "pointer",
                  transition:    "all var(--ods-transition)",
                }}
              >
                {cloud}
              </button>
            ))}
          </div>
        }
      />

      {/* ── Summary card ──────────────────────────────────────── */}
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap:                 "1rem",
          marginBottom:        "1.5rem",
        }}
      >
        <div className="ods-stat-card" style={{ borderTopColor: cloudColor }}>
          <div className="ods-stat-value" style={{ color: cloudColor }}>{cloudApps.length}</div>
          <div className="ods-stat-label">{activeCloud} Applications</div>
        </div>
        <div className="ods-stat-card success">
          <div className="ods-stat-value">
            {statusData.find((s) => s.name === "Completed")?.value ?? 0}
          </div>
          <div className="ods-stat-label">Completed</div>
        </div>
        <div className="ods-stat-card warning">
          <div className="ods-stat-value">
            {statusData.find((s) => s.name === "In Progress")?.value ?? 0}
          </div>
          <div className="ods-stat-label">In Progress</div>
        </div>
        <div className="ods-stat-card danger">
          <div className="ods-stat-value">
            {statusData.find((s) => s.name === "Failed")?.value ?? 0}
          </div>
          <div className="ods-stat-label">Failed</div>
        </div>
        <div className="ods-stat-card">
          <div className="ods-stat-value">
            {statusData.find((s) => s.name === "Pending")?.value ?? 0}
          </div>
          <div className="ods-stat-label">Pending</div>
        </div>
      </div>

      <MonthlyMigrationCard data={monthlyData} activeCloud={activeCloud} cloudColor={cloudColor} />
      <StatusBreakdownCard data={statusData} activeCloud={activeCloud} />
      <NamespaceAnalyticsCard analytics={nsAnalytics} activeCloud={activeCloud} cloudColor={cloudColor} />
    </div>
  );
}
