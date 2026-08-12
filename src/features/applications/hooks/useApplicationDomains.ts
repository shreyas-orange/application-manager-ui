import { useQuery } from "@tanstack/react-query";

import { getApplicationDomains } from "../api/applications.api";

export function useApplicationDomains() {
  return useQuery({
    queryKey: ["application-domains"],
    queryFn: getApplicationDomains,
  });
}
