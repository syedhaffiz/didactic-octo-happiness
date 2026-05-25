// Frontend mock generators for the Inventory module. Mirrors the shapes the
// backend will produce so we can iterate on the UI without a running API and
// hand the backend team an exact request/response contract.
//
// Endpoints reproduced here:
//   GET /inventory/index?range=1W|1M|3M|1Y   → IndexResponse
//   GET /inventory/overview?port=&origin=&grade=  → InventoryOverviewResponse
//
// To switch between mocks and the live API, flip `USE_MOCK_DATA` in
// src/api/dataSource.ts.

import type {
  DispatchSummary,
  IndexRange,
  IndexResponse,
  InventoryKpi,
  InventoryOverviewParams,
  InventoryOverviewResponse,
  PortInventoryRow,
  PriceIndex,
  PricePoint,
  SalesMonth,
  VesselRow,
} from "../types/inventory";
import {
  COAL_GRADES,
  INVENTORY_VESSELS,
  ORIGINS,
} from "./catalog";
import { intRange, pick, range, round, seedFromString, seeded } from "./rand";

// Anchor dates pin the mock series to a fixed window so charts look stable
// across reloads and match the design references.
const AS_OF = new Date(Date.UTC(2026, 4, 11)); // 11-May-2026
const CURRENT = new Date(Date.UTC(2026, 4, 8)); // 08-May-2026

const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
};

// --- Price indices ---------------------------------------------------------

const INDEX_DEFS = [
  { code: "ICI 4", cadence: "Weekly" as const, center: 95, amp: 30, current: 63.56 },
  { code: "API 4", cadence: "Daily" as const, center: 110, amp: 9, current: 116.38 },
  { code: "API 5", cadence: "Weekly" as const, center: 105, amp: 14, current: 98.84 },
];

const lengthFor = (r: IndexRange, cadence: "Daily" | "Weekly") => {
  const days = r === "1W" ? 7 : r === "1M" ? 30 : r === "3M" ? 90 : 365;
  const step = cadence === "Daily" ? 1 : 7;
  return { days, step };
};

const buildIndex = (def: (typeof INDEX_DEFS)[number], r: IndexRange): PriceIndex => {
  const { days, step } = lengthFor(r, def.cadence);
  const rng = seeded(seedFromString(`index:${def.code}:${r}`));
  const points: PricePoint[] = [];
  for (let offset = days; offset >= 0; offset -= step) {
    const d = addDays(CURRENT, -offset);
    const phase = (offset / days) * Math.PI * 2;
    const wave = Math.sin(phase) * def.amp * 0.5;
    const jitter = (rng() * 2 - 1) * def.amp * 0.3;
    const value = round(def.center + wave + jitter, 2);
    points.push({ date: isoDay(d), value });
  }
  if (points.length > 0) {
    points[points.length - 1] = { date: isoDay(CURRENT), value: def.current };
  }
  return {
    code: def.code,
    cadence: def.cadence,
    range: r,
    series: points,
    current: def.current,
    currentDate: isoDay(CURRENT),
  };
};

export const buildIndices = (r: IndexRange): IndexResponse => ({
  asOf: isoDay(AS_OF),
  items: INDEX_DEFS.map((d) => buildIndex(d, r)),
});

// --- Inventory overview ----------------------------------------------------

const filterKey = (f: InventoryOverviewParams) =>
  `${f.port ?? "ALL"}:${f.origin ?? "ALL"}:${f.grade ?? "ALL"}`;

const HEADLINE_DEFAULTS = {
  totalInventory: 52486,
  unsoldInventory: 21245,
  dailySales: 31616,
  mtdSales: 525225,
  dailyDispatch: 1553,
  mtdDispatch: 1553,
  sailedOut: 23,
  underLoading: 5,
};

const flex = (base: number, factor: number) => Math.max(0, Math.round(base * factor));

const buildKpis = (f: InventoryOverviewParams): InventoryKpi[] => {
  const noFilter = !f.port && !f.origin && !f.grade;
  const rng = seeded(seedFromString(`inv:kpis:${filterKey(f)}`));
  const factor = noFilter ? 1 : 0.6 + rng() * 0.7;
  const d = HEADLINE_DEFAULTS;

  return [
    {
      id: "physicalInventory",
      title: "Physical Port Inventory",
      primaryLabel: "Total",
      primaryValue: flex(d.totalInventory, factor),
      primaryUnit: "MT",
      secondaryLabel: "Unsold",
      secondaryValue: flex(d.unsoldInventory, factor),
      secondaryUnit: "MT",
      lastUpdated: isoDay(AS_OF),
    },
    {
      id: "salesBooking",
      title: "Total Sales Booking",
      primaryLabel: "Daily",
      primaryValue: flex(d.dailySales, factor),
      primaryUnit: "MT",
      secondaryLabel: "MTD",
      secondaryValue: flex(d.mtdSales, factor),
      secondaryUnit: "MT",
      lastUpdated: isoDay(addDays(AS_OF, -2)),
    },
    {
      id: "dispatch",
      title: "Total Dispatch (AEL handling)",
      primaryLabel: "Daily",
      primaryValue: flex(d.dailyDispatch, factor),
      primaryUnit: "MT",
      secondaryLabel: "MTD",
      secondaryValue: flex(d.mtdDispatch, factor),
      secondaryUnit: "MT",
      lastUpdated: isoDay(AS_OF),
    },
    {
      id: "vessels",
      title: "Total Vessels",
      primaryLabel: "Sailed Out",
      primaryValue: noFilter ? d.sailedOut : intRange(rng, 8, 28),
      secondaryLabel: "Under loading",
      secondaryValue: noFilter ? d.underLoading : intRange(rng, 1, 8),
      lastUpdated: isoDay(AS_OF),
    },
  ];
};

