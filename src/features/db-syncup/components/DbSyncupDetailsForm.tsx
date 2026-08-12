import type { ReactNode } from "react";

import { useUsersByRole } from "@/features/users/hooks/useUsersByRole";

import { DB_SYNCUP_PRIORITY_OPTIONS } from "../constants";

const MIGRATION_INCHARGE_ROLE = "Migration Manager";

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
        <div style={readOnlyBoxStyle()}>{value || "NA"}</div>
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
          <Field label="Application name" value={values.application_name} readOnly={readOnly} onChange={(v) => onChange("application_name", v)} />
          <Field label="Carto ID" value={values.carto_id} readOnly={readOnly} onChange={(v) => onChange("carto_id", v)} />
          <Field label="Basicat" value={values.basicat} readOnly={readOnly} onChange={(v) => onChange("basicat", v)} />
          <Field label="Domain" value={values.domain} readOnly={readOnly} onChange={(v) => onChange("domain", v)} />
          <Field label="DX-uid" value={values.dx_uid} readOnly={readOnly} onChange={(v) => onChange("dx_uid", v)} />
          <Field label="MCP-id" value={values.mcp_id} readOnly={readOnly} onChange={(v) => onChange("mcp_id", v)} />
          <Field label="Hosting" value={values.hosting} readOnly={readOnly} onChange={(v) => onChange("hosting", v)} />
          <Field label="Reason" value={values.reason} readOnly={readOnly} onChange={(v) => onChange("reason", v)} />
          <Field
            label="Data anonymization"
            value={values.data_anonymization_status}
            readOnly={readOnly}
            fullWidth
            onChange={(v) => onChange("data_anonymization_status", v)}
          />
        </Section>

        <Section title="Details">
          <Field label="DB validation" value={values.db_validation} readOnly={readOnly} onChange={(v) => onChange("db_validation", v)} />

          <div>
            <label style={labelStyle}>Migration incharge</label>
            {readOnly ? (
              <div style={readOnlyBoxStyle()}>{values.migration_incharge || "NA"}</div>
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
                No users with the Migration Manager role were found.
              </p>
            )}
          </div>

          <Field
            label="Date of request"
            type="date"
            value={values.date_of_request}
            readOnly={readOnly}
            onChange={(v) => onChange("date_of_request", v)}
          />

          <div>
            <label style={labelStyle}>Environment count</label>
            <div style={readOnlyBoxStyle()}>{environmentCount}</div>
            <p style={{ margin: "0.25rem 0 0", fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-500)" }}>
              Reflects the environments requested below.
            </p>
          </div>

          <Field
            label="Time taken in prod"
            value={values.time_taken_in_prod}
            readOnly={readOnly}
            fullWidth
            onChange={(v) => onChange("time_taken_in_prod", v)}
          />
          <Field label="Remarks" value={values.remarks} readOnly={readOnly} fullWidth onChange={(v) => onChange("remarks", v)} />
        </Section>

        <Section title="Priority">
          <div>
            <label style={labelStyle}>Application priority</label>
            {readOnly ? (
              <div style={readOnlyBoxStyle()}>{values.application_priority || "NA"}</div>
            ) : (
              <select
                className="form-select form-select-sm"
                value={values.application_priority}
                onChange={(e) => onChange("application_priority", e.target.value)}
              >
                <option value="">NA</option>
                {DB_SYNCUP_PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
