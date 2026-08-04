// src/features/applications/pages/AnalyticsPage.tsx
import { useMemo, useState } from "react";
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
function normalizeCloud(app: Application): "Azure" | "Blue" | "Other" {
  const names =
    app.cloud_mappings
      ?.map((m) => m.cloud?.name?.trim().toLowerCase())
      .filter(Boolean) ?? [];
  if (names.includes("azure")) return "Azure";
  if (names.includes("blue") || names.includes("bleu")) return "Blue";
  return "Other";
}

function normalizeStatus(app: Application): string {
  const s = (app.migration?.migration_status || app.application_status || "Pending").trim();
  const lower = s.toLowerCase();
  if (["completed", "complete", "done", "production"].includes(lower)) return "Completed";
  if (["in progress", "in_progress", "ongoing", "started"].includes(lower)) return "In Progress";
  if (["failed", "failure", "cancelled"].includes(lower)) return "Failed";
  return "Pending";
}

function getMonthKey(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(key: string): string {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const CLOUD_COLORS: Record<string, string> = {
  Azure: "#0078D4",
  Blue:  "#0052CC",
};

const STATUS_COLORS: Record<string, string> = {
  "Completed":  "#198754",
  "In Progress": "#FFC107",
  "Failed":     "#DC3545",
  "Pending":    "#6C757D",
};

const NS_COLORS: Record<string, string> = {
  Migrated:      "#198754",
  "In Progress": "#FFC107",
  Decommissioned: "#6C757D",
};

type CloudChoice = "Azure" | "Blue";

// ─── Component ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { data, isLoading, isError, error } = useAllApplications();
  const applications = data?.items ?? [];
  const [activeCloud, setActiveCloud] = useState<CloudChoice>("Azure");

  // ── Filtered apps for active cloud ─────────────────────────────
  const cloudApps = useMemo(
    () => applications.filter((a) => normalizeCloud(a) === activeCloud),
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
        monthLabel: formatMonth(month),
        count,
      }));
  }, [cloudApps]);

  // ── Status breakdown ───────────────────────────────────────────
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    cloudApps.forEach((app) => {
      const s = normalizeStatus(app);
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

  const nsChartData = useMemo(
    () => [{
      name: "Namespaces",
      Migrated: nsAnalytics.migrated,
      "In Progress": nsAnalytics.in_progress,
      Decommissioned: nsAnalytics.decommissioned,
    }],
    [nsAnalytics],
  );

  // ── Loading / Error ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem" }}>
        <div className="ods-spinner" />
        <p style={{ color: "var(--ods-gray-600)", fontSize: "var(--ods-font-size-sm)" }}>
          Loading analytics...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="ods-empty-state">
        <span className="ods-empty-icon">⚠️</span>
        <div className="ods-empty-title">Unable to load analytics</div>
        <p className="ods-empty-text">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div>
      {/* Page header + toggle */}
      <div className="ods-page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">
            {activeCloud} migration overview — {cloudApps.length} applications
          </p>
        </div>

        {/* Azure / Blue toggle */}
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
      </div>

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

      {/* ── Monthly Migration Bar Chart + Table ──────────────── */}
      <div className="ods-card">
        <div className="ods-card-header">
          <h2 className="ods-card-title">Monthly Migration Data</h2>
        </div>
        <div className="ods-card-body">
          {monthlyData.length === 0 ? (
            <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", margin: 0 }}>
              No migration date data available for {activeCloud}.
            </p>
          ) : (
            <>
              {/* Bar chart */}
              <div style={{ width: "100%", height: 350, marginBottom: "1.5rem" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ods-gray-200)" />
                    <XAxis
                      dataKey="monthLabel"
                      tick={{ fontSize: 12, fill: "var(--ods-gray-600)" }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--ods-gray-600)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--ods-white)",
                        border: "1px solid var(--ods-gray-200)",
                        borderRadius: 0,
                        fontSize: "var(--ods-font-size-sm)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" name={activeCloud} fill={cloudColor} radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="ods-table-wrapper">
                <table className="ods-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>{activeCloud} Migrations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((row) => (
                      <tr key={row.month}>
                        <td style={{ fontWeight: 600, color: "var(--ods-gray-800)" }}>
                          {row.monthLabel}
                        </td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Status Pie Chart ──────────────────────────────────── */}
      <div className="ods-card" style={{ marginTop: "1.5rem" }}>
        <div className="ods-card-header">
          <h2 className="ods-card-title">{activeCloud} — Application Status</h2>
        </div>
        <div className="ods-card-body">
          {statusData.length === 0 ? (
            <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", margin: 0 }}>
              No {activeCloud} applications found.
            </p>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "2.5rem", flexWrap: "wrap" }}>
              <div style={{ width: 280, height: 280, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={50}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {statusData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={STATUS_COLORS[entry.name] ?? "#999"}
                        />
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
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend + counts */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {statusData.map((entry) => (
                  <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        background: STATUS_COLORS[entry.name] ?? "#999",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-700)", minWidth: 90 }}>
                      {entry.name}
                    </span>
                    <strong style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-900)" }}>
                      {entry.value}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Namespace Migration Analytics ────────────────────── */}
      <div className="ods-card" style={{ marginTop: "1.5rem" }}>
        <div className="ods-card-header">
          <h2 className="ods-card-title">{activeCloud} — Namespace Migration</h2>
        </div>
        <div className="ods-card-body">
          {nsAnalytics.total_namespaces === 0 &&
          nsAnalytics.migrated === 0 &&
          nsAnalytics.in_progress === 0 &&
          nsAnalytics.decommissioned === 0 ? (
            <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", margin: 0 }}>
              No namespace migration data available for {activeCloud}.
            </p>
          ) : (
            <>
              {/* Stat cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div className="ods-stat-card" style={{ borderTopColor: cloudColor }}>
                  <div className="ods-stat-value" style={{ color: cloudColor }}>
                    {nsAnalytics.total_namespaces}
                  </div>
                  <div className="ods-stat-label">Total Namespaces</div>
                </div>
                <div className="ods-stat-card success">
                  <div className="ods-stat-value">{nsAnalytics.migrated}</div>
                  <div className="ods-stat-label">Migrated</div>
                </div>
                <div className="ods-stat-card warning">
                  <div className="ods-stat-value">{nsAnalytics.in_progress}</div>
                  <div className="ods-stat-label">In Progress</div>
                </div>
                <div className="ods-stat-card">
                  <div className="ods-stat-value" style={{ color: NS_COLORS.Decommissioned }}>
                    {nsAnalytics.decommissioned}
                  </div>
                  <div className="ods-stat-label">Decommissioned</div>
                </div>
              </div>

              {/* Stacked bar */}
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={nsChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    barSize={48}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ods-gray-200)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--ods-gray-600)" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--ods-gray-600)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--ods-white)",
                        border: "1px solid var(--ods-gray-200)",
                        borderRadius: 0,
                        fontSize: "var(--ods-font-size-sm)",
                      }}
                    />
                    <Legend />
                    {Object.entries(NS_COLORS).map(([name, color]) => (
                      <Bar
                        key={name}
                        dataKey={name}
                        stackId="ns"
                        fill={color}
                        radius={
                          name === "Migrated" ? [4, 0, 0, 4]
                            : name === "Decommissioned" ? [0, 4, 4, 0]
                            : [0, 0, 0, 0]
                        }
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