const PORT_LEVELS = [
  { port: "Mundra", stock: 36721, unsold: 20097 },
  { port: "Tuna", stock: 15765, unsold: 1148 },
  { port: "Krishnapatnam", stock: 12340, unsold: 3210 },
  { port: "Dahej", stock: 9870, unsold: 2100 },
  { port: "Hazira", stock: 7650, unsold: 980 },
];

const buildCurrentInventory = (f: InventoryOverviewParams): PortInventoryRow[] => {
  const noFilter = !f.port && !f.origin && !f.grade;
  const rng = seeded(seedFromString(`inv:level:${filterKey(f)}`));
  const rows = f.port ? PORT_LEVELS.filter((p) => p.port === f.port) : PORT_LEVELS;
  return rows.map((p) => {
    const factor = noFilter ? 1 : 0.4 + rng() * 1.1;
    return {
      port: p.port,
      physicalStock: flex(p.stock, factor),
      physicalUnsold: flex(p.unsold, factor),
    };
  });
};

const buildDispatchSummary = (f: InventoryOverviewParams): DispatchSummary => {
  const rng = seeded(seedFromString(`inv:dispatch:${filterKey(f)}`));
  const noFilter = !f.port && !f.origin && !f.grade;
  const last24 = noFilter ? 1553 : flex(1553, 0.5 + rng() * 1.5);
  const last7 = noFilter ? 32736 : flex(32736, 0.5 + rng() * 1.5);
  const mtd = noFilter ? 27716 : flex(27716, 0.5 + rng() * 1.5);
  const trailing7Avg = last7 / 7;
  const deltaPct = trailing7Avg ? round(((last24 - trailing7Avg) / trailing7Avg) * 100, 2) : 0;
  return { last24Hours: last24, last7Days: last7, mtdAggregate: mtd, deltaPct, unit: "MT" };
};

const MONTHS_BACK = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];

const buildSales = (f: InventoryOverviewParams): SalesMonth[] => {
  const rng = seeded(seedFromString(`inv:sales:${filterKey(f)}`));
  return MONTHS_BACK.map((m) => ({
    month: m,
    value: Math.round(range(rng, 18_000, 42_000)),
  }));
};

const buildVessels = (
  resource: "sailed" | "loading",
  count: number,
  f: InventoryOverviewParams,
): VesselRow[] => {
  const rng = seeded(seedFromString(`inv:vessels:${resource}:${filterKey(f)}`));
  return Array.from({ length: count }, (_, idx) => {
    const vessel = INVENTORY_VESSELS[idx % INVENTORY_VESSELS.length]!;
    const origin = f.origin ?? pick(rng, ORIGINS);
    const grade = f.grade ?? (rng() > 0.3 ? pick(rng, COAL_GRADES) : "");
    const tonnage = Math.round(range(rng, 35_000, 95_000) / 50) * 50;
    const blOffset = -intRange(rng, 3, 60);
    const etaOffset = intRange(rng, 2, 25);
    return {
      vessel,
      coalGrade: grade,
      tonnage,
      origin,
      blDate: isoDay(addDays(CURRENT, blOffset)),
      etaDp: isoDay(addDays(CURRENT, etaOffset)),
    };
  });
};

export const buildInventoryOverview = (
  f: InventoryOverviewParams,
): InventoryOverviewResponse => {
  const kpis = buildKpis(f);
  const sailed = kpis.find((k) => k.id === "vessels")?.primaryValue ?? 23;
  const loading = kpis.find((k) => k.id === "vessels")?.secondaryValue ?? 5;
  return {
    asOf: isoDay(AS_OF),
    kpis,
    currentInventory: buildCurrentInventory(f),
    dispatch: buildDispatchSummary(f),
    sales: buildSales(f),
    vesselsSailedOut: buildVessels("sailed", sailed, f),
    vesselsUnderloading: buildVessels("loading", loading, f),
  };
};
