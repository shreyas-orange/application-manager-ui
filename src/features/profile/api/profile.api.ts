import { apiClient } from "@/lib/api-client";

import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "../types/profile.types";

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
  const response = await apiClient.patch<ChangePasswordResponse>(
    "/users/change-password",
    payload,
  );

  return response.data;
}
