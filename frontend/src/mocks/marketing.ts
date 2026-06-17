// Deterministic mock data for the Marketing module. Mirror of
// backend/src/mocks/marketing.ts — kept in sync.

import { seeded, seedFromString, range, round } from "./rand";
import type {
  MarketRange,
  IndexChart,
  IndexMovementResponse,
  IndexSeries,
  MarketShareResponse,
  ShareRow,
  ShareSlice,
  ZoneShareRow,
  OceanFreightResponse,
  FreightChart,
  FreightSeries,
  TargetResponse,
  BarRow,
  BudgetActualRow,
  MarketShareParams,
  OceanFreightParams,
  TargetParams,
} from "../types/marketing";

const rangeCategories = (r: MarketRange): string[] => {
  if (r === "1Y")
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (r === "3M") return Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
  if (r === "1W") return Array.from({ length: 7 }, (_, i) => `Day ${i + 1}`);
  return Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
};

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

const INDEX_SPECS: Record<string, { prefix: string; bases: number[]; amps: number[] }> = {
  "ICI Index": { prefix: "ICI", bases: [59, 50, 45, 38, 33], amps: [21, 18, 17, 17, 18] },
  "API Index": { prefix: "API", bases: [58, 49, 46, 37, 32], amps: [22, 19, 16, 18, 19] },
};

export const INDEX_CODES = ["ICI Index", "API Index"];

export const buildOneIndexChart = (code: string, r: MarketRange): IndexChart | null => {
  const spec = INDEX_SPECS[code];
  if (!spec) return null;
  const rng = seeded(seedFromString(`mkt-idx-${code}-${r}`));
  const cats = rangeCategories(r);
  const series: IndexSeries[] = spec.bases.map((base, idx) => ({
    name: `${spec.prefix} ${idx + 1}`,
    data: bell(rng, cats.length, base, spec.amps[idx] ?? 18, 2.5),
  }));
  return { code, range: r, categories: cats, series };
};

export const buildIndexMovement = (r: MarketRange): IndexMovementResponse => ({
  items: INDEX_CODES.map((c) => buildOneIndexChart(c, r)).filter(
    (c): c is IndexChart => c !== null,
  ),
});

// --- Market Share ----------------------------------------------------------

export const buildMarketShare = (f: MarketShareParams = {}): MarketShareResponse => {
  const total = 155.63;
  const ownPct = 29.7;
  const nonPct = 70.3;
  const ownMmt = round(total * (ownPct / 100), 2);
  const nonMmt = round(total * (nonPct / 100), 2);

  const overall = {
    total,
    rows: [
      { category: "Own", mmt: ownMmt, totalMmt: total, pct: ownPct },
      { category: "Non-Own", mmt: nonMmt, totalMmt: total, pct: nonPct },
    ] as ShareRow[],
    slices: [
      { label: "Own", value: ownMmt, pct: ownPct },
      { label: "Non-Own", value: nonMmt, pct: nonPct },
    ] as ShareSlice[],
  };

  const rng = seeded(seedFromString(`mkt-share-zone-${f.fromDate ?? ""}-${f.toDate ?? ""}`));
  const raw = Array.from({ length: 8 }, () => range(rng, 5, 20));
  const sum = raw.reduce((a, b) => a + b, 0);
  const zonePcts = raw.map((v) => round((v / sum) * 100, 1));

  const byZone = {
    total,
    rows: zonePcts.map((pct, i) => ({ zone: i + 1, pct })) as ZoneShareRow[],
    slices: zonePcts.map((pct, i) => ({
      label: `Zone ${i + 1}`,
      value: round(total * (pct / 100), 2),
      pct,
    })) as ShareSlice[],
  };

  return { unit: "MMT", overall, byZone };
};

// --- Ocean Freight ---------------------------------------------------------

export const DISCHARGE_PORT_LIST = ["Hazira", "Mundra", "Krishnapatnam", "Dahej", "Gangavaram"];
const CAPES_SERIES = ["Samarinda", "Abbotpoint", "RBCT", "US Balti CNX"];
const PANAMAX_SERIES = ["Samarinda", "Abbotpoint", "RBCT"];

const freightChart = (
  vesselType: string,
  names: string[],
  port: string,
  baseTop: number,
): FreightChart => {
  const rng = seeded(seedFromString(`mkt-freight-${vesselType}-${port}`));
  const cats = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
  const series: FreightSeries[] = names.map((name, idx) => ({
    name,
    data: bell(rng, cats.length, baseTop - idx * 0.18, 0.4, 0.06, 2),
  }));
  return { vesselType, unit: "$/MT", categories: cats, series };
};

export const buildOceanFreight = (f: OceanFreightParams = {}): OceanFreightResponse => {
  const port = f.dischargePort ?? "Hazira";
  return {
    dischargePort: port,
    items: [
      freightChart("Capes", CAPES_SERIES, port, 8.6),
      freightChart("Panamax", PANAMAX_SERIES, port, 8.0),
    ],
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

export const buildTarget = (f: TargetParams = {}): TargetResponse => {
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
