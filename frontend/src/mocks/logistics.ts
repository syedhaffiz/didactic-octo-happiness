// Deterministic mock data for the Logistics module. Mirror of
// backend/src/mocks/logistics.ts — kept in sync.

import { seeded, seedFromString, range, intRange, pick } from "./rand";
import { VESSELS } from "./catalog";
import type {
  DpHandlingOutstanding,
  FiscalYear,
  HandlingRateRow,
  PdaPeriod,
  PdaRow,
  VesselSailedRow,
} from "../types/logistics";

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
// One row per port + vessel-type combination. Pinned to the design exports for
// the default period; other periods apply a deterministic factor so switching
// the dropdown visibly changes the table.
interface PdaBaseRow {
  port: string;
  vesselType: string;
  qty: number; // MT
  totalWithGst: number;
  pmtUsd: number;
  pmtInr: number;
}

const PDA_ROWS: PdaBaseRow[] = [
  { port: "Haldia", vesselType: "Supramax", qty: 33000, totalWithGst: 72984.5, pmtUsd: 2.21, pmtInr: 210.11 },
  { port: "Haldia", vesselType: "Panamax", qty: 33000, totalWithGst: 94264.81, pmtUsd: 2.86, pmtInr: 271.37 },
  { port: "Haldia", vesselType: "Cape", qty: 90000, totalWithGst: 101808.54, pmtUsd: 1.13, pmtInr: 107.46 },
  { port: "Haldia", vesselType: "Cape", qty: 90000, totalWithGst: 104664.36, pmtUsd: 1.16, pmtInr: 110.48 },
  { port: "Paradip", vesselType: "Supramax", qty: 60000, totalWithGst: 57001.91, pmtUsd: 0.95, pmtInr: 90.25 },
  { port: "Paradip", vesselType: "Panamax", qty: 75000, totalWithGst: 77650.15, pmtUsd: 1.04, pmtInr: 98.36 },
  { port: "Paradip", vesselType: "Cape", qty: 120000, totalWithGst: 153943.91, pmtUsd: 1.28, pmtInr: 121.87 },
  { port: "Dhamra", vesselType: "Supramax", qty: 60500, totalWithGst: 134799.05, pmtUsd: 2.23, pmtInr: 211.67 },
];

// Fiscal-year halves for the dropdown, latest first; the first is the default.
const PDA_PERIODS = ["2025-26-H1", "2025-26-H2", "2024-25-H1", "2024-25-H2"];
const DEFAULT_PDA_PERIOD = PDA_PERIODS[0]!;

// "2025-26-H1" -> "FY 25-26 H1"
const pdaPeriodDisplay = (period: string): string => {
  const [start = "", end = "", half = ""] = period.split("-");
  return `FY ${start.slice(2)}-${end} ${half}`.trim();
};

export const buildPdaPeriods = (): PdaPeriod[] =>
  PDA_PERIODS.map((p) => ({ period: p, periodDisplay: pdaPeriodDisplay(p) }));

const round2 = (n: number) => Math.round(n * 100) / 100;

// Rows depend on the selected period. The default period returns the pinned
// design figures; other periods apply a deterministic per-period variation.
export const buildPda = (period?: string): PdaRow[] => {
  const p = period ?? DEFAULT_PDA_PERIOD;
  const rows = PDA_ROWS.map((r, i): PdaRow => ({ id: `pda-${i + 1}`, ...r }));
  if (p === DEFAULT_PDA_PERIOD) return rows;
  return rows.map((r) => {
    const rng = seeded(seedFromString(`log-pda-${r.id}-${p}`));
    const factor = 0.85 + rng() * 0.3; // ±15%
    return {
      ...r,
      qty: roundTo(r.qty * factor, 50),
      totalWithGst: round2(r.totalWithGst * factor),
      pmtUsd: round2(r.pmtUsd * factor),
      pmtInr: round2(r.pmtInr * factor),
    };
  });
};

// --- DP Handling Agents — Outstanding Payments -----------------------------
// Outstanding amount owed to each handling agent, grouped by category. Values
// pinned to the design exports (in the port's local currency).
const HANDLING_AGENTS = ["GAC Shipping (INDIA) PVT LTD", "Taurus Shipping Pvt Ltd"];
const OUTSTANDING_CATEGORIES = ["Operations", "Pradip"];

export const buildOutstanding = (): DpHandlingOutstanding => ({
  unit: "Local Currency",
  categories: [...OUTSTANDING_CATEGORIES],
  series: [
    { agent: HANDLING_AGENTS[0]!, data: [98_440_000, 138_260_000] },
    { agent: HANDLING_AGENTS[1]!, data: [146_240_000, 1_230_000] },
  ],
});
