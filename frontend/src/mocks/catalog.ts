// Catalogues used by the inventory mock generators. These mirror the lists the
// backend serves from `/filters/*`, so the dropdown options look identical
// whether mocks or the real API are in use.

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

export const ORIGINS = ["INDO", "AUS", "SA", "RUS", "USA"] as const;

export const GRADES = [
  "INDO-4200 GAR",
  "INDO-3400 GAR",
  "INDO-4800 GAR",
  "INDO-3800 GAR",
  "AUS-5500 GAR",
  "AUS-6000 GAR",
  "SA-5500 GAR",
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

// Coal calorific grades used in inventory vessel rows.
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
