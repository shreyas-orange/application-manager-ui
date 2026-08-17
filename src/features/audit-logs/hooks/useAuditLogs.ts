import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "../api/audit-logs.api";

interface UseAuditLogsParams {
  page: number;
  pageSize: number;
  search?: string;
  action?: string;
  module?: string;
  fromDate?: string;
  toDate?: string;
}

export function useAuditLogs({
  page,
  pageSize,
  search,
  action,
  module,
  fromDate,
  toDate,
}: UseAuditLogsParams) {
  return useQuery({
    queryKey: [
      "audit-logs",
      page,
      pageSize,
      search,
      action,
      module,
      fromDate,
      toDate,
    ],
    queryFn: () =>
      getAuditLogs({
        page,
        pageSize,
        search,
        action,
        module,
        fromDate,
        toDate,
      }),
  });
}
