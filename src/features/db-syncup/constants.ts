import type { DbSyncupStatusField } from "./types/db-syncup.types";

export const DB_SYNCUP_STATUS_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: "Completed",   label: "Completed" },
  { value: "In Progress", label: "In Progress" },
  { value: "Pending",     label: "Pending" },
  { value: "Not Started", label: "Not Started" },
  { value: "Not Required", label: "Not Required" },
  { value: "Failed",      label: "Failed" },
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
  { key: "int_status",        label: "INT" },
  { key: "prod_status",       label: "Prod" },
];

export function getStatusBadgeClass(
  status: string | null | undefined,
): string {
  const s = String(status ?? "").trim().toLowerCase();

  if (["completed", "complete", "done", "production"].includes(s))
    return "ods-badge ods-badge-success";
  if (["failed", "failure", "cancelled", "blocked"].includes(s))
    return "ods-badge ods-badge-danger";
  if (["in progress", "in_progress", "ongoing", "started"].includes(s))
    return "ods-badge ods-badge-warning";
  return "ods-badge ods-badge-neutral";
}
