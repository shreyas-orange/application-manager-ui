import { useMemo, useState } from "react";

import { Spinner, useConfirmDialog } from "@/components/ui";
import { formatDate } from "@/lib/format";

import {
  DB_SYNCUP_PRIORITY_OPTIONS,
  DB_SYNCUP_STATUS_OPTIONS,
  ENVIRONMENT_TYPE_OPTIONS,
  getStatusBadgeClass,
} from "../constants";
import type { DbSyncEnvironmentRequest } from "../types/db-syncup.types";

export interface EnvEdit {
  status: string;
  prodSecondLoadCutOver: string;
}

export interface NewEnvSelection {
  selected: boolean;
  priority: string;
}

interface DbSyncupEnvironmentsPanelProps {
  environments: DbSyncEnvironmentRequest[];
  showBleuEnvironments: boolean;
  readOnly: boolean;
  envEdits: Record<number, EnvEdit>;
  onEnvEditChange: (envId: number, field: "status" | "prodSecondLoadCutOver", value: string) => void;
  newEnvSelections: Record<string, NewEnvSelection>;
  onToggleNewEnv: (envCode: string) => void;
  onNewEnvPriorityChange: (envCode: string, priority: string) => void;
  canRequestEnvironment: boolean;
  onRequestEnvironments: () => Promise<void>;
  isRequestingEnvironments: boolean;
  requestEnvironmentsError?: string | null;
  onEnvStatusUpdate: (environment: DbSyncEnvironmentRequest, status: string) => Promise<void>;
  onMissingEnvStatusUpdate: (cloud: string, environment: string, status: string) => Promise<void>;
  updatingEnvId?: number | null;
}

function envLabel(code: string): string {
  return ENVIRONMENT_TYPE_OPTIONS.find((o) => o.value === code)?.label ?? code;
}

