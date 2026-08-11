import { type ReactNode, useState } from "react";
import { useFormContext } from "react-hook-form";

import { useCloudConfigurations } from "@/features/cloud/hooks/useCloud";
import { useUsers } from "@/features/users/hooks/useUsers";
import type { User } from "@/features/users/types/user.types";

import type { ApplicationEditFormInput } from "../schemas/application-edit.schema";
import type { Application } from "../types/application.types";

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
          {String(getValues(name) ?? "") || "NA"}
        </div>
      ) : (
        <input type={type} className="form-control form-control-sm" {...register(name)} />
      )}
    </div>
  );
}

// ─── SelectField ──────────────────────────────────────────────────────────────
function SelectField({
  label,
  name,
  options,
  readOnly,
}: {
  label: string;
  name: FieldName;
  options: string[];
  readOnly: boolean;
}) {
  const { register, getValues } = useFormContext<ApplicationEditFormInput>();

  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {readOnly ? (
        <div style={{ ...READONLY_BOX_STYLE, minHeight: "35px", display: "flex", alignItems: "center" }}>
          {String(getValues(name) ?? "") || "NA"}
        </div>
      ) : (
        <select className="form-select form-select-sm" {...register(name)}>
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
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
          {String(getValues(name) ?? "") || "NA"}
        </div>
      ) : (
        <textarea className="form-control form-control-sm" rows={3} {...register(name)} />
      )}
    </div>
  );
}

