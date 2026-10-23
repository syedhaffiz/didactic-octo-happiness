import { MultiSelectFilterDrawer } from "../../filters/MultiSelectFilterDrawer";
import {
  DEBTORS_DRAWER_FIELDS,
  type DebtorsFiltersState,
} from "../../../utils/useDebtorsFilters";
import type { DebtorsFilterOptions } from "../../../types/finance";

interface Props {
  open: boolean;
  onClose: () => void;
  options?: DebtorsFilterOptions;
  filters: DebtorsFiltersState;
}

// Slide-in Filters panel for Debtors. Every dropdown is a multi-select defaulting
// to "All" (nothing selected). Shared by the overview and the table; Draft /
// Apply / Cancel / Clear all behaviour comes from MultiSelectFilterDrawer.
export const DebtorsFilterDrawer = ({ open, onClose, options, filters }: Props) => (
  <MultiSelectFilterDrawer
    open={open}
    onClose={onClose}
    fields={DEBTORS_DRAWER_FIELDS.map((f) => ({
      key: f.key,
      label: f.label,
      // Debtors options are plain strings — the value doubles as the label.
      options: (options?.[f.optionsKey] ?? []).map((o) => ({ value: o, label: o })),
    }))}
    values={filters.values}
    onApply={filters.setMany}
  />
);
