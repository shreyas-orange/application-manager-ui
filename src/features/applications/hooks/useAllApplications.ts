import { useQuery } from "@tanstack/react-query";

import { getApplications } from "../api/applications.api";

export function useAllApplications() {
  return useQuery({
    queryKey: ["applications", "all"],
    queryFn: () =>
      getApplications({ page: 1, pageSize: 5000 }),
  });
}
