import { useMutation } from "@tanstack/react-query";

import { queryClient } from "@/app/query-client";
import { tokenService } from "@/services/token.service";

import { registerUser } from "../api/auth.api";
import { authKeys } from "../api/auth.keys";
import type {
  AuthResponse,
  RegisterPayload,
} from "../types/auth.types";

export function useRegister() {
  return useMutation<
    AuthResponse,
    Error,
    RegisterPayload
  >({
    mutationFn: registerUser,

    onSuccess: (response) => {
      tokenService.setTokens(
        response.access_token,
        response.refresh_token,
      );

      queryClient.setQueryData(
        authKeys.currentUser(),
        response.user,
      );
    },
  });
}