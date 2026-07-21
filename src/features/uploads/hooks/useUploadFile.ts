import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadApplicationFile } from "../api/upload.api";

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadApplicationFile,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["applications"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["uploads"],
        }),
      ]);
    },
  });
}