// Deterministic mock data for the Marketing module. Seeded so fixtures are
// stable across runs. Mirrored in frontend/src/mocks/marketing.ts.

import { seeded, seedFromString, range, round } from "./rand.js";
import {
  ADDRESSABLE_LIST,
  CATEGORY_LIST,
  FISCAL_YEAR_LIST,
  INDUSTRY_LIST,
  ORIGIN_LIST,
  PORT_LIST,
  RECEIVER_NAME_LIST,
  SEGMENT_LIST,
  SHARE_LIST,
  SHIPPER_NAME_LIST,
  ZONE_LIST,
} from "./catalog.js";
import type {
  IndexCadence,
  IndexChart,
  IndexMovementResponse,
  IndexRange,
  IndexSeries,
  MarketShareFilters,
  MarketShareFilterOptions,
  MarketSharePairedResponse,
  MarketShareQuarterwiseResponse,
  MarketShareSplitResponse,
  PairedBarRow,
  OceanFreightResponse,
  FreightChart,
  FreightSeries,
  TargetResponse,
  BarRow,
  BudgetActualRow,
  OceanFreightFilters,
  TargetFilters,
} from "../types/marketing.js";

// --- shared helpers --------------------------------------------------------

// Anchor date — the figma exports show dates in May 2026, so we pin "today"
// at end-May 2026 to keep the mocks reading the same as the design.
const ANCHOR = new Date(Date.UTC(2026, 4, 31));

const pad = (n: number) => String(n).padStart(2, "0");
const ddmmyy = (d: Date) =>
  `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${String(d.getUTCFullYear()).slice(-2)}`;

const addDays = (d: Date, days: number) => {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
};

// Categories for the new Index Movement screen. Daily produces 30/60 single
// DD/MM/YY labels; weekly produces 4/8 "DD/MM/YY - DD/MM/YY" intervals.
const indexCategories = (cadence: IndexCadence, r: IndexRange): string[] => {
  const months = r === "2" ? 2 : 1;
  if (cadence === "daily") {
    const total = months * 30;
    return Array.from({ length: total }, (_, i) =>
      ddmmyy(addDays(ANCHOR, -(total - 1 - i))),
    );
  }
  // Weekly — anchor weeks end on the anchor date.
  const weeks = months * 4;
  return Array.from({ length: weeks }, (_, i) => {
    const end = addDays(ANCHOR, -7 * (weeks - 1 - i));
    const start = addDays(end, -6);
    return `${ddmmyy(start)} - ${ddmmyy(end)}`;
  });
};

// Bell-shaped series: low at the ends, peak in the middle (matches the Figma
// curves). `jitter` adds a little deterministic noise per point.
const bell = (
  rng: () => number,
  n: number,
  base: number,
  amp: number,
  jitter: number,
  decimals = 2,
): number[] =>
  Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    const shape = Math.sin(Math.PI * t);
    return round(base + amp * shape + (rng() - 0.5) * jitter, decimals);
  });

// --- Index Movement --------------------------------------------------------

// Per-chart spec: which display title, which cadence, and which numbered
// lines to draw (e.g. ICI 1..5, API 2 + API 4, API 3 + API 5).
interface IndexSpec {
  title: string;
  cadence: IndexCadence;
  prefix: "ICI" | "API";
  // Numbers (e.g. [1,2,3,4,5] for ICI, [2,4] for API Daily, [3,5] for API Weekly)
  numbers: number[];
  // Per-number base + amplitude, indexed by (number - 1). Keeps each named
  // line at a believable, distinct level across renders.
  bases: number[];
  amps: number[];
}

