// Deterministic mock data for the Marketing module. Mirror of
// backend/src/mocks/marketing.ts — kept in sync.

import { seeded, seedFromString, range, round } from "./rand";
import type {
  IndexCadence,
  IndexChart,
  IndexMovementResponse,
  IndexRange,
  IndexSeries,
  MarketShareResponse,
  MarketShareDimension,
  MarketShareRootPie,
  MarketShareDrilldownSeries,
  MarketSharePiePoint,
  ShipperReceiverRow,
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

// Anchor pinned to end-May 2026 so the dates read the same as the figma.
const ANCHOR = new Date(Date.UTC(2026, 4, 31));

const pad = (n: number) => String(n).padStart(2, "0");
const ddmmyy = (d: Date) =>
  `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${String(d.getUTCFullYear()).slice(-2)}`;

const addDays = (d: Date, days: number) => {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
};

const indexCategories = (cadence: IndexCadence, r: IndexRange): string[] => {
  const months = r === "2" ? 2 : 1;
  if (cadence === "daily") {
    const total = months * 30;
    return Array.from({ length: total }, (_, i) =>
      ddmmyy(addDays(ANCHOR, -(total - 1 - i))),
    );
  }
  const weeks = months * 4;
  return Array.from({ length: weeks }, (_, i) => {
    const end = addDays(ANCHOR, -7 * (weeks - 1 - i));
    const start = addDays(end, -6);
    return `${ddmmyy(start)} - ${ddmmyy(end)}`;
  });
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

interface IndexSpec {
  title: string;
  cadence: IndexCadence;
  prefix: "ICI" | "API";
  numbers: number[];
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
  items: INDEX_CODES.map((c) => buildOneIndexChart(c, r)).filter(
    (c): c is IndexChart => c !== null,
  ),
});

// --- Market Share ----------------------------------------------------------

interface PortDatum {
  port: string;
  own: number;
  nonOwn: number;
}
const ZONE_PORTS: { zone: string; ports: PortDatum[] }[] = [
  { zone: "Zone-1", ports: [
    { port: "MUNDRA", own: 679970, nonOwn: 325005 },
    { port: "TUNA", own: 203238, nonOwn: 479834 },
  ] },
  { zone: "Zone-2", ports: [
    { port: "NAVLAKHI", own: 135803, nonOwn: 439935 },
  ] },
  { zone: "Zone-3", ports: [
    { port: "HAZIRA", own: 300000, nonOwn: 464700 },
    { port: "DAHEJ", own: 368271, nonOwn: 296349 },
  ] },
  { zone: "Zone-4", ports: [
    { port: "DHARAMTAR", own: 60500, nonOwn: 405911 },
  ] },
  { zone: "Zone-5", ports: [
    { port: "KRISHNAPATNAM", own: 172411, nonOwn: 673416 },
    { port: "NEW MANGALORE", own: 76471, nonOwn: 174295 },
  ] },
  { zone: "Zone-6", ports: [
    { port: "TUTICORIN", own: 80000, nonOwn: 470384 },
  ] },
  { zone: "Zone-7", ports: [
    { port: "GANGAVARAM", own: 197000, nonOwn: 240500 },
  ] },
  { zone: "Zone-8", ports: [
    { port: "DHAMRA", own: 192040, nonOwn: 839219 },
    { port: "HALDIA", own: 86094, nonOwn: 120003 },
  ] },
];

const ENDUSER_RATIO: Record<string, number> = {
  MUNDRA: 0.894, TUNA: 1.0, NAVLAKHI: 1.0, HAZIRA: 0.63, DAHEJ: 0.795,
  DHARAMTAR: 1.0, KRISHNAPATNAM: 1.0, "NEW MANGALORE": 1.0, TUTICORIN: 1.0,
  GANGAVARAM: 0.62, DHAMRA: 1.0, HALDIA: 0.65,
};

const mktSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const totalsOf = (ports: PortDatum[]) =>
  ports.reduce(
    (acc, p) => ({ own: acc.own + p.own, nonOwn: acc.nonOwn + p.nonOwn }),
    { own: 0, nonOwn: 0 },
  );

const rootSlices = (
  ownDrilldownId: string,
  totalOwn: number,
  totalNonOwn: number,
): MarketSharePiePoint[] => [
  { name: "Own", y: totalOwn, drilldown: ownDrilldownId, own: totalOwn, nonOwn: totalNonOwn },
  { name: "Non-Own", y: totalNonOwn, drilldown: null, own: totalOwn, nonOwn: totalNonOwn },
];

const grandTotals = () => totalsOf(ZONE_PORTS.flatMap((z) => z.ports));

// Root pies — the only data shipped with the page.
const geographicRoot = (): MarketShareRootPie => {
  const g = grandTotals();
  return { rootName: "Market Share", root: rootSlices("geo-own", g.own, g.nonOwn) };
};
const businessTypeRoot = (): MarketShareRootPie => {
  const g = grandTotals();
  return { rootName: "Market Share", root: rootSlices("business-own", g.own, g.nonOwn) };
};

// All geographic levels (Market -> Zone -> Port), keyed by drilldown id.
const geographicLevels = (): MarketShareDrilldownSeries[] => {
  const zoneLevel: MarketSharePiePoint[] = ZONE_PORTS.map((z) => {
    const t = totalsOf(z.ports);
    return { name: z.zone, y: t.own, drilldown: `geo-${mktSlug(z.zone)}`, own: t.own, nonOwn: t.nonOwn };
  });
  const portSeries: MarketShareDrilldownSeries[] = ZONE_PORTS.map((z) => ({
    id: `geo-${mktSlug(z.zone)}`,
    tier: "Port",
    data: z.ports.map((p) => ({ name: p.port, y: p.own, drilldown: null, own: p.own, nonOwn: p.nonOwn })),
  }));
  return [{ id: "geo-own", tier: "Zone", data: zoneLevel }, ...portSeries];
};

// All business-type levels (Market -> Port -> Business Type), keyed by id.
const businessTypeLevels = (): MarketShareDrilldownSeries[] => {
  const allPorts = ZONE_PORTS.flatMap((z) => z.ports);
  const portLevel: MarketSharePiePoint[] = allPorts.map((p) => ({
    name: p.port,
    y: p.own,
    drilldown: `business-${mktSlug(p.port)}`,
    own: p.own,
    nonOwn: p.nonOwn,
  }));
  const businessSeries: MarketShareDrilldownSeries[] = allPorts.map((p) => {
    const endUser = Math.round(p.own * (ENDUSER_RATIO[p.port] ?? 0.8));
    const trader = p.own - endUser;
    return {
      id: `business-${mktSlug(p.port)}`,
      tier: "Business Type",
      data: [
        { name: "End-User", y: endUser, drilldown: null, own: endUser, nonOwn: 0 },
        { name: "Trader", y: trader, drilldown: null, own: trader, nonOwn: 0 },
      ],
    };
  });
  return [{ id: "business-own", tier: "Port", data: portLevel }, ...businessSeries];
};

// Resolves one drilldown level by dimension + node id (mirror of backend).
export const buildMarketShareDrill = (
  dim: MarketShareDimension,
  path: string,
): MarketShareDrilldownSeries | null => {
  const levels = dim === "geographic" ? geographicLevels() : businessTypeLevels();
  return levels.find((s) => s.id === path) ?? null;
};

const SHIPPER_RECEIVER: ShipperReceiverRow[] = [
  { port: "MUNDRA", shipperOwn: 679970, shipperNonOwn: 325004, receiverOwn: 1403215, receiverNonOwn: 325004 },
  { port: "KANDLA", shipperOwn: 0, shipperNonOwn: 709668, receiverOwn: 0, receiverNonOwn: 709668 },
  { port: "KRISHNAPATNAM", shipperOwn: 172411, shipperNonOwn: 673415, receiverOwn: 172411, receiverNonOwn: 673415 },
  { port: "DHAMRA", shipperOwn: 192040, shipperNonOwn: 839219, receiverOwn: 192040, receiverNonOwn: 839219 },
  { port: "VIZAG", shipperOwn: 0, shipperNonOwn: 818241, receiverOwn: 0, receiverNonOwn: 818241 },
  { port: "DAHEJ", shipperOwn: 368271, shipperNonOwn: 296349, receiverOwn: 405509, receiverNonOwn: 296349 },
  { port: "HAZIRA", shipperOwn: 300000, shipperNonOwn: 464700, receiverOwn: 395615, receiverNonOwn: 464700 },
  { port: "TUNA", shipperOwn: 203238, shipperNonOwn: 479834, receiverOwn: 203238, receiverNonOwn: 479834 },
  { port: "NAVLAKHI", shipperOwn: 135803, shipperNonOwn: 439935, receiverOwn: 135803, receiverNonOwn: 439935 },
  { port: "TUTICORIN", shipperOwn: 80000, shipperNonOwn: 470384, receiverOwn: 80000, receiverNonOwn: 470384 },
];

export const buildMarketShare = (_f: MarketShareParams = {}): MarketShareResponse => ({
  unit: "MT",
  geographic: geographicRoot(),
  businessType: businessTypeRoot(),
  shipperReceiver: SHIPPER_RECEIVER.map((r) => ({ ...r })),
});

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
