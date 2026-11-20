// Commercial Ops → Contracts mock book. Frontend-only (no backend mirror yet):
// the API layer branches on USE_MOCK_DATA and calls these builders directly.
//
// One deterministic contract book backs both screens, so the overview tiles,
// donuts and EMD chart always add up to what the details table lists for the
// same filters. Unfiltered, the status counts / MT and the pending-EMD port
// split reproduce the Figma figures.
//
// Assumption (not stated in the design): "Port-wise contracts" and "Pending EMD
// Aging Analysis" both cover the contracts whose EMD is still pending — the two
// cards show the same four ports.

import { PORT_LIST, SEGMENT_LIST, ZONE_LIST, ZONE_PORT_IDS } from "./catalog";
import { intRange, pick, range, round, seeded } from "./rand";
import type {
  ContractPortBucket,
  ContractRow,
  ContractsFilterOptions,
  ContractsFilters,
  ContractsOverview,
  ContractsResponse,
  ContractStatusBucket,
  EmdAgingPoint,
} from "../types/commercialOps";

// --- Reference data ---------------------------------------------------------

/** Status catalogue in display order, with the Figma count and total MT. */
export const CONTRACT_STATUSES: ReadonlyArray<{ name: string; count: number; mt: number }> = [
  { name: "ADI", count: 13, mt: 273798.33 },
  { name: "Dispute", count: 39, mt: 27672.36 },
  { name: "Legal", count: 5, mt: 12217.91 },
  { name: "NFA Under Approval", count: 1, mt: 82476.0 },
  { name: "Payment Pending", count: 1, mt: 9986.07 },
  { name: "QC Settlement Pending", count: 3, mt: 65107.48 },
  { name: "Quality Issues", count: 20, mt: 195253.43 },
  { name: "Running", count: 783, mt: 1922925.39 },
  { name: "Submitted to finance", count: 163, mt: 884102.625 },
  { name: "No Remarks", count: 135, mt: 53745.935 },
  { name: "Under Closure", count: 644, mt: 2178929.53 },
];

// Pending-EMD split by port id: contract count, total MT, total EMD (₹).
const PENDING_EMD_TARGETS: ReadonlyArray<{ portId: string; count: number; mt: number; emd: number }> = [
  { portId: "gangavaram", count: 1, mt: 250, emd: 26_000 },
  { portId: "hazira", count: 11, mt: 18_510, emd: 1_431_000 },
  { portId: "krishnapatnam", count: 3, mt: 1_394, emd: 179_000 },
  { portId: "navlakhi", count: 13, mt: 8_300, emd: 723_000 },
];

// Statuses a pending-EMD contract can sit in.
const PENDING_EMD_STATUSES = new Set(["Running", "Submitted to finance", "Dispute"]);

const CONTRACT_PORT_IDS = [
  "krishnapatnam",
  "hazira",
  "gangavaram",
  "navlakhi",
  "mundra",
  "dahej",
  "paradip",
  "dhamra",
] as const;

const TRADERS_BY_PORT: Record<string, readonly string[]> = {
  krishnapatnam: ["Sriram V", "K. Venkatesh"],
  hazira: ["Praveen Upman", "Nikhil Shah"],
  gangavaram: ["Balbeer Singh Ranawat", "S. Rao"],
  navlakhi: ["Rahul D Mali", "Jignesh Patel"],
  mundra: ["Amit Joshi", "Rahul D Mali"],
  dahej: ["Nikhil Shah", "Praveen Upman"],
  paradip: ["Sourav Das", "P. Mohanty"],
  dhamra: ["P. Mohanty", "Sourav Das"],
};

const CUSTOMERS = [
  "AGARWAL COAL COMPANY",
  "SHIVAM BLACKROCK",
  "KRIYAS UNIPRO PVT LTD",
  "VAMCOM",
  "VASUKI GLOBAL INDUSTRIES LTD",
  "PATEL COAL CORPORATION",
  "SHYAM COAL CORPORATION",
  "KRISHNA KALA TRADERS",
  "MAHALAXMI FUELS",
  "OM SAI ENERGY",
  "BHAGWATI MINERALS",
  "SURYA THERMAL LLP",
] as const;

