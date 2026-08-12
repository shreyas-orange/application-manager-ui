import type { ReactNode } from "react";
import { Info } from "lucide-react";

import { useUsersByRole } from "@/features/users/hooks/useUsersByRole";

import { DB_SYNCUP_PRIORITY_OPTIONS } from "../constants";

const MIGRATION_INCHARGE_ROLE = "Migration Manager";

export interface DbSyncupDetailsFormValues {
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

function SectionTitle({ title, tooltip }: { title: string; tooltip?: string }) {
  return (
    <h3
      style={{
        fontSize: "0.8rem",
        fontWeight: 700,
        color: "var(--ods-gray-700)",
        margin: 0,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        display: "flex",
        alignItems: "center",
        gap: "0.35rem",
      }}
    >
      {title}
      {tooltip && (
        <span title={tooltip} style={{ display: "inline-flex", cursor: "help", textTransform: "none", letterSpacing: "normal" }}>
          <Info size={13} color="var(--ods-gray-500)" />
        </span>
      )}
    </h3>
  );
}

function Section({ title, tooltip, children }: { title: string; tooltip?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ borderLeft: "3px solid var(--ods-orange)", paddingLeft: "0.75rem", marginBottom: "0.875rem" }}>
        <SectionTitle title={title} tooltip={tooltip} />
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

const helperTextStyle = {
  margin: "0.25rem 0 0",
  fontSize: "var(--ods-font-size-xs)",
  color: "var(--ods-gray-500)",
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  readOnly,
  fullWidth = false,
  helperText,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  readOnly: boolean;
  fullWidth?: boolean;
  helperText?: string;
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
      {helperText && <p style={helperTextStyle}>{helperText}</p>}
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
        <Section title="Priority" tooltip="For Application Team to update">
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

        <Section title="DB Details" tooltip="For DB Team to update">
          <Field label="DB Validator" value={values.db_validation} readOnly={readOnly} onChange={(v) => onChange("db_validation", v)} />

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
              <p style={helperTextStyle}>
                No users with the Migration Manager role were found.
              </p>
            )}
          </div>

          <Field
            label="First Date of Request"
            type="date"
            value={values.date_of_request}
            readOnly={readOnly}
            onChange={(v) => onChange("date_of_request", v)}
            helperText="The first date a request was made, across all environments."
          />

          <div>
            <label style={labelStyle}>Environment count</label>
            <div style={readOnlyBoxStyle()}>{environmentCount}</div>
            <p style={helperTextStyle}>
              Reflects the environments requested below.
            </p>
          </div>

          <Field
            label="Time taken in prod"
            value={values.time_taken_in_prod}
            readOnly={readOnly}
            fullWidth
            onChange={(v) => onChange("time_taken_in_prod", v)}
            helperText="Time taken from the First Date of Request to the Prod date."
          />
          <Field label="Remarks" value={values.remarks} readOnly={readOnly} fullWidth onChange={(v) => onChange("remarks", v)} />
        </Section>
      </div>
    </div>
  );
}
