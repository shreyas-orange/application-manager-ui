import { useQuery } from "@tanstack/react-query";

import { getMyApplications } from "../api/applications.api";

export function useMyApplications(page: number, pageSize = 10) {
  return useQuery({
    queryKey: ["applications", "mine", page, pageSize],
    queryFn: () => getMyApplications({ page, pageSize }),
  });
}