// Segment ids, weighted toward SNS like the Figma book.
const SEGMENT_POOL = ["sns", "sns", "sns", "sns", "sns", "sns", "seb", "tph", "domestic"] as const;

const MINES_BY_COUNTRY: Record<string, readonly string[]> = {
  INDO: ["MIFA LAYLAN", "BSSR -BMU", "BSSR", "BUNYU", "KUTAI ENERGI", "LHI", "KE"],
  USA: ["NAP"],
  AUS: ["HUNTER VALLEY"],
  SA: ["RBCT"],
  RUS: ["KUZBASS"],
};
const COUNTRY_POOL = ["INDO", "INDO", "INDO", "INDO", "INDO", "INDO", "USA", "AUS", "SA", "RUS"] as const;
const GAR_POOL = [3000, 3400, 3800, 4200, 4700, 5500, 6300] as const;

const FIRST_TC_NO = 1_210_035_848;
const BOOK_START_MS = Date.UTC(2025, 3, 1); // 01 Apr 2025
const BOOK_END_MS = Date.UTC(2026, 9, 31); // 31 Oct 2026
const DAY_MS = 86_400_000;

const portName = (id: string): string => PORT_LIST.find((p) => p.id === id)?.name ?? id;
const segmentName = (id: string): string => SEGMENT_LIST.find((s) => s.id === id)?.name ?? id;
const isoDate = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

/** Scales `weights` so they sum to `total` (2-dp), absorbing rounding in the last item. */
const distribute = (weights: number[], total: number, decimals = 2): number[] => {
  if (weights.length === 0) return [];
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const out = weights.map((w) => round((w / sum) * total, decimals));
  const drift = round(total - out.reduce((a, b) => a + b, 0), decimals);
  out[out.length - 1] = round(out[out.length - 1] + drift, decimals);
  return out;
};

// --- Book generation --------------------------------------------------------

interface BookRow extends ContractRow {
  /** Internal: catalogue port id, used for zone / port filtering. */
  portId: string;
  /** Internal: catalogue segment id, used for segment filtering. */
  segmentId: string;
}

