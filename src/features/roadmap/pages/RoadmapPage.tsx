import { useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import type { Application } from "@/features/applications/types/application.types";

import RoadmapEditDrawer from "../components/RoadmapEditDrawer";
import RoadmapTable from "../components/RoadmapTable";
import { useRoadmapDetails, useUpdateRoadmapItem } from "../hooks/useRoadmap";
import type { RoadmapItem } from "../types/roadmap.types";

export default function RoadmapPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const application =
    (location.state as { application?: Application } | null)
      ?.application ?? null;

  const appId = Number(id);

  const { data, isLoading, isError, error } = useRoadmapDetails(appId);
  const updateMutation = useUpdateRoadmapItem(appId);

  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);

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
        </div>
      </div>

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
