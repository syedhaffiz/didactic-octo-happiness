import type {
  AgingBucketItem,
  AgingFilters,
  AgingMeasure,
  AgingOriginSeries,
  AgingResponse,
} from "../types/finance.js";
import { DEFAULT_RANGE, MINE_LIST, ORIGIN_LIST } from "./catalog.js";
import { range, seedFromString, seeded } from "./rand.js";

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

// "all" (or missing) means no narrowing — normalise it away so it can't act as
// a concrete value.
const concrete = (v: string | undefined): string | undefined =>
  v && v !== "all" ? v : undefined;

// Seeded share in [0.35, 0.75] for a narrowing filter, so each concrete
// selection shrinks the totals by a stable amount across reloads.
const narrowShare = (key: string, value: string | undefined): number =>
  value ? range(seeded(seedFromString(`aging:${key}:${value}`)), 0.35, 0.75) : 1;

export const buildAging = (from: Date, to: Date, filters: AgingFilters = {}): AgingResponse => {
  const measure: AgingMeasure = filters.measure ?? "volume";

  // Scale the full-window baseline by the selected window so the charts respond
  // to the date-range filter (clamped so tiny / huge ranges stay readable).
  const windowDays = Math.max(1, (to.getTime() - from.getTime()) / DAY_MS);
  const windowFactor = Math.min(1.5, Math.max(0.05, windowDays / DEFAULT_WINDOW_DAYS));

  const zone = concrete(filters.zone);
  const port = concrete(filters.port);
  const segment = concrete(filters.segment);
  const origin = concrete(filters.origin);
  const mineId = concrete(filters.mine);

  // A mine pins its origin. An unknown mine, or one outside the selected
  // origin, matches nothing — the response comes back empty, not an error.
  const mine = mineId ? MINE_LIST.find((m) => m.id === mineId) : undefined;
  const origins = ORIGIN_LIST.map((o, idx) => ({ ...o, idx })).filter(
    (o) =>
      (!origin || o.id === origin) &&
      (!mineId || (mine !== undefined && mine.origin === o.id)),
  );

  const scale =
    windowFactor *
    narrowShare("zone", zone) *
    narrowShare("port", port) *
    narrowShare("segment", segment) *
    narrowShare("mine", mineId);

  const originwise: AgingOriginSeries[] = origins.map((o) => {
    const rng = seeded(seedFromString(`aging:origin:${o.id}`));
    const price = PRICE_PER_MT[o.id] ?? DEFAULT_PRICE_PER_MT;
    const amounts = AGING_BUCKETS.map((_, b) => {
      const mix = ORIGIN_MIX[b] ?? [];
      const mixTotal = mix.reduce((s, w) => s + w, 0) || 1;
      const share = (mix[o.idx] ?? 0) / mixTotal;
      const jitter = range(rng, 0.85, 1.15);
      const volume = (BUCKET_VOLUME_BASELINE[b] ?? 0) * share * jitter * scale;
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
