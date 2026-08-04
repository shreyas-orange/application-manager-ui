import { useQuery } from "@tanstack/react-query";

import { getNamespaceMigrationSummary } from "../api/dashboard.api";

export function useNamespaceMigrationSummary() {
  return useQuery({
    queryKey: ["admin-ns-migration-summary"],
    queryFn: getNamespaceMigrationSummary,
  });
}
