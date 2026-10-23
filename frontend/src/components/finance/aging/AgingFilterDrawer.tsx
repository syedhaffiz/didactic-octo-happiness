import { ErrorRetry } from "../../ErrorRetry";
import { MultiSelectFilterDrawer } from "../../filters/MultiSelectFilterDrawer";
import {
  AGING_DRAWER_FIELDS,
  type AgingFiltersState,
} from "../../../utils/useAgingFilters";
import type { AgingFilterOptions } from "../../../types/finance";

interface Props {
  open: boolean;
  onClose: () => void;
  options?: AgingFilterOptions;
  optionsLoading: boolean;
  /** Set when an option list failed to load — shown above the fields. */
  optionsError: Error | null;
  onRetryOptions: () => void;
  filters: AgingFiltersState;
}

// Slide-in Filters panel (Zone, Port, Origin, Segment, Mine), each a
// multi-select where empty means "All". Draft / Apply / Cancel / Clear all
// behaviour comes from the shared MultiSelectFilterDrawer.
export const AgingFilterDrawer = ({
  open,
  onClose,
  options,
  optionsLoading,
  optionsError,
  onRetryOptions,
  filters,
}: Props) => (
  <MultiSelectFilterDrawer
    open={open}
    onClose={onClose}
    fields={AGING_DRAWER_FIELDS.map((f) => ({
      key: f.key,
      label: f.label,
      options: (options?.[f.optionsKey] ?? []).map((o) => ({ value: o.id, label: o.name })),
    }))}
    values={filters.multi}
    onApply={filters.setMany}
    loading={optionsLoading}
    notice={
      optionsError ? (
        <ErrorRetry
          title="Could not load filter options"
          error={optionsError}
          onRetry={onRetryOptions}
        />
      ) : null
    }
  />
);
