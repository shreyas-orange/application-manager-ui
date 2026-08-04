import { apiClient } from "@/lib/api-client";

import type {
  DashboardResponse,
  NamespaceMigrationSummary,
} from "../types/dashboard.types";

export async function getDashboard():
  Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>(
    "/dashboard/dashboard",
  );

  return response.data;
}

export async function getNamespaceMigrationSummary():
  Promise<NamespaceMigrationSummary> {
  const response = await apiClient.get<NamespaceMigrationSummary>(
    "/ns/namespace-migration-summary",
  );

  return response.data;
}