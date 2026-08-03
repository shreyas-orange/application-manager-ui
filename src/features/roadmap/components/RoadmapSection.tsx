// src/features/roadmap/components/RoadmapSection.tsx
import { useState } from "react";
import { Plus } from "lucide-react";

import RoadmapEditDrawer from "./RoadmapEditDrawer";
import RoadmapImportButton from "./RoadmapImportButton";
import RoadmapTable from "./RoadmapTable";
import {
  useCreateRoadmapItem,
  useRoadmapDetails,
  useUpdateRoadmapItem,
} from "../hooks/useRoadmap";
import type { RoadmapItem } from "../types/roadmap.types";

// ─── Component ────────────────────────────────────────────────────────────────
export default function RoadmapSection({ appId }: { appId: number }) {
  const { data, isLoading, isError, error, refetch } = useRoadmapDetails(appId);
  const updateMutation = useUpdateRoadmapItem(appId);
  const createMutation = useCreateRoadmapItem(appId);

  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [creating, setCreating] = useState(false);

  const items = data?.items ?? [];

  const nextDisplayOrder =
    items.length > 0
      ? Math.max(...items.map((i) => i.display_order)) + 1
      : 1;

  const handleSave = async (
    payload: Parameters<typeof updateMutation.mutateAsync>[0]["payload"],
    itemId?: number,
  ) => {
    if (itemId != null) {
      await updateMutation.mutateAsync({ itemId, payload });
    } else {
      await createMutation.mutateAsync({ payload });
    }
  };

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
          onClick={() => { void refetch(); }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.5rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setCreating(true)}
          style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
        >
          <Plus size={15} />
          Create Item
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

      {/* ── Table / empty state ───────────────────────────────── */}
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

      {/* ── Edit / Create drawer ─────────────────────────────── */}
      <RoadmapEditDrawer
        item={editingItem}
        isOpen={editingItem !== null || creating}
        mode={editingItem ? "edit" : "create"}
        nextDisplayOrder={nextDisplayOrder}
        onClose={() => {
          setEditingItem(null);
          setCreating(false);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
