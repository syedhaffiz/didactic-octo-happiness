// Single switch for choosing where data is loaded from.
//
// `true`  → the frontend serves Inventory data from in-memory mock generators
//           in `src/mocks/`. Useful while the backend team is still building
//           the real endpoints — the UI works fully offline.
// `false` → the frontend calls the real API via axios (see `client.ts`).
//
// Flip this to `false` once the backend endpoints listed in
// `src/mocks/inventory.ts` are live.
//
// You can also override per-environment without editing this file by setting
// `VITE_USE_MOCK_DATA=true|false` in `.env.local`.
const ENV_OVERRIDE = import.meta.env.VITE_USE_MOCK_DATA;

export const USE_MOCK_DATA: boolean = ENV_OVERRIDE === undefined ? true : ENV_OVERRIDE === "true";

// Simulated network latency for mock responses so loading skeletons still
// render the way they would against a real API. Set to 0 for instant.
export const MOCK_LATENCY_MS = 2000;

export const mockDelay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), MOCK_LATENCY_MS));
