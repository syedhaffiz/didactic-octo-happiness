// Commercial Ops → Plot Rent mock ledger. Frontend-only (no backend mirror yet):
// the API layer branches on USE_MOCK_DATA and calls these builders directly.
//
// One deterministic ledger backs both the "Plot Rent by Port" chart and the
// table, so the bars always equal the sum of the rows shown for the same
// filters. Ports come from the shared catalogue so the Zone / Port dropdowns
// (served by the Contracts filters API) match. Unfiltered, the port totals
// reproduce the Figma figures; the Figma's first port isn't in the catalogue,
// so its total sits on Mundra instead.

import { PORT_LIST, ZONE_PORT_IDS } from "./catalog";
import { pick, range, round, seeded } from "./rand";
import type {
  PlotRentByPortResponse,
  PlotRentEntriesResponse,
  PlotRentEntry,
  PlotRentFilters,
  PlotRentPortPoint,
} from "../types/plotRent";

// Per port: plant code, entry count and the total valuated amount (₹).
// `portId: null` is the unmapped "(Blank)" bucket — its entries carry no amount.
const PORT_TARGETS: ReadonlyArray<{
  portId: string | null;
  plant: string;
  count: number;
  total: number | null;
}> = [
  { portId: "mundra", plant: "5201", count: 18, total: 290_900.51 },
  { portId: "gangavaram", plant: "5224", count: 4, total: 12_641.47 },
  { portId: "hazira", plant: "5234", count: 1, total: -8_644.98 },
  { portId: "krishnapatnam", plant: "5210", count: 42, total: 6_820_166.01 },
  { portId: "navlakhi", plant: "5206", count: 27, total: 84_429.43 },
  { portId: null, plant: "5299", count: 3, total: null },
];

const ACCOUNTS = [
  "KALRA COAL MINES PVT LTD",
  "VAMCOM",
  "VERTEX",
  "CHHATRAL ENVIRONMENTAL MANAGEMENT",
  "AKSHARCHEM INDIA LTD",
  "HONESTFALCON RESOURCES PVT LTD",
  "ANGEL RESOURCES PVT LTD",
  "PATEL COAL CORPORATION",
  "SHIVAM BLACKROCK",
  "SHYAM COAL CORPORATION",
  "KRISHNA KALA TRADERS",
  "VASUKI GLOBAL INDUSTRIES LTD",
] as const;

const LEDGER_START_MS = Date.UTC(2025, 3, 1); // 01 Apr 2025
const LEDGER_END_MS = Date.UTC(2026, 9, 31); // 31 Oct 2026
const DAY_MS = 86_400_000;

const portName = (id: string): string => PORT_LIST.find((p) => p.id === id)?.name ?? id;

/** Scales `weights` so they sum to `total` (2 dp), absorbing rounding in the last item. */
const distribute = (weights: number[], total: number): number[] => {
  if (weights.length === 0) return [];
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const out = weights.map((w) => round((w / sum) * total, 2));
  const drift = round(total - out.reduce((a, b) => a + b, 0), 2);
  out[out.length - 1] = round(out[out.length - 1] + drift, 2);
  return out;
};

interface LedgerRow extends PlotRentEntry {
  /** Internal: catalogue port id for zone / port filtering (null = blank). */
  portId: string | null;
}

const buildLedger = (): LedgerRow[] => {
  const rng = seeded(20_261_120);
  let seq = 0;
  return PORT_TARGETS.flatMap(({ portId, plant, count, total }) => {
    const amounts =
      total === null ? null : distribute(Array.from({ length: count }, () => range(rng, 0.2, 1.8)), total);
    return Array.from({ length: count }, (_, k): LedgerRow => {
      seq += 1;
      const day = Math.floor(rng() * ((LEDGER_END_MS - LEDGER_START_MS) / DAY_MS));
      return {
        id: `PR-${String(seq).padStart(5, "0")}`,
        plant,
        port: portId ? portName(portId).toUpperCase() : null,
        // Every 23rd entry has no account name, as real upstream data sometimes does.
        accountName: seq % 23 === 0 ? null : pick(rng, ACCOUNTS),
        valuatedAmount: amounts ? amounts[k] : null,
        valueDate: new Date(LEDGER_START_MS + day * DAY_MS).toISOString().slice(0, 10),
        portId,
      };
    });
  });
};

let LEDGER: LedgerRow[] | null = null;
const ledger = (): LedgerRow[] => (LEDGER ??= buildLedger());

const matches = (row: LedgerRow, f: PlotRentFilters): boolean => {
  // Zone / port filters can't place an unmapped entry, so they exclude blanks.
  if (f.zone && f.zone !== "all") {
    if (!row.portId || !(ZONE_PORT_IDS[f.zone] ?? []).includes(row.portId)) return false;
  }
  if (f.port && f.port !== "all" && row.portId !== f.port) return false;
  if (f.fromDate || f.toDate) {
    if (!row.valueDate) return false;
    if (f.fromDate && row.valueDate < f.fromDate) return false;
    if (f.toDate && row.valueDate > f.toDate) return false;
  }
  return true;
};

const filtered = (f: PlotRentFilters) => ledger().filter((r) => matches(r, f));

/** Chart: Σ valuated amount per port, ports A→Z with the blank bucket last. */
export const buildPlotRentByPort = (f: PlotRentFilters = {}): PlotRentByPortResponse => {
  const groups = new Map<string | null, LedgerRow[]>();
  for (const r of filtered(f)) {
    const list = groups.get(r.port) ?? [];
    list.push(r);
    groups.set(r.port, list);
  }
  const items: PlotRentPortPoint[] = [...groups].map(([port, rows]) => {
    const withAmount = rows.filter((r) => typeof r.valuatedAmount === "number");
    return {
      port,
      amount: withAmount.length
        ? round(withAmount.reduce((a, r) => a + (r.valuatedAmount ?? 0), 0), 2)
        : null,
    };
  });
  items.sort((a, b) =>
    a.port === null ? 1 : b.port === null ? -1 : a.port.localeCompare(b.port),
  );
  return { items };
};

/** Table: entries, latest value date first. */
export const buildPlotRentEntries = (f: PlotRentFilters = {}): PlotRentEntriesResponse => ({
  items: filtered(f)
    .slice()
    .sort((a, b) => (b.valueDate ?? "").localeCompare(a.valueDate ?? "") || a.id.localeCompare(b.id))
    .map((row) => {
      const out: Partial<LedgerRow> = { ...row };
      delete out.portId;
      return out as PlotRentEntry;
    }),
});
