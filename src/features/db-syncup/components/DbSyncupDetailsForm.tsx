import type { ReactNode } from "react";

import { useUsersByRole } from "@/features/users/hooks/useUsersByRole";

const MIGRATION_INCHARGE_ROLE = "DB_MANAGER";

export interface DbSyncupDetailsFormValues {
  application_name: string;
  carto_id: string;
  basicat: string;
  domain: string;
  dx_uid: string;
  mcp_id: string;
  hosting: string;
  reason: string;
  data_anonymization_status: string;
  db_validation: string;
  migration_incharge: string;
  date_of_request: string;
  time_taken_in_prod: string;
  remarks: string;
  application_priority: string;
}

interface DbSyncupDetailsFormProps {
  values: DbSyncupDetailsFormValues;
  onChange: <K extends keyof DbSyncupDetailsFormValues>(field: K, value: DbSyncupDetailsFormValues[K]) => void;
  readOnly: boolean;
  environmentCount: number;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ borderLeft: "3px solid var(--ods-orange)", paddingLeft: "0.75rem", marginBottom: "0.875rem" }}>
        <h3
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "var(--ods-gray-700)",
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {title}
        </h3>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>{children}</div>
    </div>
  );
}

function readOnlyBoxStyle(minHeight = 35) {
  return {
    padding: "0.5rem 0.75rem",
    fontSize: "var(--ods-font-size-sm)",
    color: "var(--ods-gray-800)",
    background: "var(--ods-gray-100)",
    border: "1px solid var(--ods-gray-200)",
    minHeight,
    display: "flex" as const,
    alignItems: "center" as const,
  };
}

const labelStyle = {
  display: "block" as const,
  fontSize: "var(--ods-font-size-xs)",
  fontWeight: 600,
  color: "var(--ods-gray-600)",
  marginBottom: "0.25rem",
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  readOnly,
  fullWidth = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  readOnly: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div style={fullWidth ? { gridColumn: "1 / -1" } : undefined}>
      <label style={labelStyle}>{label}</label>
      {readOnly ? (
        <div style={readOnlyBoxStyle()}>{value || "—"}</div>
      ) : (
        <input
          type={type}
          className="form-control form-control-sm"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
    </div>
  );
}

export default function DbSyncupDetailsForm({
  values,
  onChange,
  readOnly,
  environmentCount,
}: DbSyncupDetailsFormProps) {
  const dbManagersQuery = useUsersByRole(MIGRATION_INCHARGE_ROLE);
  const dbManagers = dbManagersQuery.data ?? [];

  return (
    <div className="ods-card">
      <div className="ods-card-body">
        <Section title="Application">
          {/* Sourced from the linked application at creation time — the update
              endpoint has no fields for these, so they're display-only here. */}
          <Field label="Application name" value={values.application_name} readOnly />
          <Field label="Carto ID" value={values.carto_id} readOnly />
          <Field label="Basicat" value={values.basicat} readOnly />
          <Field label="Domain" value={values.domain} readOnly />
          <Field label="DX-uid" value={values.dx_uid} readOnly />
          <Field label="MCP-id" value={values.mcp_id} readOnly />
          <Field label="Hosting" value={values.hosting} readOnly />
          <Field label="Reason" value={values.reason} readOnly />
          <Field label="Data anonymization" value={values.data_anonymization_status} readOnly fullWidth />
        </Section>

        <Section title="Details">
          <Field label="DB validation" value={values.db_validation} readOnly={readOnly} onChange={(v) => onChange("db_validation", v)} />

          <div>
            <label style={labelStyle}>Migration incharge</label>
            {readOnly ? (
              <div style={readOnlyBoxStyle()}>{values.migration_incharge || "—"}</div>
            ) : (
              <select
                className="form-select form-select-sm"
                value={values.migration_incharge}
                onChange={(e) => onChange("migration_incharge", e.target.value)}
              >
                <option value="">Select DB manager...</option>
                {values.migration_incharge &&
                  !dbManagers.some((u) => `${u.first_name} ${u.last_name}`.trim() === values.migration_incharge) && (
                    <option value={values.migration_incharge}>{values.migration_incharge} (current)</option>
                  )}
                {dbManagers.map((u) => {
                  const name = `${u.first_name} ${u.last_name}`.trim() || u.email;
                  return (
                    <option key={u.id} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
            )}
            {!readOnly && !dbManagersQuery.isLoading && dbManagers.length === 0 && (
              <p style={{ margin: "0.25rem 0 0", fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-500)" }}>
                No users with the DB_MANAGER role were found.
              </p>
            )}
          </div>

          <Field label="Date of request" type="date" value={values.date_of_request} readOnly />

          <div>
            <label style={labelStyle}>Environment count</label>
            <div style={readOnlyBoxStyle()}>{environmentCount}</div>
          </div>

          <Field label="Time taken in prod" value={values.time_taken_in_prod} readOnly fullWidth />
          <Field label="Remarks" value={values.remarks} readOnly={readOnly} fullWidth onChange={(v) => onChange("remarks", v)} />
        </Section>

        <Section title="Priority">
          <div>
            <label style={labelStyle}>Application priority</label>
            <div style={readOnlyBoxStyle()}>{values.application_priority || "—"}</div>
            <p style={{ margin: "0.25rem 0 0", fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-500)" }}>
              Set at creation — not currently editable.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
