import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is not configured");
}

/** Base axios instance shared by the authenticated and public API clients. */
export function createApiClient() {
  return axios.create({
    baseURL: apiBaseUrl,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    timeout: 15_000,
  });
}

export { apiBaseUrl };
