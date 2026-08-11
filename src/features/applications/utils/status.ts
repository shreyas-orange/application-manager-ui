import { normalizeValue } from "@/lib/format";

import type { Application } from "../types/application.types";

export type NormalizedStatus = "Completed" | "In Progress" | "Failed" | "Pending";

const COMPLETED_VALUES = ["completed", "complete", "done", "production"];
const IN_PROGRESS_VALUES = ["in progress", "in_progress", "ongoing", "started"];
const FAILED_VALUES = ["failed", "failure", "cancelled"];

export function getMigrationStatus(app: Application): string {
  return app.migration?.migration_status || app.application_status || "Pending";
}

export function normalizeStatus(status: string): NormalizedStatus {
  const value = normalizeValue(status);

  if (COMPLETED_VALUES.includes(value)) return "Completed";
  if (IN_PROGRESS_VALUES.includes(value)) return "In Progress";
  if (FAILED_VALUES.includes(value)) return "Failed";
  return "Pending";
}

export function getStatusBadgeClass(status: string | null | undefined): string {
  const value = normalizeValue(status);

  if (COMPLETED_VALUES.includes(value)) return "ods-badge ods-badge-success";
  if (FAILED_VALUES.includes(value)) return "ods-badge ods-badge-danger";
  if (IN_PROGRESS_VALUES.includes(value)) return "ods-badge ods-badge-warning";
  return "ods-badge ods-badge-neutral";
}

export function getCloudNames(app: Application): string {
  const names =
    app.cloud_mappings
      ?.map((mapping) => mapping.cloud?.name?.trim())
      .filter((name): name is string => Boolean(name)) ?? [];

  return names.length > 0 ? names.join(", ") : "—";
}

export function getCloudPrimary(app: Application): "Azure" | "Blue" | "Other" {
  const names =
    app.cloud_mappings
      ?.map((mapping) => mapping.cloud?.name?.trim().toLowerCase())
      .filter(Boolean) ?? [];

  if (names.includes("azure")) return "Azure";
  if (names.includes("blue") || names.includes("bleu")) return "Blue";
  return "Other";
}

export function getOwnerByType(app: Application, ownerType: string) {
  return app.owners?.find(
    (owner) => normalizeValue(owner.owner_type) === normalizeValue(ownerType),
  );
}
