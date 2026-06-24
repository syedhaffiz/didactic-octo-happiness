// --- Filters ---------------------------------------------------------------

export interface FilterRef {
  id: string;
  name: string;
}

export interface GradeRef extends FilterRef {
  group_name: string;
}

export interface IndexNameRef {
  index_name: string; // short slug, e.g. "api4"
  code_id: string; // display code, e.g. "API 4"
}

export interface FiltersResponse {
  ports: FilterRef[];
  dischargePorts: FilterRef[];
  segments: FilterRef[];
  zones: FilterRef[];
  origins: FilterRef[];
  grades: GradeRef[];
  indexNames: IndexNameRef[];
}

// --- Envelope --------------------------------------------------------------

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