const buildBook = (): BookRow[] => {
  const rng = seeded(20_251_120);

  // 1. One slot per contract, grouped by status.
  const slots: string[] = CONTRACT_STATUSES.flatMap((s) => Array<string>(s.count).fill(s.name));

  // 2. Pick which slots carry a pending EMD (spread evenly across the eligible
  //    statuses) and which port each belongs to.
  const eligible = slots.flatMap((s, i) => (PENDING_EMD_STATUSES.has(s) ? [i] : []));
  const pendingPorts = PENDING_EMD_TARGETS.flatMap((t) => Array<string>(t.count).fill(t.portId));
  const pendingByIndex = new Map<number, string>();
  const step = Math.max(1, Math.floor(eligible.length / Math.max(1, pendingPorts.length)));
  pendingPorts.forEach((portId, k) => {
    const idx = eligible[Math.min(k * step, eligible.length - 1)];
    if (idx !== undefined) pendingByIndex.set(idx, portId);
  });

  // 3. Pending-EMD quantities and amounts, scaled to the per-port targets.
  const pendingQty = new Map<number, number>();
  const pendingEmd = new Map<number, number>();
  for (const target of PENDING_EMD_TARGETS) {
    const idxs = [...pendingByIndex].filter(([, p]) => p === target.portId).map(([i]) => i);
    const qty = distribute(idxs.map(() => range(rng, 0.5, 1.5)), target.mt, 0);
    const emd = distribute(idxs.map(() => range(rng, 0.5, 1.5)), target.emd, 0);
    idxs.forEach((i, k) => {
      pendingQty.set(i, qty[k]);
      pendingEmd.set(i, emd[k]);
    });
  }

  // 4. Remaining quantities, scaled so each status still sums to its Figma MT.
  const quantity: number[] = new Array(slots.length).fill(0);
  for (const status of CONTRACT_STATUSES) {
    const idxs = slots.flatMap((s, i) => (s === status.name ? [i] : []));
    const fixed = idxs.filter((i) => pendingQty.has(i));
    const free = idxs.filter((i) => !pendingQty.has(i));
    const fixedSum = fixed.reduce((a, i) => a + (pendingQty.get(i) ?? 0), 0);
    const scaled = distribute(
      free.map(() => range(rng, 0.3, 1.7)),
      Math.max(0, status.mt - fixedSum),
      3,
    );
    fixed.forEach((i) => (quantity[i] = pendingQty.get(i) ?? 0));
    free.forEach((i, k) => (quantity[i] = scaled[k]));
  }

  // 5. Fill in the rest of each contract.
  return slots.map((status, i): BookRow => {
    const pendingPort = pendingByIndex.get(i);
    const portId = pendingPort ?? pick(rng, CONTRACT_PORT_IDS);
    const segmentId = pick(rng, SEGMENT_POOL);
    const country = pick(rng, COUNTRY_POOL);
    const gar = rng() < 0.02 ? null : pick(rng, GAR_POOL);
    const qty = quantity[i];

    const openQty = Math.max(0, Math.round(qty * range(rng, 0.15, 1)));
    const openTcQty = rng() < 0.6 ? openQty : Math.round(openQty * range(rng, 0, 1));

    const tcRate = round((gar ?? 4200) * range(rng, 1.1, 2.4) / 5, 0) * 5;
    const m2mRoll = rng();
    const m2mRate =
      m2mRoll < 0.02 ? null : m2mRoll < 0.22 ? 0 : round(tcRate * range(rng, 0.8, 1.4) / 50, 0) * 50;

    const tcValue = round(tcRate * openQty, 2);
    const m2mValue = m2mRate === null ? null : round((tcRate - m2mRate) * openQty, 2);

    const emdStatus = pendingPort ? "Pending" : rng() < 0.3 ? "Received" : null;
    const emdAmount = pendingPort
      ? pendingEmd.get(i) ?? null
      : rng() < 0.03
        ? null
        : Math.round(tcValue * range(rng, 0.02, 0.05));

    // A handful of rows carry gaps, as real upstream data does.
    const sparse = i % 97 === 41;

    return {
      tcNo: String(FIRST_TC_NO + i),
      postingDate: sparse
        ? null
        : isoDate(BOOK_START_MS + Math.floor(rng() * ((BOOK_END_MS - BOOK_START_MS) / DAY_MS)) * DAY_MS),
      customer: sparse ? null : pick(rng, CUSTOMERS),
      segment: segmentName(segmentId),
      plant: portName(portId).toUpperCase(),
      trader: sparse ? null : pick(rng, TRADERS_BY_PORT[portId] ?? ["—"]),
      quantityMt: qty,
      openQty,
      openTcQty,
      country,
      gar,
      mine: sparse ? null : pick(rng, MINES_BY_COUNTRY[country] ?? ["—"]),
      tcRate,
      m2mRate,
      m2mValue,
      tcValue,
      emdAmount,
      emdStatus,
      emdAgingDays: pendingPort ? intRange(rng, 1, 45) : null,
      status,
      portId,
      segmentId,
    };
  });
};

// Built lazily once — the book is deterministic, so it never needs rebuilding.
let BOOK: BookRow[] | null = null;
const book = (): BookRow[] => (BOOK ??= buildBook());

// --- Filtering + aggregation ------------------------------------------------

