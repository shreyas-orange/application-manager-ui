import { useMutation } from "@tanstack/react-query";

import { queryClient } from "@/app/query-client";
import { tokenService } from "@/services/token.service";

import { loginUser } from "../api/auth.api";
import { authKeys } from "../api/auth.keys";
import type {
  AuthResponse,
  LoginPayload,
} from "../types/auth.types";

interface LoginVariables extends LoginPayload {
  remember?: boolean;
}

export function useLogin() {
  return useMutation<AuthResponse, Error, LoginVariables>({
    mutationFn: ({ email, password }) => loginUser({ email, password }),

    onSuccess: (response, variables) => {
      tokenService.setTokens(
        response.access_token,
        response.refresh_token,
        { remember: variables.remember },
      );

      queryClient.setQueryData(
        authKeys.currentUser(),
        response.user,
      );
    },
  });
}