const INDEX_SPECS: Record<string, IndexSpec> = {
  ici: {
    title: "ICI Index",
    cadence: "weekly",
    prefix: "ICI",
    numbers: [1, 2, 3, 4, 5],
    bases: [59, 50, 45, 38, 33],
    amps: [21, 18, 17, 17, 18],
  },
  "api-daily": {
    title: "API Index",
    cadence: "daily",
    prefix: "API",
    numbers: [2, 4],
    // Element [n-1] used per line — indices 1 and 3 are the live ones here.
    bases: [0, 60, 0, 50, 0],
    amps:  [0, 22, 0, 18, 0],
  },
  "api-weekly": {
    title: "API Index",
    cadence: "weekly",
    prefix: "API",
    numbers: [3, 5],
    bases: [0, 0, 72, 0, 60],
    amps:  [0, 0, 14, 0, 16],
  },
};

export const INDEX_CODES = Object.keys(INDEX_SPECS);

export const buildOneIndexChart = (code: string, r: IndexRange): IndexChart | null => {
  const spec = INDEX_SPECS[code];
  if (!spec) return null;
  const rng = seeded(seedFromString(`mkt-idx-${code}-${r}`));
  const cats = indexCategories(spec.cadence, r);
  const series: IndexSeries[] = spec.numbers.map((n) => ({
    name: `${spec.prefix} ${n}`,
    data: bell(rng, cats.length, spec.bases[n - 1] ?? 50, spec.amps[n - 1] ?? 18, 2.5),
  }));
  return {
    code,
    title: spec.title,
    cadence: spec.cadence,
    range: r,
    categories: cats,
    series,
  };
};

export const buildIndexMovement = (r: IndexRange): IndexMovementResponse => ({
  items: INDEX_CODES.map((c) => buildOneIndexChart(c, r)).filter((c): c is IndexChart => c !== null),
});


// --- Market Share ----------------------------------------------------------
// Seven independently-fetched cards. Every builder seeds its RNG from the full
// filter set (via `seedFor`) so changing any filter deterministically shifts
// the numbers — a stand-in for the per-query re-aggregation a real backend
// would do. `own` = the client's own volume; `nonOwn` = competitors (display
// labels applied by the UI).

const MMT = "MMT";
const FISCAL_YEARS = ["FY 2022-23", "FY 2023-24", "FY 2024-25", "FY 2025-26"];

// One RNG seeded from the card key + the whole filter object.
const seedFor = (f: MarketShareFilters, key: string) =>
  seeded(seedFromString(`mkt-share-${key}-${JSON.stringify(f)}`));

const roundStep = (n: number, step: number) => Math.round(n / step) * step;

// Grouped own/non-own rows whose magnitudes step across categories via
// per-category `weights` (keeps the descending shape seen in the Figma), with
// a little deterministic jitter so filter changes are visible.
const weightedRows = (
  f: MarketShareFilters,
  key: string,
  categories: string[],
  ownBase: number,
  nonBase: number,
  weights: number[],
  step = 1,
): PairedBarRow[] => {
  const rng = seedFor(f, key);
  return categories.map((category, i) => {
    const w = weights[i] ?? 1;
    return {
      category,
      own: roundStep(ownBase * w * range(rng, 0.85, 1.15), step),
      nonOwn: roundStep(nonBase * w * range(rng, 0.85, 1.15), step),
    };
  });
};

// Grouped rows drawn from flat [lo, hi] ranges (used where the Figma bars are
// noisy rather than smoothly descending, e.g. Port Wise).
const rangeRows = (
  f: MarketShareFilters,
  key: string,
  categories: string[],
  own: [number, number],
  non: [number, number],
  step = 1,
): PairedBarRow[] => {
  const rng = seedFor(f, key);
  return categories.map((category) => ({
    category,
    own: roundStep(range(rng, own[0], own[1]), step),
    nonOwn: roundStep(range(rng, non[0], non[1]), step),
  }));
};

// Card 1 — Market Share Split (aggregate donut, MMT).
export const buildMarketShareSplit = (
  f: MarketShareFilters = {},
): MarketShareSplitResponse => {
  const rng = seedFor(f, "split");
  const own = round(range(rng, 150, 240), 2);
  const nonOwn = round(range(rng, 380, 460), 2);
  return { unit: MMT, own, nonOwn, total: round(own + nonOwn, 2) };
};

