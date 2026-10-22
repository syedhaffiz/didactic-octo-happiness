import type { AgingMeasure } from "../../../types/finance";

export const DEFAULT_AGING_MEASURE: AgingMeasure = "volume";

// Guards the `measure` URL param — anything unrecognised falls back to the
// default rather than reaching the API.
export const isAgingMeasure = (v: string | undefined): v is AgingMeasure =>
  v === "volume" || v === "value";
