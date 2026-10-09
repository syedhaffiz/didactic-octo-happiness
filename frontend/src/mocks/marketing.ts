// Deterministic mock data for the Marketing module. Mirror of
// backend/src/mocks/marketing.ts — kept in sync.

import { seeded, seedFromString, range, round, pick, intRange } from "./rand";
import {
  ADDRESSABLE_LIST,
  CATEGORY_LIST,
  FISCAL_YEAR_LIST,
  IIA_CUSTOMER_LIST,
  IIA_DISCHARGE_VENDOR_LIST,
  IIA_LOAD_VENDOR_LIST,
  IIA_VESSELS,
  INDUSTRY_LIST,
  ORIGIN_LIST,
  PORT_LIST,
  RECEIVER_NAME_LIST,
  SEGMENT_LIST,
  SHARE_LIST,
  SHIPPER_NAME_LIST,
  ZONE_LIST,
  ZONE_PORT_IDS,
  type IdName,
} from "./catalog";
import type {
  IndexCadence,
  IndexChart,
  IndexMovementResponse,
  IndexRange,
  IndexSeries,
  MarketShareParams,
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
  OceanFreightParams,
  TargetParams,
  IiaBillingFilterOptions,
  IiaBillingParams,
  IiaBillingResponse,
  IiaBillingRow,
  IiaPortType,
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
// Mirror of backend/src/mocks/marketing.ts. Seven independently-fetched cards.
// Every builder seeds its RNG from the full filter set (via `seedFor`) so
// changing any filter deterministically shifts the numbers. `own` = the
// client's own volume; `nonOwn` = competitors (display labels applied by the UI).

const MMT = "MMT";
const FISCAL_YEARS = ["FY 2022-23", "FY 2023-24", "FY 2024-25", "FY 2025-26"];

const seedFor = (f: MarketShareParams, key: string) =>
  seeded(seedFromString(`mkt-share-${key}-${JSON.stringify(f)}`));

const roundStep = (n: number, step: number) => Math.round(n / step) * step;

// Grouped own/non-own rows whose magnitudes step across categories via
// per-category `weights`, with deterministic jitter so filter changes show.
const weightedRows = (
  f: MarketShareParams,
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

// Grouped rows drawn from flat [lo, hi] ranges (noisy bars, e.g. Port Wise).
const rangeRows = (
  f: MarketShareParams,
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
  f: MarketShareParams = {},
): MarketShareSplitResponse => {
  const rng = seedFor(f, "split");
  const own = round(range(rng, 150, 240), 2);
  const nonOwn = round(range(rng, 380, 460), 2);
  return { unit: MMT, own, nonOwn, total: round(own + nonOwn, 2) };
};

// Card 2 — Import Quantity (MMT) by fiscal year.
export const buildImportQuantity = (
  f: MarketShareParams = {},
): MarketSharePairedResponse => ({
  unit: MMT,
  rows: weightedRows(f, "import-qty", FISCAL_YEARS, 40, 86, [1.1, 1.08, 0.98, 0.8]),
});

// Card 3 — Market Share by Category.
const CATEGORIES = ["Trader", "End User", "Trader cum End-User"];
export const buildByCategory = (
  f: MarketShareParams = {},
): MarketSharePairedResponse => ({
  unit: MMT,
  rows: weightedRows(f, "by-category", CATEGORIES, 263, 396, [1, 0.6, 0.04]),
});

// Card 4 — Quarterwise Import (QTR-1..4 × fiscal year).
const QUARTERS = ["QTR - 1", "QTR - 2", "QTR - 3", "QTR - 4"];
export const buildQuarterwise = (
  f: MarketShareParams = {},
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
  f: MarketShareParams = {},
): MarketSharePairedResponse => ({
  unit: MMT,
  rows: weightedRows(f, "industry", INDUSTRIES, 29, 40, [0.17, 0.12, 1, 0.9, 0.1, 0.55]),
});

// Card 6 — Origin Wise Import.
const ORIGINS = ["Aust", "INDO", "MOZBQ", "Others", "RSA", "Russia", "USA"];
export const buildOriginwise = (
  f: MarketShareParams = {},
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
  f: MarketShareParams = {},
): MarketSharePairedResponse => ({
  unit: "MT",
  rows: rangeRows(f, "portwise", MS_PORTS, [20000, 220000], [40000, 420000], 1000),
});

// Dropdown option lists for the Filters side-panel (Quarter is a fixed list).
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

export const buildOceanFreight = (f: OceanFreightParams = {}): OceanFreightResponse => {
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

// --- IIA Billing -----------------------------------------------------------

// Billing history spans Oct 2024 → Feb 2026 so both FY 2024-25 and FY 2025-26
// return rows.
const IIA_FIRST_DAY = Date.UTC(2024, 9, 1);
const IIA_LAST_DAY = Date.UTC(2026, 1, 28);
const DAY_MS = 86_400_000;

// Ports and segments the shipments are drawn from. Segment ids repeat so SNS
// dominates, matching the figma sample.
const IIA_PORT_IDS = ["dahej", "hazira", "navlakhi", "krishnapatnam", "mundra", "gangavaram"];
const IIA_SEGMENT_IDS = ["sns", "sns", "sns", "sns", "seb", "tph", "domestic"];
const PLANNED_GCV = [3000, 3400, 3800, 4000, 4200, 4600, 4800];
const LOAD_GRADE_LABELS = ["A Grade", "B Grade"];
// Discharge results take a few weeks to land; newer lines show "0" (pending).
const DP_PENDING_DAYS = 40;

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const nameIn = (list: IdName[], id: string) => list.find((o) => o.id === id)?.name ?? id;

// A vessel call: one cargo for one customer, sampled once at the load port
// and again at the discharge port.
interface Shipment {
  loadDay: number;
  dischargeDay: number;
  vessel: string;
  portId: string;
  segmentId: string;
  customerId: string;
  plannedQuality: number;
  qty: number; // MMT
}

const buildShipments = (): Shipment[] => {
  const rng = seeded(seedFromString("mkt-iia-shipments"));
  const out: Shipment[] = [];
  for (let day = IIA_FIRST_DAY; day <= IIA_LAST_DAY; day += DAY_MS) {
    if (rng() > 0.5) continue;
    out.push({
      loadDay: day,
      dischargeDay: day + intRange(rng, 12, 22) * DAY_MS,
      vessel: pick(rng, IIA_VESSELS),
      portId: pick(rng, IIA_PORT_IDS),
      segmentId: pick(rng, IIA_SEGMENT_IDS),
      customerId: pick(rng, IIA_CUSTOMER_LIST).id,
      plannedQuality: pick(rng, PLANNED_GCV),
      qty: round(range(rng, 0.015, 0.075), 4),
    });
  }
  return out;
};

// Billing lines for one side of every shipment. Each shipment is billed by 1–4
// agency lines (split quantities), and roughly one line in eight is followed by
// a credit note against the same TC number.
const buildIiaRows = (portType: IiaPortType, shipments: Shipment[]): IiaBillingRow[] => {
  const rng = seeded(seedFromString(`mkt-iia-rows-${portType}`));
  const vendors = portType === "load" ? IIA_LOAD_VENDOR_LIST : IIA_DISCHARGE_VENDOR_LIST;
  let tc = portType === "load" ? 8310056000 : 8310057000;
  const rows: IiaBillingRow[] = [];

  for (const s of shipments) {
    const day = portType === "load" ? s.loadDay : s.dischargeDay;
    if (day > IIA_LAST_DAY) continue;
    const date = isoDay(day);
    const pending = portType === "discharge" && IIA_LAST_DAY - day < DP_PENDING_DAYS * DAY_MS;
    const lines = intRange(rng, 1, 4);

    for (let i = 0; i < lines; i++) {
      tc += intRange(rng, 1, 9);
      const qty = lines === 1 ? s.qty : round(s.qty * range(rng, 0.3, 0.7), 6);
      // Load agencies bill a variable per-tonne rate; discharge agencies a flat 1–1.25/t.
      const rate = portType === "load" ? range(rng, 1.4, 2.8) : pick(rng, [1, 1, 1.25]);
      const amount = round(qty * 1_000_000 * rate, 2);
      const portQuality = pending
        ? "0"
        : portType === "load" && rng() < 0.08
          ? pick(rng, LOAD_GRADE_LABELS)
          : String(Math.round(s.plannedQuality + range(rng, -700, 700)));
      const base = {
        date,
        customer: nameIn(IIA_CUSTOMER_LIST, s.customerId),
        vessel: s.vessel,
        port: nameIn(PORT_LIST, s.portId).toUpperCase(),
        segment: nameIn(SEGMENT_LIST, s.segmentId),
        vendor: pick(rng, vendors).name,
        plannedQuality: s.plannedQuality,
        portQuality,
        tcNumber: String(tc),
      };
      rows.push({ ...base, id: `${portType}-${tc}`, amount, qty });

      if (rng() < 0.12) {
        // Credit note: the load side adjusts a slice of the line, the
        // discharge side reverses it in full.
        const share = portType === "load" ? range(rng, 0.01, 0.05) : 1;
        rows.push({
          ...base,
          id: `${portType}-${tc}-cn`,
          amount: -round(amount * share, 2),
          qty: round(qty * share, 6),
        });
      }
    }
  }
  return rows.sort((a, b) => b.date.localeCompare(a.date) || a.tcNumber.localeCompare(b.tcNumber));
};

// Built once on first use — the generator is deterministic.
let iiaRowsCache: Record<IiaPortType, IiaBillingRow[]> | null = null;
const iiaRows = (portType: IiaPortType): IiaBillingRow[] => {
  if (!iiaRowsCache) {
    const shipments = buildShipments();
    iiaRowsCache = {
      load: buildIiaRows("load", shipments),
      discharge: buildIiaRows("discharge", shipments),
    };
  }
  return iiaRowsCache[portType];
};

const csv = (v: string | undefined): string[] => (v ? v.split(",").filter(Boolean) : []);

// Indian fiscal year (Apr–Mar): the calendar year the FY starts in, and the
// quarter within it ("q1" = Apr–Jun … "q4" = Jan–Mar).
const fiscalStartYear = (iso: string) => {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  return m >= 4 ? y : y - 1;
};
const fiscalQuarter = (iso: string) =>
  `q${Math.floor(((Number(iso.slice(5, 7)) + 8) % 12) / 3) + 1}`;
// "fy25-26" → 2025.
const fyStartYear = (id: string) => 2000 + Number(id.slice(2, 4));

// Selected ids → the display names the rows carry.
const namesFor = (list: IdName[], ids: string[], upper = false) =>
  new Set(ids.map((id) => (upper ? nameIn(list, id).toUpperCase() : nameIn(list, id))));

export const buildIiaBilling = (
  portType: IiaPortType,
  f: IiaBillingParams = {},
): IiaBillingResponse => {
  const all = iiaRows(portType);
  const years = csv(f.fiscalYears).map(fyStartYear);
  const quarters = csv(f.quarters);
  // Year/Quarter take precedence over the date range.
  const useDates = years.length === 0 && quarters.length === 0;

  // Zones narrow the port set; an explicit Port selection narrows it further.
  const zones = csv(f.zone);
  const zonePortIds = zones.flatMap((z) => ZONE_PORT_IDS[z] ?? []);
  const portIds = csv(f.port);
  const allowedPortIds = !zones.length
    ? portIds
    : !portIds.length
      ? zonePortIds
      : portIds.filter((p) => zonePortIds.includes(p));
  const portFilterOn = zones.length > 0 || portIds.length > 0;
  const ports = namesFor(PORT_LIST, allowedPortIds, true);
  const segments = namesFor(SEGMENT_LIST, csv(f.segment));
  const customers = namesFor(IIA_CUSTOMER_LIST, csv(f.customer));
  const vendors = namesFor(
    [...IIA_LOAD_VENDOR_LIST, ...IIA_DISCHARGE_VENDOR_LIST],
    csv(f.vendor),
  );

  const items = all.filter(
    (r) =>
      (years.length === 0 || years.includes(fiscalStartYear(r.date))) &&
      (quarters.length === 0 || quarters.includes(fiscalQuarter(r.date))) &&
      (!useDates || !f.fromDate || r.date >= f.fromDate) &&
      (!useDates || !f.toDate || r.date <= f.toDate) &&
      (!portFilterOn || ports.has(r.port)) &&
      (segments.size === 0 || segments.has(r.segment)) &&
      (customers.size === 0 || customers.has(r.customer)) &&
      (vendors.size === 0 || vendors.has(r.vendor)),
  );

  // Rows are newest-first, so the head is the latest billing date in scope.
  const yesterdayDate = items[0]?.date ?? null;
  const sum = (rows: IiaBillingRow[]) => round(rows.reduce((acc, r) => acc + r.amount, 0), 2);

  return {
    portType,
    yesterdayBilling: sum(items.filter((r) => r.date === yesterdayDate)),
    yesterdayDate,
    totalBilling: sum(items),
    lastUpdated: all[0]?.date ?? null,
    items,
  };
};

export const buildIiaBillingFilterOptions = (): IiaBillingFilterOptions => ({
  fiscalYears: [...FISCAL_YEAR_LIST],
  zones: [...ZONE_LIST],
  ports: PORT_LIST.filter((p) => IIA_PORT_IDS.includes(p.id)),
  segments: [...SEGMENT_LIST],
  customers: [...IIA_CUSTOMER_LIST],
  vendors: [...IIA_LOAD_VENDOR_LIST, ...IIA_DISCHARGE_VENDOR_LIST],
});
