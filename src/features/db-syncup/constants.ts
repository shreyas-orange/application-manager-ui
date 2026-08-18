import type { DbSyncupStatusField } from "./types/db-syncup.types";

export const DB_SYNCUP_STATUS_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED",   label: "Completed" },
  { value: "REQUESTED",   label: "Requested" },
  { value: "FAILED",      label: "Failed" },
];

export const DB_SYNCUP_PRIORITY_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: "P1", label: "P1" },
  { value: "P2", label: "P2" },
  { value: "P3", label: "P3" },
];

export const ENVIRONMENT_STATUS_FIELDS: {
  key: DbSyncupStatusField;
  label: string;
}[] = [
  { key: "dev_status",        label: "Dev" },
  { key: "demo_status",       label: "Demo" },
  { key: "qa_status",         label: "QA" },
  { key: "uat_am_status",     label: "UAT / AM" },
  { key: "pprod_perf_status", label: "PP / Perf" },
  { key: "mnt_e_status",      label: "MNT / E" },
  { key: "bench_status",      label: "Bench" },
  { key: "staging_status",    label: "Staging" },
  { key: "int_status",        label: "Int" },
  { key: "prod_status",       label: "Prod" },
];

/**
 * Environment type codes as used by DbSyncEnvironmentRequest.environment
 * (e.g. "DEV", "UAT_AM") — distinct from ENVIRONMENT_STATUS_FIELDS, which
 * keys off the flat form-field names (e.g. "dev_status").
 */
export const ENVIRONMENT_TYPE_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: "DEV",         label: "Dev" },
  { value: "DEMO",        label: "Demo" },
  { value: "QA",          label: "QA" },
  { value: "UAT_AM",      label: "UAT / AM" },
  { value: "PPROD_PERF",  label: "PP / Perf" },
  { value: "MNT_E",       label: "MNT / E" },
  { value: "BENCH",       label: "Bench" },
  { value: "STAGING",     label: "Staging" },
  { value: "INT",         label: "Int" },
  { value: "PROD",        label: "Prod" },
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
  const p = String(priority ?? "").trim().toUpperCase();

  if (p === "P1") return "ods-badge ods-badge-danger";
  if (p === "P2") return "ods-badge ods-badge-warning";
  return "ods-badge ods-badge-neutral";
}

export type NormalizedDbSyncupStatus = "Completed" | "In Progress" | "Requested" | "Failed" | "Pending";

/** Buckets a raw status value (e.g. prod_status) for summary counts and filtering. */
export function normalizeDbSyncupStatus(
  status: string | null | undefined,
): NormalizedDbSyncupStatus {
  const s = String(status ?? "").trim().toLowerCase();

  if (["completed", "complete", "done", "production"].includes(s)) return "Completed";
  if (["rejected", "cancelled", "failed", "failure", "blocked"].includes(s)) return "Failed";
  if (["requested"].includes(s)) return "Requested";
  if (["in progress", "in_progress", "ongoing", "started"].includes(s)) return "In Progress";
  return "Pending";
}
