import { apiClient } from "@/lib/api-client";
import { apiBaseUrl } from "@/lib/create-api-client";
import { tokenService } from "@/services/token.service";

import type {
  AuthResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  LogoutResponse,
  RegisterPayload,
  ResetPasswordPayload,
  User,
} from "../types/auth.types";

export function getOrangeSsoLoginUrl(): string {
  const normalizedBaseUrl = apiBaseUrl.endsWith("/")
    ? apiBaseUrl
    : `${apiBaseUrl}/`;

  return new URL("auth/sso/login", normalizedBaseUrl).toString();
}

export async function loginUser(
  payload: LoginPayload,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/auth/login",
    {
      email: payload.email,
      password: payload.password,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/auth/register",
    payload,
  );

  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response =
    await apiClient.get<User>("usersme");

  return response.data;
}

export async function requestPasswordReset(
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    payload,
  );

  return response.data;
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<string> {
  const response = await apiClient.post<string>(
    "/auth/reset-password",
    payload,
  );

  return response.data;
}

export async function logoutUser(): Promise<LogoutResponse> {
  const refreshToken = tokenService.getRefreshToken();

  const response = await apiClient.post<LogoutResponse>(
    "/auth/logout",
    refreshToken
      ? {
          refresh_token: refreshToken,
        }
      : {},
  );

  return response.data;
}
