// Combines kpis + forex into the OverviewResponse the page consumes.

import type { OverviewResponse } from "../../types/finance";
import { buildKpis } from "./kpis";
import { buildForex } from "./forex";

export const buildOverview = (
  fromDate?: string,
  toDate?: string,
): OverviewResponse => ({
  kpis: buildKpis(fromDate, toDate),
  forex: buildForex("week", new Date()),
});
