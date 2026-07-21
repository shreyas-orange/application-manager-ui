import { apiClient } from "@/lib/api-client";

import type {
  AuthResponse,
  LoginPayload,
  LogoutResponse,
  RegisterPayload,
  User,
} from "../types/auth.types";

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

export async function logoutUser(): Promise<LogoutResponse> {
  const refreshToken = localStorage.getItem(
    "application_manager_refresh_token",
  );

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