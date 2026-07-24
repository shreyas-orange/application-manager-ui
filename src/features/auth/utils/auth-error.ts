import axios from "axios";

import type {
  ApiErrorResponse,
  ValidationErrorItem,
} from "@/features/auth/types/api.types";

function extractValidationMessage(
  error: ValidationErrorItem,
): string | null {
  return error.message ?? error.msg ?? null;
}

export function getAuthErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return "An unexpected error occurred. Please try again.";
  }

  if (!error.response) {
    return "Unable to connect to the server. Check your internet connection.";
  }

  const status = error.response.status;
  const data = error.response.data;

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    const firstMessage = data.detail
      .map(extractValidationMessage)
      .find(Boolean);

    if (firstMessage) {
      return firstMessage;
    }
  }

  if (Array.isArray(data?.errors)) {
    const firstMessage = data.errors
      .map(extractValidationMessage)
      .find(Boolean);

    if (firstMessage) {
      return firstMessage;
    }
  }

  if (data?.message) {
    return data.message;
  }

  if (status === 401) {
    return "Invalid email or password.";
  }

  if (status === 403) {
    return "Your account does not have permission to continue.";
  }

  if (status === 409) {
    return "An account with this email already exists.";
  }

  if (status === 422) {
    return "The submitted information is invalid.";
  }

  if (status >= 500) {
    return "The server is currently unavailable. Please try again later.";
  }

  return "Authentication failed. Please try again.";
}