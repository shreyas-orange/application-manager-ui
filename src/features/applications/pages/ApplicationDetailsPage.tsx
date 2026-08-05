// src/features/applications/pages/ApplicationDetailsPage.tsx
import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Save,
  X,
} from "lucide-react";

import RoadmapAnalytics from "@/features/roadmap/components/RoadmapAnalytics";
import RoadmapSection  from "@/features/roadmap/components/RoadmapSection";
import DbSyncupSection from "@/features/db-syncup/components/DbSyncupSection";

import { useUpdateApplication } from "../hooks/useUpdateApplication";
import type {
  Application,
  UpdateApplicationPayload,
} from "../types/application.types";

// ─── Types ────────────────────────────────────────────────────────────────────
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
  assessment_status:          string;
  wave:                       string;
  gate:                       string;
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
  assessment_status:         "",
  wave:                      "",
  gate:                      "",
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

function populateForm(app: Application): FormState {
  const qa      = getOwner(app, "QA");
  const devops  = getOwner(app, "DevOps");
  const pm      = getOwner(app, "PM");
  const manager = getOwner(app, "Application Manager");
  const last    = app.remarks?.[app.remarks.length - 1];

  return {
    application_name:          app.application_name          ?? "",
    carto_id:                  app.carto_id                  ?? "",
    basicat:                   app.basicat                   ?? "",
    domain:                    app.domain                    ?? "",
    confirmed_domain:          app.confirmed_domain          ?? "",
    portfolio:                 app.portfolio                 ?? "",
    business_importance:       app.business_importance       ?? "",
    application_status:        app.application_status        ?? "",
    priority:                  app.priority                  ?? "",
    sov_type:                  app.sov_type                  ?? "",
    out_of_scope:              app.out_of_scope              ?? false,
    qa_owner_name:             qa?.owner_name                ?? "",
    qa_owner_email:            qa?.owner_email               ?? "",
    devops_owner_name:         devops?.owner_name            ?? "",
    devops_owner_email:        devops?.owner_email           ?? "",
    pm_owner_name:             pm?.owner_name                ?? "",
    pm_owner_email:            pm?.owner_email               ?? "",
    manager_owner_name:        manager?.owner_name           ?? "",
    manager_owner_email:       manager?.owner_email          ?? "",
    migration_status:          app.migration?.migration_status          ?? "",
    migration_progress:        app.migration?.migration_progress        ?? 0,
    hosting_location:          app.migration?.hosting_location          ?? "",
    cloud_squad:               app.migration?.cloud_squad               ?? "",
    cluster:                   app.migration?.cluster                   ?? "",
    strategy:                  app.migration?.strategy                  ?? "",
    tentative_start:           dateInputValue(app.migration?.tentative_start),
    tentative_end:             dateInputValue(app.migration?.tentative_end),
    confirmed_end:             dateInputValue(app.migration?.confirmed_end),
    go_live:                   dateInputValue(app.migration?.go_live),
    assessment_status:         app.meta_data?.assessment_status         ?? "",
    wave:                      app.meta_data?.wave                      ?? "",
    gate:                      app.meta_data?.gate                      ?? "",
    data_anonymization_status: app.meta_data?.data_anonymization_status ?? "",
    nexus_status:              app.security?.nexus_status               ?? "",
    rooted_status:             app.security?.rooted_status              ?? "",
    network_policy_status:     app.security?.network_policy_status      ?? "",
    security_prod_status:      app.security?.security_prod_status       ?? "",
    remark:                    last?.remark                             ?? "",
    remarks_imp:               last?.remarks_imp                        ?? "",
    source_comments:           last?.source_comments                    ?? "",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({
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

function Field({
  label,
  value,
  onChange,
  type = "text",
  readOnly = false,
}: {
  label:    string;
  value:    string | number;
  onChange?: (value: string) => void;
  type?:    string;
  readOnly?: boolean;
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
      {readOnly ? (
        <div
          style={{
            padding:       "0.5rem 0.75rem",
            fontSize:      "var(--ods-font-size-sm)",
            color:         "var(--ods-gray-800)",
            background:    "var(--ods-gray-100)",
            border:        "1px solid var(--ods-gray-200)",
            minHeight:     "35px",
            display:       "flex",
            alignItems:    "center",
          }}
        >
          {value || "—"}
        </div>
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

function FieldTextarea({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label:    string;
  value:    string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
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
      {readOnly ? (
        <div
          style={{
            padding:       "0.5rem 0.75rem",
            fontSize:      "var(--ods-font-size-sm)",
            color:         "var(--ods-gray-800)",
            background:    "var(--ods-gray-100)",
            border:        "1px solid var(--ods-gray-200)",
            minHeight:     "70px",
            whiteSpace:    "pre-wrap",
          }}
        >
          {value || "—"}
        </div>
      ) : (
        <textarea
          className="form-control form-control-sm"
          rows={3}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ApplicationDetailsPage() {
  const { id }        = useParams<{ id: string }>();
  const navigate      = useNavigate();
  const location      = useLocation();

  const application =
    (location.state as { application?: Application } | null)
      ?.application ?? null;

  const updateMutation = useUpdateApplication();
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState<FormState>(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState<"analytics" | "roadmap" | "application" | "db-syncup">("analytics");

  const TABS: { id: "analytics" | "roadmap" | "application" | "db-syncup"; label: string }[] = [
    { id: "analytics",   label: "Analytics (roadmap)" },
    { id: "roadmap",     label: "Roadmap" },
    { id: "application", label: "Application" },
    { id: "db-syncup",   label: "DB Syncup" },
  ];

  useEffect(() => {
    if (application) {
      setForm(populateForm(application));
      setEditing(false);
    }
  }, [application]);

  if (!application) {
    return (
      <div className="ods-empty-state">
        <span className="ods-empty-icon">⚠️</span>
        <div className="ods-empty-title">Application not found</div>
        <p className="ods-empty-text">
          No application data was found. Please go back to the list and try again.
        </p>
        <button
          type="button"
          className="btn btn-primary mt-3"
          onClick={() => navigate("/app/applications")}
        >
          Back to Applications
        </button>
      </div>
    );
  }

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => setForm((prev) => ({ ...prev, [field]: value }));

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
        tentative_end:      form.tentative_end       || null,
        confirmed_end:      form.confirmed_end       || null,
        go_live:            form.go_live             || null,
      },
      meta_data: {
        wave:                      form.wave                      || null,
        gate:                      form.gate                      || null,
        assessment_status:         form.assessment_status         || null,
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
      await updateMutation.mutateAsync({
        applicationId: application.id,
        payload,
      });
      setEditing(false);
    } catch {
      // Error displayed below
    }
  };

  const ro = !editing;

  return (
    <div>
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="ods-page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/app/applications")}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <ArrowLeft size={15} />
            Back
          </button>
          <div>
            <h1 className="page-title">{application.application_name}</h1>
            <p className="page-subtitle">
              Application ID: {application.id}
              {application.carto_id ? ` · Carto: ${application.carto_id}` : ""}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {activeTab === "application" && (
            !editing ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setEditing(true)}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Pencil size={15} />
                Edit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={updateMutation.isPending}
                  onClick={() => {
                    setForm(populateForm(application));
                    setEditing(false);
                  }}
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <X size={15} />
                  Cancel
                </button>
              </>
            )
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          borderBottom: "2px solid var(--ods-gray-200)",
          marginBottom: "1.5rem",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "0.6rem 1.25rem",
                fontSize: "var(--ods-font-size-sm)",
                fontWeight: 600,
                color: isActive ? "var(--ods-orange)" : "var(--ods-gray-600)",
                background: "transparent",
                border: "none",
                borderBottom: isActive
                  ? "3px solid var(--ods-orange)"
                  : "3px solid transparent",
                cursor: "pointer",
                marginBottom: "-2px",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab: Analytics (roadmap) ─────────────────────────────── */}
      {activeTab === "analytics" && (
        <RoadmapAnalytics appId={application.id} />
      )}

      {/* ── Tab: Roadmap ─────────────────────────────────────────── */}
      {activeTab === "roadmap" && (
        <RoadmapSection appId={application.id} />
      )}

      {/* ── Tab: DB Syncup ───────────────────────────────────────── */}
      {activeTab === "db-syncup" && (
        <DbSyncupSection application={application} />
      )}

      {/* ── Tab: Application ─────────────────────────────────────── */}
      {activeTab === "application" && (
        <>
      {/* ── Error ──────────────────────────────────────────────── */}
      {updateMutation.isError && (
        <div className="ods-form-message error">
          {updateMutation.error instanceof Error
            ? updateMutation.error.message
            : "Unable to update application."}
        </div>
      )}

      {/* ── Form ───────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div className="ods-card">
          <div className="ods-card-body">

            <Section title="Application Information">
              <Field label="Application name"    value={form.application_name}    readOnly={ro} onChange={(v) => updateField("application_name", v)} />
              <Field label="Carto ID"            value={form.carto_id}            readOnly={ro} onChange={(v) => updateField("carto_id", v)} />
              <Field label="Basicat"             value={form.basicat}             readOnly={ro} onChange={(v) => updateField("basicat", v)} />
              <Field label="Domain"              value={form.domain}              readOnly={ro} onChange={(v) => updateField("domain", v)} />
              <Field label="Confirmed domain"    value={form.confirmed_domain}    readOnly={ro} onChange={(v) => updateField("confirmed_domain", v)} />
              <Field label="Portfolio"           value={form.portfolio}           readOnly={ro} onChange={(v) => updateField("portfolio", v)} />
              <Field label="Business importance" value={form.business_importance} readOnly={ro} onChange={(v) => updateField("business_importance", v)} />
              <Field label="Application status"  value={form.application_status}  readOnly={ro} onChange={(v) => updateField("application_status", v)} />
              <Field label="Priority"            value={form.priority}            readOnly={ro} onChange={(v) => updateField("priority", v)} />
              <Field label="SOV type"            value={form.sov_type}            readOnly={ro} onChange={(v) => updateField("sov_type", v)} />

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
                  disabled={ro}
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
            </Section>

            <Section title="Owners">
              <Field label="QA owner"       value={form.qa_owner_name}      readOnly={ro} onChange={(v) => updateField("qa_owner_name", v)} />
              <Field label="QA email"       value={form.qa_owner_email}     readOnly={ro} onChange={(v) => updateField("qa_owner_email", v)} />
              <Field label="DevOps owner"   value={form.devops_owner_name}  readOnly={ro} onChange={(v) => updateField("devops_owner_name", v)} />
              <Field label="DevOps email"   value={form.devops_owner_email} readOnly={ro} onChange={(v) => updateField("devops_owner_email", v)} />
              <Field label="PM owner"       value={form.pm_owner_name}      readOnly={ro} onChange={(v) => updateField("pm_owner_name", v)} />
              <Field label="PM email"       value={form.pm_owner_email}     readOnly={ro} onChange={(v) => updateField("pm_owner_email", v)} />
              <Field label="App manager"    value={form.manager_owner_name}  readOnly={ro} onChange={(v) => updateField("manager_owner_name", v)} />
              <Field label="Manager email"  value={form.manager_owner_email} readOnly={ro} onChange={(v) => updateField("manager_owner_email", v)} />
            </Section>

            <Section title="Migration">
              <Field label="Migration status"   value={form.migration_status}   readOnly={ro} onChange={(v) => updateField("migration_status", v)} />
              <Field label="Progress (%)"       value={form.migration_progress} readOnly={ro} onChange={(v) => updateField("migration_progress", Number(v))} type="number" />
              <Field label="Hosting location"   value={form.hosting_location}   readOnly={ro} onChange={(v) => updateField("hosting_location", v)} />
              <Field label="Cloud squad"        value={form.cloud_squad}        readOnly={ro} onChange={(v) => updateField("cloud_squad", v)} />
              <Field label="Cluster"            value={form.cluster}            readOnly={ro} onChange={(v) => updateField("cluster", v)} />
              <Field label="Strategy"           value={form.strategy}           readOnly={ro} onChange={(v) => updateField("strategy", v)} />
              <Field label="Tentative start"    value={form.tentative_start}    readOnly={ro} onChange={(v) => updateField("tentative_start", v)} type="date" />
              <Field label="Tentative end"      value={form.tentative_end}      readOnly={ro} onChange={(v) => updateField("tentative_end", v)} type="date" />
              <Field label="Confirmed end"      value={form.confirmed_end}      readOnly={ro} onChange={(v) => updateField("confirmed_end", v)} type="date" />
              <Field label="Go live"            value={form.go_live}            readOnly={ro} onChange={(v) => updateField("go_live", v)} type="date" />
            </Section>

            <Section title="Metadata">
              <Field label="Assessment status" value={form.assessment_status} readOnly={ro} onChange={(v) => updateField("assessment_status", v)} />
              <Field label="Wave"              value={form.wave}              readOnly={ro} onChange={(v) => updateField("wave", v)} />
              <Field label="Gate"              value={form.gate}              readOnly={ro} onChange={(v) => updateField("gate", v)} />
              <FieldTextarea label="Data anonymization" value={form.data_anonymization_status} readOnly={ro} onChange={(v) => updateField("data_anonymization_status", v)} />
            </Section>

            <Section title="Security">
              <Field label="Nexus status"           value={form.nexus_status}           readOnly={ro} onChange={(v) => updateField("nexus_status", v)} />
              <Field label="Rooted status"          value={form.rooted_status}          readOnly={ro} onChange={(v) => updateField("rooted_status", v)} />
              <Field label="Network policy status"  value={form.network_policy_status}  readOnly={ro} onChange={(v) => updateField("network_policy_status", v)} />
              <Field label="Security prod status"   value={form.security_prod_status}   readOnly={ro} onChange={(v) => updateField("security_prod_status", v)} />
            </Section>

            <Section title="Remarks">
              <FieldTextarea label="Remark"            value={form.remark}          readOnly={ro} onChange={(v) => updateField("remark", v)} />
              <FieldTextarea label="Important remarks"  value={form.remarks_imp}     readOnly={ro} onChange={(v) => updateField("remarks_imp", v)} />
              <FieldTextarea label="Source comments"    value={form.source_comments} readOnly={ro} onChange={(v) => updateField("source_comments", v)} />
            </Section>

          </div>

          {/* ── Save footer ────────────────────────────────────── */}
          {editing && (
            <div
              className="ods-card-footer"
              style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}
            >
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={updateMutation.isPending}
                onClick={() => {
                  setForm(populateForm(application));
                  setEditing(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updateMutation.isPending}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                {updateMutation.isPending ? (
                  <>
                    <span className="ods-spinner" style={{ width: "1rem", height: "1rem", borderWidth: 2 }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </form>
        </>
      )}
    </div>
  );
}
