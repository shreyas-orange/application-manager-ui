// src/features/applications/pages/AnalyticsPage.tsx
import { useState } from "react";

import { EmptyState, PageHeader, PageLoader } from "@/components/ui";
import { formatMonthYear } from "@/lib/format";

import { useApplicationAnalytics } from "../hooks/useApplicationAnalytics";
import MonthlyMigrationCard from "../components/MonthlyMigrationCard";
import StatusBreakdownCard from "../components/StatusBreakdownCard";
import NamespaceAnalyticsCard from "../components/NamespaceAnalyticsCard";

// ─── Colors ───────────────────────────────────────────────────────────────────
const CLOUD_COLORS: Record<string, string> = {
  Azure: "#0078D4",
  Bleu:  "#0052CC",
};

type CloudChoice = "Azure" | "Bleu";

// ─── Component ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [activeCloud, setActiveCloud] = useState<CloudChoice>("Azure");
  const { data, isLoading, isError, error } = useApplicationAnalytics(activeCloud);

  // ── Filtered apps for active cloud ─────────────────────────────
  const monthlyData = (data?.monthly_migrations ?? []).map((item) => ({
    ...item,
    monthLabel: formatMonthYear(item.month),
  }));
  const statusData = data?.status_breakdown ?? [];

  // ── Monthly migration data ─────────────────────────────────────
  // ── Status breakdown ───────────────────────────────────────────
  const cloudColor = CLOUD_COLORS[activeCloud];

  // ── Namespace migration analytics ──────────────────────────
  const nsAnalytics = data?.namespace_summary ?? {
    total_namespaces: 0,
    migrated: 0,
    in_progress: 0,
    decommissioned: 0,
  };

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
        subtitle={`${activeCloud} migration overview — ${data?.total_applications ?? 0} applications`}
        actions={
          <div
            style={{
              display:      "flex",
              border:       "1px solid var(--ods-gray-300)",
              overflow:     "hidden",
            }}
          >
            {(["Azure", "Bleu"] as CloudChoice[]).map((cloud) => (
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
          <div className="ods-stat-value" style={{ color: cloudColor }}>{data?.total_applications ?? 0}</div>
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
