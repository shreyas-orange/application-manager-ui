import { type FormEvent, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import type { Application } from "@/features/applications/types/application.types";

import {
  DB_SYNCUP_STATUS_OPTIONS,
  ENVIRONMENT_STATUS_FIELDS,
} from "../constants";
import type {
  CreateDbSyncupPayload,
  DbSyncup,
  UpdateDbSyncupPayload,
} from "../types/db-syncup.types";

interface DbSyncupEditDrawerProps {
  application: Application;
  item: DbSyncup | null;
  isOpen: boolean;
  nextSerialNumber: number;
  onClose: () => void;
  onSave: (
    payload: CreateDbSyncupPayload | UpdateDbSyncupPayload,
    syncupId?: number,
  ) => Promise<void>;
}

interface FormState {
  db_validation: string;
  migration_incharge: string;
  date_of_request: string;
  environment_count: string;
  remarks: string;
  dev_status: string;
  demo_status: string;
  qa_status: string;
  uat_am_status: string;
  pprod_perf_status: string;
  mnt_e_status: string;
  bench_status: string;
  staging_status: string;
  int_status: string;
  prod_status: string;
  time_taken_in_prod: string;
}

const EMPTY_FORM: FormState = {
  db_validation: "",
  migration_incharge: "",
  date_of_request: "",
  environment_count: "0",
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
  time_taken_in_prod: "",
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

function DrawerReadonly({
  label,
  value,
}: {
  label: string;
  value: string;
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
      <div
        style={{
          padding: "0.5rem 0.75rem",
          fontSize: "var(--ods-font-size-sm)",
          color: "var(--ods-gray-800)",
          background: "var(--ods-gray-100)",
          border: "1px solid var(--ods-gray-200)",
          minHeight: "35px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {value || "—"}
      </div>
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

export default function DbSyncupEditDrawer({
  application,
  item,
  isOpen,
  nextSerialNumber,
  onClose,
  onSave,
}: DbSyncupEditDrawerProps) {
  const isCreate = item == null;
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const derived = useMemo(() => {
    if (item) {
      return {
        application_name: item.application_name,
        carto_id: item.carto_id,
        basicat: item.basicat,
        domain: item.domain,
        dx_uid: item.dx_uid,
        mcp_id: item.mcp_id,
        hosting: item.hosting,
        reason: item.reason,
        data_anonymization_status: item.data_anonymization_status,
      };
    }

    return {
      application_name: application.application_name,
      carto_id: application.carto_id ?? "",
      basicat: application.basicat ?? "",
      domain: application.confirmed_domain || application.domain || "",
      dx_uid: application.meta_data?.dx_uid ?? "",
      mcp_id: application.meta_data?.mcp_id ?? "",
      hosting: application.migration?.hosting_location ?? "",
      reason: "",
      data_anonymization_status:
        application.meta_data?.data_anonymization_status ?? "",
    };
  }, [item, application]);

  useEffect(() => {
    if (!item) {
      setForm({ ...EMPTY_FORM, date_of_request: todayInputValue() });
      return;
    }
    setForm({
      db_validation: item.db_validation || "",
      migration_incharge: item.migration_incharge || "",
      date_of_request: item.date_of_request?.slice(0, 10) || "",
      environment_count: String(item.environment_count ?? 0),
      remarks: item.remarks || "",
      dev_status: item.dev_status || "",
      demo_status: item.demo_status || "",
      qa_status: item.qa_status || "",
      uat_am_status: item.uat_am_status || "",
      pprod_perf_status: item.pprod_perf_status || "",
      mnt_e_status: item.mnt_e_status || "",
      bench_status: item.bench_status || "",
      staging_status: item.staging_status || "",
      int_status: item.int_status || "",
      prod_status: item.prod_status || "",
      time_taken_in_prod: item.time_taken_in_prod || "",
    });
    setError("");
  }, [item]);

  if (!isOpen) return null;

  const updateField = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const base = {
      db_validation: form.db_validation,
      migration_incharge: form.migration_incharge,
      date_of_request: form.date_of_request,
      environment_count: Number(form.environment_count) || 0,
      remarks: form.remarks,
      dev_status: form.dev_status,
      demo_status: form.demo_status,
      qa_status: form.qa_status,
      uat_am_status: form.uat_am_status,
      pprod_perf_status: form.pprod_perf_status,
      mnt_e_status: form.mnt_e_status,
      bench_status: form.bench_status,
      staging_status: form.staging_status,
      int_status: form.int_status,
      prod_status: form.prod_status,
      time_taken_in_prod: form.time_taken_in_prod,
    };

    const payload: CreateDbSyncupPayload | UpdateDbSyncupPayload = item
      ? base
      : {
          ...base,
          serial_number: nextSerialNumber,
          application_name: derived.application_name,
          carto_id: derived.carto_id,
          basicat: derived.basicat,
          hosting: derived.hosting,
          reason: derived.reason,
          data_anonymization_status: derived.data_anonymization_status,
          domain: derived.domain,
          dx_uid: derived.dx_uid,
          mcp_id: derived.mcp_id,
          application_id: application.id,
          uploaded_file_id: application.uploaded_file_id ?? 0,
        };

    try {
      await onSave(payload, item?.id);
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          data?: { detail?: string; message?: string };
        };
      };
      const detail =
        axiosErr?.response?.data?.detail ||
        axiosErr?.response?.data?.message;
      setError(
        detail ||
          (err instanceof Error ? err.message : "Failed to save."),
      );
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
                : `Serial #${item.serial_number} · ${derived.application_name}`}
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
            <DrawerSection title="Application (read-only)">
              <DrawerReadonly
                label="Application name"
                value={derived.application_name}
              />
              <DrawerReadonly label="Carto ID" value={derived.carto_id} />
              <DrawerReadonly label="Basicat" value={derived.basicat} />
              <DrawerReadonly label="Domain" value={derived.domain} />
              <DrawerReadonly label="DX-uid" value={derived.dx_uid} />
              <DrawerReadonly label="MCP-id" value={derived.mcp_id} />
              <DrawerReadonly label="Hosting" value={derived.hosting} />
              <DrawerReadonly label="Reason" value={derived.reason} />
              <DrawerReadonly
                label="Data anonymization"
                value={derived.data_anonymization_status}
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
