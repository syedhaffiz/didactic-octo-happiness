// Frontend-only mock for Finance → Insurance Status. There is no backend
// endpoint yet; the HTTP client in api/finance.ts already targets the path the
// real API is expected to expose, so flipping USE_MOCK_DATA is the only change
// needed once it lands.

import type {
  InsuranceFilterOptions,
  InsurancePolicyRow,
  InsuranceSegmentSummary,
  InsuranceStatus,
  InsuranceStatusParams,
  InsuranceStatusResponse,
} from "../../types/finance";
import { PORT_LIST, ZONE_PORT_IDS } from "../catalog";

const CR = 10_000_000;

// Segment display order — matches the Figma KPI strip and Sankey (top → bottom).
const SEGMENT_ORDER = ["ICM", "Bunkering", "Rock Phosphate", "Sagarmala"] as const;

// Per-segment totals (Cr) pinned to the Figma so the unfiltered view reads the
// same: 12,542.87 + 2,725.73 + 16.60 + 5,664.40 = 20,949.60 Cr sum insured.
const SEGMENT_TOTALS: Record<string, { sumInsuredCr: number; stockValueCr: number }> = {
  ICM: { sumInsuredCr: 12_542.87, stockValueCr: 842.15 },
  Bunkering: { sumInsuredCr: 2_725.73, stockValueCr: 3_120.5 },
  "Rock Phosphate": { sumInsuredCr: 16.6, stockValueCr: 567.8 },
  Sagarmala: { sumInsuredCr: 5_664.4, stockValueCr: 2_890.45 },
};

interface Seed {
  segment: string;
  policyType: string;
  /** Catalogue port id (PORT_LIST) — the Sankey's third column. */
  port: string;
  /** Relative share of the segment's totals. */
  weight: number;
  /** Defaults to the current fiscal year when omitted. */
  periodStart?: string;
  periodEnd?: string;
  status?: InsuranceStatus;
}

const FY_START = "2026-04-01";
const FY_END = "2027-03-31";

const MARINE = "Marine Policy";
const CUSTOMS = "Customs Duty";
const FIRE = "Fire Policy";
const FIRE_NON_FLOATER = "Fire Policy Non Floater";
const MARINE_FOR = "Marine Cargo FOR sales";
const STOCK_THROUGHPUT = "Stock Throughput Policy";
const MACHINERY = "Machinery Breakdown";

// Insured risks across seven policy types. The book is deliberately
// many-to-many so the Sankey shows merging flows: Marine Policy is held by all
// four segments, Stock Throughput and Machinery Breakdown by three, Customs
// Duty and Fire Policy by two each; Mundra, Hazira, Paradip, Krishnapatnam, Gangavaram
// and Dahej are each covered by more than one policy type. Weights split each
// segment's pinned totals.
const SEEDS: Seed[] = [
  // ICM
  { segment: "ICM", policyType: FIRE_NON_FLOATER, port: "krishnapatnam", weight: 22 },
  { segment: "ICM", policyType: FIRE_NON_FLOATER, port: "tuna", weight: 14 },
  { segment: "ICM", policyType: FIRE_NON_FLOATER, port: "mundra", weight: 20 },
  { segment: "ICM", policyType: FIRE_NON_FLOATER, port: "dhamra", weight: 12 },
  { segment: "ICM", policyType: MARINE_FOR, port: "gangavaram", weight: 10, periodStart: "2026-06-01", periodEnd: "2027-05-31" },
  { segment: "ICM", policyType: MARINE_FOR, port: "paradip", weight: 8, periodStart: "2026-06-01", periodEnd: "2027-05-31" },
  { segment: "ICM", policyType: MARINE, port: "mundra", weight: 8 },
  { segment: "ICM", policyType: MARINE, port: "hazira", weight: 6 },
  { segment: "ICM", policyType: STOCK_THROUGHPUT, port: "gangavaram", weight: 7 },
  { segment: "ICM", policyType: MACHINERY, port: "dhamra", weight: 5 },
  // Bunkering — the Hazira marine cover lapses this month, so the segment reads
  // as at-risk.
  { segment: "Bunkering", policyType: MARINE, port: "mundra", weight: 40 },
  { segment: "Bunkering", policyType: MARINE, port: "hazira", weight: 20, periodStart: "2025-12-01", periodEnd: "2026-11-30", status: "Expiring Soon" },
  { segment: "Bunkering", policyType: CUSTOMS, port: "mundra", weight: 25, periodStart: "2026-01-01", periodEnd: "2026-12-31" },
  { segment: "Bunkering", policyType: CUSTOMS, port: "dahej", weight: 15, periodStart: "2026-01-01", periodEnd: "2026-12-31" },
  { segment: "Bunkering", policyType: STOCK_THROUGHPUT, port: "dahej", weight: 12, periodStart: "2026-05-01", periodEnd: "2027-04-30" },
  // Rock Phosphate
  { segment: "Rock Phosphate", policyType: FIRE, port: "navlakhi", weight: 30, periodStart: "2026-07-01", periodEnd: "2027-06-30" },
  { segment: "Rock Phosphate", policyType: FIRE, port: "gopalpur", weight: 20, periodStart: "2026-07-01", periodEnd: "2027-06-30" },
  { segment: "Rock Phosphate", policyType: FIRE, port: "krishnapatnam", weight: 15, periodStart: "2026-07-01", periodEnd: "2027-06-30" },
  { segment: "Rock Phosphate", policyType: MARINE, port: "paradip", weight: 35 },
  { segment: "Rock Phosphate", policyType: MACHINERY, port: "navlakhi", weight: 15 },
  // Sagarmala
  { segment: "Sagarmala", policyType: CUSTOMS, port: "mundra", weight: 30, periodStart: "2026-01-01", periodEnd: "2026-12-31" },
  { segment: "Sagarmala", policyType: CUSTOMS, port: "karaikal", weight: 10, periodStart: "2026-01-01", periodEnd: "2026-12-31" },
  { segment: "Sagarmala", policyType: MARINE, port: "hazira", weight: 20, periodStart: "2026-03-23", periodEnd: "2027-03-22" },
  { segment: "Sagarmala", policyType: MARINE, port: "gangavaram", weight: 15, periodStart: "2026-03-23", periodEnd: "2027-03-22" },
  { segment: "Sagarmala", policyType: MARINE, port: "paradip", weight: 10, periodStart: "2026-03-23", periodEnd: "2027-03-22" },
  { segment: "Sagarmala", policyType: FIRE, port: "dahej", weight: 15 },
  { segment: "Sagarmala", policyType: STOCK_THROUGHPUT, port: "mundra", weight: 12, periodStart: "2026-05-01", periodEnd: "2027-04-30" },
  { segment: "Sagarmala", policyType: MACHINERY, port: "karaikal", weight: 8 },
];

