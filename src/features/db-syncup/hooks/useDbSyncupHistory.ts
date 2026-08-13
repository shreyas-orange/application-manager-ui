import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import {
  getDbSyncupHistory,
} from "../api/db-syncup.api";

export function useDbSyncupHistory({
  dbSyncupId,
  page = 1,
  pageSize = 20,
  action = null,
}: {
  dbSyncupId: number | null;
  page?: number;
  pageSize?: number;
  action?: string | null;
}) {
  return useQuery({
    queryKey: [
      "db-syncups",
      "history",
      dbSyncupId,
      page,
      pageSize,
      action,
    ],
    queryFn: () =>
      getDbSyncupHistory({
        page,
        pageSize,
        dbSyncupId,
        action,
      }),
    enabled: dbSyncupId != null,
    placeholderData: keepPreviousData,
  });
}
