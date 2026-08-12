import { useState } from "react";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type {
  ApplicationsByDomainItem,
  CloudDistributionItem,
  MigrationStatusItem,
} from "../types/dashboard.types";

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

function migrationColor(name: string, index: number): string {
  return MIGRATION_COLORS[name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

interface CountListProps {
  items: { label: string; count: number }[];
  emptyText: string;
  initialVisibleCount?: number;
}

function CountList({ items, emptyText, initialVisibleCount }: CountListProps) {
  const [showAll, setShowAll] = useState(false);

  if (items.length === 0) {
    return (
      <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", textAlign: "center", padding: "2rem 0" }}>
        {emptyText}
      </p>
    );
  }

  const hasMore = initialVisibleCount !== undefined && items.length > initialVisibleCount;
  const visibleItems = hasMore && !showAll
    ? items.slice(0, initialVisibleCount)
    : items;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {visibleItems.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          style={{
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            padding:        "0.625rem 0.75rem",
            background:     "var(--ods-gray-100)",
            borderLeft:     "3px solid var(--ods-orange)",
          }}
        >
          <span style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-700)" }}>
            {item.label || "Unknown"}
          </span>
          <strong style={{ color: "var(--ods-orange)", fontSize: "var(--ods-font-size-sm)" }}>
            {item.count}
          </strong>
        </div>
      ))}
      {hasMore && (
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          aria-expanded={showAll}
          onClick={() => setShowAll((current) => !current)}
          style={{ alignSelf: "center", marginTop: "0.25rem" }}
        >
          {showAll ? "View less" : `View more (${items.length - initialVisibleCount})`}
        </button>
      )}
    </div>
  );
}

interface DashboardChartsRowProps {
  migrationStatus: MigrationStatusItem[];
  cloudDistribution: CloudDistributionItem[];
  applicationsByDomain: ApplicationsByDomainItem[];
}

export default function DashboardChartsRow({
  migrationStatus,
  cloudDistribution,
  applicationsByDomain,
}: DashboardChartsRowProps) {
  const migrationChartData = Array.from(
    migrationStatus.reduce((totals, item) => {
      const name = normalizeMigrationStatus(item.status);
      totals.set(name, (totals.get(name) ?? 0) + item.count);
      return totals;
    }, new Map<string, number>()),
    ([name, value]) => ({ name, value }),
  ).sort((a, b) => b.value - a.value);

  const domainItems = applicationsByDomain
    .map((item) => ({ label: item.domain?.trim() ?? "", count: item.count }))
    .filter((item) => item.label.length > 0 && !/^\d+$/.test(item.label));

  return (
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
            <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", textAlign: "center", padding: "2rem 0" }}>
              No migration data found.
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={migrationChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={76}
                    paddingAngle={2}
                  >
                    {migrationChartData.map((item, index) => (
                      <Cell key={item.name} fill={migrationColor(item.name, index)} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [Number(value), "Applications"]}
                    contentStyle={{ border: "1px solid var(--ods-gray-300)", borderRadius: 0, fontSize: "0.8rem" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div
                aria-label="Migration status legend"
                style={{
                  display:             "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap:                 "0.4rem 0.75rem",
                  marginTop:           "0.5rem",
                }}
              >
                {migrationChartData.map((item, index) => (
                  <div
                    key={item.name}
                    title={`${item.name}: ${item.value}`}
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem", minWidth: 0 }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width:      10,
                        height:     10,
                        flexShrink: 0,
                        background: migrationColor(item.name, index),
                      }}
                    />
                    <span
                      style={{
                        minWidth:     0,
                        overflow:     "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace:   "nowrap",
                        color:        "var(--ods-gray-700)",
                        fontSize:     "0.75rem",
                      }}
                    >
                      {item.name}: <strong>{item.value}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cloud Distribution */}
      <div className="ods-card">
        <div className="ods-card-header">
          <h2 className="ods-card-title">Cloud Distribution</h2>
        </div>
        <div className="ods-card-body">
          <CountList
            items={cloudDistribution.map((item) => ({ label: item.cloud, count: item.count }))}
            emptyText="No cloud data found."
          />
        </div>
      </div>

      {/* Applications by Domain */}
      <div className="ods-card">
        <div className="ods-card-header">
          <h2 className="ods-card-title">Applications by Domain</h2>
        </div>
        <div className="ods-card-body">
          <CountList
            items={domainItems}
            emptyText="No domain data found."
            initialVisibleCount={5}
          />
        </div>
      </div>
    </div>
  );
}
