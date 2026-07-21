import { useMutation } from "@tanstack/react-query";

import { queryClient } from "@/app/query-client";
import { tokenService } from "@/services/token.service";

import { loginUser } from "../api/auth.api";
import { authKeys } from "../api/auth.keys";
import type {
  AuthResponse,
  LoginPayload,
} from "../types/auth.types";

export function useLogin() {
  return useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: loginUser,

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