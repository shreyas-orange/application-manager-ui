import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateApplication } from "../api/applications.api";
import type {
  UpdateApplicationPayload,
} from "../types/application.types";

interface UpdateApplicationVariables {
  applicationId: number;
  payload: UpdateApplicationPayload;
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      payload,
    }: UpdateApplicationVariables) =>
      updateApplication(
        applicationId,
        payload,
      ),

    onSuccess: async (data, { applicationId }) => {
      queryClient.setQueryData(["application", applicationId], data);

      await queryClient.invalidateQueries({
        queryKey: ["applications"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["application", applicationId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
}
