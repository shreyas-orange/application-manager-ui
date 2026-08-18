import axios from "axios";

declare global {
  interface Window {
    __ENV__?: { API_BASE_URL?: string };
  }
}

// In a container, /env.js (written by the entrypoint script at container
// start) sets window.__ENV__ so one built image can move between
// environments without a rebuild. Locally (vite dev / vite preview) that
// file doesn't exist, so this falls back to the Vite build-time value.
const apiBaseUrl = window.__ENV__?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL;

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
