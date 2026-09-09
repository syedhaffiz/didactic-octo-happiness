// Mock generator for the Finance → Debtors screen. Produces a deterministic
// customer-outstanding book that the mock API filters, sums and returns. Mirrors
// what the real /finance/debtors endpoints will serve so flipping USE_MOCK_DATA
// is the only change needed to switch over.

import type {
  Currency,
  DebtorRow,
  DebtorsFilterOptions,
  DebtorsParams,
  DebtorsResponse,
} from "../../types/finance";
import { intRange, pick, range, round, seeded, seedFromString } from "../rand";

// Every numeric column, used to currency-scale each row generically (one list
// instead of 16 hand-written lines). Aggregation lives on the client now — the
// response carries the filtered rows and the UI derives the Total row from them.
const NUMERIC_KEYS = [
  "balanceOutstanding",
  "notedLc",
  "lc",
  "netReceivable",
  "contractuallyNotDue",
  "tdsMaterial",
  "notDue",
  "dueAmount",
  "age0_30",
  "age31_60",
  "age61_90",
  "age91_120",
  "age121_180",
  "age181_365",
  "age1_2yr",
  "age2yr_plus",
] as const;

// Reference lists backing both the fixture rows and the Filters side-panel. Zone
// labels carry the "Zone- N" spacing from the design.
const ZONES = ["Zone- 1", "Zone- 2", "Zone- 3", "Zone- 4", "Zone- 5", "Zone- 6", "Zone- 7", "Zone- 8"];
const PORTS = ["Gangavaram", "Paradip", "Hazira", "Dhamra", "Bedi", "TUNA", "Krishnapatnam", "Other"];
const SEGMENTS = ["SNS", "SEB", "TPH", "SAGARMALA", "OTHER"];
const GROUPS = ["Sales", "Handling", "ADI Group", "Legal", "Static", "Others"];
const AGINGS = ["0-30 days", "31-60 days", "61-90 days", "91-180 days", ">180 days"];
const TYPES = ["Domestic", "Export"];

// Indicative INR→USD rate for the currency toggle — the real API applies the
// booked rate; the mock just divides so USD figures land in a plausible range.
const USD_PER_INR = 1 / 83;

// A handful of real-looking customers from the design, so the first page reads
// like the Figma. The brand name appears here as an authorized on-screen value
// for this screen (same allowance as the Market Share "Share" catalogue).
const SEED_CUSTOMERS = [
  "ACC LTD",
  "A J COAL PVT LTD",
  "A K TRADELINK",
  "A ONE STEEL AND ALLO",
  "A ONE STEELS INDIA P",
  "AAISWARYA DYEING MIL",
  "A AND A INTERNATIONAL",
  "ADANI ELECTRICITY MUMBAI LTD",
  "ADANI MINING PTY LTD",
  "ADANI POWER LTD",
  "ADANI WILMAR LTD",
  "ADARSH COALHUB LLP",
];

// Fragments recombined into further plausible trading-company names to pad the
// book out to a realistic size.
const NAME_HEADS = [
  "BALAJI",
  "SHREE",
  "JAI",
  "NATIONAL",
  "EASTERN",
  "WESTERN",
  "COASTAL",
  "PRIME",
  "UNITED",
  "GLOBAL",
  "ORIENT",
  "SUPREME",
  "VICTORY",
  "RELIABLE",
  "STERLING",
  "PIONEER",
  "SUNRISE",
  "METRO",
  "DIAMOND",
  "GATEWAY",
];
const NAME_MIDS = ["COAL", "STEEL", "MINERALS", "TRADING", "ENERGY", "CEMENT", "LOGISTICS", "POWER", "INDUSTRIES", "ENTERPRISES"];
const NAME_TAILS = ["LTD", "PVT LTD", "LLP", "& CO", "INDIA LTD", "CORPORATION"];