export default function DbSyncupEnvironmentsPanel({
  environments,
  showBleuEnvironments,
  newEnvSelections,
  onToggleNewEnv,
  onNewEnvPriorityChange,
  canRequestEnvironment,
  onRequestEnvironments,
  isRequestingEnvironments,
  requestEnvironmentsError,
  onEnvStatusUpdate,
  onMissingEnvStatusUpdate,
  updatingEnvId,
}: DbSyncupEnvironmentsPanelProps) {
  const { confirm, dialog } = useConfirmDialog();
  const [addEnvOpen, setAddEnvOpen] = useState(false);
  const [selectedEnvironmentKey, setSelectedEnvironmentKey] = useState<string | null>(null);
  const [detailCloud, setDetailCloud] = useState<string | null>(null);

  const availableEnvTypes = useMemo(() => {
    const requested = new Set(
      environments
        .filter((env) => String(env.deployment_target ?? "").trim().toUpperCase() === "BLEU")
        .map((env) => env.environment),
    );
    return ENVIRONMENT_TYPE_OPTIONS.filter((o) => !requested.has(o.value));
  }, [environments]);

  const selectedCount = Object.values(newEnvSelections).filter((s) => s.selected).length;

  const cloudEnvironmentGroups = useMemo(() => {
    const azure: DbSyncEnvironmentRequest[] = [];
    const bleu: DbSyncEnvironmentRequest[] = [];

    environments.forEach((environment) => {
      const target = String(environment.deployment_target ?? "AZURE").trim().toUpperCase();
      if (target === "BLEU") bleu.push(environment);
      else azure.push(environment);
    });

    return [
      ["Azure", azure] as const,
      ...(showBleuEnvironments ? [["Bleu", bleu] as const] : []),
    ];
  }, [environments, showBleuEnvironments]);

  const statusButtonClass = (status: string | null | undefined) => {
    const normalized = String(status ?? "").trim().toLowerCase();
    if (["completed", "complete", "done", "production"].includes(normalized)) {
      return "btn btn-success btn-sm";
    }
    if (["rejected", "cancelled", "failed", "failure", "blocked"].includes(normalized)) {
      return "btn btn-danger btn-sm";
    }
    if (normalized === "requested") {
      return "btn btn-primary btn-sm";
    }
    if (["in progress", "in_progress", "ongoing", "started"].includes(normalized)) {
      return "btn btn-warning btn-sm";
    }
    return "btn btn-secondary btn-sm";
  };

  const statusLabel = (status: string | null | undefined) =>
    DB_SYNCUP_STATUS_OPTIONS.find((option) => option.value === status)?.label || status || "Pending";

  const handleStatusChange = async (environment: DbSyncEnvironmentRequest, status: string) => {
    if (!status || status === environment.request_status) return;
    const confirmed = await confirm({
      title: "Update environment status",
      message: `Are you sure you want to update ${envLabel(environment.environment)} (${environment.deployment_target || "AZURE"}) status to ${status}?`,
      confirmLabel: "Update status",
    });
    if (!confirmed) return;

    await onEnvStatusUpdate(environment, status);
    setSelectedEnvironmentKey(null);
  };

  const handleMissingStatusChange = async (cloud: string, environment: string, status: string) => {
    if (!status) return;
    const confirmed = await confirm({
      title: "Set environment status",
      message: `Are you sure you want to set ${envLabel(environment)} (${cloud}) status to ${status}?`,
      confirmLabel: "Set status",
    });
    if (!confirmed) return;

    await onMissingEnvStatusUpdate(cloud, environment, status);
    setSelectedEnvironmentKey(null);
  };

  const handleSubmitRequest = async () => {
    try {
      await onRequestEnvironments();
      setAddEnvOpen(false);
    } catch {
      // Stay open — the error is shown via requestEnvironmentsError below.
    }
  };

  return (
    <div className="ods-card" style={{ marginBottom: "1.5rem" }}>
      <div className="ods-card-header">
        <h2 className="ods-card-title">Environments</h2>

        {/* Independent of the page's Edit toggle — can request an environment any time. */}
      </div>

      {/* ── Existing environments — only ones actually requested ─────── */}
      <>
          <div
            className="ods-card-body"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}
          >
            {cloudEnvironmentGroups.map(([cloud, cloudEnvironments]) => (
              <div key={cloud}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.65rem" }}>
                  <h3 style={{ fontSize: "var(--ods-font-size-sm)", margin: 0 }}>
                    {cloud} All Environments
                  </h3>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setDetailCloud((current) => current === cloud ? null : cloud)}
                  >
                    {detailCloud === cloud ? "Hide Details" : "View Details"}
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {ENVIRONMENT_TYPE_OPTIONS.map((environmentType) => {
                    const environmentKey = `${cloud}:${environmentType.value}`;
                    const environment = cloudEnvironments.find(
                      (item) => item.environment.trim().toUpperCase() === environmentType.value,
                    );
                    if (!environment) {
                      return selectedEnvironmentKey === environmentKey ? (
                        <select
                          key={environmentType.value}
                          className="form-select form-select-sm"
                          style={{ width: "auto" }}
                          defaultValue=""
                          autoFocus
                          onBlur={() => setSelectedEnvironmentKey(null)}
                          onChange={(event) => { void handleMissingStatusChange(cloud, environmentType.value, event.target.value); }}
                        >
                          <option value="">Select status</option>
                          {DB_SYNCUP_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          key={environmentType.value}
                          type="button"
                          className="btn btn-sm"
                          style={{
                            background: "var(--ods-gray-300)",
                            borderColor: "var(--ods-gray-300)",
                            color: "var(--ods-gray-700)",
                          }}
                          onClick={() => setSelectedEnvironmentKey(environmentKey)}
                          title="No data — click to set status"
                        >
                          {environmentType.label}
                        </button>
                      );
                    }

                      const updating = updatingEnvId === environment.id;
                      return selectedEnvironmentKey === environmentKey ? (
                        <select
                          key={environmentType.value}
                          className="form-select form-select-sm"
                          style={{ width: "auto" }}
                          value={environment.request_status || ""}
                          disabled={updating}
                          autoFocus
                          onBlur={() => setSelectedEnvironmentKey(null)}
                          onChange={(event) => { void handleStatusChange(environment, event.target.value); }}
                        >
                          <option value="">Select status</option>
                          {DB_SYNCUP_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          key={environmentType.value}
                          type="button"
                          className={statusButtonClass(environment.request_status)}
                          disabled={updating}
                          onClick={() => setSelectedEnvironmentKey(environmentKey)}
                          title={`${environment.request_status || "No status"} — click to update`}
                        >
                          {updating
                            ? "Updating..."
                            : `${envLabel(environment.environment)} · ${statusLabel(environment.request_status)}`}
                        </button>
                      );
                  })}
                </div>
              </div>
            ))}
          </div>

          {detailCloud && (
            <div>
              <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid var(--ods-gray-200)" }}>
                <h3 style={{ margin: 0, fontSize: "var(--ods-font-size-sm)" }}>
                  {detailCloud} Environment Details
                </h3>
              </div>
              <div className="ods-table-wrapper">
                <table className="ods-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 120 }}>Environment</th>
                  <th style={{ minWidth: 110 }}>Cloud</th>
                  <th style={{ minWidth: 160 }}>Status</th>
                  <th style={{ minWidth: 140 }}>Date of Request</th>
                  <th style={{ minWidth: 170 }}>Time taken In Cut Over</th>
                </tr>
              </thead>
              <tbody>
                {(cloudEnvironmentGroups.find(([cloud]) => cloud === detailCloud)?.[1] ?? []).map((environment) => {
                  const isProd = environment.environment.trim().toUpperCase() === "PROD";

                  return (
                    <tr key={environment.id}>
                      <td style={{ fontWeight: 500, color: "var(--ods-gray-800)" }}>
                        {envLabel(environment.environment)}
                      </td>
                      <td style={{ color: "var(--ods-gray-700)" }}>
                        {environment.deployment_target || "AZURE"}
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(environment.request_status)}>
                          {environment.request_status || "NA"}
                        </span>
                      </td>
                      <td style={{ color: "var(--ods-gray-700)" }}>
                        {formatDate(environment.date_of_request)}
                      </td>
                      <td>
                        {!isProd ? (
                          <span style={{ color: "var(--ods-gray-500)" }}>-</span>
                        ) : (
                          <span style={{ color: "var(--ods-gray-700)" }}>
                            {environment.prod_second_load_cut_over || "NA"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
                </table>
              </div>
            </div>
          )}

      </>

      {/* ── Add Env — toggle any/all unrequested environments at once ── */}
      {addEnvOpen && (
        <div className="ods-card-footer" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {availableEnvTypes.length === 0 ? (
            <p style={{ margin: 0, fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-500)" }}>
              All environments have already been requested for this syncup.
            </p>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {availableEnvTypes.map((envType) => {
                  const selection = newEnvSelections[envType.value] ?? { selected: false, priority: "" };

                  return (
                    <div
                      key={envType.value}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        padding: "0.6rem 0.75rem",
                        background: selection.selected ? "rgba(255, 121, 0, 0.06)" : "var(--ods-gray-100)",
                        border: `1px solid ${selection.selected ? "var(--ods-orange)" : "var(--ods-gray-200)"}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <input
                          id={`new-env-${envType.value}`}
                          type="checkbox"
                          className="form-check-input"
                          style={{ margin: 0, accentColor: "var(--ods-orange)" }}
                          checked={selection.selected}
                          disabled={isRequestingEnvironments}
                          onChange={() => onToggleNewEnv(envType.value)}
                        />
                        <label
                          htmlFor={`new-env-${envType.value}`}
                          style={{ flex: 1, fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-800)", cursor: "pointer", margin: 0 }}
                        >
                          {envType.label}
                        </label>
                      </div>
                      <select
                        className="form-select form-select-sm"
                        value={selection.priority}
                        disabled={!selection.selected || isRequestingEnvironments}
                        onChange={(e) => onNewEnvPriorityChange(envType.value, e.target.value)}
                      >
                        <option value="">Priority...</option>
                        {DB_SYNCUP_PRIORITY_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              {requestEnvironmentsError && (
                <div className="ods-form-message error" style={{ margin: 0 }}>
                  {requestEnvironmentsError}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <p style={{ margin: 0, fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-500)" }}>
                  {selectedCount > 0
                    ? `${selectedCount} environment${selectedCount === 1 ? "" : "s"} selected.`
                    : "Select Bleu environments to request, and set their priority."}
                </p>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={selectedCount === 0 || isRequestingEnvironments}
                  onClick={() => { void handleSubmitRequest(); }}
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  {isRequestingEnvironments ? (
                    <>
                      <Spinner size={14} />
                      Requesting...
                    </>
                  ) : (
                    `Request ${selectedCount > 0 ? selectedCount : ""} Environment${selectedCount === 1 ? "" : "s"}`
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {dialog}
    </div>
  );
}
