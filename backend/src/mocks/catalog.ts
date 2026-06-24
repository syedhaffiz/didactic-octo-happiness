// Catalogues of plausible business entities used to build fixtures.
//
// Filter catalogues are now object lists with stable ids — the API contract
// is id-based, and the lookup helpers convert id → name when an internal
// generator (e.g. inventory mock) needs the display string.
//
// The string-only exports (PORTS, SEGMENTS, …) are derived from the object
// lists and kept for back-compat with mock generators (profitability,
// breakdown, sales) that only need random names for fake rows.

// === Filter catalogues (id + name) =========================================

export interface IdName {
  id: string;
  name: string;
}
export interface GradeDetail extends IdName {
  group_name: string;
}
export interface IndexNameDetail {
  index_name: string; // short slug, e.g. "api4"
  code_id: string; // display code, e.g. "API 4"
}

export const PORT_LIST: IdName[] = [
  { id: "krishnapatnam", name: "Krishnapatnam" },
  { id: "paradip", name: "Paradip" },
  { id: "hazira", name: "Hazira" },
  { id: "gangavaram", name: "Gangavaram" },
  { id: "dahej", name: "Dahej" },
  { id: "dhamra", name: "Dhamra" },
  { id: "mundra", name: "Mundra" },
  { id: "navlakhi", name: "Navlakhi" },
  { id: "tuna", name: "TUNA" },
  { id: "karaikal", name: "Karaikal" },
  { id: "gopalpur", name: "Gopalpur" },
];

// Discharge ports for the Marketing → Ocean Freight page. A distinct catalogue
// from PORT_LIST (load/finance ports) — exposed under `dischargePorts` in the
// /filters response.
export const DISCHARGE_PORT_LIST: IdName[] = [
  { id: "hazira", name: "Hazira" },
  { id: "mundra", name: "Mundra" },
  { id: "krishnapatnam", name: "Krishnapatnam" },
  { id: "dahej", name: "Dahej" },
  { id: "gangavaram", name: "Gangavaram" },
];

export const SEGMENT_LIST: IdName[] = [
  { id: "sns", name: "SNS" },
  { id: "seb", name: "SEB" },
  { id: "tph", name: "TPH" },
  { id: "sagarmala", name: "Sagarmala" },
  { id: "domestic", name: "Domestic" },
  { id: "cif-handling", name: "CIF Handling" },
  { id: "old", name: "Old" },
];

export const ZONE_LIST: IdName[] = [
  { id: "zone-1", name: "Zone 1" },
  { id: "zone-2", name: "Zone 2" },
  { id: "zone-3", name: "Zone 3" },
  { id: "zone-4", name: "Zone 4" },
  { id: "zone-5", name: "Zone 5" },
  { id: "zone-6", name: "Zone 6" },
];

export const ORIGIN_LIST: IdName[] = [
  { id: "indo", name: "INDO" },
  { id: "aus", name: "AUS" },
  { id: "sa", name: "SA" },
  { id: "rus", name: "RUS" },
  { id: "usa", name: "USA" },
];

export const GRADE_LIST: GradeDetail[] = [
  { id: "indo-4200-gar", name: "INDO-4200 GAR", group_name: "INDO" },
  { id: "indo-3400-gar", name: "INDO-3400 GAR", group_name: "INDO" },
  { id: "indo-4800-gar", name: "INDO-4800 GAR", group_name: "INDO" },
  { id: "indo-3800-gar", name: "INDO-3800 GAR", group_name: "INDO" },
  { id: "aus-5500-gar", name: "AUS-5500 GAR", group_name: "AUS" },
  { id: "aus-6000-gar", name: "AUS-6000 GAR", group_name: "AUS" },
  { id: "sa-5500-gar", name: "SA-5500 GAR", group_name: "SA" },
];

export const INDEX_NAME_LIST: IndexNameDetail[] = [
  { index_name: "ici4", code_id: "ICI 4" },
  { index_name: "api4", code_id: "API 4" },
  { index_name: "api5", code_id: "API 5" },
];

// === id → name lookups (used by mocks that filter by name internally) =====

const byId = <T extends { id: string }>(list: T[], id: string | undefined): T | undefined =>
  id ? list.find((x) => x.id === id) : undefined;

export const portNameById = (id?: string) => byId(PORT_LIST, id)?.name;
export const segmentNameById = (id?: string) => byId(SEGMENT_LIST, id)?.name;
export const zoneNameById = (id?: string) => byId(ZONE_LIST, id)?.name;
export const originNameById = (id?: string) => byId(ORIGIN_LIST, id)?.name;
export const gradeNameById = (id?: string) => byId(GRADE_LIST, id)?.name;

