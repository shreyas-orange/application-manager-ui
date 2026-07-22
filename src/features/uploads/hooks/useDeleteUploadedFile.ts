import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteUploadedFile,
} from "../api/upload.api";

export function useDeleteUploadedFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      uploadId: number,
    ) =>
      deleteUploadedFile(uploadId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["uploads"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["applications"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);
    },
  });
}