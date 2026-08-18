import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteApplication } from "../api/applications.api";

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteApplication,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
