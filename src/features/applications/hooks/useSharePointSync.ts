import { useMutation, useQueryClient } from "@tanstack/react-query";

import { runSharePointSync } from "../api/applications.api";

export function useSharePointSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runSharePointSync,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["applications"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}
