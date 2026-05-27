import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiEnvelope } from "../types/api";
import { getAccessToken } from "../auth/token";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// --- Auth interceptors -----------------------------------------------------

// Request: attach a bearer token from MSAL on every outbound call. Silent
// acquisition uses the in-memory token cache so it's effectively free after
// the first call.
apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// Marker on the request config so a single failure → refresh → retry chain
// can't loop. Without this, a backend that always returns 401 would spin
// indefinitely.
interface RetryConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

// Response: on 401, force a fresh token (cache may be stale, token may have
// been revoked, scopes may have changed) and retry the request once. If that
// still fails, fall through to the caller — the auth template will redirect
// to login on the next render.
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retried) {
      original._retried = true;
      try {
        const fresh = await getAccessToken({ forceRefresh: true });
        if (fresh) {
          original.headers.set("Authorization", `Bearer ${fresh}`);
          return apiClient(original);
        }
      } catch {
        // fall through — propagate the original 401 to the caller
      }
    }

    return Promise.reject(error);
  },
);

// --- Envelope helpers ------------------------------------------------------

export const unwrap = <T>(response: AxiosResponse<ApiEnvelope<T>>): T => {
  const { data } = response;
  if (data.error) {
    throw new Error(`${data.error.code}: ${data.error.message}`);
  }
  if (data.data === undefined) {
    throw new Error("Empty response payload");
  }
  return data.data;
};

export const getHealth = async (): Promise<{ status: string; uptime: number }> => {
  const res = await apiClient.get<ApiEnvelope<{ status: string; uptime: number }>>("/health");
  return unwrap(res);
};
