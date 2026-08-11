import { type FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";

import type { Application } from "@/features/applications/types/application.types";
import { useUsersByRole } from "@/features/users/hooks/useUsersByRole";
import { getApiErrorMessage } from "@/lib/api-error";

import { DB_SYNCUP_PRIORITY_OPTIONS } from "../constants";
import type { CreateDbSyncupPayload } from "../types/db-syncup.types";

const MIGRATION_INCHARGE_ROLE = "DB_MANAGER";

interface DbSyncupCreateDrawerProps {
  application: Application | null;
  isOpen: boolean;
  nextSerialNumber: number;
  applications?: Application[];
  onClose: () => void;
  onSave: (payload: CreateDbSyncupPayload) => Promise<void>;
}

interface FormState {
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
  application_priority: string;
}

const EMPTY_FORM: FormState = {
  application_name: "",
  carto_id: "",
  basicat: "",
  domain: "",
  dx_uid: "",
  mcp_id: "",
  hosting: "",
  reason: "",
  data_anonymization_status: "",
  db_validation: "",
  migration_incharge: "",
  date_of_request: "",
  application_priority: "",
};

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
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

function DrawerInput({
  label,
  value,
  onChange,
  type = "text",
  fullWidth = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  fullWidth?: boolean;
}) {
  return (
    <div style={fullWidth ? { gridColumn: "1 / -1" } : undefined}>
      <label style={{ display: "block", fontSize: "var(--ods-font-size-xs)", fontWeight: 600, color: "var(--ods-gray-600)", marginBottom: "0.25rem" }}>
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

function DrawerApplicationSelect({
  value,
  applications,
  onChange,
}: {
  value: number;
  applications: Application[];
  onChange: (applicationId: number) => void;
}) {
  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <label style={{ display: "block", fontSize: "var(--ods-font-size-xs)", fontWeight: 600, color: "var(--ods-gray-600)", marginBottom: "0.25rem" }}>
        Application
      </label>
      <select
        className="form-select form-select-sm"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value="" disabled>Select an application...</option>
        {applications.map((app) => (
          <option key={app.id} value={app.id}>
            {app.application_name}
            {app.carto_id ? ` (${app.carto_id})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function DbSyncupCreateDrawer({
  application,
  isOpen,
  nextSerialNumber,
  applications = [],
  onClose,
  onSave,
}: DbSyncupCreateDrawerProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const dbManagersQuery = useUsersByRole(MIGRATION_INCHARGE_ROLE);
  const dbManagers = dbManagersQuery.data ?? [];

  const targetApplication = selectedApp ?? application;

  const applyApplication = (app: Application) => {
    setForm((prev) => ({
      ...prev,
      application_name: app.application_name,
      carto_id: app.carto_id ?? "",
      basicat: app.basicat ?? "",
      domain: app.confirmed_domain || app.domain || "",
      dx_uid: app.meta_data?.dx_uid ?? "",
      mcp_id: app.meta_data?.mcp_id ?? "",
      hosting: app.migration?.hosting_location ?? "",
      reason: "",
      data_anonymization_status: app.meta_data?.data_anonymization_status ?? "",
    }));
  };

  useEffect(() => {
    if (!isOpen) return;

    setSelectedApp(null);
    setError("");

    const empty = { ...EMPTY_FORM, date_of_request: todayInputValue() };
    if (application) {
      setForm({
        ...empty,
        application_name: application.application_name,
        carto_id: application.carto_id ?? "",
        basicat: application.basicat ?? "",
        domain: application.confirmed_domain || application.domain || "",
        dx_uid: application.meta_data?.dx_uid ?? "",
        mcp_id: application.meta_data?.mcp_id ?? "",
        hosting: application.migration?.hosting_location ?? "",
        data_anonymization_status: application.meta_data?.data_anonymization_status ?? "",
      });
      return;
    }
    setForm(empty);
  }, [isOpen, application]);

  if (!isOpen) return null;

  const updateField = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!targetApplication) {
      setError("Please select an application.");
      setSaving(false);
      return;
    }

    const payload: CreateDbSyncupPayload = {
      serial_number: nextSerialNumber,
      application_name: form.application_name,
      carto_id: form.carto_id,
      basicat: form.basicat,
      domain: form.domain,
      dx_uid: form.dx_uid,
      mcp_id: form.mcp_id,
      hosting: form.hosting,
      reason: form.reason,
      data_anonymization_status: form.data_anonymization_status,
      db_validation: form.db_validation,
      migration_incharge: form.migration_incharge,
      date_of_request: form.date_of_request,
      environment_count: 0,
      remarks: "",
      dev_status: "",
      demo_status: "",
      qa_status: "",
      uat_am_status: "",
      pprod_perf_status: "",
      mnt_e_status: "",
      bench_status: "",
      staging_status: "",
      int_status: "",
      prod_status: "",
      environment_priority: "",
      application_priority: form.application_priority,
      time_taken_in_prod: "",
      application_id: targetApplication.id,
      uploaded_file_id: targetApplication.uploaded_file_id ?? 0,
    };

    try {
      await onSave(payload);
      onClose();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="ods-drawer-overlay" onMouseDown={onClose} />
      <aside className="ods-drawer open" onMouseDown={(e) => e.stopPropagation()}>
        <div className="ods-drawer-header">
          <div>
            <div className="ods-drawer-title">Add DB Syncup</div>
            <div style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-400)", marginTop: "0.15rem" }}>
              New record · Serial #{nextSerialNumber}
            </div>
          </div>
          <button type="button" className="ods-drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>

        <div className="ods-drawer-body">
          <form onSubmit={handleSubmit}>
            <DrawerSection title="Application">
              {!application && applications.length > 0 && (
                <DrawerApplicationSelect
                  value={selectedApp?.id ?? 0}
                  applications={applications}
                  onChange={(id) => {
                    const app = applications.find((a) => a.id === id) ?? null;
                    setSelectedApp(app);
                    setError("");
                    if (app) applyApplication(app);
                  }}
                />
              )}
              <DrawerInput label="Application name" value={form.application_name} onChange={(v) => updateField("application_name", v)} />
              <DrawerInput label="Carto ID" value={form.carto_id} onChange={(v) => updateField("carto_id", v)} />
              <DrawerInput label="Basicat" value={form.basicat} onChange={(v) => updateField("basicat", v)} />
              <DrawerInput label="Domain" value={form.domain} onChange={(v) => updateField("domain", v)} />
              <DrawerInput label="DX-uid" value={form.dx_uid} onChange={(v) => updateField("dx_uid", v)} />
              <DrawerInput label="MCP-id" value={form.mcp_id} onChange={(v) => updateField("mcp_id", v)} />
              <DrawerInput label="Hosting" value={form.hosting} onChange={(v) => updateField("hosting", v)} />
              <DrawerInput label="Reason" value={form.reason} onChange={(v) => updateField("reason", v)} />
              <DrawerInput
                label="Data anonymization"
                value={form.data_anonymization_status}
                onChange={(v) => updateField("data_anonymization_status", v)}
                fullWidth
              />
            </DrawerSection>

            <DrawerSection title="Details">
              <DrawerInput label="DB validation" value={form.db_validation} onChange={(v) => updateField("db_validation", v)} />

              <div>
                <label style={{ display: "block", fontSize: "var(--ods-font-size-xs)", fontWeight: 600, color: "var(--ods-gray-600)", marginBottom: "0.25rem" }}>
                  Migration incharge
                </label>
                <select
                  className="form-select form-select-sm"
                  value={form.migration_incharge}
                  onChange={(e) => updateField("migration_incharge", e.target.value)}
                >
                  <option value="">Select DB manager...</option>
                  {dbManagers.map((u) => {
                    const name = `${u.first_name} ${u.last_name}`.trim() || u.email;
                    return (
                      <option key={u.id} value={name}>{name}</option>
                    );
                  })}
                </select>
              </div>

              <DrawerInput label="Date of request" value={form.date_of_request} onChange={(v) => updateField("date_of_request", v)} type="date" />

              <div>
                <label style={{ display: "block", fontSize: "var(--ods-font-size-xs)", fontWeight: 600, color: "var(--ods-gray-600)", marginBottom: "0.25rem" }}>
                  Application priority
                </label>
                <select
                  className="form-select form-select-sm"
                  value={form.application_priority}
                  onChange={(e) => updateField("application_priority", e.target.value)}
                >
                  <option value="">—</option>
                  {DB_SYNCUP_PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </DrawerSection>

            <p style={{ fontSize: "var(--ods-font-size-xs)", color: "var(--ods-gray-500)", margin: "0 0 1rem" }}>
              Environments can be requested from the syncup's details page after it's created.
            </p>

            {error && (
              <div className="ods-alert ods-alert-danger" role="alert" style={{ marginBottom: "1rem" }}>
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="ods-drawer-footer">
          <button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving} onClick={(e) => void handleSubmit(e)}>
            {saving ? "Saving..." : "Add syncup"}
          </button>
        </div>
      </aside>
    </>
  );
}
