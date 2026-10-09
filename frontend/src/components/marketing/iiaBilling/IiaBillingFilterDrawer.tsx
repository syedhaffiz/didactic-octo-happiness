import { useState } from "react";
import { Button, Drawer, Select, Space } from "antd";
import { FilterField } from "../../filters/FilterField";
import {
  IIA_DRAWER_FIELDS,
  type IiaBillingFiltersState,
  type IiaMultiKey,
} from "../../../utils/useIiaBillingFilters";
import type { IiaBillingFilterOptions } from "../../../types/marketing";

interface Props {
  open: boolean;
  onClose: () => void;
  options?: IiaBillingFilterOptions;
  filters: IiaBillingFiltersState;
}

type Draft = Partial<Record<IiaMultiKey, string[]>>;

// Slide-in Filters panel (Zone, Port, Segment, Customer, Vendor), each a
// multi-select where empty means "All". Edits stay in a local draft and only
// commit on "Apply filters"; "Cancel" discards and "Clear all" empties the draft.
export const IiaBillingFilterDrawer = ({ open, onClose, options, filters }: Props) => {
  const buildDraft = (): Draft =>
    Object.fromEntries(IIA_DRAWER_FIELDS.map((f) => [f.key, filters.multi[f.key]]));

  const [draft, setDraft] = useState<Draft>(buildDraft);

  // Re-sync the draft to the committed values on each open transition. Done in
  // render (not an effect) so the panel always opens showing the live state.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraft(buildDraft());
  }

  const apply = () => {
    filters.setMany(
      Object.fromEntries(IIA_DRAWER_FIELDS.map((f) => [f.key, draft[f.key] ?? []])),
    );
    onClose();
  };

  return (
    <Drawer
      title="Filters"
      open={open}
      onClose={onClose}
      extra={
        <a onClick={() => setDraft({})} style={{ cursor: "pointer" }}>
          Clear all
        </a>
      }
      footer={
        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={apply}>
            Apply filters
          </Button>
        </Space>
      }
    >
      <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
        {IIA_DRAWER_FIELDS.map((f) => (
          <FilterField key={f.key} label={f.label}>
            <Select
              mode="multiple"
              allowClear
              value={draft[f.key] ?? []}
              onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
              options={(options?.[f.optionsKey] ?? []).map((o) => ({ value: o.id, label: o.name }))}
              placeholder="All"
              maxTagCount="responsive"
              optionFilterProp="label"
              style={{ width: "100%" }}
            />
          </FilterField>
        ))}
      </Space>
    </Drawer>
  );
};
