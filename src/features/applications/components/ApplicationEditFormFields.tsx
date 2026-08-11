import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import type { ApplicationEditFormInput } from "../schemas/application-edit.schema";

type FieldName = keyof ApplicationEditFormInput;

const LABEL_STYLE = {
  display:      "block" as const,
  fontSize:     "var(--ods-font-size-xs)",
  fontWeight:   600,
  color:        "var(--ods-gray-600)",
  marginBottom: "0.25rem",
};

const READONLY_BOX_STYLE = {
  padding:    "0.5rem 0.75rem",
  fontSize:   "var(--ods-font-size-sm)",
  color:      "var(--ods-gray-800)",
  background: "var(--ods-gray-100)",
  border:     "1px solid var(--ods-gray-200)",
};

// ─── Section ────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div
        style={{
          borderLeft:   "3px solid var(--ods-orange)",
          paddingLeft:  "0.75rem",
          marginBottom: "0.875rem",
        }}
      >
        <h3
          style={{
            fontSize:      "0.8rem",
            fontWeight:    700,
            color:         "var(--ods-gray-700)",
            margin:        0,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {title}
        </h3>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Field ──────────────────────────────────────────────────────────────────
function Field({
  label,
  name,
  type = "text",
  readOnly,
}: {
  label: string;
  name: FieldName;
  type?: string;
  readOnly: boolean;
}) {
  const { register, getValues } = useFormContext<ApplicationEditFormInput>();

  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {readOnly ? (
        <div style={{ ...READONLY_BOX_STYLE, minHeight: "35px", display: "flex", alignItems: "center" }}>
          {String(getValues(name) ?? "") || "—"}
        </div>
      ) : (
        <input type={type} className="form-control form-control-sm" {...register(name)} />
      )}
    </div>
  );
}

// ─── FieldTextarea ──────────────────────────────────────────────────────────
function FieldTextarea({
  label,
  name,
  readOnly,
}: {
  label: string;
  name: FieldName;
  readOnly: boolean;
}) {
  const { register, getValues } = useFormContext<ApplicationEditFormInput>();

  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <label style={LABEL_STYLE}>{label}</label>
      {readOnly ? (
        <div style={{ ...READONLY_BOX_STYLE, minHeight: "70px", whiteSpace: "pre-wrap" }}>
          {String(getValues(name) ?? "") || "—"}
        </div>
      ) : (
        <textarea className="form-control form-control-sm" rows={3} {...register(name)} />
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ApplicationEditFormFieldsProps {
  readOnly: boolean;
}

export default function ApplicationEditFormFields({ readOnly }: ApplicationEditFormFieldsProps) {
  const { register } = useFormContext<ApplicationEditFormInput>();

  return (
    <>
      <Section title="Application Information">
        <Field label="Application name" name="application_name" readOnly={readOnly} />
        <Field label="Carto ID" name="carto_id" readOnly={readOnly} />
        <Field label="Basicat" name="basicat" readOnly={readOnly} />
        <Field label="Domain" name="domain" readOnly={readOnly} />
        <Field label="Confirmed domain" name="confirmed_domain" readOnly={readOnly} />
        <Field label="Portfolio" name="portfolio" readOnly={readOnly} />
        <Field label="Business importance" name="business_importance" readOnly={readOnly} />
        <Field label="Application status" name="application_status" readOnly={readOnly} />
        <Field label="Priority" name="priority" readOnly={readOnly} />
        <Field label="SOV type" name="sov_type" readOnly={readOnly} />

        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            id="out_of_scope"
            type="checkbox"
            className="form-check-input"
            style={{ margin: 0, accentColor: "var(--ods-orange)" }}
            disabled={readOnly}
            {...register("out_of_scope")}
          />
          <label
            htmlFor="out_of_scope"
            style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-700)", cursor: "pointer", margin: 0 }}
          >
            Out of scope
          </label>
        </div>
      </Section>

      <Section title="Owners">
        <Field label="QA owner" name="qa_owner_name" readOnly={readOnly} />
        <Field label="QA email" name="qa_owner_email" readOnly={readOnly} />
        <Field label="DevOps owner" name="devops_owner_name" readOnly={readOnly} />
        <Field label="DevOps email" name="devops_owner_email" readOnly={readOnly} />
        <Field label="PM owner" name="pm_owner_name" readOnly={readOnly} />
        <Field label="PM email" name="pm_owner_email" readOnly={readOnly} />
        <Field label="App manager" name="manager_owner_name" readOnly={readOnly} />
        <Field label="Manager email" name="manager_owner_email" readOnly={readOnly} />
      </Section>

      <Section title="Migration">
        <Field label="Migration status" name="migration_status" readOnly={readOnly} />
        <Field label="Progress (%)" name="migration_progress" type="number" readOnly={readOnly} />
        <Field label="Hosting location" name="hosting_location" readOnly={readOnly} />
        <Field label="Cloud squad" name="cloud_squad" readOnly={readOnly} />
        <Field label="Cluster" name="cluster" readOnly={readOnly} />
        <Field label="Strategy" name="strategy" readOnly={readOnly} />
        <Field label="Tentative start" name="tentative_start" type="date" readOnly={readOnly} />
        <Field label="Tentative end" name="tentative_end" type="date" readOnly={readOnly} />
        <Field label="Confirmed end" name="confirmed_end" type="date" readOnly={readOnly} />
        <Field label="Go live" name="go_live" type="date" readOnly={readOnly} />
      </Section>

      <Section title="Metadata">
        <Field label="Assessment status" name="assessment_status" readOnly={readOnly} />
        <Field label="Wave" name="wave" readOnly={readOnly} />
        <Field label="Gate" name="gate" readOnly={readOnly} />
        <FieldTextarea label="Data anonymization" name="data_anonymization_status" readOnly={readOnly} />
      </Section>

      <Section title="Security">
        <Field label="Nexus status" name="nexus_status" readOnly={readOnly} />
        <Field label="Rooted status" name="rooted_status" readOnly={readOnly} />
        <Field label="Network policy status" name="network_policy_status" readOnly={readOnly} />
        <Field label="Security prod status" name="security_prod_status" readOnly={readOnly} />
      </Section>

      <Section title="Remarks">
        <FieldTextarea label="Remark" name="remark" readOnly={readOnly} />
        <FieldTextarea label="Important remarks" name="remarks_imp" readOnly={readOnly} />
        <FieldTextarea label="Source comments" name="source_comments" readOnly={readOnly} />
      </Section>
    </>
  );
}
