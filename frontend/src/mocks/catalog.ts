// Mirror of backend/src/mocks/catalog.ts. Kept in sync so the mock-mode
// dropdowns and lookups match what the real API returns. The object lists
// are the source of truth; the name-only arrays are derived for the
// inventory mock's internal needs.

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

// id → name lookups for the inventory mock (filters by name internally).
const byId = <T extends { id: string }>(list: T[], id: string | undefined): T | undefined =>
  id ? list.find((x) => x.id === id) : undefined;

export const portNameById = (id?: string) => byId(PORT_LIST, id)?.name;
export const originNameById = (id?: string) => byId(ORIGIN_LIST, id)?.name;
export const gradeNameById = (id?: string) => byId(GRADE_LIST, id)?.name;

// Convenience name arrays — used by the inventory mock to generate random
// vessel rows (it just wants string fixtures, no ids needed).
export const ORIGINS: readonly string[] = ORIGIN_LIST.map((o) => o.name);

// Coal calorific grades displayed on vessel rows. Distinct from trading
// grades (GRADE_LIST) which are the filter values.
export const COAL_GRADES = ["INDO LCV", "INDO MCV", "INDO HCV", "AUS HCV", "SA MCV"] as const;

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
