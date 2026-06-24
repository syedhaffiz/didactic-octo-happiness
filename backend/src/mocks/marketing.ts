// Deterministic mock data for the Marketing module. Seeded so fixtures are
// stable across runs. Mirrored in frontend/src/mocks/marketing.ts.

import { seeded, seedFromString, range, round } from "./rand.js";
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
  MarketShareFilters,
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

// Base geographic dataset: Zone -> Port with the Own / Non-Own volume split (MT).
// Drives both the geographic pie and the business-type pie.
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

// Per-port End-User share of the Own volume (rest is Trader). Stable per port.
const ENDUSER_RATIO: Record<string, number> = {
  MUNDRA: 0.894, TUNA: 1.0, NAVLAKHI: 1.0, HAZIRA: 0.63, DAHEJ: 0.795,
  DHARAMTAR: 1.0, KRISHNAPATNAM: 1.0, "NEW MANGALORE": 1.0, TUTICORIN: 1.0,
  GANGAVARAM: 0.62, DHAMRA: 1.0, HALDIA: 0.65,
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const totalsOf = (ports: PortDatum[]) =>
  ports.reduce(
    (acc, p) => ({ own: acc.own + p.own, nonOwn: acc.nonOwn + p.nonOwn }),
    { own: 0, nonOwn: 0 },
  );

// Builds the root Own / Non-Own slices shared by both pies. The "Own" slice
// drills into `ownDrilldownId`; "Non-Own" is a leaf.
const rootSlices = (
  ownDrilldownId: string,
  totalOwn: number,
  totalNonOwn: number,
): MarketSharePiePoint[] => [
  { name: "Own", y: totalOwn, drilldown: ownDrilldownId, own: totalOwn, nonOwn: totalNonOwn },
  { name: "Non-Own", y: totalNonOwn, drilldown: null, own: totalOwn, nonOwn: totalNonOwn },
];

const grandTotals = () => totalsOf(ZONE_PORTS.flatMap((z) => z.ports));

// Root pies (the only data shipped with the page). Deeper levels are produced
// by the level builders below and served lazily through the drill endpoint.
const geographicRoot = (): MarketShareRootPie => {
  const g = grandTotals();
  return { rootName: "Market Share", root: rootSlices("geo-own", g.own, g.nonOwn) };
};
const businessTypeRoot = (): MarketShareRootPie => {
  const g = grandTotals();
  return { rootName: "Market Share", root: rootSlices("business-own", g.own, g.nonOwn) };
};

// Geographic: Market -> Zone -> Port. All levels keyed by id:
//   geo-own            -> the 8 zones
//   geo-<zone-slug>    -> that zone's ports (leaf)
const geographicLevels = (): MarketShareDrilldownSeries[] => {
  const zoneLevel: MarketSharePiePoint[] = ZONE_PORTS.map((z) => {
    const t = totalsOf(z.ports);
    return { name: z.zone, y: t.own, drilldown: `geo-${slug(z.zone)}`, own: t.own, nonOwn: t.nonOwn };
  });
  const portSeries: MarketShareDrilldownSeries[] = ZONE_PORTS.map((z) => ({
    id: `geo-${slug(z.zone)}`,
    tier: "Port",
    data: z.ports.map((p) => ({ name: p.port, y: p.own, drilldown: null, own: p.own, nonOwn: p.nonOwn })),
  }));
  return [{ id: "geo-own", tier: "Zone", data: zoneLevel }, ...portSeries];
};

// Business Type: Market -> Port -> Business Type. Levels keyed by id:
//   business-own         -> every port
//   business-<port-slug> -> that port's Trader / End-User split (leaf)
const businessTypeLevels = (): MarketShareDrilldownSeries[] => {
  const allPorts = ZONE_PORTS.flatMap((z) => z.ports);
  const portLevel: MarketSharePiePoint[] = allPorts.map((p) => ({
    name: p.port,
    y: p.own,
    drilldown: `business-${slug(p.port)}`,
    own: p.own,
    nonOwn: p.nonOwn,
  }));
  const businessSeries: MarketShareDrilldownSeries[] = allPorts.map((p) => {
    const endUser = Math.round(p.own * (ENDUSER_RATIO[p.port] ?? 0.8));
    const trader = p.own - endUser;
    return {
      id: `business-${slug(p.port)}`,
      tier: "Business Type",
      data: [
        { name: "End-User", y: endUser, drilldown: null, own: endUser, nonOwn: 0 },
        { name: "Trader", y: trader, drilldown: null, own: trader, nonOwn: 0 },
      ],
    };
  });
  return [{ id: "business-own", tier: "Port", data: portLevel }, ...businessSeries];
};

// Resolves a single drilldown level for the given dimension + node id. Returns
// null for an unknown id so the controller can answer 404.
export const buildMarketShareDrill = (
  dim: MarketShareDimension,
  path: string,
): MarketShareDrilldownSeries | null => {
  const levels = dim === "geographic" ? geographicLevels() : businessTypeLevels();
  return levels.find((s) => s.id === path) ?? null;
};

// Shipper vs Receiver volume per port, each split Own / Non-Own (MT).
const SHIPPER_RECEIVER: ShipperReceiverRow[] = [
  { port: "MUNDRA",        shipperOwn: 679970,  shipperNonOwn: 325004,  receiverOwn: 1403215, receiverNonOwn: 325004,
    shipperOwnEntities: ["ADANI: 679K MT"],                     shipperNonOwnEntities: ["SHREE CEMENT", "TATA POWER"],
    receiverOwnEntities: ["APL", "AEL SNS", "ACC/AMBUJA"],      receiverNonOwnEntities: ["SHREE CEMENT", "TATA POWER"] },
  { port: "KANDLA",        shipperOwn: 0,        shipperNonOwn: 709668,  receiverOwn: 0,       receiverNonOwn: 709668,
    shipperOwnEntities: [],                                      shipperNonOwnEntities: ["ULTRATECH CEMENT", "SHREE CEMENT", "AGARWAL COAL"],
    receiverOwnEntities: [],                                     receiverNonOwnEntities: ["ULTRATECH CEMENT", "KUTCH CHEMICALS", "JSW TRADING"] },
  { port: "KRISHNAPATNAM", shipperOwn: 172411,  shipperNonOwn: 673415,  receiverOwn: 172411,  receiverNonOwn: 673415,
    shipperOwnEntities: ["ADANI: 172K MT"],                     shipperNonOwnEntities: ["ULTRATECH CEMENT", "JSW STEEL", "MY HOME GROUP"],
    receiverOwnEntities: ["AEL SNS"],                            receiverNonOwnEntities: ["CHETTINAD CEMENT", "SEMBCORP", "JINDAL POWER"] },
  { port: "DHAMRA",        shipperOwn: 192040,  shipperNonOwn: 839219,  receiverOwn: 192040,  receiverNonOwn: 839219,
    shipperOwnEntities: ["ADANI: 192K MT"],                     shipperNonOwnEntities: ["RUNGTA MINES", "RASHMI GROUP", "OCL IRON"],
    receiverOwnEntities: ["AEL SNS"],                            receiverNonOwnEntities: ["RUNGTA MINES", "RASHMI GROUP", "OCL IRON"] },
  { port: "VIZAG",         shipperOwn: 0,        shipperNonOwn: 818241,  receiverOwn: 0,       receiverNonOwn: 818241,
    shipperOwnEntities: [],                                      shipperNonOwnEntities: ["JSW STEEL", "MAHINDRA SPONGE", "JSPL"],
    receiverOwnEntities: [],                                     receiverNonOwnEntities: ["JSW/BHUSHAN", "AMNS", "AGARWAL COAL"] },
  { port: "DAHEJ",         shipperOwn: 368271,  shipperNonOwn: 296349,  receiverOwn: 405509,  receiverNonOwn: 296349,
    shipperOwnEntities: ["ADANI: 368K MT"],                     shipperNonOwnEntities: ["GRASIM", "HINDUSTAN ZINC", "RELIANCE"],
    receiverOwnEntities: ["AEL SNS", "APL"],                     receiverNonOwnEntities: ["GRASIM", "HINDALCO", "WONDER CEMENT"] },
  { port: "HAZIRA",        shipperOwn: 300000,  shipperNonOwn: 464700,  receiverOwn: 395615,  receiverNonOwn: 464700,
    shipperOwnEntities: ["ADANI: 300K MT"],                     shipperNonOwnEntities: ["RELIANCE"],
    receiverOwnEntities: ["AEL SNS", "RELIANCE"],                receiverNonOwnEntities: ["RELIANCE"] },
  { port: "TUNA",          shipperOwn: 203238,  shipperNonOwn: 479834,  receiverOwn: 203238,  receiverNonOwn: 479834,
    shipperOwnEntities: ["ADANI: 203K MT"],                     shipperNonOwnEntities: ["SWISS SINGAPORE", "WONDER CEMENT", "JSW TRADING"],
    receiverOwnEntities: ["AEL SNS"],                            receiverNonOwnEntities: ["SWISS SINGAPORE", "WONDER CEMENT", "COMSOL ENERGY"] },
  { port: "NAVLAKHI",      shipperOwn: 135803,  shipperNonOwn: 439935,  receiverOwn: 135803,  receiverNonOwn: 439935,
    shipperOwnEntities: ["ADANI: 135K MT"],                     shipperNonOwnEntities: ["AGARWAL COAL", "MOHIT MINERALS", "BHATIA COAL"],
    receiverOwnEntities: ["AEL SNS"],                            receiverNonOwnEntities: ["FC AGARWAL", "AGARWAL COAL", "TARANJOT"] },
  { port: "TUTICORIN",     shipperOwn: 80000,   shipperNonOwn: 470384,  receiverOwn: 80000,   receiverNonOwn: 470384,
    shipperOwnEntities: ["ADANI: 80K MT"],                      shipperNonOwnEntities: ["TATA INTERNATIONAL", "DHAR COAL", "AGARWAL COAL"],
    receiverOwnEntities: ["MOXIE POWER GEN"],                    receiverNonOwnEntities: ["TATA INT.", "DHAR COAL", "NLC TAMILNADU"] },
];

export const buildMarketShare = (_f: MarketShareFilters = {}): MarketShareResponse => ({
  unit: "MT",
  geographic: geographicRoot(),
  businessType: businessTypeRoot(),
  shipperReceiver: SHIPPER_RECEIVER.map((r) => ({ ...r })),
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