// The full customer book — the seed rows first, then generated ones up to
// `count`. Deterministic (fixed seed) so the fixture never reshuffles.
const buildBook = (count: number): DebtorRow[] => {
  const rng = seeded(seedFromString("finance:debtors"));
  const rows: DebtorRow[] = [];
  const usedNames = new Set<string>();

  const makeRow = (customer: string): DebtorRow => {
    // ~1 in 9 rows carries a Letter of Credit; the rest sit at zero (matching
    // the design, where most LC / Noted LC cells read 0).
    const hasLc = rng() < 0.11;
    const lc = hasLc ? Math.round(range(rng, 2_000_000, 120_000_000)) : 0;
    const notedLc = hasLc && rng() < 0.4 ? Math.round(range(rng, 500_000, 5_000_000)) : 0;
    // Balances lean negative (debtor positions) with a positive minority. The
    // range is centred so the book's net magnitude lands near the design's
    // ~13 Cr total outstanding across the full 245-customer set.
    const balanceOutstanding = round(range(rng, -3_775_000, 3_125_000), 2);
    // Net Receivable reconciles the balance with any LC exposure. When there is
    // no LC (the common case) it equals the balance — as the design shows.
    const netReceivable = round(balanceOutstanding + notedLc + lc, 2);

    // Receivable-status columns — sparse, mostly zero (as the design shows).
    const contractuallyNotDue = rng() < 0.12 ? round(range(rng, -500_000_000, 500_000_000), 0) : 0;
    const tdsMaterial = rng() < 0.15 ? round(range(rng, 50_000, 800_000), 0) : 0;
    const notDue = rng() < 0.4 ? round(range(rng, 1_000_000, 550_000_000), 0) : 0;
    const dueAmount = round(range(rng, -4_000_000, 2_500_000), 2);

    // Age the due amount into one or two buckets; the rest stay zero. Keeping
    // Σ(buckets) === dueAmount makes the Due Amount column reconcile.
    const ages: [number, number, number, number, number, number, number, number] = [
      0, 0, 0, 0, 0, 0, 0, 0,
    ];
    if (dueAmount !== 0) {
      const primary = intRange(rng, 0, 7);
      if (rng() < 0.35 && primary < 7) {
        const split = round(dueAmount * range(rng, 0.3, 0.7), 2);
        ages[primary] = round(dueAmount - split, 2);
        ages[primary + 1] = split;
      } else {
        ages[primary] = dueAmount;
      }
    }

    return {
      customerNumber: String(100_000 + Math.floor(range(rng, 0, 850_000))),
      customer,
      zone: pick(rng, ZONES),
      portName: pick(rng, PORTS),
      segmentName: pick(rng, SEGMENTS),
      group: pick(rng, GROUPS),
      balanceOutstanding,
      notedLc,
      lc,
      netReceivable,
      contractuallyNotDue,
      tdsMaterial,
      notDue,
      dueAmount,
      age0_30: ages[0],
      age31_60: ages[1],
      age61_90: ages[2],
      age91_120: ages[3],
      age121_180: ages[4],
      age181_365: ages[5],
      age1_2yr: ages[6],
      age2yr_plus: ages[7],
      aging: pick(rng, AGINGS),
      type: pick(rng, TYPES),
    };
  };

  SEED_CUSTOMERS.forEach((name) => {
    usedNames.add(name);
    rows.push(makeRow(name));
  });

  while (rows.length < count) {
    const name = `${pick(rng, NAME_HEADS)} ${pick(rng, NAME_MIDS)} ${pick(rng, NAME_TAILS)}`;
    // Skip the rare duplicate so the customer dropdown stays clean.
    if (usedNames.has(name)) continue;
    usedNames.add(name);
    rows.push(makeRow(name));
  }
  return rows;
};

// The book is built once and reused across requests — filtering/summing happens
// per call on this stable dataset.
const BOOK = buildBook(245);

const scale = (value: number, currency: Currency): number =>
  currency === "USD" ? Math.round(value * USD_PER_INR * 100) / 100 : value;

// Each filter is a comma-joined multi-select — a row passes when its value is
// in the selected set (an empty/absent filter matches everything).
const inCsv = (value: string, param: string | undefined): boolean => {
  if (!param) return true;
  const list = param.split(",").filter(Boolean);
  return list.length === 0 || list.includes(value);
};

const matches = (row: DebtorRow, p: DebtorsParams): boolean =>
  inCsv(row.zone, p.zone) &&
  inCsv(row.portName, p.port) &&
  inCsv(row.segmentName, p.segment) &&
  inCsv(row.customer, p.customer) &&
  inCsv(row.group, p.group) &&
  inCsv(row.aging, p.aging) &&
  inCsv(row.type, p.type);

export const buildDebtors = (p: DebtorsParams = {}): DebtorsResponse => {
  const currency: Currency = p.currency === "USD" ? "USD" : "INR";

  // `tillDate` is the as-of date for the balances. The mock returns the same
  // book regardless (the real API would re-age against it); it flows through so
  // the seam and the URL state stay honest.
  const filtered = BOOK.filter((r) => matches(r, p)).map((r) => {
    const out = { ...r };
    for (const k of NUMERIC_KEYS) out[k] = scale(r[k], currency);
    return out;
  });

  // Aggregation (the Total row + the banner) is derived on the client from these
  // rows, so it depends only on the current filter result — never on the page.
  return {
    currency,
    periodLabel: "Apr 25 : Feb 26",
    items: filtered,
  };
};

export const buildDebtorsFilterOptions = (): DebtorsFilterOptions => ({
  zones: ZONES,
  ports: PORTS,
  segments: SEGMENTS,
  customers: [...new Set(BOOK.map((r) => r.customer))].sort((a, b) => a.localeCompare(b)),
  groups: GROUPS,
  agings: AGINGS,
  types: TYPES,
});
