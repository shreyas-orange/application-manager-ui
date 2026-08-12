import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import { Spinner } from "@/components/ui";
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
}

function envLabel(code: string): string {
  return ENVIRONMENT_TYPE_OPTIONS.find((o) => o.value === code)?.label ?? code;
}

export default function DbSyncupEnvironmentsPanel({
  environments,
  readOnly,
  envEdits,
  onEnvEditChange,
  newEnvSelections,
  onToggleNewEnv,
  onNewEnvPriorityChange,
  canRequestEnvironment,
  onRequestEnvironments,
  isRequestingEnvironments,
  requestEnvironmentsError,
}: DbSyncupEnvironmentsPanelProps) {
  const [addEnvOpen, setAddEnvOpen] = useState(false);

  const availableEnvTypes = useMemo(() => {
    const requested = new Set(environments.map((env) => env.environment));
    return ENVIRONMENT_TYPE_OPTIONS.filter((o) => !requested.has(o.value));
  }, [environments]);

  const selectedCount = Object.values(newEnvSelections).filter((s) => s.selected).length;

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
        {canRequestEnvironment && availableEnvTypes.length > 0 && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setAddEnvOpen((prev) => !prev)}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            {addEnvOpen ? <X size={14} /> : <Plus size={14} />}
            {addEnvOpen ? "Close" : "Add Env"}
          </button>
        )}
      </div>

      {/* ── Existing environments — only ones actually requested ─────── */}
      {environments.length === 0 ? (
        <div className="ods-card-body">
          <p style={{ color: "var(--ods-gray-500)", fontSize: "var(--ods-font-size-sm)", margin: 0 }}>
            No environments requested yet.
          </p>
        </div>
      ) : (
        <div className="ods-table-wrapper">
          <table className="ods-table">
            <thead>
              <tr>
                <th style={{ minWidth: 120 }}>Environment</th>
                <th style={{ minWidth: 160 }}>Status</th>
                <th style={{ minWidth: 140 }}>Date of Request</th>
                <th style={{ minWidth: 170 }}>Prod Second Load Cut Over</th>
              </tr>
            </thead>
            <tbody>
              {environments.map((env) => {
                const edit = envEdits[env.id] ?? {
                  status: env.request_status ?? "",
                  prodSecondLoadCutOver: env.prod_second_load_cut_over ?? "",
                };

                return (
                  <tr key={env.id}>
                    <td style={{ fontWeight: 500, color: "var(--ods-gray-800)" }}>
                      {envLabel(env.environment)}
                    </td>
                    <td>
                      {readOnly ? (
                        <span className={getStatusBadgeClass(edit.status)}>{edit.status || "NA"}</span>
                      ) : (
                        <select
                          className="form-select form-select-sm"
                          value={edit.status}
                          onChange={(e) => onEnvEditChange(env.id, "status", e.target.value)}
                        >
                          <option value="">NA</option>
                          {DB_SYNCUP_STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td style={{ color: "var(--ods-gray-700)" }}>
                      {formatDate(env.date_of_request)}
                    </td>
                    <td>
                      {readOnly ? (
                        <span style={{ color: "var(--ods-gray-700)" }}>{edit.prodSecondLoadCutOver || "NA"}</span>
                      ) : (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={edit.prodSecondLoadCutOver}
                          onChange={(e) => onEnvEditChange(env.id, "prodSecondLoadCutOver", e.target.value)}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
                    : "Toggle an environment on to request it, and set its priority."}
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
    </div>
  );
}
