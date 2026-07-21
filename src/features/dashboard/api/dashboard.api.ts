import { apiClient } from "@/lib/api-client";

import type {
  DashboardResponse,
} from "../types/dashboard.types";

export async function getDashboard():
  Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>(
    "/dashboard/dashboard",
  );

  return response.data;
}