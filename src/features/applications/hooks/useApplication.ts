import { useQuery } from "@tanstack/react-query";

import { getApplication } from "../api/applications.api";

export function useApplication(applicationId: number) {
  return useQuery({
    queryKey: ["application", applicationId],
    queryFn: () => getApplication(applicationId),
    enabled: applicationId > 0,
  });
}
