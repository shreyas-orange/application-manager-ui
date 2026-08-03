import { useQuery } from "@tanstack/react-query";

import {
  getApplications,
  getPublicApplications,
} from "../api/applications.api";

export function useAllApplications() {
  return useQuery({
    queryKey: ["applications", "all"],
    queryFn: () =>
      getApplications({ page: 1, pageSize: 50 }),
  });
}

export function usePublicApplications() {
  return useQuery({
    queryKey: ["applications", "public", "all"],
    queryFn: () =>
      getPublicApplications({ page: 1, pageSize: 50 }),
  });
}
