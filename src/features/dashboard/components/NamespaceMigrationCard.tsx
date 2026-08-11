import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Spinner } from "@/components/ui";

import type { NamespaceMigrationSummary } from "../types/dashboard.types";

const NS_COLORS: Record<string, string> = {
  Migrated:       "#198754",
  "In Progress":  "#FFC107",
  Decommissioned: "#6C757D",
};

interface NamespaceMigrationCardProps {
  summary: NamespaceMigrationSummary | undefined;
  isLoading: boolean;
  isError: boolean;
}

export default function NamespaceMigrationCard({ summary, isLoading, isError }: NamespaceMigrationCardProps) {
  const chartData = [
    { name: "Migrated", value: summary?.migrated ?? 0, fill: NS_COLORS.Migrated },
    { name: "In Progress", value: summary?.in_progress ?? 0, fill: NS_COLORS["In Progress"] },
    { name: "Decommissioned", value: summary?.decommissioned ?? 0, fill: NS_COLORS.Decommissioned },
  ];

  return (
    <div className="ods-card" style={{ marginBottom: "1.5rem" }}>
      <div className="ods-card-header">
        <h2 className="ods-card-title">Namespace Migration</h2>
      </div>
      <div className="ods-card-body">
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <Spinner />
          </div>
        ) : isError || !summary ? (
          <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", margin: 0 }}>
            Unable to load namespace migration summary.
          </p>
        ) : (
          <>
            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap:                 "1rem",
                marginBottom:        "1.5rem",
              }}
            >
              <div className="ods-stat-card">
                <div className="ods-stat-value">{summary.total_namespaces ?? 0}</div>
                <div className="ods-stat-label">Total Namespaces</div>
              </div>
              <div className="ods-stat-card success">
                <div className="ods-stat-value">{summary.migrated ?? 0}</div>
                <div className="ods-stat-label">Migrated</div>
              </div>
              <div className="ods-stat-card warning">
                <div className="ods-stat-value">{summary.in_progress ?? 0}</div>
                <div className="ods-stat-label">In Progress</div>
              </div>
              <div className="ods-stat-card">
                <div className="ods-stat-value" style={{ color: NS_COLORS.Decommissioned }}>
                  {summary.decommissioned ?? 0}
                </div>
                <div className="ods-stat-label">Decommissioned</div>
              </div>
            </div>

            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background:   "var(--ods-white)",
                      border:       "1px solid var(--ods-gray-200)",
                      borderRadius: 0,
                      fontSize:     "var(--ods-font-size-sm)",
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
  );
}
