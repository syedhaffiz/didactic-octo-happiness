import { FilterChips, type FilterChip } from "../FilterChips";
import { refName, type RefFilterField, type RefFilterOptions } from "./refFilterFields";

interface Props<K extends string, O extends string> {
  fields: RefFilterField<K, O>[];
  options?: RefFilterOptions<O>;
  values: Record<K, string[]>;
  /** Replace one filter's values (used to drop a single chip's value). */
  onChange: (key: K, values: string[]) => void;
  onClearAll: () => void;
  /** Screen-specific chips shown first (e.g. the date range). */
  leadingChips?: FilterChip[];
}

// "Applied Filters" bar for side-panel filters backed by `{ id, name }` option
// lists: one removable chip per selected value, names resolved from the
// screen's filter-options payload.
export const RefFilterChips = <K extends string, O extends string>({
  fields,
  options,
  values,
  onChange,
  onClearAll,
  leadingChips = [],
}: Props<K, O>) => {
  const chips: FilterChip[] = [...leadingChips];

  for (const f of fields) {
    const vals = values[f.key] ?? [];
    vals.forEach((id) =>
      chips.push({
        key: `${f.key}:${id}`,
        label: f.label,
        value: refName(options?.[f.optionsKey], id),
        onClose: () => onChange(f.key, vals.filter((v) => v !== id)),
      }),
    );
  }

  return <FilterChips chips={chips} onClearAll={onClearAll} />;
};
