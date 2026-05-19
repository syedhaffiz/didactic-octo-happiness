import { DEFAULT_RANGE } from "../mocks/catalog.js";
import { HttpError } from "../middleware/errorHandler.js";
import type { DateRange } from "../types/finance.js";

// Accepts "YYYY-MM-DD:YYYY-MM-DD". Returns the default Apr 2025–Feb 2026 window when omitted.
export const parseDateRange = (raw: string | undefined): DateRange => {
  if (!raw) return { from: DEFAULT_RANGE.from, to: DEFAULT_RANGE.to };

  const parts = raw.split(":");
  if (parts.length !== 2) {
    throw new HttpError(400, "bad_date_range", "dateRange must be YYYY-MM-DD:YYYY-MM-DD");
  }
  const [fromStr, toStr] = parts;
  const from = new Date(`${fromStr}T00:00:00Z`);
  const to = new Date(`${toStr}T23:59:59Z`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new HttpError(400, "bad_date_range", "dateRange contains invalid dates");
  }
  if (from > to) {
    throw new HttpError(400, "bad_date_range", "dateRange 'from' is after 'to'");
  }
  return { from, to };
};
