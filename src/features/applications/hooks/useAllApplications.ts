import { useQuery } from "@tanstack/react-query";

import {
  getApplications,
  getPublicApplications,
  type GetApplicationsParams,
} from "../api/applications.api";
import type { ApplicationsResponse } from "../types/application.types";

const PAGE_SIZE = 50;

async function loadAllApplicationPages(
  getPage: (page: number, pageSize: number) => Promise<ApplicationsResponse>,
): Promise<ApplicationsResponse> {
  const firstPage = await getPage(1, PAGE_SIZE);
  const totalPages = Math.ceil(firstPage.total / PAGE_SIZE);

  if (totalPages <= 1) return firstPage;

  const remainingPages = await Promise.all(
    Array.from(
      { length: totalPages - 1 },
      (_, index) => getPage(index + 2, PAGE_SIZE),
    ),
  );

  return {
    ...firstPage,
    items: [firstPage, ...remainingPages].flatMap((response) => response.items),
  };
}

export function useAllApplications(
  params: Pick<GetApplicationsParams, "search" | "cloud" | "domain"> = {},
) {
  return useQuery({
    queryKey: ["applications", "all", params.search, params.cloud, params.domain],
    queryFn: () => loadAllApplicationPages(
      (page, pageSize) => getApplications({ ...params, page, pageSize }),
    ),
  });
}

export function usePublicApplications() {
  return useQuery({
    queryKey: ["applications", "public", "all"],
    queryFn: () => loadAllApplicationPages(
      (page, pageSize) => getPublicApplications({ page, pageSize }),
    ),
  });
}
