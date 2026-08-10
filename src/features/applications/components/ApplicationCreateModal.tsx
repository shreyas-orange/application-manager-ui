// src/features/applications/components/ApplicationCreateModal.tsx
import { type FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";

import { getApiErrorMessage } from "@/lib/api-error";
import { useCloudConfigurations } from "@/features/cloud/hooks/useCloud";
import type { CloudConfiguration } from "@/features/cloud/types/clouds.types";

import { useCreateApplication } from "../hooks/useCreateApplication";
import type {
  CreateApplicationPayload,
} from "../types/application.types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ApplicationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (message: string) => void;
  onError: (message: string) => void;
}

interface FormState {
  application_name:          string;
  carto_id:                  string;
  basicat:                   string;
  domain:                    string;
  confirmed_domain:          string;
  portfolio:                 string;
  business_importance:       string;
  application_status:        string;
  priority:                  string;
  sov_type:                  string;
  out_of_scope:              boolean;
  qa_owner_name:             string;
  qa_owner_email:            string;
  devops_owner_name:         string;
  devops_owner_email:        string;
  pm_owner_name:             string;
  pm_owner_email:            string;
  manager_owner_name:        string;
  manager_owner_email:       string;
  migration_status:          string;
  migration_progress:        number;
  hosting_location:          string;
  cloud_squad:               string;
  cluster:                   string;
  strategy:                  string;
  tentative_start:           string;
  tentative_end:             string;
  confirmed_end:             string;
  go_live:                   string;
  data_anonymization_status: string;
  nexus_status:              string;
  rooted_status:             string;
  network_policy_status:     string;
  security_prod_status:      string;
  remark:                    string;
  cloud_ids:                 number[];
}

