import { useState } from "react";
import { Button, Drawer, Select, Space } from "antd";
import { FilterField } from "../filters/FilterField";
import {
  DEBTORS_DRAWER_FIELDS,
  type DebtorsFiltersState,
} from "../../utils/useDebtorsFilters";
import type { DebtorsFilterOptions } from "../../types/finance";

interface Props {
  open: boolean;
  onClose: () => void;
  options?: DebtorsFilterOptions;
  filters: DebtorsFiltersState;
}

// Draft value per field — a value array (empty means "All"). Edits stay local
// until "Apply filters" commits them; "Cancel" discards and "Clear all" empties
// the draft.
type Draft = Record<string, string[]>;

// Slide-in Filters panel for Debtors. Every dropdown is a multi-select defaulting
// to "All" (nothing selected).
export const DebtorsFilterDrawer = ({ open, onClose, options, filters }: Props) => {
  const buildDraft = (): Draft => {
    const d: Draft = {};
    for (const f of DEBTORS_DRAWER_FIELDS) d[f.key] = filters.values[f.key] ?? [];
    return d;
  };

  const [draft, setDraft] = useState<Draft>(buildDraft);

  // Re-sync the draft to the committed values on each open transition, in render
  // (not an effect) so the panel always opens showing the live state.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraft(buildDraft());
  }

  const apply = () => {
    const entries: Record<string, string[]> = {};
    for (const f of DEBTORS_DRAWER_FIELDS) entries[f.key] = draft[f.key] ?? [];
    filters.setMany(entries);
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
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {DEBTORS_DRAWER_FIELDS.map((f) => {
          const opts = (options?.[f.optionsKey] ?? []).map((o) => ({ value: o, label: o }));
          return (
            <FilterField key={f.key} label={f.label}>
              <Select<string[]>
                mode="multiple"
                allowClear
                showSearch
                value={draft[f.key] ?? []}
                onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
                options={opts}
                placeholder="All"
                optionFilterProp="label"
                maxTagCount="responsive"
                style={{ width: "100%" }}
              />
            </FilterField>
          );
        })}
      </Space>
    </Drawer>
  );
};
