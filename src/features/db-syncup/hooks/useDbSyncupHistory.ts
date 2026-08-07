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
}: {
  dbSyncupId: number | null;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: [
      "db-syncups",
      "history",
      dbSyncupId,
      page,
      pageSize,
    ],
    queryFn: () =>
      getDbSyncupHistory({
        page,
        pageSize,
        dbSyncupId,
      }),
    enabled: dbSyncupId != null,
    placeholderData: keepPreviousData,
  });
}
