import { ErrorRetry } from "../ErrorRetry";
import { MultiSelectFilterDrawer } from "./MultiSelectFilterDrawer";
import {
  toSelectOptions,
  type RefFilterField,
  type RefFilterOptions,
} from "./refFilterFields";

interface Props<K extends string, O extends string> {
  open: boolean;
  onClose: () => void;
  fields: RefFilterField<K, O>[];
  /** The screen's filter-options payload; undefined while it loads. */
  options?: RefFilterOptions<O>;
  optionsLoading?: boolean;
  /** Set when the options call failed — shown above the fields with a Retry. */
  optionsError?: Error | null;
  onRetryOptions?: () => void;
  /** Committed values — the draft is re-seeded from these on every open. */
  values: Partial<Record<K, string[]>>;
  onApply: (entries: Record<K, string[]>) => void;
}

// Filters side panel for screens whose dropdowns come from a dedicated
// `{ id, name }` filter-options endpoint (Aging, Inventory Days). Every field
// is a multi-select; Draft / Apply / Cancel / Clear all come from
// MultiSelectFilterDrawer.
export const RefFilterDrawer = <K extends string, O extends string>({
  open,
  onClose,
  fields,
  options,
  optionsLoading = false,
  optionsError,
  onRetryOptions,
  values,
  onApply,
}: Props<K, O>) => (
  <MultiSelectFilterDrawer
    open={open}
    onClose={onClose}
    fields={fields.map((f) => ({
      key: f.key,
      label: f.label,
      options: toSelectOptions(options?.[f.optionsKey]),
    }))}
    values={values}
    onApply={onApply}
    loading={optionsLoading}
    notice={
      optionsError ? (
        <ErrorRetry
          title="Could not load filter options"
          error={optionsError}
          onRetry={onRetryOptions ?? (() => {})}
        />
      ) : null
    }
  />
);
