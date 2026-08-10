// src/features/applications/components/ApplicationDetailsDrawer.tsx
import { type FormEvent, useEffect, useState } from "react";
import { X }                                   from "lucide-react";

import { useUpdateApplication }  from "../hooks/useUpdateApplication";
import type {
  Application,
  UpdateApplicationPayload,
} from "../types/application.types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ApplicationDetailsDrawerProps {
  application: Application | null;
  isOpen:      boolean;
  onClose:     () => void;
  onUpdated:   (application: Application) => void;
}

interface FormState {
  application_name:           string;
  carto_id:                   string;
  basicat:                    string;
  domain:                     string;
  confirmed_domain:           string;
  portfolio:                  string;
  business_importance:        string;
  application_status:         string;
  priority:                   string;
  sov_type:                   string;
  out_of_scope:               boolean;
  qa_owner_name:              string;
  qa_owner_email:             string;
  devops_owner_name:          string;
  devops_owner_email:         string;
  pm_owner_name:              string;
  pm_owner_email:             string;
  manager_owner_name:         string;
  manager_owner_email:        string;
  migration_status:           string;
  migration_progress:         number;
  hosting_location:           string;
  cloud_squad:                string;
  cluster:                    string;
  strategy:                   string;
  tentative_start:            string;
  tentative_end:              string;
  confirmed_end:              string;
  go_live:                    string;
  data_anonymization_status:  string;
  nexus_status:               string;
  rooted_status:              string;
  network_policy_status:      string;
  security_prod_status:       string;
  remark:                     string;
  remarks_imp:                string;
  source_comments:            string;
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
  remarks_imp:               "",
  source_comments:           "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getOwner(app: Application, type: string) {
  return app.owners?.find(
    (o) => o.owner_type?.trim().toLowerCase() === type.trim().toLowerCase(),
  );
}

