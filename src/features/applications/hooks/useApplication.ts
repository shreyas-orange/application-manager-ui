import { useQuery } from "@tanstack/react-query";

import { getApplication } from "../api/applications.api";
import type { Application } from "../types/application.types";

export function useApplication(applicationId: number, placeholderData?: Application) {
  return useQuery({
    queryKey: ["application", applicationId],
    queryFn: () => getApplication(applicationId),
    enabled: Number.isFinite(applicationId) && applicationId > 0,
    placeholderData,
  });
}
