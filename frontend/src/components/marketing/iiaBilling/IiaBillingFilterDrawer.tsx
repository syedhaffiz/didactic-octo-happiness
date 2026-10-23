import { MultiSelectFilterDrawer } from "../../filters/MultiSelectFilterDrawer";
import {
  IIA_DRAWER_FIELDS,
  type IiaBillingFiltersState,
} from "../../../utils/useIiaBillingFilters";
import type { IiaBillingFilterOptions } from "../../../types/marketing";

interface Props {
  open: boolean;
  onClose: () => void;
  options?: IiaBillingFilterOptions;
  filters: IiaBillingFiltersState;
}

// Slide-in Filters panel (Zone, Port, Segment, Customer, Vendor), each a
// multi-select where empty means "All". Draft / Apply / Cancel / Clear all
// behaviour comes from the shared MultiSelectFilterDrawer.
export const IiaBillingFilterDrawer = ({ open, onClose, options, filters }: Props) => (
  <MultiSelectFilterDrawer
    open={open}
    onClose={onClose}
    fields={IIA_DRAWER_FIELDS.map((f) => ({
      key: f.key,
      label: f.label,
      options: (options?.[f.optionsKey] ?? []).map((o) => ({ value: o.id, label: o.name })),
    }))}
    values={filters.multi}
    onApply={filters.setMany}
  />
);
