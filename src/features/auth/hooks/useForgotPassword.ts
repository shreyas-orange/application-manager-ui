import { useMutation } from "@tanstack/react-query";

import { requestPasswordReset } from "../api/auth.api";
import type {
  ForgotPasswordPayload,
  ForgotPasswordResponse,
} from "../types/auth.types";

export function useForgotPassword() {
  return useMutation<ForgotPasswordResponse, Error, ForgotPasswordPayload>({
    mutationFn: requestPasswordReset,
  });
}
