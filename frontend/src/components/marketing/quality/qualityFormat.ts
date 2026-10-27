import dayjs from "dayjs";
import type { QualityResponse, QualityTradeType } from "../../../types/marketing";

// A point as the chart sees it: any missing / non-finite reading becomes null
// (a gap in the line, "—" in the tooltip) rather than NaN.
export interface QualityChartPoint {
  date: string;
  plannedValue: number | null;
  loadPortValue: number | null;
  dischargePortValue: number | null;
  lpVariance: number | null;
  dpVariance: number | null;
  aggregateVariance: number | null;
}

export interface NormalizedQuality {
  tradeType: QualityTradeType;
  avgVarianceLp: number | null;
  avgVarianceDp: number | null;
  lastUpdated: string | null;
  points: QualityChartPoint[];
}

const finiteOrNull = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const validDate = (v: unknown): v is string => typeof v === "string" && dayjs(v).isValid();

// Defensive copy of an API response: a missing points array becomes [], points
// without a usable date are dropped, and every number is finite or null. The
// tiles and chart only ever see this shape.
export const normalizeQuality = (
  data: QualityResponse | undefined,
): NormalizedQuality | undefined => {
  if (!data) return undefined;
  const points = (Array.isArray(data.points) ? data.points : [])
    .filter((p) => p != null && validDate(p.date))
    .map((p) => ({
      date: p.date,
      plannedValue: finiteOrNull(p.plannedValue),
      loadPortValue: finiteOrNull(p.loadPortValue),
      dischargePortValue: finiteOrNull(p.dischargePortValue),
      lpVariance: finiteOrNull(p.lpVariance),
      dpVariance: finiteOrNull(p.dpVariance),
      aggregateVariance: finiteOrNull(p.aggregateVariance),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  return {
    tradeType: data.tradeType === "sales" ? "sales" : "purchase",
    avgVarianceLp: finiteOrNull(data.avgVarianceLp),
    avgVarianceDp: finiteOrNull(data.avgVarianceDp),
    lastUpdated: validDate(data.lastUpdated) ? data.lastUpdated : null,
    points,
  };
};

// KPI value: "99%" on the tile, "98.74%" on hover; "—" when there is no data.
export const formatPct = (v: number | null): string => (v == null ? "—" : `${Math.round(v)}%`);
export const formatPctFull = (v: number | null): string | undefined =>
  v == null ? undefined : `${v.toFixed(2)}%`;

export const formatQualityDate = (iso: string | null): string =>
  iso ? dayjs(iso).format("DD-MMM-YY") : "—";

// Whole kcal/kg figure, or "—" when missing.
export const formatGcv = (v: number | null): string => (v == null ? "—" : String(Math.round(v)));
