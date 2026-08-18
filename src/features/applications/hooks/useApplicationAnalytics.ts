import { useQuery } from "@tanstack/react-query";

import {
  getApplicationAnalytics,
  type AnalyticsCloud,
} from "../api/application-analytics.api";

export function useApplicationAnalytics(cloud: AnalyticsCloud) {
  return useQuery({
    queryKey: ["application-analytics", cloud],
    queryFn: () => getApplicationAnalytics(cloud),
  });
}
