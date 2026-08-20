import type { Application } from "../types/application.types";
import { getCloudPrimary, getMigrationStatus, normalizeStatus } from "./status";

export interface ApplicationOverviewSummary {
  total: number;
  azure: number;
  blue: number;
  completed: number;
  inProgress: number;
  pending: number;
  failed: number;
}

export function getApplicationOverviewSummary(
  applications: Application[],
): ApplicationOverviewSummary {
  const summary: ApplicationOverviewSummary = {
    total: applications.length,
    azure: 0,
    blue: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    failed: 0,
  };

  applications.forEach((application) => {
    const cloud = getCloudPrimary(application);
    if (cloud === "Azure") summary.azure += 1;
    if (cloud === "Blue") summary.blue += 1;

    const status = normalizeStatus(getMigrationStatus(application));
    if (status === "Completed") summary.completed += 1;
    else if (status === "In Progress") summary.inProgress += 1;
    else if (status === "Failed") summary.failed += 1;
    else summary.pending += 1;
  });

  return summary;
}
