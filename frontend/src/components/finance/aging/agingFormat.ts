import type { AgingResponse } from "../../../types/finance";
import { fmtK, formatCrLakh, formatInr } from "../../../utils/format";

export type AgingUnit = AgingResponse["unit"];

// Compact axis / data-label form: volume as "450K", value as "40.5 Cr".
export const formatAgingCompact = (v: number, unit: AgingUnit): string =>
  unit === "INR" ? formatCrLakh(v) : fmtK(v);

// Full raw figure for tooltips: "450,000 MT" / "₹4,05,00,00,000".
export const formatAgingFull = (v: number, unit: AgingUnit): string =>
  unit === "INR" ? formatInr(v) : `${Math.round(v).toLocaleString()} MT`;

// Y-axis title per the Figma: "MT" for volume, "Value" for value.
export const agingAxisTitle = (unit: AgingUnit): string => (unit === "INR" ? "Value" : "MT");

// True when a settled response has nothing to plot (no origins matched, or
// every bucket is zero) — the charts show an Empty state instead of flat bars.
export const isAgingEmpty = (data: AgingResponse | undefined): boolean =>
  !!data && (data.originwise.length === 0 || data.buckets.every((b) => b.amount === 0));
