import type { AgingResponse } from "../../../types/finance";
import { fmtK, formatCrLakh, formatInr } from "../../../utils/format";

export type AgingUnit = AgingResponse["unit"];

// Non-finite / missing amounts render as 0 rather than "NaN" or "".
const finite = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);

// Compact axis / data-label form: volume as "450K", value as "40.5 Cr".
export const formatAgingCompact = (v: number, unit: AgingUnit): string =>
  unit === "INR" ? formatCrLakh(finite(v)) : fmtK(finite(v));

// Full raw figure for tooltips: "450,000 MT" / "₹4,05,00,00,000".
export const formatAgingFull = (v: number, unit: AgingUnit): string =>
  unit === "INR" ? formatInr(finite(v)) : `${Math.round(finite(v)).toLocaleString()} MT`;

// Y-axis title per the Figma: "MT" for volume, "Value" for value.
export const agingAxisTitle = (unit: AgingUnit): string => (unit === "INR" ? "Value" : "MT");

// Defensive copy of an API response: missing arrays become [], non-finite
// amounts become 0, each origin series is padded / trimmed to the bucket count,
// and an unknown unit falls back to MT. The charts only ever see this shape.
export const normalizeAging = (data: AgingResponse | undefined): AgingResponse | undefined => {
  if (!data) return undefined;
  const buckets = (Array.isArray(data.buckets) ? data.buckets : [])
    .filter((b) => b != null)
    .map((b) => ({ bucket: String(b.bucket ?? ""), amount: finite(b.amount) }));
  const originwise = (Array.isArray(data.originwise) ? data.originwise : [])
    .filter((o) => o != null)
    .map((o) => {
      const amounts = Array.isArray(o.amounts) ? o.amounts : [];
      return {
        origin: String(o.origin ?? ""),
        amounts: buckets.map((_, i) => finite(amounts[i])),
      };
    });
  return {
    measure: data.measure === "value" ? "value" : "volume",
    unit: data.unit === "INR" ? "INR" : "MT",
    buckets,
    originwise,
  };
};

// True when a settled response has nothing to plot (no buckets, no origins
// matched, or every bucket is zero) — the charts show an Empty state instead
// of flat bars.
export const isAgingEmpty = (data: AgingResponse | undefined): boolean =>
  !!data &&
  (data.buckets.length === 0 ||
    data.originwise.length === 0 ||
    data.buckets.every((b) => b.amount === 0));
