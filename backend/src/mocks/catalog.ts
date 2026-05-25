// Catalogues of plausible business entities used to build fixtures.
// Names cover the entities visible in the design references plus a few extras
// so filters have realistic depth.

export const PORTS = [
  "Krishnapatnam",
  "Paradip",
  "Hazira",
  "Gangavaram",
  "Dahej",
  "Dhamra",
  "Mundra",
  "Navlakhi",
  "TUNA",
  "Karaikal",
  "Gopalpur",
] as const;

export const SEGMENTS = [
  "SNS",
  "SEB",
  "TPH",
  "Sagarmala",
  "Domestic",
  "CIF Handling",
  "Old",
] as const;

export const ZONES = ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5", "Zone 6"] as const;

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

// Coal calorific grades used in inventory reporting.
export const COAL_GRADES = ["INDO LCV", "INDO MCV", "INDO HCV", "AUS HCV", "SA MCV"] as const;

export const GRADES = [
  "INDO-4200 GAR",
  "INDO-3400 GAR",
  "INDO-4800 GAR",
  "INDO-3800 GAR",
  "AUS-5500 GAR",
  "AUS-6000 GAR",
  "SA-5500 GAR",
] as const;

export const ORIGINS = ["INDO", "AUS", "SA", "RUS", "USA"] as const;

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
