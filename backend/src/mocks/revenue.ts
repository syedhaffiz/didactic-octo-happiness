import type {
  DonutSlice,
  RevenueBreakdownCard,
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

// Headline numbers anchored to the Figma so the screen reads the same as the
// design out of the box. YTD vs MTD scales the values; the mix stays the same.
const YTD_VALUES: Record<string, number> = {
  SNS: 86.6,
  SEB: 24.5,
  Sagarmala: 54.9,
  TPH: 4.6,
};

export const buildRevenueBreakdown = (
  period: RevenuePeriod,
): RevenueBreakdownResponse => {
  const factor = period === "MTD" ? 0.09 : 1;

  const cards: RevenueBreakdownCard[] = SEGMENTS_ORDER.map((segment) => ({
    segment,
    value: round((YTD_VALUES[segment] ?? 0) * factor, 1),
    unit: "Cr" as const,
  }));

  const total = round(cards.reduce((s, c) => s + c.value, 0), 1);

  const slices: DonutSlice[] = cards.map((c) => ({
    segment: c.segment,
    value: c.value,
    pct: total > 0 ? round((c.value / total) * 100, 1) : 0,
  }));

  return { period, total, unit: "Cr", cards, slices };
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
