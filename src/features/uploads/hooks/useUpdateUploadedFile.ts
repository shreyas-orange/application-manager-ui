import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  updateUploadedFile,
} from "../api/upload.api";

interface UpdateUploadVariables {
  uploadId: number;
  file: File;
}

export function useUpdateUploadedFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      uploadId,
      file,
    }: UpdateUploadVariables) =>
      updateUploadedFile(
        uploadId,
        file,
      ),

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