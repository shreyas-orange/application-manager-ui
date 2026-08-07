// src/features/roadmap/components/RoadmapAnalytics.tsx
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useRoadmapDetails } from "../hooks/useRoadmap";

const STATUS_LABELS: Record<string, string> = {
  TO_DO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  NOT_REQUIRED: "Not Required",
};

const STATUS_COLORS: Record<string, string> = {
  DONE: "#15803d",
  IN_PROGRESS: "#1d4ed8",
  TO_DO: "#c2410c",
  NOT_REQUIRED: "#6b7280",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function RoadmapAnalytics({ appId }: { appId: number }) {
  const { data, isLoading, isError, error } = useRoadmapDetails(appId);

  const items = useMemo(() => data?.items ?? [], [data]);

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      const s = item.status ?? "TO_DO";
      counts[s] = (counts[s] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: STATUS_LABELS[name] ?? name,
      value,
      fill: STATUS_COLORS[name] ?? "#6b7280",
    }));
  }, [items]);

  const phaseOverview = useMemo(() => {
    const groups: Record<string, Record<string, number>> = {};
    items.forEach((item) => {
      const phase = item.phase || "Other";
      if (!groups[phase]) groups[phase] = {};
      const s = item.status ?? "TO_DO";
      groups[phase][s] = (groups[phase][s] ?? 0) + 1;
    });
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([phase, statuses]) => ({
        phase,
        total: Object.values(statuses).reduce((sum, v) => sum + v, 0),
        done: statuses.DONE ?? 0,
        inProgress: statuses.IN_PROGRESS ?? 0,
        toDo: statuses.TO_DO ?? 0,
        notRequired: statuses.NOT_REQUIRED ?? 0,
      }));
  }, [items]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "40vh",
          gap: "1rem",
        }}
      >
        <div className="ods-spinner" />
        <p style={{ color: "var(--ods-gray-600)", fontSize: "var(--ods-font-size-sm)" }}>
          Loading roadmap analytics...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="ods-empty-state">
        <span className="ods-empty-icon">⚠️</span>
        <div className="ods-empty-title">Unable to load roadmap analytics</div>
        <p className="ods-empty-text">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="ods-card" style={{ padding: "3rem" }}>
        <div className="ods-empty-state">
          <span className="ods-empty-icon">📊</span>
          <div className="ods-empty-title">No roadmap data</div>
          <p className="ods-empty-text">
            No roadmap items found for this application yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {statusBreakdown.map((s) => (
          <div
            key={s.name}
            className="ods-card"
            style={{
              flex: 1,
              minWidth: 140,
              padding: "1rem 1.25rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <span style={{ fontSize: "1.5rem", fontWeight: 700, color: s.fill }}>
              {s.value}
            </span>
            <span style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-500)" }}>
              {s.name}
            </span>
          </div>
        ))}
      </div>

      {/* Pie chart */}
      <div className="ods-card" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "var(--ods-font-size-sm)" }}>
          Status Distribution
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={statusBreakdown}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
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

      {/* Phase overview table */}
      <div className="ods-card" style={{ padding: 0 }}>
        <div className="ods-table-wrapper">
          <table className="ods-table">
            <thead>
              <tr>
                <th>Phase</th>
                <th>Total</th>
                <th>Done</th>
                <th>In Progress</th>
                <th>To Do</th>
                <th>Not Required</th>
              </tr>
            </thead>
            <tbody>
              {phaseOverview.map((row) => (
                <tr key={row.phase}>
                  <td style={{ fontWeight: 500 }}>{row.phase}</td>
                  <td>{row.total}</td>
                  <td style={{ color: STATUS_COLORS.DONE }}>{row.done}</td>
                  <td style={{ color: STATUS_COLORS.IN_PROGRESS }}>{row.inProgress}</td>
                  <td style={{ color: STATUS_COLORS.TO_DO }}>{row.toDo}</td>
                  <td style={{ color: STATUS_COLORS.NOT_REQUIRED }}>{row.notRequired}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
