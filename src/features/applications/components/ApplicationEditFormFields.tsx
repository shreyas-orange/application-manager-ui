import { useState, type ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import { useUsers } from "@/features/users/hooks/useUsers";
import type { User } from "@/features/users/types/user.types";

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

function SelectField({
  label,
  name,
  options,
  placeholder,
  readOnly,
}: {
  label: string;
  name: FieldName;
  options: string[];
  placeholder: string;
  readOnly: boolean;
}) {
  const { register, getValues } = useFormContext<ApplicationEditFormInput>();

  if (readOnly) {
    return (
      <div>
        <label style={LABEL_STYLE}>{label}</label>
        <div style={{ ...READONLY_BOX_STYLE, minHeight: "35px", display: "flex", alignItems: "center" }}>
          {String(getValues(name) ?? "") || "—"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      <select className="form-select form-select-sm" {...register(name)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function OwnerField({
  label,
  nameField,
  emailField,
  users,
  disabled,
  readOnly,
}: {
  label: string;
  nameField: FieldName;
  emailField: FieldName;
  users: User[];
  disabled: boolean;
  readOnly: boolean;
}) {
  const { setValue, watch } = useFormContext<ApplicationEditFormInput>();
  const name = String(watch(nameField) ?? "");
  const email = String(watch(emailField) ?? "");

  if (readOnly) {
    return <Field label={label} name={nameField} readOnly />;
  }

  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      <select
        className="form-select form-select-sm"
        value={email || (name ? "__current__" : "")}
        disabled={disabled}
        onChange={(event) => {
          const user = users.find((item) => item.email === event.target.value);
          const userName = user
            ? [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || user.email
            : "";
          setValue(nameField, userName, { shouldDirty: true });
          setValue(emailField, user?.email ?? "", { shouldDirty: true });
        }}
      >
        <option value="">Select a user</option>
        {email && !users.some((user) => user.email === email) && (
          <option value={email}>{name || email}</option>
        )}
        {!email && name && (
          <option value="__current__" disabled>{name}</option>
        )}
        {users.map((user) => {
          const userName = [user.first_name, user.last_name]
            .filter(Boolean)
            .join(" ")
            .trim() || user.email;
          return <option key={user.id} value={user.email}>{userName}</option>;
        })}
      </select>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ApplicationEditFormFieldsProps {
  readOnly: boolean;
}

export default function ApplicationEditFormFields({ readOnly }: ApplicationEditFormFieldsProps) {
  const { register } = useFormContext<ApplicationEditFormInput>();
  const [userSearch, setUserSearch] = useState("");
  const usersQuery = useUsers({ page: 1, pageSize: 100, search: userSearch.trim() });
  const users = (usersQuery.data?.items ?? []).filter((user) => user.is_active);

  return (
    <>
      <Section title="Application Information">
        <Field label="Application name" name="application_name" readOnly={readOnly} />
        <Field label="Carto ID" name="carto_id" readOnly />
        <Field label="Basicat" name="basicat" readOnly={readOnly} />
        <Field label="Domain" name="domain" readOnly={readOnly} />
        <Field label="Confirmed domain" name="confirmed_domain" readOnly={readOnly} />
        <Field label="Portfolio" name="portfolio" readOnly={readOnly} />
        <Field label="Business importance" name="business_importance" readOnly={readOnly} />
        <Field label="Application status" name="application_status" readOnly={readOnly} />
        <SelectField label="Priority" name="priority" options={["P1", "P2", "P3"]} placeholder="Select priority" readOnly={readOnly} />
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
        {!readOnly && (
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={LABEL_STYLE}>Search users</label>
            <input className="form-control form-control-sm" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} />
          </div>
        )}
        <OwnerField label="QA owner" nameField="qa_owner_name" emailField="qa_owner_email" users={users} disabled={usersQuery.isLoading} readOnly={readOnly} />
        <Field label="QA email" name="qa_owner_email" readOnly />
        <OwnerField label="DevOps owner" nameField="devops_owner_name" emailField="devops_owner_email" users={users} disabled={usersQuery.isLoading} readOnly={readOnly} />
        <Field label="DevOps email" name="devops_owner_email" readOnly />
        <OwnerField label="PM owner" nameField="pm_owner_name" emailField="pm_owner_email" users={users} disabled={usersQuery.isLoading} readOnly={readOnly} />
        <Field label="PM email" name="pm_owner_email" readOnly />
        <OwnerField label="App manager" nameField="manager_owner_name" emailField="manager_owner_email" users={users} disabled={usersQuery.isLoading} readOnly={readOnly} />
        <Field label="Manager email" name="manager_owner_email" readOnly />
        {usersQuery.isError && !readOnly && (
          <div className="ods-form-message error" style={{ gridColumn: "1 / -1" }}>
            Unable to load users. Please try again.
          </div>
        )}
      </Section>

      <Section title="Migration">
        <SelectField
          label="Migration status"
          name="migration_status"
          options={[
            "IN PROGRESS",
            "COMPLETED",
            "PENDING",
            "FAILED",
            "ONHOLD",
            "IN PROGRESS/ ON TRACK",
            "IN PROGRESS/ AT RISK",
            "PRODUCTION",
            "DECOMMISSIONED",
          ]}
          placeholder="Select migration status"
          readOnly={readOnly}
        />
        <Field label="Progress (%)" name="migration_progress" type="number" readOnly={readOnly} />
        <Field label="Hosting location" name="hosting_location" readOnly={readOnly} />
        <Field label="Cloud squad" name="cloud_squad" readOnly={readOnly} />
        <Field label="Cluster" name="cluster" readOnly={readOnly} />
        <Field label="Strategy" name="strategy" readOnly={readOnly} />
        <Field label="Tentative start" name="tentative_start" type="date" readOnly={readOnly} />
        <Field label="Tentative end" name="tentative_end" type="date" readOnly={readOnly} />
        <Field label="Confirmed end" name="confirmed_end" type="date" readOnly={readOnly} />
        <Field label="Go live" name="go_live" type="date" readOnly={readOnly} />
        <Field label="NS migration status Azure count" name="ns_migration_status_azure_count" type="number" readOnly={readOnly} />
        <Field label="NS to migrate BLEU environment names" name="ns_to_migrate_bleu_environment_names" readOnly={readOnly} />
        <Field label="NS migration status BLEU count" name="ns_migration_status_bleu_count" type="number" readOnly={readOnly} />
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
