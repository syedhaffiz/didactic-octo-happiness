// Mirror of backend/src/mocks/aging.ts. Kept in sync so flipping USE_MOCK_DATA
// is the only change needed to switch over to the real API.

import type {
  AgingBucketItem,
  AgingFilterOptions,
  AgingFilters,
  AgingMeasure,
  AgingOriginSeries,
  AgingResponse,
} from "../../types/finance";
import {
  DEFAULT_RANGE,
  MINE_LIST,
  ORIGIN_LIST,
  PORT_LIST,
  SEGMENT_LIST,
  ZONE_LIST,
} from "../catalog";
import { range, seedFromString, seeded } from "../rand";
import { parseRange } from "../dateRange";

// Age buckets, oldest last — the x-axis of both Aging charts.
export const AGING_BUCKETS = [
  "0 - 30 Days",
  "30 - 90 Days",
  "90 - 180 Days",
  "180 - 365 Days",
  "365 - 730 Days",
  "730+ Days",
] as const;

// Total volume (MT) per bucket over the full default window. Pinned so the
// unfiltered view reads like the Figma (450K / 280K / 120K / 65K / 30K / 12K).
const BUCKET_VOLUME_BASELINE = [450_000, 280_000, 120_000, 65_000, 30_000, 12_000];

// Relative origin mix per bucket, in ORIGIN_LIST order (INDO, AUS, SA, RUS,
// USA). Shaped after the Figma's Origin Wise chart: fresh stock skews to INDO /
// AUS, older stock to RUS / USA. Normalised per bucket, then jittered.
const ORIGIN_MIX: number[][] = [
  [135, 105, 67, 37, 22],
  [118, 133, 58, 22, 10],
  [55, 85, 98, 30, 8],
  [30, 45, 72, 48, 15],
  [12, 26, 38, 58, 12],
  [3, 12, 15, 35, 27],
];

// Landed value per metric tonne (base rupees) by origin id — converts volume
// into the Value measure so the two views differ in shape, not just scale.
const PRICE_PER_MT: Record<string, number> = {
  indo: 6_500,
  aus: 11_000,
  sa: 9_000,
  rus: 8_500,
  usa: 9_500,
};
const DEFAULT_PRICE_PER_MT = 8_000;

const DAY_MS = 86_400_000;
const DEFAULT_WINDOW_DAYS = (DEFAULT_RANGE.to.getTime() - DEFAULT_RANGE.from.getTime()) / DAY_MS;

// Multi-select filters arrive comma-joined ("zone-1,zone-2"). Blank entries and
// "all" mean no narrowing, so they're dropped; an empty list means "All".
const csvList = (v: string | undefined): string[] =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && s !== "all");

// Seeded share in [0.35, 0.75] for one concrete filter value, stable across
// reloads. A multi-value selection adds its members' shares (capped at 1), so
// picking more values never shrinks the totals.
const narrowShare = (key: string, values: string[]): number =>
  values.length === 0
    ? 1
    : Math.min(
        1,
        values.reduce(
          (sum, v) => sum + range(seeded(seedFromString(`aging:${key}:${v}`)), 0.35, 0.75),
          0,
        ),
      );

export const buildAging = (filters: AgingFilters = {}): AgingResponse => {
  const { from, to } = parseRange(filters.fromDate, filters.toDate);
  const measure: AgingMeasure = filters.measure ?? "volume";

  // Scale the full-window baseline by the selected window so the charts respond
  // to the date-range filter (clamped so tiny / huge ranges stay readable).
  const windowDays = Math.max(1, (to.getTime() - from.getTime()) / DAY_MS);
  const windowFactor = Math.min(1.5, Math.max(0.05, windowDays / DEFAULT_WINDOW_DAYS));

  const originIds = csvList(filters.origin);
  const mineIds = csvList(filters.mine);

  // Each mine pins its origin, so a mine selection limits the origins too.
  // Unknown mine ids are ignored; if none of the picked mines is known, or
  // none sits in a picked origin, nothing matches — the response comes back
  // empty rather than erroring.
  const mines = MINE_LIST.filter((m) => mineIds.includes(m.id));
  const origins = ORIGIN_LIST.map((o, idx) => ({ ...o, idx })).filter(
    (o) =>
      (originIds.length === 0 || originIds.includes(o.id)) &&
      (mineIds.length === 0 || mines.some((m) => m.origin === o.id)),
  );

  const scale =
    windowFactor *
    narrowShare("zone", csvList(filters.zone)) *
    narrowShare("port", csvList(filters.port)) *
    narrowShare("segment", csvList(filters.segment));

  const originwise: AgingOriginSeries[] = origins.map((o) => {
    const rng = seeded(seedFromString(`aging:origin:${o.id}`));
    const price = PRICE_PER_MT[o.id] ?? DEFAULT_PRICE_PER_MT;
    // Only the picked mines' slice of this origin's stock counts.
    const mineShare = narrowShare(
      "mine",
      mines.filter((m) => m.origin === o.id).map((m) => m.id),
    );
    const amounts = AGING_BUCKETS.map((_, b) => {
      const mix = ORIGIN_MIX[b] ?? [];
      const mixTotal = mix.reduce((s, w) => s + w, 0) || 1;
      const share = (mix[o.idx] ?? 0) / mixTotal;
      const jitter = range(rng, 0.85, 1.15);
      const volume = (BUCKET_VOLUME_BASELINE[b] ?? 0) * share * jitter * scale * mineShare;
      return Math.round(measure === "value" ? volume * price : volume);
    });
    return { origin: o.name, amounts };
  });

  // Bucket totals are summed from the (rounded) origin series so the two
  // charts always agree.
  const buckets: AgingBucketItem[] = AGING_BUCKETS.map((bucket, b) => ({
    bucket,
    amount: originwise.reduce((s, o) => s + (o.amounts[b] ?? 0), 0),
  }));

  return {
    measure,
    unit: measure === "value" ? "INR" : "MT",
    buckets,
    originwise,
  };
};

// Filters side-panel options. Mines drop their origin link — only id + name
// cross the wire.
export const buildAgingFilterOptions = (): AgingFilterOptions => ({
  zones: [...ZONE_LIST],
  ports: [...PORT_LIST],
  origins: [...ORIGIN_LIST],
  segments: [...SEGMENT_LIST],
  mines: MINE_LIST.map(({ id, name }) => ({ id, name })),
});
