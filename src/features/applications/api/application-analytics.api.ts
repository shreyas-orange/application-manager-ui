import { apiClient } from "@/lib/api-client";

export type AnalyticsCloud = "Azure" | "Bleu";

export interface ApplicationAnalyticsResponse {
  cloud: AnalyticsCloud;
  total_applications: number;
  status_breakdown: Array<{ name: string; value: number }>;
  monthly_migrations: Array<{ month: string; count: number }>;
  namespace_summary: {
    total_namespaces: number;
    migrated: number;
    in_progress: number;
    decommissioned: number;
  };
}

export async function getApplicationAnalytics(
  cloud: AnalyticsCloud,
): Promise<ApplicationAnalyticsResponse> {
  const response = await apiClient.get<ApplicationAnalyticsResponse>(
    "/dashboard/application-analytics",
    { params: { cloud } },
  );

  return response.data;
}
