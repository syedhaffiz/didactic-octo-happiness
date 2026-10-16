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
import { ZONE_PORT_IDS } from "../catalog";

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
  location: string;
  /** Catalogue port id the insured location rolls up to (drives Zone / Port filters). */
  port: string;
  /** Relative share of the segment's totals. */
  weight: number;
  periodStart: string;
  periodEnd: string;
  status: InsuranceStatus;
}

const FY_START = "2026-04-01";
const FY_END = "2027-03-31";

// Insured risks, in Sankey order. Weights split each segment's pinned totals.
const SEEDS: Seed[] = [
  // ICM
  { segment: "ICM", policyType: "Fire Policy Non Floater", location: "Krishnapatnam", port: "krishnapatnam", weight: 22, periodStart: FY_START, periodEnd: FY_END, status: "Active" },
  { segment: "ICM", policyType: "Fire Policy Non Floater", location: "Tuna", port: "tuna", weight: 16, periodStart: FY_START, periodEnd: FY_END, status: "Active" },
  { segment: "ICM", policyType: "Fire Policy Non Floater", location: "Mundra (ICM)", port: "mundra", weight: 24, periodStart: FY_START, periodEnd: FY_END, status: "Active" },
  { segment: "ICM", policyType: "Fire Policy Non Floater", location: "Dhamra", port: "dhamra", weight: 14, periodStart: FY_START, periodEnd: FY_END, status: "Active" },
  { segment: "ICM", policyType: "Marine Cargo FOR sales", location: "FOR Sales", port: "gangavaram", weight: 14, periodStart: "2026-06-01", periodEnd: "2027-05-31", status: "Active" },
  { segment: "ICM", policyType: "Marine Cargo FOR sales", location: "Port Stock List", port: "paradip", weight: 10, periodStart: "2026-06-01", periodEnd: "2027-05-31", status: "Active" },
  // Bunkering — the NSEZ cover lapses this month, so the segment reads as at-risk.
  { segment: "Bunkering", policyType: "Marine Policy", location: "Marine Cargo-SEZ", port: "mundra", weight: 55, periodStart: FY_START, periodEnd: FY_END, status: "Active" },
  { segment: "Bunkering", policyType: "Marine Policy", location: "Marine Cargo-NSEZ", port: "mundra", weight: 45, periodStart: "2025-11-01", periodEnd: "2026-10-31", status: "Expiring Soon" },
  // Rock Phosphate
  { segment: "Rock Phosphate", policyType: "Fire Policy", location: "Goa", port: "karaikal", weight: 60, periodStart: "2026-07-01", periodEnd: "2027-06-30", status: "Active" },
  { segment: "Rock Phosphate", policyType: "Fire Policy", location: "Bedi", port: "navlakhi", weight: 40, periodStart: "2026-07-01", periodEnd: "2027-06-30", status: "Active" },
  // Sagarmala
  { segment: "Sagarmala", policyType: "Customs Duty", location: "Mundra-Tank 107 HSFO_NSEZ", port: "mundra", weight: 45, periodStart: "2026-01-01", periodEnd: "2026-12-31", status: "Active" },
  { segment: "Sagarmala", policyType: "Marine Policy", location: "Hazira", port: "hazira", weight: 22, periodStart: "2026-03-23", periodEnd: "2027-03-22", status: "Active" },
  { segment: "Sagarmala", policyType: "Marine Policy", location: "Gangavaram", port: "gangavaram", weight: 18, periodStart: "2026-03-23", periodEnd: "2027-03-22", status: "Active" },
  { segment: "Sagarmala", policyType: "Marine Policy", location: "Haldia", port: "paradip", weight: 15, periodStart: "2026-03-23", periodEnd: "2027-03-22", status: "Active" },
];

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

// Materialise the full (unfiltered) policy book once — it's static.
// Each row is paired with its catalogue port, which only drives the filters.
const BOOK: { port: string; row: InsurancePolicyRow }[] = SEGMENT_ORDER.flatMap((segment) => {
  const seeds = SEEDS.filter((s) => s.segment === segment);
  const totals = SEGMENT_TOTALS[segment];
  const weights = seeds.map((s) => s.weight);
  const sums = allocate(Math.round(totals.sumInsuredCr * CR), weights);
  const stocks = allocate(Math.round(totals.stockValueCr * CR), weights);
  return seeds.map((s, i) => ({
    port: s.port,
    row: {
      id: `${segment}:${s.policyType}:${s.location}`,
      segment,
      policyType: s.policyType,
      location: s.location,
      sumInsured: sums[i],
      stockValue: stocks[i],
      periodStart: s.periodStart,
      periodEnd: s.periodEnd,
      status: s.status,
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
    ({ port: rowPort, row: r }) =>
      (!zonePorts || zonePorts.includes(rowPort)) &&
      (!port || rowPort === port) &&
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