const portName = (id: string) => PORT_LIST.find((p) => p.id === id)?.name ?? id;

// Split `total` (whole rupees) across `weights` exactly — the last share takes
// the rounding remainder so the parts always sum back to the pinned total.
const allocate = (total: number, weights: number[]): number[] => {
  const sum = weights.reduce((s, w) => s + w, 0);
  let left = total;
  return weights.map((w, i) => {
    if (i === weights.length - 1) return left;
    const share = Math.floor((total * w) / sum);
    left -= share;
    return share;
  });
};

// Materialise the full (unfiltered) policy book once — it's static. Each row's
// `location` is the port display name; the catalogue port id is kept alongside
// (not on the row) since it only drives the Zone / Port filters.
const BOOK: { portId: string; row: InsurancePolicyRow }[] = SEGMENT_ORDER.flatMap((segment) => {
  const seeds = SEEDS.filter((s) => s.segment === segment);
  const totals = SEGMENT_TOTALS[segment];
  const weights = seeds.map((s) => s.weight);
  const sums = allocate(Math.round(totals.sumInsuredCr * CR), weights);
  const stocks = allocate(Math.round(totals.stockValueCr * CR), weights);
  return seeds.map((s, i) => ({
    portId: s.port,
    row: {
      id: `${segment}:${s.policyType}:${s.port}`,
      segment,
      policyType: s.policyType,
      location: portName(s.port),
      sumInsured: sums[i],
      stockValue: stocks[i],
      periodStart: s.periodStart ?? FY_START,
      periodEnd: s.periodEnd ?? FY_END,
      status: s.status ?? "Active",
    },
  }));
});

const POLICY_TYPES = [...new Set(SEEDS.map((s) => s.policyType))];

export const buildInsuranceFilterOptions = (): InsuranceFilterOptions => ({
  policyTypes: POLICY_TYPES,
});

export const buildInsuranceStatus = (p: InsuranceStatusParams = {}): InsuranceStatusResponse => {
  // "all" (or missing) means no narrowing.
  const zone = p.zone && p.zone !== "all" ? p.zone : undefined;
  const port = p.port && p.port !== "all" ? p.port : undefined;
  const policyType = p.policyType && p.policyType !== "all" ? p.policyType : undefined;
  const zonePorts = zone ? ZONE_PORT_IDS[zone] ?? [] : undefined;

  // ISO "YYYY-MM-DD" strings compare correctly as plain strings. A policy is in
  // range when its period overlaps the selected window.
  const rows = BOOK.filter(
    ({ portId, row: r }) =>
      (!zonePorts || zonePorts.includes(portId)) &&
      (!port || portId === port) &&
      (!policyType || r.policyType === policyType) &&
      (!p.fromDate || r.periodEnd >= p.fromDate) &&
      (!p.toDate || r.periodStart <= p.toDate),
  ).map((b) => b.row);

  const segments: InsuranceSegmentSummary[] = SEGMENT_ORDER.map((segment) => {
    const own = rows.filter((r) => r.segment === segment);
    return {
      segment,
      sumInsured: own.reduce((s, r) => s + r.sumInsured, 0),
      stockValue: own.reduce((s, r) => s + r.stockValue, 0),
      atRisk: own.some((r) => r.status !== "Active"),
    };
  });

  return {
    totalSumInsured: segments.reduce((s, it) => s + it.sumInsured, 0),
    totalStockValue: segments.reduce((s, it) => s + it.stockValue, 0),
    segments,
    policies: rows,
  };
};
