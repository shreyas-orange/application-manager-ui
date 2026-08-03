import { useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft, BarChart3, Table2 } from "lucide-react";

import type { Application } from "@/features/applications/types/application.types";

import RoadmapEditDrawer from "../components/RoadmapEditDrawer";
import RoadmapImportButton from "../components/RoadmapImportButton";
import RoadmapTable from "../components/RoadmapTable";
import { useRoadmapDetails, useUpdateRoadmapItem } from "../hooks/useRoadmap";
import type { RoadmapItem } from "../types/roadmap.types";

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

export default function RoadmapPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const application =
    (location.state as { application?: Application } | null)
      ?.application ?? null;

  const appId = Number(id);

  const { data, isLoading, isError, error, refetch } = useRoadmapDetails(appId);
  const updateMutation = useUpdateRoadmapItem(appId);

  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const applicationName =
    application?.application_name ?? `Application ${id}`;

  const handleSave = async (
    itemId: number,
    payload: Parameters<typeof updateMutation.mutateAsync>[0]["payload"],
  ) => {
    await updateMutation.mutateAsync({ itemId, payload });
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: "1rem",
        }}
      >
        <div className="ods-spinner" />
        <p
          style={{
            color: "var(--ods-gray-600)",
            fontSize: "var(--ods-font-size-sm)",
          }}
        >
          Loading roadmap...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="ods-empty-state">
        <span className="ods-empty-icon">⚠️</span>
        <div className="ods-empty-title">Unable to load roadmap</div>
        <p className="ods-empty-text">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
        <button
          type="button"
          className="btn btn-primary mt-3"
          onClick={() =>
            navigate(`/app/applications/${id}`, { state: { application } })
          }
        >
          Back to Application
        </button>
      </div>
    );
  }

  const items = data?.items ?? [];

  // ── Analytics computations ────────────────────────────────────
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

  return (
    <div>
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="ods-page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() =>
              navigate(`/app/applications/${id}`, { state: { application } })
            }
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <ArrowLeft size={15} />
            Back
          </button>
          <div>
            <h1 className="page-title">Roadmap — {applicationName}</h1>
            <p className="page-subtitle">
              Application ID: {id}
              {items.length > 0 ? ` · ${items.length} items` : ""}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowAnalytics((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginLeft: "auto" }}
          >
            {showAnalytics ? <Table2 size={15} /> : <BarChart3 size={15} />}
            {showAnalytics ? "Show Table" : "Show Analytics"}
          </button>
          {items.length > 0 && (
            <RoadmapImportButton
              applicationId={appId}
              replaceExisting
              label="Replace Roadmap"
              className="btn btn-outline-secondary btn-sm"
              onSuccess={() => { void refetch(); }}
            />
          )}
        </div>
      </div>

      {/* ── Analytics view ──────────────────────────────────────── */}
      {showAnalytics && (
        <div style={{ marginBottom: "1.5rem" }}>
          {/* Summary cards */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            {statusBreakdown.map((s) => (
              <div
                key={s.name}
                className="ods-card"
                style={{
                  flex: 1,
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
      )}

      {/* ── Table ────────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="ods-card" style={{ padding: "3rem" }}>
          <div className="ods-empty-state">
            <span className="ods-empty-icon">📋</span>
            <div className="ods-empty-title">No roadmap data</div>
            <p className="ods-empty-text">
              No roadmap items found for this application.
            </p>
          </div>
        </div>
      ) : (
        <RoadmapTable items={items} onEdit={setEditingItem} />
      )}

      {/* ── Edit drawer ──────────────────────────────────────── */}
      <RoadmapEditDrawer
        item={editingItem}
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        onSave={handleSave}
      />
    </div>
  );
}
