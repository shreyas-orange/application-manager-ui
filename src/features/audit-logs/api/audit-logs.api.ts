import { apiClient } from "@/lib/api-client";

import type { AuditLogsResponse } from "../types/audit-log.types";

interface GetAuditLogsParams {
  page: number;
  pageSize: number;
  search?: string;
  action?: string;
  module?: string;
  fromDate?: string;
  toDate?: string;
}

export async function getAuditLogs({
  page,
  pageSize,
  search,
  action,
  module,
  fromDate,
  toDate,
}: GetAuditLogsParams): Promise<AuditLogsResponse> {
  const response = await apiClient.get<AuditLogsResponse>(
    "/audit-logs",
    {
      params: {
        page,
        size: pageSize,
        search: search || undefined,
        action: action || undefined,
        module: module || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      },
    }
  );

  return response.data;
}
