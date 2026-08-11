import type { DbSyncupStatusField } from "./types/db-syncup.types";

export const DB_SYNCUP_STATUS_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: "REQUESTED",   label: "Requested" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED",   label: "Completed" },
  { value: "REJECTED",    label: "Rejected" },
  { value: "CANCELLED",   label: "Cancelled" },
];

export const DB_SYNCUP_PRIORITY_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: "LOW",     label: "Low" },
  { value: "MEDIUM",  label: "Medium" },
  { value: "HIGH",    label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export const ENVIRONMENT_STATUS_FIELDS: {
  key: DbSyncupStatusField;
  label: string;
}[] = [
  { key: "dev_status",        label: "Dev" },
  { key: "qa_status",         label: "QA" },
  { key: "uat_am_status",     label: "UAT / AM" },
  { key: "pprod_perf_status", label: "PP / Perf" },
  { key: "mnt_e_status",      label: "MNT / E" },
  { key: "prod_status",       label: "Prod" },
];

export function getStatusBadgeClass(
  status: string | null | undefined,
): string {
  const s = String(status ?? "").trim().toLowerCase();

  if (["completed", "complete", "done", "production"].includes(s))
    return "ods-badge ods-badge-success";
  if (["rejected", "cancelled", "failed", "failure", "blocked"].includes(s))
    return "ods-badge ods-badge-danger";
  if (["in progress", "in_progress", "requested", "ongoing", "started"].includes(s))
    return "ods-badge ods-badge-warning";
  return "ods-badge ods-badge-neutral";
}

export function getPriorityBadgeClass(
  priority: string | null | undefined,
): string {
  const p = String(priority ?? "").trim().toLowerCase();

  if (["critical"].includes(p))
    return "ods-badge ods-badge-danger";
  if (["high"].includes(p))
    return "ods-badge ods-badge-warning";
  return "ods-badge ods-badge-neutral";
}

export type NormalizedDbSyncupStatus = "Completed" | "In Progress" | "Failed" | "Pending";

/** Buckets a raw status value (e.g. prod_status) for summary counts and filtering. */
export function normalizeDbSyncupStatus(
  status: string | null | undefined,
): NormalizedDbSyncupStatus {
  const s = String(status ?? "").trim().toLowerCase();

  if (["completed", "complete", "done", "production"].includes(s)) return "Completed";
  if (["rejected", "cancelled", "failed", "failure", "blocked"].includes(s)) return "Failed";
  if (["in progress", "in_progress", "requested", "ongoing", "started"].includes(s)) return "In Progress";
  return "Pending";
}
