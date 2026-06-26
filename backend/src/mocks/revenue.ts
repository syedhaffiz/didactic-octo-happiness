import type {
  RevenueBreakdownItem,
  RevenueBreakdownResponse,
  RevenuePeriod,
  RevenuePortResponse,
  RevenuePortRow,
  RevenueSegmentResponse,
  RevenueSegmentRow,
} from "../types/finance.js";
import { PORTS, PROFIT_CENTRES, SEGMENTS } from "./catalog.js";
import { pick, range, round, seedFromString, seeded } from "./rand.js";

// Segment order, kept in lockstep with the Figma legend order
// (SNS / SEB / Sagarmala / TPH). Slice/card colors are owned by the UI.
const SEGMENTS_ORDER = ["SNS", "SEB", "Sagarmala", "TPH"] as const;

// Baseline per-segment revenue for a ~1-month window, as whole-number rupee
// amounts. Pinned so the default view reads like the Figma (86.6 Cr, …); the
// UI formats each value as Cr or L. YTD/MTD and the date range scale these.
const MONTHLY_BASELINE: Record<string, number> = {
  SNS: 866_000_000, // 86.6 Cr
  SEB: 245_000_000, // 24.5 Cr
  Sagarmala: 549_000_000, // 54.9 Cr
  TPH: 46_000_000, // 4.6 Cr
};

const DAY_MS = 86_400_000;

export const buildRevenueBreakdown = (
  period: RevenuePeriod,
  from: Date,
  to: Date,
): RevenueBreakdownResponse => {
  // Scale the monthly baseline by the selected window (relative to 30 days) so
  // the breakdown responds to the date-range filter; MTD trims it further.
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY_MS));
  const factor = (period === "MTD" ? 0.09 : 1) * (days / 30);

  const items: RevenueBreakdownItem[] = SEGMENTS_ORDER.map((segment) => ({
    segment,
    value: Math.round((MONTHLY_BASELINE[segment] ?? 0) * factor),
    pct: 0,
  }));

  const total = items.reduce((s, it) => s + it.value, 0);
  for (const it of items) {
    it.pct = total > 0 ? round((it.value / total) * 100, 1) : 0;
  }

  return { period, total, items };
};

// Ledger row generators. Both tables share the same shape except for the
// leading category column (port vs segment), so we factor out the body.
interface LedgerCore {
  companyCode: string;
  accountNumber: string;
  profitCentre: string;
  accumulatedBalance: number;
}

const buildLedgerCore = (seed: string, rows: number): LedgerCore[] => {
  const rng = seeded(seedFromString(seed));
  return Array.from({ length: rows }, (_, idx) => ({
    companyCode: "1000",
    accountNumber: `1000/${30000000 + (idx + 1) * 10}`,
    profitCentre: pick(rng, PROFIT_CENTRES),
    // The Figma shows a mix of zero and very large balances, so we tilt the
    // distribution: ~20% zeros, the rest spread up to ~165M.
    accumulatedBalance:
      rng() < 0.2 ? 0 : round(range(rng, 100_000, 165_000_000), 2),
  }));
};

export const buildRevenuePort = (
  port: string | undefined,
  rowsPerPort = 6,
): RevenuePortResponse => {
  const ports = port ? [port] : PORTS;
  const items: RevenuePortRow[] = ports.flatMap((p) => {
    const core = buildLedgerCore(`revenue:port:${p}`, rowsPerPort);
    return core.map((c) => ({ port: p, ...c }));
  });
  return { items };
};

export const buildRevenueSegment = (
  segment: string | undefined,
  rowsPerSegment = 6,
): RevenueSegmentResponse => {
  const segments = segment ? [segment] : SEGMENTS;
  const items: RevenueSegmentRow[] = segments.flatMap((s) => {
    const core = buildLedgerCore(`revenue:segment:${s}`, rowsPerSegment);
    return core.map((c) => ({ segment: s, ...c }));
  });
  return { items };
};
