import { useQuery } from "@tanstack/react-query";

import {
  getApplications,
  type GetApplicationsParams,
} from "../api/applications.api";

export function useApplications(
  params: GetApplicationsParams,
) {
  return useQuery({
    queryKey: [
      "applications",
      params.page,
      params.pageSize,
      params.search,
      params.status,
      params.domain,
      params.cloud,
    ],
    queryFn: () => getApplications(params),
  });
}