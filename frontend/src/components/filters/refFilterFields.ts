import type { FilterRef } from "../../types/marketing";

// One side-panel dropdown backed by a `{ id, name }` option list. `optionsKey`
// ties the field to its list in the screen's filter-options payload (e.g.
// GET /finance/aging/filters), so the drawer and chips stay in lock-step.
export interface RefFilterField<K extends string, O extends string> {
  key: K;
  label: string;
  optionsKey: O;
}

// A screen's filter-options payload: one `{ id, name }` list per options key.
export type RefFilterOptions<O extends string> = Partial<Record<O, FilterRef[] | undefined>>;

// Resolve an id to its display name; falls back to the id while options load
// (or for an unknown id) so a chip is never blank.
export const refName = (list: FilterRef[] | undefined, id: string): string =>
  (Array.isArray(list) ? list : []).find((o) => o?.id === id)?.name ?? id;

// Map a `{ id, name }` list to Select options, tolerating a missing list.
export const toSelectOptions = (list: FilterRef[] | undefined) =>
  (Array.isArray(list) ? list : [])
    .filter((o) => o?.id != null)
    .map((o) => ({ value: o.id, label: o.name ?? o.id }));
