import { useMutation } from "@tanstack/react-query";

import { resetPassword } from "../api/auth.api";
import type { ResetPasswordPayload } from "../types/auth.types";

export function useResetPassword() {
  return useMutation<string, Error, ResetPasswordPayload>({
    mutationFn: resetPassword,
  });
}