const EMPTY_FORM: FormState = {
  application_name:          "",
  carto_id:                  "",
  basicat:                   "",
  domain:                    "",
  confirmed_domain:          "",
  portfolio:                 "",
  business_importance:       "",
  application_status:        "",
  priority:                  "",
  sov_type:                  "",
  out_of_scope:              false,
  qa_owner_name:             "",
  qa_owner_email:            "",
  devops_owner_name:         "",
  devops_owner_email:        "",
  pm_owner_name:             "",
  pm_owner_email:            "",
  manager_owner_name:        "",
  manager_owner_email:       "",
  migration_status:          "",
  migration_progress:        0,
  hosting_location:          "",
  cloud_squad:               "",
  cluster:                   "",
  strategy:                  "",
  tentative_start:           "",
  tentative_end:             "",
  confirmed_end:             "",
  go_live:                   "",
  data_anonymization_status: "",
  nexus_status:              "",
  rooted_status:             "",
  network_policy_status:     "",
  security_prod_status:      "",
  remark:                    "",
  cloud_ids:                 [],
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function DrawerSection({
  title,
  children,
}: {
  title:    string;
  children: React.ReactNode;
}) {
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
            fontSize:     "0.8rem",
            fontWeight:   700,
            color:        "var(--ods-gray-700)",
            margin:       0,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {title}
        </h3>
      </div>

      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "1fr 1fr",
          gap:                 "0.75rem",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function DrawerInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label:    string;
  value:    string | number;
  onChange: (value: string) => void;
  type?:    string;
}) {
  return (
    <div>
      <label
        style={{
          display:      "block",
          fontSize:     "var(--ods-font-size-xs)",
          fontWeight:   600,
          color:        "var(--ods-gray-600)",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        className="form-control form-control-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function DrawerTextarea({
  label,
  value,
  onChange,
}: {
  label:    string;
  value:    string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <label
        style={{
          display:      "block",
          fontSize:     "var(--ods-font-size-xs)",
          fontWeight:   600,
          color:        "var(--ods-gray-600)",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </label>
      <textarea
        className="form-control form-control-sm"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ApplicationCreateModal({
  isOpen,
  onClose,
  onCreated,
  onError,
}: ApplicationCreateModalProps) {
  const createMutation = useCreateApplication();
  const cloudsQuery = useCloudConfigurations({ page: 1, size: 100, search: "" });
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleCloud = (cloudId: number) => {
    setForm((prev) => ({
      ...prev,
      cloud_ids: prev.cloud_ids.includes(cloudId)
        ? prev.cloud_ids.filter((id) => id !== cloudId)
        : [...prev.cloud_ids, cloudId],
    }));
  };

  const buildPayload = (): CreateApplicationPayload => ({
    application: {
      application_name:    form.application_name.trim() || null,
      carto_id:            form.carto_id.trim()            || null,
      basicat:             form.basicat.trim()             || null,
      domain:              form.domain.trim()              || null,
      confirmed_domain:    form.confirmed_domain.trim()    || null,
      portfolio:           form.portfolio.trim()           || null,
      business_importance: form.business_importance.trim() || null,
      application_status:  form.application_status.trim()  || null,
      priority:            form.priority.trim()            || null,
      sov_type:            form.sov_type.trim()            || null,
      out_of_scope:        form.out_of_scope,
    },
    owners: [
      { owner_type: "QA",                  owner_name: form.qa_owner_name.trim()      || null, owner_email: form.qa_owner_email.trim()      || null },
      { owner_type: "DevOps",              owner_name: form.devops_owner_name.trim()  || null, owner_email: form.devops_owner_email.trim()  || null },
      { owner_type: "PM",                  owner_name: form.pm_owner_name.trim()      || null, owner_email: form.pm_owner_email.trim()      || null },
      { owner_type: "Application Manager", owner_name: form.manager_owner_name.trim() || null, owner_email: form.manager_owner_email.trim() || null },
    ],
    migration: {
      migration_status:   form.migration_status.trim()  || null,
      migration_progress: Number(form.migration_progress) || null,
      hosting_location:   form.hosting_location.trim()  || null,
      cloud_squad:        form.cloud_squad.trim()       || null,
      cluster:            form.cluster.trim()           || null,
      strategy:           form.strategy.trim()          || null,
      tentative_start:    form.tentative_start          || null,
      tentative_end_prod: form.tentative_end            || null,
      confirmed_end:      form.confirmed_end            || null,
      go_live:            form.go_live                  || null,
    },
    meta_data: {
      data_anonymization_status: form.data_anonymization_status.trim() || null,
    },
    security: {
      nexus_status:           form.nexus_status.trim()           || null,
      rooted_status:          form.rooted_status.trim()          || null,
      network_policy_status:  form.network_policy_status.trim()  || null,
      security_prod_status:   form.security_prod_status.trim()   || null,
    },
    remark: {
      remark: form.remark.trim() || null,
    },
    cloud_ids: form.cloud_ids,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.application_name.trim()) {
      setError("Application name is required.");
      return;
    }

    setError("");
    const payload = buildPayload();

    try {
      await createMutation.mutateAsync(payload);
      onCreated("Application created successfully.");
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
      onError(getApiErrorMessage(err));
    }
  };

  const clouds: CloudConfiguration[] = cloudsQuery.data?.items ?? [];

  return (
    <>
      <div
        className="ods-drawer-overlay"
        onMouseDown={onClose}
      />
      <aside
        className="ods-drawer open ods-drawer--wide"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="ods-drawer-header">
          <div>
            <div className="ods-drawer-title">Create Application</div>
            <div
              style={{
                fontSize: "var(--ods-font-size-xs)",
                color: "var(--ods-gray-400)",
                marginTop: "0.15rem",
              }}
            >
              Register a new application
            </div>
          </div>
          <button
            type="button"
            className="ods-drawer-close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="ods-drawer-body">
          <form onSubmit={handleSubmit}>
            <DrawerSection title="Application Information">
              <DrawerInput label="Application name *" value={form.application_name} onChange={(v) => updateField("application_name", v)} />
              <DrawerInput label="Carto ID"           value={form.carto_id}           onChange={(v) => updateField("carto_id", v)} />
              <DrawerInput label="Basicat"            value={form.basicat}            onChange={(v) => updateField("basicat", v)} />
              <DrawerInput label="Domain"             value={form.domain}             onChange={(v) => updateField("domain", v)} />
              <DrawerInput label="Confirmed domain"   value={form.confirmed_domain}   onChange={(v) => updateField("confirmed_domain", v)} />
              <DrawerInput label="Portfolio"          value={form.portfolio}          onChange={(v) => updateField("portfolio", v)} />
              <DrawerInput label="Business importance" value={form.business_importance} onChange={(v) => updateField("business_importance", v)} />
              <DrawerInput label="Application status" value={form.application_status}  onChange={(v) => updateField("application_status", v)} />
              <DrawerInput label="Priority"           value={form.priority}           onChange={(v) => updateField("priority", v)} />
              <DrawerInput label="SOV type"           value={form.sov_type}           onChange={(v) => updateField("sov_type", v)} />

              <div
                style={{
                  gridColumn:  "1 / -1",
                  display:     "flex",
                  alignItems:  "center",
                  gap:         "0.5rem",
                }}
              >
                <input
                  id="create_out_of_scope"
                  type="checkbox"
                  className="form-check-input"
                  style={{ margin: 0, accentColor: "var(--ods-orange)" }}
                  checked={form.out_of_scope}
                  onChange={(e) => updateField("out_of_scope", e.target.checked)}
                />
                <label
                  htmlFor="create_out_of_scope"
                  style={{
                    fontSize: "var(--ods-font-size-sm)",
                    color:    "var(--ods-gray-700)",
                    cursor:   "pointer",
                    margin:   0,
                  }}
                >
                  Out of scope
                </label>
              </div>
            </DrawerSection>

            <DrawerSection title="Owners">
              <DrawerInput label="QA owner"          value={form.qa_owner_name}      onChange={(v) => updateField("qa_owner_name", v)} />
              <DrawerInput label="QA email"          value={form.qa_owner_email}     onChange={(v) => updateField("qa_owner_email", v)} />
              <DrawerInput label="DevOps owner"      value={form.devops_owner_name}  onChange={(v) => updateField("devops_owner_name", v)} />
              <DrawerInput label="DevOps email"      value={form.devops_owner_email} onChange={(v) => updateField("devops_owner_email", v)} />
              <DrawerInput label="PM owner"          value={form.pm_owner_name}      onChange={(v) => updateField("pm_owner_name", v)} />
              <DrawerInput label="PM email"          value={form.pm_owner_email}     onChange={(v) => updateField("pm_owner_email", v)} />
              <DrawerInput label="App manager"       value={form.manager_owner_name}  onChange={(v) => updateField("manager_owner_name", v)} />
              <DrawerInput label="Manager email"     value={form.manager_owner_email} onChange={(v) => updateField("manager_owner_email", v)} />
            </DrawerSection>

            <DrawerSection title="Migration">
              <DrawerInput label="Migration status"   value={form.migration_status}   onChange={(v) => updateField("migration_status", v)} />
              <DrawerInput label="Progress (%)"       value={form.migration_progress} onChange={(v) => updateField("migration_progress", Number(v))} type="number" />
              <DrawerInput label="Hosting location"   value={form.hosting_location}   onChange={(v) => updateField("hosting_location", v)} />
              <DrawerInput label="Cloud squad"        value={form.cloud_squad}        onChange={(v) => updateField("cloud_squad", v)} />
              <DrawerInput label="Cluster"            value={form.cluster}            onChange={(v) => updateField("cluster", v)} />
              <DrawerInput label="Strategy"           value={form.strategy}           onChange={(v) => updateField("strategy", v)} />
              <DrawerInput label="Tentative start"    value={form.tentative_start}    onChange={(v) => updateField("tentative_start", v)} type="date" />
              <DrawerInput label="Tentative end"      value={form.tentative_end}      onChange={(v) => updateField("tentative_end", v)} type="date" />
              <DrawerInput label="Confirmed end"      value={form.confirmed_end}      onChange={(v) => updateField("confirmed_end", v)} type="date" />
              <DrawerInput label="Go live"            value={form.go_live}            onChange={(v) => updateField("go_live", v)} type="date" />
            </DrawerSection>

            <DrawerSection title="Cloud">
              {clouds.length === 0 ? (
                <p style={{ gridColumn: "1 / -1", fontSize: "var(--ods-font-size-sm)", color: "var(--ods-gray-500)", margin: 0 }}>
                  No cloud configurations available.
                </p>
              ) : (
                clouds.map((cloud) => (
                  <div
                    key={cloud.id}
                    style={{
                      display:      "flex",
                      alignItems:   "center",
                      gap:          "0.5rem",
                      fontSize:     "var(--ods-font-size-sm)",
                      color:        "var(--ods-gray-700)",
                      cursor:       "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      style={{ margin: 0, accentColor: "var(--ods-orange)" }}
                      checked={form.cloud_ids.includes(cloud.id)}
                      onChange={() => toggleCloud(cloud.id)}
                    />
                    <span>
                      {cloud.name}
                      <span style={{ color: "var(--ods-gray-500)" }}>
                        {" "}({cloud.provider}{cloud.region ? ` · ${cloud.region}` : ""})
                      </span>
                    </span>
                  </div>
                ))
              )}
            </DrawerSection>

            <DrawerSection title="Security">
              <DrawerInput label="Nexus status"          value={form.nexus_status}          onChange={(v) => updateField("nexus_status", v)} />
              <DrawerInput label="Rooted status"         value={form.rooted_status}         onChange={(v) => updateField("rooted_status", v)} />
              <DrawerInput label="Network policy status" value={form.network_policy_status} onChange={(v) => updateField("network_policy_status", v)} />
              <DrawerInput label="Security prod status"  value={form.security_prod_status}  onChange={(v) => updateField("security_prod_status", v)} />
              <DrawerTextarea label="Data anonymization" value={form.data_anonymization_status} onChange={(v) => updateField("data_anonymization_status", v)} />
            </DrawerSection>

            <DrawerSection title="Remarks">
              <DrawerTextarea label="Remark" value={form.remark} onChange={(v) => updateField("remark", v)} />
            </DrawerSection>

            {error && (
              <div
                className="ods-alert ods-alert-danger"
                role="alert"
                style={{ marginBottom: "1rem" }}
              >
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="ods-drawer-footer">
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={createMutation.isPending}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createMutation.isPending}
            onClick={(e) => void handleSubmit(e)}
          >            {createMutation.isPending ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="ods-spinner" style={{ width: "1rem", height: "1rem", borderWidth: 2 }} />
                Creating...
              </span>
            ) : (
              "Create application"
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