const matches = (row: BookRow, f: ContractsFilters): boolean => {
  if (f.zone && f.zone !== "all" && !(ZONE_PORT_IDS[f.zone] ?? []).includes(row.portId)) return false;
  if (f.port && f.port !== "all" && row.portId !== f.port) return false;
  if (f.segment && f.segment !== "all" && row.segmentId !== f.segment) return false;
  if (f.status && row.status !== f.status) return false;
  if (f.emd === "pending" && row.emdStatus !== "Pending") return false;
  if (f.fromDate || f.toDate) {
    // A contract with no posting date can't be placed in a window.
    if (!row.postingDate) return false;
    if (f.fromDate && row.postingDate < f.fromDate) return false;
    if (f.toDate && row.postingDate > f.toDate) return false;
  }
  return true;
};

const filtered = (f: ContractsFilters): BookRow[] => book().filter((r) => matches(r, f));

// Drop the internal filter keys before a row leaves the mock layer.
const stripInternal = (row: BookRow): ContractRow => {
  const out: Partial<BookRow> = { ...row };
  delete out.portId;
  delete out.segmentId;
  return out as ContractRow;
};

export const buildContractsOverview = (f: ContractsFilters = {}): ContractsOverview => {
  // The overview never narrows by status — the status card *is* the status split.
  const rows = filtered({ ...f, status: undefined, emd: undefined });

  const statuses: ContractStatusBucket[] = CONTRACT_STATUSES.map(({ name }) => {
    const inStatus = rows.filter((r) => r.status === name);
    return {
      status: name,
      count: inStatus.length,
      quantityMt: round(inStatus.reduce((a, r) => a + (r.quantityMt ?? 0), 0), 3),
    };
  });

  const pending = rows.filter((r) => r.emdStatus === "Pending");
  const portIds = [...new Set(pending.map((r) => r.portId))].sort((a, b) =>
    portName(a).localeCompare(portName(b)),
  );

  const ports: ContractPortBucket[] = [];
  const emdAging: EmdAgingPoint[] = [];
  for (const id of portIds) {
    const inPort = pending.filter((r) => r.portId === id);
    const name = portName(id);
    ports.push({
      portId: id,
      port: name,
      count: inPort.length,
      quantityMt: round(inPort.reduce((a, r) => a + (r.quantityMt ?? 0), 0), 2),
    });
    const aged = inPort.filter((r) => r.emdAgingDays !== null);
    emdAging.push({
      port: name,
      emdAmount: inPort.reduce((a, r) => a + (r.emdAmount ?? 0), 0),
      agingDays: aged.length
        ? Math.round(aged.reduce((a, r) => a + (r.emdAgingDays ?? 0), 0) / aged.length)
        : 0,
    });
  }

  return {
    statuses,
    totalContracts: rows.length,
    totalQuantityMt: round(rows.reduce((a, r) => a + (r.quantityMt ?? 0), 0), 3),
    ports,
    portTotalContracts: pending.length,
    portTotalQuantityMt: round(pending.reduce((a, r) => a + (r.quantityMt ?? 0), 0), 2),
    emdAging,
  };
};

export const buildContracts = (f: ContractsFilters = {}): ContractsResponse => ({
  items: filtered(f)
    .slice()
    // Newest posting first; undated contracts sink to the bottom.
    .sort(
      (a, b) =>
        (b.postingDate ?? "").localeCompare(a.postingDate ?? "") || a.tcNo.localeCompare(b.tcNo),
    )
    .map(stripInternal),
});

// Filter options for the overview header — three independent flat lists
// (zone, port and segment don't constrain one another). Ports and segments are
// limited to those that occur in the contract book.
export const buildContractsFilterOptions = (): ContractsFilterOptions => {
  const rows = book();
  const portIds = new Set(rows.map((r) => r.portId));
  const segmentIds = new Set(rows.map((r) => r.segmentId));
  const option = ({ id, name }: { id: string; name: string }) => ({ id, name });

  return {
    zones: ZONE_LIST.map(option),
    ports: PORT_LIST.filter((p) => portIds.has(p.id)).map(option),
    segments: SEGMENT_LIST.filter((s) => segmentIds.has(s.id)).map(option),
  };
};
