// src/features/roadmap/components/RoadmapSection.tsx
import { useState } from "react";
import { Download, Plus, RefreshCw } from "lucide-react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { getUserRole } from "@/features/auth/utils/get-user-role";
import { useConfirmDialog } from "@/components/ui";
import { downloadBlob, getResponseFilename } from "@/lib/download-file";

import RoadmapEditDrawer from "./RoadmapEditDrawer";
import RoadmapImportButton from "./RoadmapImportButton";
import RoadmapTable from "./RoadmapTable";
import {
  useCreateRoadmapItem,
  useCreateRoadmapLookup,
  useDeleteRoadmapItem,
  useRoadmapDetails,
  useRoadmapLookups,
  useUpdateRoadmapItem,
} from "../hooks/useRoadmap";
import { exportRoadmapExcel } from "../api/roadmap.api";
import type { RoadmapItem } from "../types/roadmap.types";

// ─── Component ────────────────────────────────────────────────────────────────
export default function RoadmapSection({ appId }: { appId: number }) {
  const { data: currentUser } = useCurrentUser();
  const canDelete = ["admin", "manager"].includes(getUserRole(currentUser));
  const { confirm, dialog } = useConfirmDialog();
  const { data, isLoading, isError, error, isFetching, refetch } = useRoadmapDetails(appId);
  const updateMutation = useUpdateRoadmapItem(appId);
  const createMutation = useCreateRoadmapItem(appId);
  const phasesQuery = useRoadmapLookups("phases");
  const environmentsQuery = useRoadmapLookups("environments");
  const createPhase = useCreateRoadmapLookup("phases");
  const createEnvironment = useCreateRoadmapLookup("environments");
  const deleteMutation = useDeleteRoadmapItem(appId);

  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [importError, setImportError] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setImportError("");
    setIsExporting(true);
    try {
      const result = await exportRoadmapExcel(appId);
      downloadBlob(
        result.blob,
        getResponseFilename(result.contentDisposition, `application_${appId}_roadmap.xlsx`),
      );
    } catch (exportError) {
      setImportError(exportError instanceof Error ? exportError.message : "Unable to export roadmap.");
    } finally {
      setIsExporting(false);
    }
  };

  const items = data?.items ?? [];

  const phaseOptions = phasesQuery.data ?? [];
  const environmentOptions = environmentsQuery.data ?? [];

  const resolveLookup = async (
    kind: "phases" | "environments",
    value: string,
  ): Promise<number> => {
    const normalized = value.trim().toLowerCase();
    const options = kind === "phases" ? phaseOptions : environmentOptions;
    const existing = options.find((option) =>
      option.name.trim().toLowerCase() === normalized ||
      option.display_name.trim().toLowerCase() === normalized
    );
    if (existing) return existing.id;

    const created = kind === "phases"
      ? await createPhase.mutateAsync(value.trim())
      : await createEnvironment.mutateAsync(value.trim());
    return created.id;
  };

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

  const handleDelete = async (item: RoadmapItem) => {
    const confirmed = await confirm({
      title: "Delete roadmap activity",
      message: `Are you sure you want to delete activity ${item.activity_number || item.display_order}: ${item.activity}?`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;
    await deleteMutation.mutateAsync(item.id);
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
          alignItems: "flex-start",
          gap: "0.5rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled={isExporting}
          onClick={() => { void handleExport(); }}
          style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
        >
          <Download size={15} />
          {isExporting ? "Exporting..." : "Export Excel"}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          disabled={isFetching}
          onClick={() => { void refetch(); }}
          style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
        >
          <RefreshCw
            size={15}
            style={{ animation: isFetching ? "ods-spin 0.7s linear infinite" : "none" }}
          />
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setCreating(true)}
          style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
        >
          <Plus size={15} />
          Create Item
        </button>
        <RoadmapImportButton
          applicationId={appId}
          replaceExisting={items.length > 0}
          label={items.length > 0 ? "Replace Roadmap" : "Upload Roadmap"}
          className="btn btn-outline-secondary btn-sm"
          onSuccess={() => {
            setImportError("");
            void refetch();
          }}
          onErrorMessage={setImportError}
        />
      </div>

      {importError && (
        <div
          className="ods-form-message error"
          role="alert"
          aria-live="assertive"
          style={{
            maxWidth: 620,
            margin: "-0.5rem 0 1rem auto",
            padding: "0.4rem 0.55rem",
            fontSize: "var(--ods-font-size-xs)",
            lineHeight: 1.3,
          }}
        >
          {importError}
        </div>
      )}

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
        <RoadmapTable
          items={items}
          onEdit={setEditingItem}
          onDelete={canDelete ? (item) => { void handleDelete(item); } : undefined}
          deletingItemId={deleteMutation.isPending ? deleteMutation.variables : null}
        />
      )}

      {/* ── Edit / Create drawer ─────────────────────────────── */}
      <RoadmapEditDrawer
        item={editingItem}
        isOpen={editingItem !== null || creating}
        mode={editingItem ? "edit" : "create"}
        nextDisplayOrder={nextDisplayOrder}
        phaseOptions={phaseOptions}
        environmentOptions={environmentOptions}
        onResolveLookup={resolveLookup}
        onClose={() => {
          setEditingItem(null);
          setCreating(false);
        }}
        onSave={handleSave}
      />
      {dialog}
    </div>
  );
}
