// Mirror of backend/src/mocks/breakdown.ts. Kept in sync.

import type {
  BreakdownItem,
  BreakdownResponse,
  DonutResponse,
  LedgerRow,
} from "../../types/finance";
import {
  GROUPINGS,
  PROFIT_CENTRES,
  SEGMENTS,
  monthsInRange,
  type MonthKey,
} from "../catalog";
import { pick, range, round, seedFromString, seeded } from "../rand";
import { parseRange } from "../dateRange";

const BREAKDOWN_SEGMENTS = ["SNS", "SEB", "TPH", "Sagarmala"] as const;

const segmentValue = (
  resource: "revenue" | "working-capital",
  segment: string,
  port: string | undefined,
  months: MonthKey[],
): number => {
  const portKey = port ?? "ALL";
  let acc = 0;
  for (const m of months) {
    const rng = seeded(seedFromString(`${resource}:${segment}:${portKey}:${m.label}`));
    const center =
      segment === "SNS" ? 80 :
      segment === "SEB" ? 25 :
      segment === "TPH" ? 5 :
      55;
    const variance = 0.4;
    acc += center * (1 + (rng() * 2 - 1) * variance);
  }
  return round(acc / Math.max(months.length, 1), 1);
};

const buildLedger = (
  resource: "revenue" | "working-capital",
  port: string | undefined,
  months: MonthKey[],
  rows = 24,
): LedgerRow[] => {
  const rng = seeded(
    seedFromString(`${resource}:ledger:${port ?? "ALL"}:${months.map((m) => m.label).join(",")}`),
  );
  return Array.from({ length: rows }, (_, idx) => {
    const profitCentre = pick(rng, PROFIT_CENTRES);
    const segment = pick(rng, SEGMENTS);
    const grouping = pick(rng, GROUPINGS);
    const debitOn = rng() > 0.5;
    const amount = Math.round(range(rng, 1_500_000, 180_000_000));
    return {
      companyCode: "1000",
      accountNumber: `1000/${30000000 + (idx + 1) * 10}`,
      profitCentre,
      segment,
      grouping,
      debit: debitOn ? amount : 0,
      credit: debitOn ? 0 : amount,
    } satisfies LedgerRow;
  });
};

export const buildBreakdown = (
  resource: "revenue" | "working-capital",
  port: string | undefined,
  fromDate?: string,
  toDate?: string,
): BreakdownResponse => {
  const { from, to } = parseRange(fromDate, toDate);
  const months = monthsInRange(from, to);
  const ms = months.length ? months : [{ year: 2025, month: 4, label: "2025-04" } as MonthKey];

  const breakdown: BreakdownItem[] = BREAKDOWN_SEGMENTS.map((segment) => ({
    segment,
    value: segmentValue(resource, segment, port, ms),
    unit: "Cr" as const,
  }));

  const total = round(breakdown.reduce((s, b) => s + b.value, 0), 1);

  const donut: DonutResponse = {
    total,
    unit: "Cr",
    slices: breakdown.map((b) => ({
      segment: b.segment,
      value: b.value,
      pct: total > 0 ? round((b.value / total) * 100, 1) : 0,
    })),
  };

  const ledger = buildLedger(resource, port, ms);

  return { breakdown, donut, ledger };
};
