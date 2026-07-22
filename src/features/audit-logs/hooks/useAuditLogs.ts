import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../api/audit-logs.api";

interface UseAuditLogsParams {
  page: number;
  pageSize: number;
  search?: string;
}

export function useAuditLogs({
  page,
  pageSize,
  search,
}: UseAuditLogsParams) {
  return useQuery({
    queryKey: [
      "audit-logs",
      page,
      pageSize,
      search,
    ],
    queryFn: () =>
      getAuditLogs({
        page,
        pageSize,
        search,
      }),
  });
}