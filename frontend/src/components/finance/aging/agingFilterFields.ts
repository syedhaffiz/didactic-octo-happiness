import type { FiltersResponse } from "../../../api/filters";

export type AgingDrawerKey = "zone" | "port" | "origin" | "segment" | "mine";

// Filters side-panel fields, in display order. Shared by the drawer, the
// applied-filter tags and the Filters badge so the three stay in lock-step.
// `kind` names the slice of the shared /filters response that feeds options.
export interface AgingDrawerField {
  key: AgingDrawerKey;
  label: string;
  kind: Extract<keyof FiltersResponse, "zones" | "ports" | "origins" | "segments" | "mines">;
}

export const AGING_DRAWER_FIELDS: AgingDrawerField[] = [
  { key: "zone", label: "Zone", kind: "zones" },
  { key: "port", label: "Port", kind: "ports" },
  { key: "origin", label: "Origin", kind: "origins" },
  { key: "segment", label: "Segment", kind: "segments" },
  { key: "mine", label: "Mine", kind: "mines" },
];

export const AGING_DRAWER_KEYS: AgingDrawerKey[] = AGING_DRAWER_FIELDS.map((f) => f.key);

export type AgingDrawerValues = Record<AgingDrawerKey, string | undefined>;
