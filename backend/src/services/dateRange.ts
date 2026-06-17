import { DEFAULT_RANGE } from "../mocks/catalog.js";
import { HttpError } from "../middleware/errorHandler.js";
import type { DateRange } from "../types/finance.js";

// Parses the API's `fromDate` / `toDate` ("YYYY-MM-DD") params into a DateRange
// of JS Dates. Returns the default Apr 2025–Feb 2026 window when either is
// omitted (callers can still pass one and rely on the default for the other).
export const parseDateRange = (
  fromRaw: string | undefined,
  toRaw: string | undefined,
): DateRange => {
  if (!fromRaw && !toRaw) {
    return { from: DEFAULT_RANGE.from, to: DEFAULT_RANGE.to };
  }

  const fromStr = fromRaw ?? `${DEFAULT_RANGE.from.toISOString().slice(0, 10)}`;
  const toStr = toRaw ?? `${DEFAULT_RANGE.to.toISOString().slice(0, 10)}`;

  const from = new Date(`${fromStr}T00:00:00Z`);
  const to = new Date(`${toStr}T23:59:59Z`);
  if (Number.isNaN(from.getTime())) {
    throw new HttpError(400, "bad_date_range", "fromDate must be YYYY-MM-DD");
  }
  if (Number.isNaN(to.getTime())) {
    throw new HttpError(400, "bad_date_range", "toDate must be YYYY-MM-DD");
  }
  if (from > to) {
    throw new HttpError(400, "bad_date_range", "fromDate is after toDate");
  }
  return { from, to };
};
