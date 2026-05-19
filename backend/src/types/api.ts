export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiEnvelope<T> {
  data?: T;
  meta?: Record<string, unknown>;
  error?: ApiError;
}

export const ok = <T>(data: T, meta?: Record<string, unknown>): ApiEnvelope<T> => ({
  data,
  ...(meta ? { meta } : {}),
});

export const fail = (code: string, message: string, details?: unknown): ApiEnvelope<never> => ({
  error: { code, message, ...(details === undefined ? {} : { details }) },
});
