import { apiClient } from "@/lib/api-client";

import type { AuditLogsResponse } from "../types/audit-log.types";

interface GetAuditLogsParams {
  page: number;
  pageSize: number;
  search?: string;
}

export async function getAuditLogs({
  page,
  pageSize,
  search,
}: GetAuditLogsParams): Promise<AuditLogsResponse> {
  const response = await apiClient.get<AuditLogsResponse>(
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
