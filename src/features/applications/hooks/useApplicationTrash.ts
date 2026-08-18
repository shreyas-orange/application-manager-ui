import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApplicationTrash, restoreApplication } from "../api/applications.api";

export function useApplicationTrash(page: number, search: string, pageSize = 10) {
  return useQuery({
    queryKey: ["applications", "trash", page, pageSize, search],
    queryFn: () => getApplicationTrash({ page, pageSize, search }),
  });
}

export function useRestoreApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreApplication,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
