// Deterministic mock data for the Logistics module. Seeded so fixtures are
// stable across runs. Mirrored in frontend/src/mocks/logistics.ts.

import { seeded, seedFromString, range, intRange, pick } from "./rand.js";
import { VESSELS } from "./catalog.js";
import type {
  DpHandlingOutstanding,
  FiscalYear,
  HandlingRateRow,
  PdaDrilldownSeries,
  PdaPiePoint,
  PdaRootPie,
  VesselSailedRow,
} from "../types/logistics.js";

// --- shared helpers --------------------------------------------------------

const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (d: Date) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

const addDays = (d: Date, days: number) => {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
};

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

// Fallback window when the caller supplies no range — keeps the table populated
// with dates that read like the design (Sep–Oct 2025) on a bare page load.
const DEFAULT_FROM = new Date(Date.UTC(2025, 8, 1)); // 01 Sep 2025
const DEFAULT_TO = new Date(Date.UTC(2025, 9, 31)); // 31 Oct 2025

const parseDate = (s: string | undefined, fallback: Date): Date => {
  if (!s) return fallback;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? fallback : d;
};

// --- Vessel Sailed Out -----------------------------------------------------

// Grade codes shaped like the design exports (e.g. "MIFA_3400_P_A").
const COAL_GRADE_CODES = [
  "MIFA_3400_P_A",
  "INDO_4200_GAR",
  "INDO_3800_GAR",
  "AUS_5500_GAR",
  "RSA_5500_NAR",
  "INDO_4600_GAR",
  "AUS_6000_GAR",
];

const VESSEL_ORIGINS = ["INDO", "AUS", "RSA", "USA"];

const VESSEL_COUNT = 25;

export const buildVesselsSailed = (
  fromDate?: string,
  toDate?: string,
): VesselSailedRow[] => {
  const from = parseDate(fromDate, DEFAULT_FROM);
  const to = parseDate(toDate, DEFAULT_TO);
  // Seed off the window so changing the date range reshuffles the fixtures the
  // way a real query would, while staying stable for a given range.
  const rng = seeded(seedFromString(`log-vessels-${isoDate(from)}-${isoDate(to)}`));
  const spanDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));

  return Array.from({ length: VESSEL_COUNT }, (_, i) => {
    const blOffset = Math.round((i / (VESSEL_COUNT - 1)) * spanDays);
    const blDate = addDays(from, blOffset);
    const etaDp = addDays(blDate, intRange(rng, 5, 20));
    return {
      id: `vsl-${i + 1}`,
      vessel: pick(rng, VESSELS),
      coalGrade: pick(rng, COAL_GRADE_CODES),
      tonnage: roundTo(range(rng, 900, 3000), 50),
      origin: pick(rng, VESSEL_ORIGINS),
      blDate: isoDate(blDate),
      etaDp: isoDate(etaDp),
    };
  });
};

// --- Handling Rates --------------------------------------------------------
// Pinned to the design exports (Port / Road / Rake in INR/MT).
const HANDLING_RATES: HandlingRateRow[] = [
  { port: "Haldia (2 & 8 berth)", road: 523, rake: 600 },
  { port: "Haldia (other)", road: 443, rake: 520 },
  { port: "Sandhead (HDC Jetty)", road: 936, rake: 1013 },
  { port: "Dhamra Paradip", road: 300, rake: 375 },
  { port: "Gangavaram", road: 275, rake: 345 },
  { port: "Gopalpur Kakinada", road: 248, rake: 248 },
  { port: "Krishnapatnam (Gearless)", road: 275, rake: 305 },
  { port: "Krishnapatnam (Geared)", road: 353, rake: 389 },
];

// Fiscal years for the dropdown, latest first; the first is the default.
const FISCAL_YEARS = ["2025-26", "2024-25", "2023-24", "2022-23"];
const DEFAULT_FISCAL_YEAR = FISCAL_YEARS[0]!;

export const buildFiscalYears = (): FiscalYear[] =>
  FISCAL_YEARS.map((fy) => ({ fiscalYear: fy, fiscalYearDisplay: `FY${fy}` }));

// Rates depend on the selected fiscal year. The default year returns the pinned
// design figures; other years apply a deterministic per-year variation so the
// dropdown visibly changes the table.
export const buildHandlingRates = (year?: string): HandlingRateRow[] => {
  const fy = year ?? DEFAULT_FISCAL_YEAR;
  if (fy === DEFAULT_FISCAL_YEAR) return HANDLING_RATES.map((r) => ({ ...r }));
  return HANDLING_RATES.map((r) => {
    const rng = seeded(seedFromString(`log-handling-${r.port}-${fy}`));
    const factor = 0.85 + rng() * 0.3; // ±15%
    return { port: r.port, road: Math.round(r.road * factor), rake: Math.round(r.rake * factor) };
  });
};

// --- Portwise PDA ----------------------------------------------------------
// Root pie by port (values tuned to the design's percentages); each port
// drills into its shipping-agent (operations) split.
interface PdaPort {
  id: string;
  name: string;
  value: number;
}
const PDA_PORTS: PdaPort[] = [
  { id: "pradip", name: "Pradip", value: 17900 },
  { id: "goa", name: "Goa", value: 7000 },
  { id: "krishnapatnam", name: "Krishnapatnam", value: 3200 },
  { id: "gangavaram", name: "Gangavaram", value: 1500 },
];
const PDA_OTHERS = 70400;

const PDA_AGENTS = [
  "GAC Shipping (INDIA) PVT LTD",
  "Taurus Shipping Pvt Ltd",
  "Seahorse Ship Agencies",
  "J M Baxi & Co",
];

const pdaDrillId = (portId: string) => `pda-${portId}`;

export const buildPdaRoot = (): PdaRootPie => ({
  rootName: "Ports",
  root: [
    ...PDA_PORTS.map(
      (p): PdaPiePoint => ({ name: p.name, y: p.value, drilldown: pdaDrillId(p.id) }),
    ),
    { name: "Others", y: PDA_OTHERS, drilldown: null },
  ],
});

// One drill level: the operations (agent) split for a single port. Returns
// null for an unknown path so the controller can 404.
export const buildPdaDrill = (path: string): PdaDrilldownSeries | null => {
  const port = PDA_PORTS.find((p) => pdaDrillId(p.id) === path);
  if (!port) return null;

  const rng = seeded(seedFromString(`log-pda-${port.id}`));
  const count = intRange(rng, 2, 3);
  const agents = PDA_AGENTS.slice(0, count);

  // Random positive weights that sum to the port's total, then round.
  const weights = agents.map(() => range(rng, 0.4, 1));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const data: PdaPiePoint[] = agents.map((name, i) => ({
    name,
    y: Math.round((weights[i]! / weightSum) * port.value),
    drilldown: null,
  }));

  return { id: path, tier: "Operations", data };
};

// --- DP Handling Agents — Outstanding Payments -----------------------------
// Outstanding amount owed to each handling agent, grouped by category. Values
// pinned to the design exports (in the port's local currency).
const OUTSTANDING_CATEGORIES = ["Operations", "Pradip"];

export const buildOutstanding = (): DpHandlingOutstanding => ({
  unit: "Local Currency",
  categories: [...OUTSTANDING_CATEGORIES],
  series: [
    { agent: PDA_AGENTS[0]!, data: [98_440_000, 138_260_000] },
    { agent: PDA_AGENTS[1]!, data: [146_240_000, 1_230_000] },
  ],
});