// ─── OwnerField ─────────────────────────────────────────────────────────────
function OwnerField({
  label,
  nameField,
  emailField,
  users,
  usersLoading,
  readOnly,
}: {
  label: string;
  nameField: "qa_owner_name" | "devops_owner_name" | "pm_owner_name" | "manager_owner_name";
  emailField: "qa_owner_email" | "devops_owner_email" | "pm_owner_email" | "manager_owner_email";
  users: User[];
  usersLoading: boolean;
  readOnly: boolean;
}) {
  const { getValues, setValue, watch } = useFormContext<ApplicationEditFormInput>();
  const name = watch(nameField);
  const email = watch(emailField);

  if (readOnly) {
    return (
      <>
        <div>
          <label style={LABEL_STYLE}>{label}</label>
          <div style={{ ...READONLY_BOX_STYLE, minHeight: "35px", display: "flex", alignItems: "center" }}>
            {String(getValues(nameField) ?? "") || "NA"}
          </div>
        </div>
        <div>
          <label style={LABEL_STYLE}>{label} email</label>
          <div style={{ ...READONLY_BOX_STYLE, minHeight: "35px", display: "flex", alignItems: "center" }}>
            {String(getValues(emailField) ?? "") || "NA"}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <label style={LABEL_STYLE}>{label}</label>
        <select
          className="form-select form-select-sm"
          value={email}
          disabled={usersLoading}
          onChange={(event) => {
            const selectedUser = users.find((user) => user.email === event.target.value) ?? null;
            const fullName = selectedUser
              ? [selectedUser.first_name, selectedUser.last_name].filter(Boolean).join(" ").trim() || selectedUser.email
              : "";
            setValue(nameField, fullName, { shouldDirty: true });
            setValue(emailField, selectedUser?.email ?? "", { shouldDirty: true });
          }}
        >
          <option value="">Select a user</option>
          {email && !users.some((user) => user.email === email) && (
            <option value={email}>{name || email}</option>
          )}
          {users.map((user) => {
            const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || user.email;
            return (
              <option key={user.id} value={user.email}>{fullName}</option>
            );
          })}
        </select>
      </div>
      <Field label={`${label} email`} name={emailField} readOnly />
    </>
  );
}

// ─── CloudSelection ─────────────────────────────────────────────────────────
function CloudSelection({
  application,
  readOnly,
}: {
  application: Application;
  readOnly: boolean;
}) {
  const { watch, setValue } = useFormContext<ApplicationEditFormInput>();
  const cloudsQuery = useCloudConfigurations({ page: 1, size: 100, search: "" });
  const selectedIds = watch("cloud_ids") ?? [];

  if (readOnly) {
    const mappedClouds = application.cloud_mappings ?? [];
    return (
      <div style={{ gridColumn: "1 / -1" }}>
        {mappedClouds.length === 0 ? (
          <p style={{ fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-500)", margin: 0 }}>
            No clouds assigned.
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {mappedClouds.map((mapping) => (
              <span key={mapping.id} className="ods-badge ods-badge-neutral no-dot">
                {mapping.cloud.name}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  const clouds = cloudsQuery.data?.items ?? [];

  const toggleCloud = (cloudId: number) => {
    const next = selectedIds.includes(cloudId)
      ? selectedIds.filter((id) => id !== cloudId)
      : [...selectedIds, cloudId];
    setValue("cloud_ids", next, { shouldDirty: true });
  };

  if (clouds.length === 0) {
    return (
      <p style={{ gridColumn: "1 / -1", fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-500)", margin: 0 }}>
        {cloudsQuery.isLoading ? "Loading clouds..." : "No cloud configurations available."}
      </p>
    );
  }

  return (
    <>
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        "0.5rem",
            fontSize:   "var(--ods-font-size-sm)",
            color:      "var(--ods-gray-700)",
            cursor:     "pointer",
          }}
        >
          <input
            type="checkbox"
            className="form-check-input"
            style={{ margin: 0, accentColor: "var(--ods-orange)" }}
            checked={selectedIds.includes(cloud.id)}
            onChange={() => toggleCloud(cloud.id)}
          />
          <span>
            {cloud.name}
            {(cloud.provider || cloud.region) && (
              <span style={{ color: "var(--ods-gray-500)" }}>
                {" "}({[cloud.provider, cloud.region].filter(Boolean).join(" · ")})
              </span>
            )}
          </span>
        </div>
      ))}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ApplicationEditFormFieldsProps {
  application: Application;
  readOnly: boolean;
}

export default function ApplicationEditFormFields({ application, readOnly }: ApplicationEditFormFieldsProps) {
  const { register } = useFormContext<ApplicationEditFormInput>();
  const [userSearch, setUserSearch] = useState("");
  const usersQuery = useUsers({
    page: 1,
    pageSize: 10,
    search: userSearch.trim(),
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const users = (usersQuery.data?.items ?? []).filter((user) => user.is_active);

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
        <SelectField label="Priority" name="priority" options={["P1", "P2", "P3"]} readOnly={readOnly} />
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
            <input
              type="text"
              className="form-control form-control-sm"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name or email"
            />
          </div>
        )}
        <OwnerField label="QA owner" nameField="qa_owner_name" emailField="qa_owner_email" users={users} usersLoading={usersQuery.isLoading} readOnly={readOnly} />
        <OwnerField label="DevOps owner" nameField="devops_owner_name" emailField="devops_owner_email" users={users} usersLoading={usersQuery.isLoading} readOnly={readOnly} />
        <OwnerField label="PM owner" nameField="pm_owner_name" emailField="pm_owner_email" users={users} usersLoading={usersQuery.isLoading} readOnly={readOnly} />
        <OwnerField label="App manager" nameField="manager_owner_name" emailField="manager_owner_email" users={users} usersLoading={usersQuery.isLoading} readOnly={readOnly} />
        {!readOnly && usersQuery.isError && (
          <div className="ods-form-message error" style={{ gridColumn: "1 / -1" }}>
            Unable to load users. Please try again.
          </div>
        )}
      </Section>

      <Section title="Migration">
        <Field label="Migration status" name="migration_status" readOnly={readOnly} />
        <Field label="Progress (%)" name="migration_progress" type="number" readOnly={readOnly} />
        <Field label="Hosting location" name="hosting_location" readOnly={readOnly} />
        <Field label="Cloud squad" name="cloud_squad" readOnly={readOnly} />
        <Field label="Cluster" name="cluster" readOnly={readOnly} />
        <Field label="Strategy" name="strategy" readOnly={readOnly} />
        <Field label="Initiated" name="initiated" type="date" readOnly={readOnly} />
        <Field label="Tentative start" name="tentative_start" type="date" readOnly={readOnly} />
        <Field label="Tentative end" name="tentative_end" type="date" readOnly={readOnly} />
        <Field label="Confirmed end" name="confirmed_end" type="date" readOnly={readOnly} />
        <Field label="Go live" name="go_live" type="date" readOnly={readOnly} />
        <Field label="Total NS" name="total_ns" type="number" readOnly={readOnly} />
        <Field label="NS migration progress" name="ns_migration_progress" readOnly={readOnly} />
        <Field label="Assessment status" name="migration_assessment_status" readOnly={readOnly} />
        <Field label="Data anonymization status" name="migration_data_anonymization_status" readOnly={readOnly} />
        <Field label="NS backup creation" name="ns_backup_creation" readOnly={readOnly} />
        <Field label="NS migration status" name="ns_migration_status" readOnly={readOnly} />
      </Section>

      <Section title="Metadata">
        <Field label="DX UID" name="dx_uid" readOnly={readOnly} />
        <Field label="MCP ID" name="mcp_id" readOnly={readOnly} />
        <Field label="Assessment status" name="assessment_status" readOnly={readOnly} />
        <Field label="Wave" name="wave" readOnly={readOnly} />
        <Field label="Gate" name="gate" readOnly={readOnly} />
        <FieldTextarea label="Data anonymization" name="data_anonymization_status" readOnly={readOnly} />
      </Section>

      <Section title="Cloud">
        <CloudSelection application={application} readOnly={readOnly} />
      </Section>

      <Section title="Security">
        <Field label="Benchmark status" name="benchmark_status" readOnly={readOnly} />
        <Field label="Nexus status" name="nexus_status" readOnly={readOnly} />
        <Field label="Rooted status" name="rooted_status" readOnly={readOnly} />
        <Field label="Network policy status" name="network_policy_status" readOnly={readOnly} />
        <Field label="Security prod status" name="security_prod_status" readOnly={readOnly} />
        <Field label="Security prod date" name="security_prod_date" type="date" readOnly={readOnly} />
      </Section>

      <Section title="Remarks">
        <FieldTextarea label="Remark" name="remark" readOnly={readOnly} />
        <FieldTextarea label="Important remarks" name="remarks_imp" readOnly={readOnly} />
        <FieldTextarea label="Source comments" name="source_comments" readOnly={readOnly} />
        <FieldTextarea label="Archived remarks" name="archived_remarks" readOnly={readOnly} />
      </Section>
    </>
  );
}