// === Convenience name arrays (derived) =====================================
// Existing mock generators that only need random names use these.

export const PORTS: readonly string[] = PORT_LIST.map((p) => p.name);
export const SEGMENTS: readonly string[] = SEGMENT_LIST.map((s) => s.name);
export const ZONES: readonly string[] = ZONE_LIST.map((z) => z.name);
export const ORIGINS: readonly string[] = ORIGIN_LIST.map((o) => o.name);
export const GRADES: readonly string[] = GRADE_LIST.map((g) => g.name);

// === Unchanged catalogues ==================================================

export const VESSELS = [
  "MV ATLANTIC PRESTIGE",
  "MV WEST TREASURE",
  "MV ASTRO GRUMIUM",
  "MV FAST",
  "MV YOUNG SPIRIT",
  "MV STAR QUEST",
  "MV BLUE HORIZON",
  "MV NORTHERN LIGHT",
  "MV PACIFIC DAWN",
  "MV OCEAN VOYAGER",
  "MV SILVER WAVE",
  "MV GOLDEN GATE",
  "MV CRYSTAL BAY",
  "MV CORAL REEF",
  "MV EMERALD ISLE",
] as const;

// Vessels used in the Inventory module — mostly matches the Figma rows so
// the table looks familiar; padded out with realistic-sounding names.
export const INVENTORY_VESSELS = [
  "MV APOLLON",
  "MV BAHRI HAYA",
  "MV CRIMSON GLORY",
  "MV ES BROAD SEA",
  "MV GASTONE",
  "MV HARMONY",
  "MV INDIGO STAR",
  "MV JADE COAST",
  "MV KESTREL",
  "MV LIBERTY",
  "MV MERIDIAN",
  "MV NOBLE EAGLE",
  "MV OASIS",
  "MV PHOENIX",
  "MV QUEEN ANNE",
  "MV ROYAL FLAG",
  "MV SEA HAWK",
  "MV TITAN",
  "MV ULTRA SKY",
  "MV VANGUARD",
  "MV WIND SONG",
  "MV XENA",
  "MV YONDER",
  "MV ZENITH",
  "MV ASIAN GLORY",
  "MV BLUE OCEAN",
  "MV CORAL DAWN",
  "MV DELTA RIVER",
] as const;

// Coal calorific grades displayed on vessel rows. Distinct from trading
// grades (GRADE_LIST above) which are the filter values.
export const COAL_GRADES = ["INDO LCV", "INDO MCV", "INDO HCV", "AUS HCV", "SA MCV"] as const;

export const PROFIT_CENTRES = [
  "AEL-COAL-DAHE-TPH",
  "AEL-COAL-DHAM-TPH",
  "AEL-COAL-OHAM-TPH",
  "AEL-COAL-OHMT-TPH",
  "AEL-COAL-MUND-SNS",
  "AEL-COAL-HAZI-SEB",
  "AEL-COAL-GOPI-DOM",
  "AEL-COAL-KRIS-SAG",
] as const;

export const GROUPINGS = [
  "Sale Revenue",
  "Plot Rent",
  "Handing Revenue",
  "Demurrage",
  "Service Charges",
  "Logistics",
] as const;

// Month catalogue — Apr 2025 → Feb 2026 inclusive (11 months).
export interface MonthKey {
  year: number;
  month: number; // 1-indexed
  label: string; // e.g. "2025-04"
}

export const MONTHS: MonthKey[] = [
  { year: 2025, month: 4, label: "2025-04" },
  { year: 2025, month: 5, label: "2025-05" },
  { year: 2025, month: 6, label: "2025-06" },
  { year: 2025, month: 7, label: "2025-07" },
  { year: 2025, month: 8, label: "2025-08" },
  { year: 2025, month: 9, label: "2025-09" },
  { year: 2025, month: 10, label: "2025-10" },
  { year: 2025, month: 11, label: "2025-11" },
  { year: 2025, month: 12, label: "2025-12" },
  { year: 2026, month: 1, label: "2026-01" },
  { year: 2026, month: 2, label: "2026-02" },
];

export const monthsInRange = (from: Date, to: Date): MonthKey[] =>
  MONTHS.filter((m) => {
    const start = new Date(Date.UTC(m.year, m.month - 1, 1));
    const end = new Date(Date.UTC(m.year, m.month, 0));
    return end >= from && start <= to;
  });

export const DEFAULT_RANGE = {
  from: new Date(Date.UTC(2025, 3, 1)), // Apr 1 2025
  to: new Date(Date.UTC(2026, 1, 28)), // Feb 28 2026
};
