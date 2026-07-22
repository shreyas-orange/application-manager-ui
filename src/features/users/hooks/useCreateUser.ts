import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createUser } from "../api/users.api";

import type {
  CreateUserRequest,
} from "../types/user.types";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateUserRequest,
    ) => createUser(data),

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