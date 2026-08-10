import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createApplication } from "../api/applications.api";
import type {
  CreateApplicationPayload,
} from "../types/application.types";

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: CreateApplicationPayload,
    ) => createApplication(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["applications"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}
