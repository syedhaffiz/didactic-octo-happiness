import axios, { type AxiosResponse } from "axios";
import type { ApiEnvelope } from "../types/api";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

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
