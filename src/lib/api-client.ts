import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { tokenService } from "@/services/token.service";

import { apiBaseUrl, createApiClient } from "./create-api-client";

interface RetryableRequestConfig
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

export const apiClient = createApiClient();

apiClient.interceptors.request.use(
  (config) => {
    const accessToken =
      tokenService.getAccessToken();

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    /*
     * Do not manually set Content-Type for FormData.
     * Axios/browser will generate:
     *
     * multipart/form-data; boundary=...
     */
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (
      !config.headers["Content-Type"]
    ) {
      config.headers["Content-Type"] =
        "application/json";
    }

    return config;
  },
  (error: AxiosError) =>
    Promise.reject(error),
);

let refreshPromise: Promise<string> | null =
  null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken =
    tokenService.getRefreshToken();

  if (!refreshToken) {
    throw new Error(
      "Refresh token is missing",
    );
  }

  const response =
    await axios.post<RefreshResponse>(
      `${apiBaseUrl}/auth/refresh`,
      {
        refresh_token: refreshToken,
      },
      {
        headers: {
          "Content-Type":
            "application/json",
        },
        timeout: 15_000,
      },
    );

  tokenService.setTokens(
    response.data.access_token,
    response.data.refresh_token,
    { remember: tokenService.isRemembered() },
  );

  return response.data.access_token;
}

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as
        | RetryableRequestConfig
        | undefined;

    const isUnauthorized =
      error.response?.status === 401;

    const isAuthRequest =
      originalRequest?.url?.includes(
        "/auth/login",
      ) ||
      originalRequest?.url?.includes(
        "/auth/register",
      ) ||
      originalRequest?.url?.includes(
        "/auth/refresh",
      ) ||
      originalRequest?.url?.includes(
        "/auth/forgot-password",
      ) ||
      originalRequest?.url?.includes(
        "/auth/reset-password",
      );

    if (
      !isUnauthorized ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise =
          refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
      }

      const accessToken =
        await refreshPromise;

      originalRequest.headers.Authorization =
        `Bearer ${accessToken}`;

      /*
       * Preserve multipart upload headers when
       * retrying a FormData request after token refresh.
       */
      if (
        originalRequest.data instanceof
        FormData
      ) {
        delete originalRequest.headers[
          "Content-Type"
        ];
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      tokenService.clearTokens();

      if (
        window.location.pathname !==
        "/login"
      ) {
        window.location.replace("/login");
      }

      return Promise.reject(
        refreshError,
      );
    }
  },
);
