// Mirror of backend/src/mocks/revenue.ts. Kept in sync.

import type {
  DonutSlice,
  RevenueBreakdownCard,
  RevenueBreakdownResponse,
  RevenuePeriod,
  RevenuePortResponse,
  RevenuePortRow,
  RevenueSegmentResponse,
  RevenueSegmentRow,
} from "../../types/finance";
import { PORTS, PROFIT_CENTRES, SEGMENTS } from "../catalog";
import { pick, range, round, seedFromString, seeded } from "../rand";

const SEGMENT_PALETTE = [
  { segment: "SNS",       color: "#4A6CD4" },
  { segment: "SEB",       color: "#36B45C" },
  { segment: "Sagarmala", color: "#F2992E" },
  { segment: "TPH",       color: "#07DBFB" },
] as const;

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

  const cards: RevenueBreakdownCard[] = SEGMENT_PALETTE.map(({ segment, color }) => ({
    segment,
    value: round((YTD_VALUES[segment] ?? 0) * factor, 1),
    unit: "Cr" as const,
    color,
  }));

  const total = round(cards.reduce((s, c) => s + c.value, 0), 1);

  const slices: DonutSlice[] = cards.map((c) => ({
    segment: c.segment,
    value: c.value,
    pct: total > 0 ? round((c.value / total) * 100, 1) : 0,
  }));

  return { period, total, unit: "Cr", cards, slices };
};

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
