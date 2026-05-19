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
