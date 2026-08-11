import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { EmptyState } from "@/components/ui";

import { normalizeDbSyncupStatus, type NormalizedDbSyncupStatus } from "../constants";
import type { DbSyncEnvironmentRequest } from "../types/db-syncup.types";

const STATUS_COLORS: Record<NormalizedDbSyncupStatus, string> = {
  Completed:    "#198754",
  "In Progress": "#FFC107",
  Requested:    "#6C757D",
  Pending:      "#ADB5BD",
  Failed:       "#DC3545",
};

interface DbSyncupEnvironmentAnalyticsProps {
  environments: DbSyncEnvironmentRequest[];
}

export default function DbSyncupEnvironmentAnalytics({ environments }: DbSyncupEnvironmentAnalyticsProps) {
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    environments.forEach((env) => {
      const s = normalizeDbSyncupStatus(env.request_status);
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      fill: STATUS_COLORS[name as NormalizedDbSyncupStatus] ?? "#6b7280",
    }));
  }, [environments]);

  if (environments.length === 0) {
    return (
      <div className="ods-card" style={{ padding: "3rem", marginBottom: "1.5rem" }}>
        <EmptyState
          icon="📊"
          title="No environments requested yet"
          text="Use the panel below to request an environment for this syncup."
        />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {/* Summary cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div
          className="ods-card"
          style={{ flex: 1, minWidth: 140, padding: "1rem 1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}
        >
          <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--ods-gray-900)" }}>
            {environments.length}
          </span>
          <span style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-500)" }}>Total</span>
        </div>
        {statusBreakdown.map((s) => (
          <div
            key={s.name}
            className="ods-card"
            style={{ flex: 1, minWidth: 140, padding: "1rem 1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}
          >
            <span style={{ fontSize: "1.5rem", fontWeight: 700, color: s.fill }}>{s.value}</span>
            <span style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-500)" }}>{s.name}</span>
          </div>
        ))}
      </div>

      {/* Pie chart */}
      <div className="ods-card" style={{ padding: "1.25rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "var(--ods-font-size-sm)" }}>Environment Status Distribution</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={statusBreakdown}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
            >
              {statusBreakdown.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
