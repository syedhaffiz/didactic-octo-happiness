// Mock generator for the Finance → Debtors screen. Produces a deterministic
// customer-outstanding book that the mock API filters, sums and returns. Mirrors
// what the real /finance/debtors endpoints will serve so flipping USE_MOCK_DATA
// is the only change needed to switch over.

import type {
  Currency,
  DebtorRow,
  DebtorTotals,
  DebtorsFilterOptions,
  DebtorsParams,
  DebtorsResponse,
} from "../../types/finance";
import { pick, range, seeded, seedFromString } from "../rand";

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
    const balanceOutstanding = Math.round(range(rng, -4_164_000, 2_736_000) * 100) / 100;
    // Net Receivable reconciles the balance with any LC exposure. When there is
    // no LC (the common case) it equals the balance — as the design shows.
    const netReceivable = Math.round((balanceOutstanding + notedLc + lc) * 100) / 100;
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

const matches = (row: DebtorRow, p: DebtorsParams): boolean =>
  (!p.zone || row.zone === p.zone) &&
  (!p.port || row.portName === p.port) &&
  (!p.segment || row.segmentName === p.segment) &&
  (!p.customer || row.customer === p.customer) &&
  (!p.group || row.group === p.group) &&
  (!p.aging || row.aging === p.aging) &&
  (!p.type || row.type === p.type);

export const buildDebtors = (p: DebtorsParams = {}): DebtorsResponse => {
  const currency: Currency = p.currency === "USD" ? "USD" : "INR";

  // `tillDate` is the as-of date for the balances. The mock returns the same
  // book regardless (the real API would re-age against it); it flows through so
  // the seam and the URL state stay honest.
  const filtered = BOOK.filter((r) => matches(r, p)).map((r) => ({
    ...r,
    balanceOutstanding: scale(r.balanceOutstanding, currency),
    notedLc: scale(r.notedLc, currency),
    lc: scale(r.lc, currency),
    netReceivable: scale(r.netReceivable, currency),
  }));

  const totals: DebtorTotals = filtered.reduce<DebtorTotals>(
    (acc, r) => ({
      balanceOutstanding: acc.balanceOutstanding + r.balanceOutstanding,
      notedLc: acc.notedLc + r.notedLc,
      lc: acc.lc + r.lc,
      netReceivable: acc.netReceivable + r.netReceivable,
    }),
    { balanceOutstanding: 0, notedLc: 0, lc: 0, netReceivable: 0 },
  );

  // Round the accumulated totals so floating-point noise doesn't leak into the
  // pinned row.
  (Object.keys(totals) as (keyof DebtorTotals)[]).forEach((k) => {
    totals[k] = Math.round(totals[k] * 100) / 100;
  });

  // The banner headline is the magnitude of the net balance position across the
  // filtered customers — i.e. |Σ Balance Outstanding| (the design shows this as
  // "13.16 Cr", matching its Total row's Balance Outstanding of ~-13.16 Cr).
  const totalOutstanding = Math.abs(totals.balanceOutstanding);

  return {
    currency,
    periodLabel: "Apr 25 : Feb 26",
    totalOutstanding,
    customerCount: filtered.length,
    totals,
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