function dateInputValue(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : "";
}

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
      {/* Section heading with orange left border */}
      <div
        style={{
          borderLeft:   "3px solid var(--ods-orange)",
          paddingLeft:  "0.75rem",
          marginBottom: "0.875rem",
        }}
      >
        <h3
          style={{
            fontSize:   "0.8rem",
            fontWeight: 700,
            color:      "var(--ods-gray-700)",
            margin:     0,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {title}
        </h3>
      </div>

      {/* 2-column grid */}
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
export default function ApplicationDetailsDrawer({
  application,
  isOpen,
  onClose,
  onUpdated,
}: ApplicationDetailsDrawerProps) {
  const [form, setForm]     = useState<FormState>(EMPTY_FORM);
  const updateMutation      = useUpdateApplication();

  // ── Populate form when application changes ───────────────────────
  useEffect(() => {
    if (!application) { setForm(EMPTY_FORM); return; }

    const qa      = getOwner(application, "QA");
    const devops  = getOwner(application, "DevOps");
    const pm      = getOwner(application, "PM");
    const manager = getOwner(application, "Application Manager");
    const last    = application.remarks?.[application.remarks.length - 1];

    setForm({
      application_name:          application.application_name          ?? "",
      carto_id:                  application.carto_id                  ?? "",
      basicat:                   application.basicat                   ?? "",
      domain:                    application.domain                    ?? "",
      confirmed_domain:          application.confirmed_domain          ?? "",
      portfolio:                 application.portfolio                 ?? "",
      business_importance:       application.business_importance       ?? "",
      application_status:        application.application_status        ?? "",
      priority:                  application.priority                  ?? "",
      sov_type:                  application.sov_type                  ?? "",
      out_of_scope:              application.out_of_scope              ?? false,
      qa_owner_name:             qa?.owner_name                        ?? "",
      qa_owner_email:            qa?.owner_email                       ?? "",
      devops_owner_name:         devops?.owner_name                    ?? "",
      devops_owner_email:        devops?.owner_email                   ?? "",
      pm_owner_name:             pm?.owner_name                        ?? "",
      pm_owner_email:            pm?.owner_email                       ?? "",
      manager_owner_name:        manager?.owner_name                   ?? "",
      manager_owner_email:       manager?.owner_email                  ?? "",
      migration_status:          application.migration?.migration_status          ?? "",
      migration_progress:        application.migration?.migration_progress        ?? 0,
      hosting_location:          application.migration?.hosting_location          ?? "",
      cloud_squad:               application.migration?.cloud_squad               ?? "",
      cluster:                   application.migration?.cluster                   ?? "",
      strategy:                  application.migration?.strategy                  ?? "",
      tentative_start:           dateInputValue(application.migration?.tentative_start),
      tentative_end:             dateInputValue(application.migration?.tentative_end_prod),
      confirmed_end:             dateInputValue(application.migration?.confirmed_end),
      go_live:                   dateInputValue(application.migration?.go_live),
      data_anonymization_status: application.meta_data?.data_anonymization_status ?? "",
      nexus_status:              application.security?.nexus_status               ?? "",
      rooted_status:             application.security?.rooted_status              ?? "",
      network_policy_status:     application.security?.network_policy_status      ?? "",
      security_prod_status:      application.security?.security_prod_status       ?? "",
      remark:                    last?.remark                                     ?? "",
      remarks_imp:               last?.remarks_imp                                ?? "",
      source_comments:           last?.source_comments                            ?? "",
    });
  }, [application]);

  if (!isOpen || !application) return null;

  // ── Field updater ────────────────────────────────────────────────
  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: UpdateApplicationPayload = {
      application: {
        application_name:    form.application_name    || null,
        carto_id:            form.carto_id            || null,
        basicat:             form.basicat             || null,
        priority:            form.priority            || null,
        confirmed_domain:    form.confirmed_domain    || null,
        application_status:  form.application_status  || null,
        domain:              form.domain              || null,
        portfolio:           form.portfolio           || null,
        business_importance: form.business_importance || null,
        sov_type:            form.sov_type            || null,
      },
      migration: {
        migration_status:   form.migration_status  || null,
        migration_progress: Number(form.migration_progress),
        strategy:           form.strategy           || null,
        hosting_location:   form.hosting_location   || null,
        cloud_squad:        form.cloud_squad         || null,
        cluster:            form.cluster             || null,
        tentative_start:    form.tentative_start     || null,
        tentative_end_prod: form.tentative_end       || null,
        confirmed_end:      form.confirmed_end       || null,
        go_live:            form.go_live             || null,
      },
      meta_data: {
        data_anonymization_status: form.data_anonymization_status || null,
      },
      security: {
        nexus_status:           form.nexus_status           || null,
        rooted_status:          form.rooted_status          || null,
        network_policy_status:  form.network_policy_status  || null,
        security_prod_status:   form.security_prod_status   || null,
      },
      remark: {
        remark:          form.remark          || null,
        remarks_imp:     form.remarks_imp     || null,
        source_comments: form.source_comments || null,
      },
      owners: [
        { owner_type: "QA",                  owner_name: form.qa_owner_name      || null, owner_email: form.qa_owner_email      || null },
        { owner_type: "DevOps",              owner_name: form.devops_owner_name  || null, owner_email: form.devops_owner_email  || null },
        { owner_type: "PM",                  owner_name: form.pm_owner_name      || null, owner_email: form.pm_owner_email      || null },
        { owner_type: "Application Manager", owner_name: form.manager_owner_name || null, owner_email: form.manager_owner_email || null },
      ],
    };

    try {
      const updated = await updateMutation.mutateAsync({
        applicationId: application.id,
        payload,
      });
      onUpdated(updated);
      onClose();
    } catch {
      // Error displayed below via updateMutation.isError
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position:   "fixed",
          inset:      0,
          background: "rgba(0,0,0,0.45)",
          zIndex:     1040,
        }}
        onMouseDown={onClose}
      />

      {/* Drawer panel */}
      <aside
        style={{
          position:    "fixed",
          top:         0,
          right:       0,
          bottom:      0,
          width:       "min(680px, 95vw)",
          background:  "var(--ods-white)",
          zIndex:      1050,
          display:     "flex",
          flexDirection: "column",
          boxShadow:   "-4px 0 24px rgba(0,0,0,0.15)",
          overflowY:   "auto",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* ── Drawer header ───────────────────────────────────── */}
        <div
          style={{
            display:      "flex",
            alignItems:   "center",
            justifyContent: "space-between",
            padding:      "1rem 1.25rem",
            borderBottom: "2px solid var(--ods-orange)",
            background:   "var(--ods-black)",
            position:     "sticky",
            top:          0,
            zIndex:       1,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize:   "1rem",
                color:      "var(--ods-white)",
              }}
            >
              {application.application_name}
            </div>
            <div
              style={{
                fontSize: "var(--ods-font-size-xs)",
                color:    "var(--ods-gray-400)",
              }}
            >
              Application ID: {application.id}
            </div>
          </div>

          <button
            type="button"
            className="ods-navbar-toggle"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Form ────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          style={{ padding: "1.25rem", flex: 1 }}
        >

          <DrawerSection title="Application Information">
            <DrawerInput label="Application name"    value={form.application_name}    onChange={(v) => updateField("application_name", v)} />
            <DrawerInput label="Carto ID"            value={form.carto_id}            onChange={(v) => updateField("carto_id", v)} />
            <DrawerInput label="Basicat"             value={form.basicat}             onChange={(v) => updateField("basicat", v)} />
            <DrawerInput label="Domain"              value={form.domain}              onChange={(v) => updateField("domain", v)} />
            <DrawerInput label="Confirmed domain"    value={form.confirmed_domain}    onChange={(v) => updateField("confirmed_domain", v)} />
            <DrawerInput label="Portfolio"           value={form.portfolio}           onChange={(v) => updateField("portfolio", v)} />
            <DrawerInput label="Business importance" value={form.business_importance} onChange={(v) => updateField("business_importance", v)} />
            <DrawerInput label="Application status"  value={form.application_status}  onChange={(v) => updateField("application_status", v)} />
            <DrawerInput label="Priority"            value={form.priority}            onChange={(v) => updateField("priority", v)} />
            <DrawerInput label="SOV type"            value={form.sov_type}            onChange={(v) => updateField("sov_type", v)} />

            {/* Out of scope checkbox — full width */}
            <div
              style={{
                gridColumn:  "1 / -1",
                display:     "flex",
                alignItems:  "center",
                gap:         "0.5rem",
              }}
            >
              <input
                id="out_of_scope"
                type="checkbox"
                className="form-check-input"
                style={{ margin: 0, accentColor: "var(--ods-orange)" }}
                checked={form.out_of_scope}
                onChange={(e) => updateField("out_of_scope", e.target.checked)}
              />
              <label
                htmlFor="out_of_scope"
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

          <DrawerSection title="Security">
            <DrawerInput label="Nexus status"           value={form.nexus_status}           onChange={(v) => updateField("nexus_status", v)} />
            <DrawerInput label="Rooted status"          value={form.rooted_status}          onChange={(v) => updateField("rooted_status", v)} />
            <DrawerInput label="Network policy status"  value={form.network_policy_status}  onChange={(v) => updateField("network_policy_status", v)} />
            <DrawerInput label="Security prod status"   value={form.security_prod_status}   onChange={(v) => updateField("security_prod_status", v)} />
            <DrawerTextarea label="Data anonymization" value={form.data_anonymization_status} onChange={(v) => updateField("data_anonymization_status", v)} />
          </DrawerSection>

          <DrawerSection title="Remarks">
            <DrawerTextarea label="Remark"             value={form.remark}          onChange={(v) => updateField("remark", v)} />
            <DrawerTextarea label="Important remarks"  value={form.remarks_imp}     onChange={(v) => updateField("remarks_imp", v)} />
            <DrawerTextarea label="Source comments"    value={form.source_comments} onChange={(v) => updateField("source_comments", v)} />
          </DrawerSection>

          {/* ── Error ─────────────────────────────────────────── */}
          {updateMutation.isError && (
            <div
              className="ods-alert ods-alert-danger"
              role="alert"
              style={{ marginBottom: "1rem" }}
            >
              {updateMutation.error instanceof Error
                ? updateMutation.error.message
                : "Unable to update application."}
            </div>
          )}

          {/* ── Actions ───────────────────────────────────────── */}
          <div
            style={{
              display:        "flex",
              justifyContent: "flex-end",
              gap:            "0.75rem",
              paddingTop:     "0.5rem",
              borderTop:      "1px solid var(--ods-gray-200)",
              marginTop:      "0.5rem",
            }}
          >
            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={updateMutation.isPending}
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="ods-spinner" style={{ width: "1rem", height: "1rem", borderWidth: 2 }} />
                  Saving...
                </span>
              ) : (
                "Save changes"
              )}
            </button>
          </div>

        </form>
      </aside>
    </>
  );
}
