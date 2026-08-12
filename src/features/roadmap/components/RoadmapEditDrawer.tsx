import { type FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";

import { getApiErrorMessage } from "@/lib/api-error";

import type {
  RoadmapItem,
  UpdateRoadmapItemPayload,
} from "../types/roadmap.types";

interface RoadmapEditDrawerProps {
  item: RoadmapItem | null;
  isOpen: boolean;
  mode?: "edit" | "create";
  nextDisplayOrder?: number;
  onClose: () => void;
  onSave: (
    payload: UpdateRoadmapItemPayload,
    itemId?: number,
  ) => Promise<void>;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "TO_DO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
  { value: "NOT_REQUIRED", label: "Not Required" },
];

interface FormState {
  phase: string;
  environment: string;
  section_name: string;
  activity_number: string;
  activity: string;
  status: string;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  responsible_teams: string;
  support_teams: string;
  assigned_resources: string;
  remarks: string;
}

const EMPTY_FORM: FormState = {
  phase: "",
  environment: "",
  section_name: "",
  activity_number: "",
  activity: "",
  status: "",
  planned_start_date: "",
  planned_end_date: "",
  actual_start_date: "",
  actual_end_date: "",
  responsible_teams: "",
  support_teams: "",
  assigned_resources: "",
  remarks: "",
};

function dateInputValue(v: string | null): string {
  return v ? v.slice(0, 10) : "";
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

function DrawerTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
      <textarea
        className="form-control form-control-sm"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function DrawerSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
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
        <option value="">NA</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function RoadmapEditDrawer({
  item,
  isOpen,
  mode = "edit",
  nextDisplayOrder = 1,
  onClose,
  onSave,
}: RoadmapEditDrawerProps) {
  const isCreate = mode === "create";
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!item) {
      setForm(EMPTY_FORM);
      return;
    }
    setForm({
      phase: item.phase || "",
      environment: item.environment || "",
      section_name: item.section_name || "",
      activity_number: item.activity_number || "",
      activity: item.activity || "",
      status: item.status || "",
      planned_start_date: dateInputValue(item.planned_start_date),
      planned_end_date: dateInputValue(item.planned_end_date),
      actual_start_date: dateInputValue(item.actual_start_date),
      actual_end_date: dateInputValue(item.actual_end_date),
      responsible_teams: item.responsible_teams || "",
      support_teams: item.support_teams || "",
      assigned_resources: item.assigned_resources || "",
      remarks: item.remarks || "",
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

    try {
      const payload: UpdateRoadmapItemPayload = {
        phase_id: item?.phase_id ?? 0,
        environment_id: item?.environment_id ?? 0,
        section_name: form.section_name,
        activity_number:
          Number(form.activity_number) || item?.display_order || nextDisplayOrder,
        activity: form.activity,
        status: form.status,
        planned_start_date: form.planned_start_date || null,
        planned_end_date: form.planned_end_date || null,
        actual_start_date: form.actual_start_date || null,
        actual_end_date: form.actual_end_date || null,
        remarks: form.remarks,
        display_order: item?.display_order ?? nextDisplayOrder,
        responsible_team_ids: item?.responsible_team_ids ?? [],
        support_team_ids: item?.support_team_ids ?? [],
        assigned_resource_ids: item?.assigned_resource_ids ?? [],
      };
      await onSave(payload, item?.id);
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
              {isCreate ? "Create Roadmap Item" : "Edit Roadmap Item"}
            </div>
            <div
              style={{
                fontSize: "var(--ods-font-size-xs)",
                color: "var(--ods-gray-400)",
                marginTop: "0.15rem",
              }}
            >
              {isCreate
                ? "New activity"
                : `Activity #${item!.activity_number || item!.display_order}`}
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
            <DrawerSection title="Classification">
              <DrawerInput
                label="Phase"
                value={form.phase}
                onChange={(v) => updateField("phase", v)}
              />
              <DrawerInput
                label="Environment"
                value={form.environment}
                onChange={(v) => updateField("environment", v)}
              />
              <DrawerInput
                label="Section"
                value={form.section_name}
                onChange={(v) => updateField("section_name", v)}
              />
              <DrawerInput
                label="Activity #"
                value={form.activity_number}
                onChange={(v) => updateField("activity_number", v)}
              />
            </DrawerSection>

            <DrawerSection title="Activity">
              <DrawerTextarea
                label="Activity description"
                value={form.activity}
                onChange={(v) => updateField("activity", v)}
              />
              <DrawerSelect
                label="Status"
                value={form.status}
                onChange={(v) => updateField("status", v)}
                options={STATUS_OPTIONS.map((s) => ({
                  value: s.value!,
                  label: s.label,
                }))}
              />
            </DrawerSection>

            <DrawerSection title="Schedule">
              <DrawerInput
                label="Planned start"
                value={form.planned_start_date}
                onChange={(v) => updateField("planned_start_date", v)}
                type="date"
              />
              <DrawerInput
                label="Planned end"
                value={form.planned_end_date}
                onChange={(v) => updateField("planned_end_date", v)}
                type="date"
              />
              <DrawerInput
                label="Actual start"
                value={form.actual_start_date}
                onChange={(v) => updateField("actual_start_date", v)}
                type="date"
              />
              <DrawerInput
                label="Actual end"
                value={form.actual_end_date}
                onChange={(v) => updateField("actual_end_date", v)}
                type="date"
              />
            </DrawerSection>

            <DrawerSection title="Ownership">
              <DrawerInput
                label="Responsible teams"
                value={form.responsible_teams}
                onChange={(v) => updateField("responsible_teams", v)}
                fullWidth
              />
              <DrawerInput
                label="Support teams"
                value={form.support_teams}
                onChange={(v) => updateField("support_teams", v)}
                fullWidth
              />
              <DrawerInput
                label="Assigned resources"
                value={form.assigned_resources}
                onChange={(v) => updateField("assigned_resources", v)}
                fullWidth
              />
            </DrawerSection>

            <DrawerSection title="Notes">
              <DrawerTextarea
                label="Remarks"
                value={form.remarks}
                onChange={(v) => updateField("remarks", v)}
              />
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
              isCreate ? "Create item" : "Save changes"
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
