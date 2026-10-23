import type {
  InventoryDaysFilterOptions,
  InventoryDaysFilters,
  InventoryDaysPortItem,
  InventoryDaysResponse,
  InventoryDaysSegmentItem,
} from "../types/finance.js";
import { ORIGIN_LIST, PORT_LIST, SEGMENT_LIST, ZONE_LIST } from "./catalog.js";
import { csvList } from "./csv.js";
import { range, round, seedFromString, seeded } from "./rand.js";

// Segments shown on the Inventory Days screen, in Figma legend order (SNS / SEB).
// Slice/tile colors are owned by the UI and assigned by this order.
const SEGMENTS_ORDER = ["SNS", "SEB"] as const;

// Per-segment snapshot baseline: inventory days + holding value (whole-number
// rupees). Pinned so the default view reads like the Figma (SNS 18 days,
// SEB 24 days; ~170 Cr total value).
const SEGMENT_BASELINE: Record<string, { days: number; value: number }> = {
  SNS: { days: 18, value: 970_000_000 }, // 97 Cr
  SEB: { days: 24, value: 730_000_000 }, // 73 Cr
};

// Segment display names for a list of filter ids (e.g. ["sns"] -> ["SNS"]).
// Unknown ids are dropped.
const segmentNamesByIds = (ids: string[]): string[] =>
  SEGMENT_LIST.filter((s) => ids.includes(s.id)).map((s) => s.name);

export const buildInventoryDays = (p: InventoryDaysFilters = {}): InventoryDaysResponse => {
  const timeFrame = p.timeFrame ?? "7d";
  // Multi-select filters arrive comma-joined; an empty list means "All".
  const zones = csvList(p.zone);
  const ports = csvList(p.port);
  const origins = csvList(p.origin);
  const segmentIds = csvList(p.segment);
  const segmentNames = segmentNamesByIds(segmentIds);
  // Sorted so "aus,sa" and "sa,aus" seed the same figures.
  const zoneKey = zones.length ? [...zones].sort().join(",") : undefined;
  const originKey = origins.length ? [...origins].sort().join(",") : undefined;
  const monthKey = p.month && /^\d{4}-\d{2}$/.test(p.month) ? p.month : "default";

  // Inventory days and holding value are snapshot metrics, so the look-back
  // window does NOT accumulate them (unlike the flow-based Revenue screen). The
  // time frame / month / zone / origin instead seed a gentle variation so the
  // view visibly responds to the filters while staying near the design baseline
  // (~170 Cr total; SNS 18 / SEB 24 days).
  const rng = seeded(
    seedFromString(
      `inventory-days:${timeFrame}:${monthKey}:${zoneKey ?? "all"}:${originKey ?? "all"}`,
    ),
  );
  const valueScale = 0.85 + rng() * 0.3; // 0.85 – 1.15
  // Days only shift once a zone/origin narrows the view; the all-up default
  // shows the baseline figures exactly, as in the design.
  const narrowed = Boolean(zoneKey || originKey);
  const daysScale = narrowed ? 0.8 + rng() * 0.4 : 1;

  // A segment selection that matches none of the shown segments (unknown ids,
  // or only segments without inventory) yields an empty list, not an error.
  const segments: InventoryDaysSegmentItem[] = SEGMENTS_ORDER.filter(
    (s) => segmentIds.length === 0 || segmentNames.includes(s),
  ).map((seg) => {
    const base = SEGMENT_BASELINE[seg] ?? { days: 0, value: 0 };
    return {
      segment: seg,
      days: Math.round(base.days * daysScale),
      value: Math.round(base.value * valueScale),
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
    portwise: buildPortwise(ports, narrowed ? daysScale : 1),
  };
};

// Port Wise bars — inventory days per port. When ports are selected only those
// are returned; otherwise every port in the catalogue. Each port's days are
// seeded so they stay put across reloads; `scale` nudges them when a zone/origin
// filter narrows the view.
const buildPortwise = (ports: string[], scale: number): InventoryDaysPortItem[] =>
  PORT_LIST.filter((p) => ports.length === 0 || ports.includes(p.id)).map((p) => {
    const prng = seeded(seedFromString(`inventory-days:portwise:${p.id}`));
    return { port: p.name, days: Math.round(range(prng, 8, 42) * scale) };
  });

// Filters side-panel options (GET /finance/inventory-days/filters).
export const buildInventoryDaysFilterOptions = (): InventoryDaysFilterOptions => ({
  zones: [...ZONE_LIST],
  ports: [...PORT_LIST],
  origins: [...ORIGIN_LIST],
  segments: [...SEGMENT_LIST],
});
