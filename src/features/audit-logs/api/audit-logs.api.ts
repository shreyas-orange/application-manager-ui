import { apiClient } from "@/lib/api-client";

interface GetAuditLogsParams {
  page: number;
  pageSize: number;
  search?: string;
}

export async function getAuditLogs({
  page,
  pageSize,
  search,
}: GetAuditLogsParams) {
  const response = await apiClient.get(
    "/audit-logs",
    {
      params: {
        page,
        size: pageSize,
        search: search || undefined,
      },
    }
  );

  return response.data;
}