// Mock generator for the Finance → Debtors screens (table + overview). Produces
// a deterministic customer-outstanding book that the mock API filters and
// aggregates. Mirrors what the real /finance/debtors endpoints will serve so
// flipping USE_MOCK_DATA is the only change needed to switch over.

import type {
  Currency,
  DebtorRow,
  DebtorsBreakdownItem,
  DebtorsFilterOptions,
  DebtorsOverviewResponse,
  DebtorsParams,
  DebtorsResponse,
} from "../../types/finance";
import { intRange, pick, range, round, seeded, seedFromString } from "../rand";

// Every numeric column, used to currency-scale each row generically (one list
// instead of hand-written lines). Aggregation lives elsewhere (the table derives
// its Total row on the client; the overview endpoint aggregates below).
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
  "age91_180",
  "age181_365",
  "age1_2yr",
  "age2yr_plus",
] as const;

// Reference lists backing both the fixture rows and the Filters side-panel. Zone
// labels carry the "Zone- N" spacing from the design.
const ZONES = ["Zone- 1", "Zone- 2", "Zone- 3", "Zone- 4", "Zone- 5", "Zone- 6", "Zone- 7", "Zone- 8"];
const PORTS = ["Gangavaram", "Paradip", "Hazira", "Dhamra", "Bedi", "TUNA", "Krishnapatnam", "Other"];
const SEGMENTS = ["SNS", "SEB", "TPH", "SAGARMALA", "OTHER"];
const GROUPS = [
  "ADI Group",
  "Group Co",
  "Others",
  "Handling",
  "JP Group",
  "Sales / Handling",
  "Legal",
  "Sales",
  "Static",
];
const TYPES = ["Domestic", "Export"];

// The canonical aging buckets, used across the whole Debtors screen (the filter,
// the overview aging tiles, and — index-aligned — the age* row columns).
export const AGINGS = [
  "0-30 days",
  "31-60 days",
  "61-90 days",
  "91-180 days",
  "181-365 days",
  "1-2 years",
  "2+ years",
];

// The age* row columns are index-aligned with AGINGS: age0_30 ↔ AGINGS[0] …
// age2yr_plus ↔ AGINGS[6]. A row's dueAmount lands in the column at its aging
// index (see makeRow).

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
    const notDue = rng() < 0.4 ? round(range(rng, 300_000, 5_000_000), 0) : 0;
    // Overdue amount — a wide spread around a small positive mean, so the segment
    // and group receivable tiles land a realistic mix of positive and negative
    // (credits/advances), which the tiles colour differently.
    const dueAmount = round(range(rng, -20_000_000, 22_000_000), 2);

    // The row's dominant aging bucket. The whole due amount sits in that one
    // bucket (others stay 0), so the aging filter, the overview aging tiles, and
    // these columns all agree. `agingIdx` is in range by construction.
    const agingIdx = intRange(rng, 0, AGINGS.length - 1);
    const aging = AGINGS[agingIdx] as string;

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
      age0_30: agingIdx === 0 ? dueAmount : 0,
      age31_60: agingIdx === 1 ? dueAmount : 0,
      age61_90: agingIdx === 2 ? dueAmount : 0,
      age91_180: agingIdx === 3 ? dueAmount : 0,
      age181_365: agingIdx === 4 ? dueAmount : 0,
      age1_2yr: agingIdx === 5 ? dueAmount : 0,
      age2yr_plus: agingIdx === 6 ? dueAmount : 0,
      aging,
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

// The book is built once and reused across requests — filtering/aggregation
// happens per call on this stable dataset.
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

// The overview landing screen. Aggregates the same book (post-filter) three
// ways: by aging bucket, by segment, and by group. `netReceivable` = due +
// notDue and is the donut centre; each grouping partitions all rows, so the
// segment and group slices both sum to it.
export const buildDebtorsOverview = (p: DebtorsParams = {}): DebtorsOverviewResponse => {
  const currency: Currency = p.currency === "USD" ? "USD" : "INR";
  const rows = BOOK.filter((r) => matches(r, p));
  const sc = (v: number) => round(scale(v, currency), 2);

  // Aging tiles — Σ dueAmount for the customers whose dominant aging is each
  // bucket (always all seven, zero when a bucket is empty).
  const agingDue = new Map<string, number>(AGINGS.map((a) => [a, 0]));
  for (const r of rows) agingDue.set(r.aging, (agingDue.get(r.aging) ?? 0) + r.dueAmount);
  const aging = AGINGS.map((bucket) => ({ bucket, value: sc(agingDue.get(bucket) ?? 0) }));

  // Segment-/group-wise breakdown: value = due + notDue, dropping rows a name
  // never received (keeps empty slices out of the donut).
  const breakdown = (keyOf: (r: DebtorRow) => string, names: string[]): DebtorsBreakdownItem[] => {
    const due = new Map<string, number>(names.map((n) => [n, 0]));
    const notDue = new Map<string, number>(names.map((n) => [n, 0]));
    for (const r of rows) {
      const k = keyOf(r);
      if (!due.has(k)) continue;
      due.set(k, (due.get(k) ?? 0) + r.dueAmount);
      notDue.set(k, (notDue.get(k) ?? 0) + r.notDue);
    }
    return names
      .map((name) => {
        const d = sc(due.get(name) ?? 0);
        const nd = sc(notDue.get(name) ?? 0);
        return { name, due: d, notDue: nd, value: round(d + nd, 2) };
      })
      .filter((item) => item.value !== 0 || item.due !== 0 || item.notDue !== 0);
  };

  const segments = breakdown((r) => r.segmentName, SEGMENTS);
  const groups = breakdown((r) => r.group, GROUPS);

  const netReceivable = round(segments.reduce((s, i) => s + i.value, 0), 2);
  const totalDue = round(segments.reduce((s, i) => s + i.due, 0), 2);
  const totalNotDue = round(segments.reduce((s, i) => s + i.notDue, 0), 2);

  return {
    currency,
    periodLabel: "Apr 25 : Feb 26",
    netReceivable,
    totalDue,
    totalNotDue,
    aging,
    segments,
    groups,
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
