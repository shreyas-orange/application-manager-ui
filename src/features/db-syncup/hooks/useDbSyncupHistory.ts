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
  startDate = null,
  endDate = null,
  search = null,
}: {
  dbSyncupId: number | null;
  page?: number;
  pageSize?: number;
  startDate?: string | null;
  endDate?: string | null;
  search?: string | null;
}) {
  return useQuery({
    queryKey: [
      "db-syncups",
      "history",
      dbSyncupId,
      page,
      pageSize,
      startDate,
      endDate,
      search,
    ],
    queryFn: () =>
      getDbSyncupHistory({
        page,
        pageSize,
        dbSyncupId,
        startDate,
        endDate,
        search,
      }),
    enabled: dbSyncupId != null,
    placeholderData: keepPreviousData,
  });
}
