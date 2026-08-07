import { type FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";

import type { Application } from "@/features/applications/types/application.types";
import { getApiErrorMessage } from "@/lib/api-error";

import {
  DB_SYNCUP_PRIORITY_OPTIONS,
  DB_SYNCUP_STATUS_OPTIONS,
  ENVIRONMENT_STATUS_FIELDS,
} from "../constants";
import type {
  CreateDbSyncupPayload,
  DbSyncup,
  UpdateDbSyncupPayload,
} from "../types/db-syncup.types";

interface DbSyncupEditDrawerProps {
  application: Application | null;
  item: DbSyncup | null;
  isOpen: boolean;
  nextSerialNumber: number;
  applications?: Application[];
  onClose: () => void;
  onSave: (
    payload: CreateDbSyncupPayload | UpdateDbSyncupPayload,
    syncupId?: number,
  ) => Promise<void>;
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
  environment_count: string;
  remarks: string;
  dev_status: string;
  qa_status: string;
  uat_am_status: string;
  pprod_perf_status: string;
  mnt_e_status: string;
  prod_status: string;
  environment_priority: string;
  application_priority: string;
  time_taken_in_prod: string;
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
  environment_count: "0",
  remarks: "",
  dev_status: "",
  qa_status: "",
  uat_am_status: "",
  pprod_perf_status: "",
  mnt_e_status: "",
  prod_status: "",
  environment_priority: "",
  application_priority: "",
  time_taken_in_prod: "",
};

const ENVIRONMENT_STATUS_FIELD_MAP: Record<
  string,
  keyof FormState
> = {
  DEV: "dev_status",
  QA: "qa_status",
  UAT_AM: "uat_am_status",
  PPROD_PERF: "pprod_perf_status",
  MNT_E: "mnt_e_status",
  PROD: "prod_status",
};

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function statusOptions(value: string) {
  const known = DB_SYNCUP_STATUS_OPTIONS.map((o) => o.value);
  if (value && !known.includes(value)) {
    return [{ value, label: value }, ...DB_SYNCUP_STATUS_OPTIONS];
  }
  return DB_SYNCUP_STATUS_OPTIONS;
}

function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div
        style={{
          borderLeft: "3px solid var(--ods-orange)",
          paddingLeft: "0.75rem",
          marginBottom: "0.875rem",
        }}
      >
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
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
      <label
        style={{
          display: "block",
          fontSize: "var(--ods-font-size-xs)",
          fontWeight: 600,
          color: "var(--ods-gray-600)",
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

function DrawerStatusSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "var(--ods-font-size-xs)",
          fontWeight: 600,
          color: "var(--ods-gray-600)",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </label>
      <select
        className="form-select form-select-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">—</option>
        {statusOptions(value).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DrawerPrioritySelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "var(--ods-font-size-xs)",
          fontWeight: 600,
          color: "var(--ods-gray-600)",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </label>
      <select
        className="form-select form-select-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">—</option>
        {DB_SYNCUP_PRIORITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DrawerApplicationSelect({
  label,
  value,
  applications,
  onChange,
}: {
  label: string;
  value: number;
  applications: Application[];
  onChange: (applicationId: number) => void;
}) {
  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <label
        style={{
          display: "block",
          fontSize: "var(--ods-font-size-xs)",
          fontWeight: 600,
          color: "var(--ods-gray-600)",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </label>
      <select
        className="form-select form-select-sm"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value="" disabled>
          Select an application...
        </option>
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

export default function DbSyncupEditDrawer({
  application,
  item,
  isOpen,
  nextSerialNumber,
  applications = [],
  onClose,
  onSave,
}: DbSyncupEditDrawerProps) {
  const isCreate = item == null;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const createApplication = isCreate
    ? (selectedApp ?? application)
    : null;

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
      data_anonymization_status:
        app.meta_data?.data_anonymization_status ?? "",
    }));
  };

  useEffect(() => {
    setSelectedApp(null);
    setError("");
    if (item) {
      setForm({
        application_name: item.application_name || "",
        carto_id: item.carto_id || "",
        basicat: item.basicat || "",
        domain: item.domain || "",
        dx_uid: item.dx_uid || "",
        mcp_id: item.mcp_id || "",
        hosting: item.hosting || "",
        reason: item.reason || "",
        data_anonymization_status: item.data_anonymization_status || "",
        db_validation: item.db_validation || "",
        migration_incharge: item.migration_incharge || "",
        date_of_request: item.date_of_request?.slice(0, 10) || "",
        environment_count: String(item.environment_count ?? 0),
        remarks: item.remarks || "",
        dev_status: item.dev_status || "",
        qa_status: item.qa_status || "",
        uat_am_status: item.uat_am_status || "",
        pprod_perf_status: item.pprod_perf_status || "",
        mnt_e_status: item.mnt_e_status || "",
        prod_status: item.prod_status || "",
        environment_priority: item.environment_priority || "",
        application_priority: item.application_priority || "",
        time_taken_in_prod: item.time_taken_in_prod || "",
      });
      return;
    }

    const empty = { ...EMPTY_FORM, date_of_request: todayInputValue() };
    if (application) {
      return setForm({
        ...empty,
        application_name: application.application_name,
        carto_id: application.carto_id ?? "",
        basicat: application.basicat ?? "",
        domain: application.confirmed_domain || application.domain || "",
        dx_uid: application.meta_data?.dx_uid ?? "",
        mcp_id: application.meta_data?.mcp_id ?? "",
        hosting: application.migration?.hosting_location ?? "",
        data_anonymization_status:
          application.meta_data?.data_anonymization_status ?? "",
      });
    }
    setForm(empty);
  }, [item, isOpen, application]);

  if (!isOpen) return null;

  const updateField = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const buildUpdatePayload = (): UpdateDbSyncupPayload => {
    const request = item?.requests?.[0];

    const environments = (request?.environments ?? []).map((env) => {
      const statusField = ENVIRONMENT_STATUS_FIELD_MAP[env.environment];
      const formStatus = statusField ? form[statusField] : "";
      const requestStatus =
        formStatus || env.request_status;

      return {
        id: env.id,
        request_status: requestStatus,
        priority: form.environment_priority || env.priority,
        remarks: env.remarks,
      };
    });

    return {
      db_validation: form.db_validation,
      migration_incharge: form.migration_incharge,
      remarks: form.remarks,
      request: {
        id: request?.id ?? 0,
        assigned_to_user_id: request?.assigned_to_user_id ?? null,
        remarks: request?.remarks ?? "",
        environments,
      },
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (isCreate && !createApplication) {
      setError("Please select an application.");
      setSaving(false);
      return;
    }

    if (item) {
      try {
        await onSave(buildUpdatePayload(), item.id);
        onClose();
      } catch (err: unknown) {
        setError(getApiErrorMessage(err));
      } finally {
        setSaving(false);
      }
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
      environment_count: Number(form.environment_count) || 0,
      remarks: form.remarks,
      dev_status: form.dev_status,
      qa_status: form.qa_status,
      uat_am_status: form.uat_am_status,
      pprod_perf_status: form.pprod_perf_status,
      mnt_e_status: form.mnt_e_status,
      prod_status: form.prod_status,
      environment_priority: form.environment_priority,
      application_priority: form.application_priority,
      time_taken_in_prod: form.time_taken_in_prod,
      application_id: createApplication?.id ?? 0,
      uploaded_file_id: createApplication?.uploaded_file_id ?? 0,
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
      <div
        className="ods-drawer-overlay"
        onMouseDown={onClose}
      />
      <aside
        className="ods-drawer open"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="ods-drawer-header">
          <div>
            <div className="ods-drawer-title">
              {isCreate ? "Add DB Syncup" : "Edit DB Syncup"}
            </div>
            <div
              style={{
                fontSize: "var(--ods-font-size-xs)",
                color: "var(--ods-gray-400)",
                marginTop: "0.15rem",
              }}
            >
              {isCreate
                ? `New record · Serial #${nextSerialNumber}`
                : `Serial #${item.serial_number} · ${form.application_name}`}
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
            <DrawerSection title="Application">
              {isCreate && !application && applications.length > 0 && (
                <DrawerApplicationSelect
                  label="Application"
                  value={selectedApp?.id ?? 0}
                  applications={applications}
                  onChange={(id) => {
                    const app =
                      applications.find((a) => a.id === id) ?? null;
                    setSelectedApp(app);
                    setError("");
                    if (app) applyApplication(app);
                  }}
                />
              )}
              <DrawerInput
                label="Application name"
                value={form.application_name}
                onChange={(v) => updateField("application_name", v)}
              />
              <DrawerInput
                label="Carto ID"
                value={form.carto_id}
                onChange={(v) => updateField("carto_id", v)}
              />
              <DrawerInput
                label="Basicat"
                value={form.basicat}
                onChange={(v) => updateField("basicat", v)}
              />
              <DrawerInput
                label="Domain"
                value={form.domain}
                onChange={(v) => updateField("domain", v)}
              />
              <DrawerInput
                label="DX-uid"
                value={form.dx_uid}
                onChange={(v) => updateField("dx_uid", v)}
              />
              <DrawerInput
                label="MCP-id"
                value={form.mcp_id}
                onChange={(v) => updateField("mcp_id", v)}
              />
              <DrawerInput
                label="Hosting"
                value={form.hosting}
                onChange={(v) => updateField("hosting", v)}
              />
              <DrawerInput
                label="Reason"
                value={form.reason}
                onChange={(v) => updateField("reason", v)}
              />
              <DrawerInput
                label="Data anonymization"
                value={form.data_anonymization_status}
                onChange={(v) => updateField("data_anonymization_status", v)}
                fullWidth
              />
            </DrawerSection>

            <DrawerSection title="Details">
              <DrawerInput
                label="DB validation"
                value={form.db_validation}
                onChange={(v) => updateField("db_validation", v)}
              />
              <DrawerInput
                label="Migration incharge"
                value={form.migration_incharge}
                onChange={(v) => updateField("migration_incharge", v)}
              />
              <DrawerInput
                label="Date of request"
                value={form.date_of_request}
                onChange={(v) => updateField("date_of_request", v)}
                type="date"
              />
              <DrawerInput
                label="Environment count"
                value={form.environment_count}
                onChange={(v) => updateField("environment_count", v)}
                type="number"
              />
              <DrawerInput
                label="Time taken in prod"
                value={form.time_taken_in_prod}
                onChange={(v) => updateField("time_taken_in_prod", v)}
                fullWidth
              />
              <DrawerInput
                label="Remarks"
                value={form.remarks}
                onChange={(v) => updateField("remarks", v)}
                fullWidth
              />
            </DrawerSection>

            <DrawerSection title="Priorities">
              <DrawerPrioritySelect
                label="Application priority"
                value={form.application_priority}
                onChange={(v) => updateField("application_priority", v)}
              />
              <DrawerPrioritySelect
                label="Environment priority"
                value={form.environment_priority}
                onChange={(v) => updateField("environment_priority", v)}
              />
            </DrawerSection>

            <DrawerSection title="Environment Status">
              {ENVIRONMENT_STATUS_FIELDS.map((field) => (
                <DrawerStatusSelect
                  key={field.key}
                  label={field.label}
                  value={form[field.key]}
                  onChange={(v) =>
                    updateField(field.key as keyof FormState, v)
                  }
                />
              ))}
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
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            onClick={(e) => void handleSubmit(e)}
          >
            {saving ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  className="ods-spinner"
                  style={{ width: "1rem", height: "1rem", borderWidth: 2 }}
                />
                Saving...
              </span>
            ) : (
              isCreate ? "Add syncup" : "Save changes"
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
