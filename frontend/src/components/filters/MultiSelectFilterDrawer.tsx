import { useState, type ReactNode } from "react";
import { FilterDrawer } from "./FilterDrawer";
import { MultiSelectFilter, type MultiSelectOption } from "./MultiSelectFilter";

export interface MultiSelectDrawerField<K extends string> {
  key: K;
  label: string;
  options: MultiSelectOption[];
}

interface Props<K extends string> {
  open: boolean;
  onClose: () => void;
  fields: MultiSelectDrawerField<K>[];
  /** Committed values — the draft is re-seeded from these on every open. */
  values: Partial<Record<K, string[]>>;
  /** Commit every field at once (an empty array means "All"). */
  onApply: (entries: Record<K, string[]>) => void;
  /** Spinner on the dropdowns while their option lists load. */
  loading?: boolean;
  /** Rendered above the fields — e.g. an ErrorRetry when options fail to load. */
  notice?: ReactNode;
}

// Generic slide-in Filters panel where every field is a multi-select (empty ⇒
// "All"). Edits stay in a local draft and only commit on "Apply filters";
// "Cancel" discards and "Clear all" empties the draft. Shared by the screens
// whose side panel is all multi-selects (Aging, IIA Billing, Debtors).
export const MultiSelectFilterDrawer = <K extends string>({
  open,
  onClose,
  fields,
  values,
  onApply,
  loading = false,
  notice,
}: Props<K>) => {
  const [draft, setDraft] = useState<Partial<Record<K, string[]>>>(values);

  // Re-sync the draft to the committed values on each open transition. Done in
  // render (not an effect) so the panel always opens showing the live state.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraft(values);
  }

  const apply = () => {
    const entries = {} as Record<K, string[]>;
    for (const f of fields) entries[f.key] = draft[f.key] ?? [];
    onApply(entries);
    onClose();
  };

  return (
    <FilterDrawer open={open} onClose={onClose} onApply={apply} onClearAll={() => setDraft({})}>
      {notice}
      {fields.map((f) => (
        <MultiSelectFilter
          key={f.key}
          label={f.label}
          value={draft[f.key] ?? []}
          onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
          options={f.options}
          loading={loading}
        />
      ))}
    </FilterDrawer>
  );
};
