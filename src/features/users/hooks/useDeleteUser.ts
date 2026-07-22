import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { deleteUser } from "../api/users.api";

export function useDeleteUser() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      userId: number,
    ) => deleteUser(userId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["users"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);
    },
  });
}