import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateUser } from "../api/users.api";

import type {
  UpdateUserRequest,
} from "../types/user.types";

interface UpdateUserVariables {
  userId: number;
  data: UpdateUserRequest;
}

export function useUpdateUser() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: UpdateUserVariables) =>
      updateUser(userId, data),

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