// Card 2 — Import Quantity (MMT) by fiscal year.
export const buildImportQuantity = (
  f: MarketShareFilters = {},
): MarketSharePairedResponse => ({
  unit: MMT,
  rows: weightedRows(f, "import-qty", FISCAL_YEARS, 40, 86, [1.1, 1.08, 0.98, 0.8]),
});

// Card 3 — Market Share by Category.
const CATEGORIES = ["Trader", "End User", "Trader cum End-User"];
export const buildByCategory = (
  f: MarketShareFilters = {},
): MarketSharePairedResponse => ({
  unit: MMT,
  rows: weightedRows(f, "by-category", CATEGORIES, 263, 396, [1, 0.6, 0.04]),
});

// Card 4 — Quarterwise Import (QTR-1..4 × fiscal year).
const QUARTERS = ["QTR - 1", "QTR - 2", "QTR - 3", "QTR - 4"];
export const buildQuarterwise = (
  f: MarketShareFilters = {},
): MarketShareQuarterwiseResponse => ({
  unit: MMT,
  groups: QUARTERS.map((quarter, qi) => ({
    quarter,
    rows: weightedRows(f, `qtr-${qi}`, FISCAL_YEARS, 19, 20, [1, 1, 1, 1]),
  })),
});

// Card 5 — Industry Wise Import.
const INDUSTRIES = ["Cement", "Chemical", "Power", "Retail", "SEB", "Sponge"];
export const buildIndustrywise = (
  f: MarketShareFilters = {},
): MarketSharePairedResponse => ({
  unit: MMT,
  rows: weightedRows(f, "industry", INDUSTRIES, 29, 40, [0.17, 0.12, 1, 0.9, 0.1, 0.55]),
});

// Card 6 — Origin Wise Import.
const ORIGINS = ["Aust", "INDO", "MOZBQ", "Others", "RSA", "Russia", "USA"];
export const buildOriginwise = (
  f: MarketShareFilters = {},
): MarketSharePairedResponse => ({
  unit: MMT,
  rows: weightedRows(f, "origin", ORIGINS, 23, 45, [0.15, 0.09, 1, 0.8, 0.09, 0.55, 0.49]),
});

// Card 7 — Port Wise (taller scale, MT).
const MS_PORTS = [
  "Mundra", "PAHD", "Bedi", "Paradip", "Talabira", "Dahej", "Navlakhi", "Dhamra",
  "Dharamtar", "Gangavaram", "Goa", "Gopalpur", "Haldia", "Hazira", "Kakinada",
  "Karaikal", "Krishnapatnam", "MHDA", "Tuticorin",
];
export const buildPortwise = (
  f: MarketShareFilters = {},
): MarketSharePairedResponse => ({
  unit: "MT",
  rows: rangeRows(f, "portwise", MS_PORTS, [20000, 220000], [40000, 420000], 1000),
});

// Dropdown option lists for the Filters side-panel. Quarter is a fixed frontend
// list (Q1–Q4), so it is intentionally omitted.
export const buildMarketShareFilterOptions = (): MarketShareFilterOptions => ({
  fiscalYears: [...FISCAL_YEAR_LIST],
  shares: [...SHARE_LIST],
  zones: [...ZONE_LIST],
  ports: [...PORT_LIST],
  origins: [...ORIGIN_LIST],
  segments: [...SEGMENT_LIST],
  addressable: [...ADDRESSABLE_LIST],
  industries: [...INDUSTRY_LIST],
  categories: [...CATEGORY_LIST],
  shipperNames: [...SHIPPER_NAME_LIST],
  receiverNames: [...RECEIVER_NAME_LIST],
});

// --- Ocean Freight ---------------------------------------------------------

