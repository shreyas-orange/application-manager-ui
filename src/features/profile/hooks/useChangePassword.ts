import { useMutation } from "@tanstack/react-query";

import { changePassword } from "../api/profile.api";
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "../types/profile.types";

export function useChangePassword() {
  return useMutation<ChangePasswordResponse, Error, ChangePasswordRequest>({
    mutationFn: changePassword,
  });
}
