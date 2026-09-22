import type {
  InventoryDaysPortItem,
  InventoryDaysResponse,
  InventoryDaysSegmentItem,
} from "../types/finance.js";
import { PORT_LIST, SEGMENT_LIST } from "./catalog.js";
import { range, round, seedFromString, seeded } from "./rand.js";

// Segments shown on the Inventory Days screen, in Figma legend order (SNS / SEB).
// Slice/tile colors are owned by the UI and assigned by this order.
const SEGMENTS_ORDER = ["SNS", "SEB"] as const;

// Per-segment baseline for a ~1-month window: inventory days + holding value
// (whole-number rupees). Pinned so the default view reads like the Figma
// (SNS 18 days, SEB 24 days; ~170 Cr total value). The date range scales value.
const SEGMENT_BASELINE: Record<string, { days: number; value: number }> = {
  SNS: { days: 18, value: 970_000_000 }, // 97 Cr
  SEB: { days: 24, value: 730_000_000 }, // 73 Cr
};

const DAY_MS = 86_400_000;

// Look up a segment display name from its filter id (e.g. "sns" -> "SNS").
const segmentNameById = (id: string | undefined): string | undefined =>
  id ? SEGMENT_LIST.find((s) => s.id === id)?.name : undefined;

export const buildInventoryDays = (
  from: Date,
  to: Date,
  zone?: string,
  port?: string,
  origin?: string,
  segment?: string,
): InventoryDaysResponse => {
  // Scale the monthly value baseline by the selected window (relative to 30
  // days) so the donut responds to the date-range filter. Days are a rate, not a
  // total, so they stay put — only the holding value scales.
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY_MS));
  const factor = days / 30;

  // "all" (or missing) means no narrowing — normalise it away so it can't act
  // as a concrete value.
  const zoneKey = zone && zone !== "all" ? zone : undefined;
  const portKey = port && port !== "all" ? port : undefined;
  const originKey = origin && origin !== "all" ? origin : undefined;
  const segmentName = segmentNameById(segment && segment !== "all" ? segment : undefined);

  // Zone/origin nudge the figures so the view visibly responds to those filters
  // (seeded, so a given combination is stable across reloads).
  const rng = seeded(
    seedFromString(`inventory-days:${zoneKey ?? "all"}:${originKey ?? "all"}`),
  );
  const filterScale = 0.8 + rng() * 0.4; // 0.8 – 1.2

  const segments: InventoryDaysSegmentItem[] = SEGMENTS_ORDER.filter(
    (s) => !segmentName || s === segmentName,
  ).map((seg) => {
    const base = SEGMENT_BASELINE[seg] ?? { days: 0, value: 0 };
    return {
      segment: seg,
      days: Math.round(base.days * filterScale),
      value: Math.round(base.value * factor * filterScale),
      pct: 0,
      deltaVsBudget: round(8 + rng() * 10, 0), // +8 – +18
      deltaVsLastYear: -round(4 + rng() * 8, 0), // -4 – -12
    };
  });

  const totalValue = segments.reduce((s, it) => s + it.value, 0);
  for (const it of segments) {
    it.pct = totalValue > 0 ? round((it.value / totalValue) * 100, 1) : 0;
  }

  return {
    periodLabel: "Apr 25 : Feb 26",
    totalValue,
    totalDeltaVsBudget: round(8 + rng() * 8, 0),
    totalDeltaVsLastYear: -round(4 + rng() * 7, 0),
    segments,
    portwise: buildPortwise(portKey, filterScale),
  };
};

// Port Wise bars — inventory days per port. When a port filter is set only that
// port is returned; otherwise every port in the catalogue. Each port's days are
// seeded so they stay put across reloads.
const buildPortwise = (
  port: string | undefined,
  filterScale: number,
): InventoryDaysPortItem[] =>
  PORT_LIST.filter((p) => !port || p.id === port).map((p) => {
    const prng = seeded(seedFromString(`inventory-days:portwise:${p.id}`));
    return { port: p.name, days: Math.round(range(prng, 8, 42) * filterScale) };
  });