// The full catalogue of vessel-type charts. How many a given port returns is
// derived per port below — the page renders whatever count comes back rather
// than assuming a fixed Capes/Panamax pair.
interface VesselSpec {
  vesselType: string;
  series: string[];
  baseTop: number;
}
const VESSEL_SPECS: VesselSpec[] = [
  { vesselType: "Capes", series: ["Samarinda", "Abbotpoint", "RBCT", "US Balti CNX"], baseTop: 8.6 },
  { vesselType: "Panamax", series: ["Samarinda", "Abbotpoint", "RBCT"], baseTop: 8.0 },
  { vesselType: "Supramax", series: ["Samarinda", "Abbotpoint"], baseTop: 7.4 },
  { vesselType: "Handymax", series: ["Samarinda", "RBCT"], baseTop: 7.0 },
];

// Deterministic per-port chart count (2..VESSEL_SPECS.length) so a given
// discharge port always returns the same set across reloads.
const portVesselCount = (port: string): number => {
  const rng = seeded(seedFromString(`mkt-freight-count-${port}`));
  return 2 + Math.floor(rng() * (VESSEL_SPECS.length - 1));
};

const freightChart = (spec: VesselSpec, port: string): FreightChart => {
  const rng = seeded(seedFromString(`mkt-freight-${spec.vesselType}-${port}`));
  const cats = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
  const series: FreightSeries[] = spec.series.map((name, idx) => ({
    name,
    data: bell(rng, cats.length, spec.baseTop - idx * 0.18, 0.4, 0.06, 2),
  }));
  return { vesselType: spec.vesselType, unit: "$/MT", categories: cats, series };
};

export const buildOceanFreight = (f: OceanFreightFilters = {}): OceanFreightResponse => {
  const port = f.dischargePort ?? "hazira";
  return {
    dischargePort: port,
    items: VESSEL_SPECS.slice(0, portVesselCount(port)).map((spec) => freightChart(spec, port)),
  };
};

// --- Target above 2% -------------------------------------------------------

const TARGET_PORTS = [
  "Mundra", "PHJD", "Bedi", "Paradip", "Talabira", "Dahej", "Navsadhi", "Dhamra",
  "Dharamtar", "Gangavaram", "Goa", "Gopalpur", "Hadia", "Hazira", "Kakinada",
  "Karaikal", "Krishnapatnam", "MHDA", "Tuticorin",
];
const TARGET_ORIGINS = ["AUS", "INDO", "AUS", "DOMESTIC", "RSA", "USA"];
const TARGET_SEGMENTS = ["TPH", "SNS", "SEB", "Sagarmala", "Old", "CIF Handling"];

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export const buildTarget = (f: TargetFilters = {}): TargetResponse => {
  const seed = `${f.fromDate ?? ""}-${f.toDate ?? ""}`;

  const rngP = seeded(seedFromString(`mkt-target-port-${seed}`));
  const portwise: BarRow[] = TARGET_PORTS.map((p) => ({
    category: p,
    value: roundTo(range(rngP, 120000, 700000), 1000),
  }));

  const rngO = seeded(seedFromString(`mkt-target-origin-${seed}`));
  const originwise: BudgetActualRow[] = TARGET_ORIGINS.map((o) => {
    const budget = roundTo(range(rngO, 60000, 420000), 1000);
    const actual = roundTo(budget * range(rngO, 0.25, 0.9), 1000);
    return { category: o, budget, actual };
  });

  const rngS = seeded(seedFromString(`mkt-target-segment-${seed}`));
  const segmentwise: BudgetActualRow[] = TARGET_SEGMENTS.map((s) => {
    const budget = round(range(rngS, 0.1, 0.8), 1);
    const actual = round(budget * range(rngS, 0.3, 1.1), 1);
    return { category: s, budget, actual };
  });

  return { unit: "MT", portwise, originwise, segmentwise };
};
