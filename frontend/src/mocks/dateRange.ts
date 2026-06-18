import { DEFAULT_RANGE } from "./catalog";

// Parse the API's `fromDate` / `toDate` strings ("YYYY-MM-DD") into a Date
// pair, falling back to the catalog's default window when either is missing
// or invalid. Mirrors backend/src/services/dateRange.ts but is lenient — mocks
// shouldn't throw on bad input; they just degrade to the default.
export const parseRange = (
  fromRaw: string | undefined,
  toRaw: string | undefined,
): { from: Date; to: Date } => {
  const from = fromRaw ? new Date(`${fromRaw}T00:00:00Z`) : DEFAULT_RANGE.from;
  const to = toRaw ? new Date(`${toRaw}T23:59:59Z`) : DEFAULT_RANGE.to;
  return {
    from: Number.isNaN(from.getTime()) ? DEFAULT_RANGE.from : from,
    to: Number.isNaN(to.getTime()) ? DEFAULT_RANGE.to : to,
  };
};
