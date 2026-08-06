import { useState } from "react";
import { Button, Drawer, Select, Space } from "antd";
import { FilterField } from "../filters/FilterField";
import { MS_SINGLE_FIELDS, type MsSingleKey } from "../../utils/useMarketShareFilters";
import type { MarketShareFilterOptions, FilterRef } from "../../types/marketing";

const ALL = "__all__";

type Draft = Record<MsSingleKey, string | undefined>;

interface Props {
  open: boolean;
  onClose: () => void;
  options?: MarketShareFilterOptions;
  /** Currently committed single-select values. */
  values: Draft;
  /** Commit the draft to the URL-backed filter state. */
  onApply: (next: Draft) => void;
}

// Slide-in Filters panel: ten single-select dropdowns fed by the filter-options
// endpoint. Edits stay in a local draft and only commit on "Apply filters";
// "Cancel" discards, and "Clear all" empties the draft.
export const MarketShareFilterDrawer = ({ open, onClose, options, values, onApply }: Props) => {
  const [draft, setDraft] = useState<Draft>(values);

  // Re-sync the draft to the committed values on each open transition. Done in
  // render (not an effect) so the panel always opens showing the live state.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraft(values);
  }

  const setField = (key: MsSingleKey, v: string) =>
    setDraft((d) => ({ ...d, [key]: v === ALL ? undefined : v }));

  const apply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <Drawer
      title="Filters"
      open={open}
      onClose={onClose}
      extra={
        <a onClick={() => setDraft({} as Draft)} style={{ cursor: "pointer" }}>
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
        {MS_SINGLE_FIELDS.map(({ key, label, optionsKey }) => {
          const list: FilterRef[] = options?.[optionsKey] ?? [];
          return (
            <FilterField key={key} label={label}>
              <Select
                value={draft[key] ?? ALL}
                onChange={(v) => setField(key, v)}
                options={[
                  { value: ALL, label: "All" },
                  ...list.map((o) => ({ value: o.id, label: o.name })),
                ]}
                style={{ width: "100%" }}
              />
            </FilterField>
          );
        })}
      </Space>
    </Drawer>
  );
};
