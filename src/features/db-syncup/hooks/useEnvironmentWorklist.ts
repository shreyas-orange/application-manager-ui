import { useQuery } from "@tanstack/react-query";

import { getEnvironmentWorklist, type GetEnvironmentWorklistParams } from "../api/db-syncup.api";

export function useEnvironmentWorklist(params: GetEnvironmentWorklistParams) {
  return useQuery({
    queryKey: ["db-syncups", "environment-worklist", params],
    queryFn: () => getEnvironmentWorklist(params),
  });
}
