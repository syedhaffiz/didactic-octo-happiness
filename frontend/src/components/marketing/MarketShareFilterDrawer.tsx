import { useState } from "react";
import { Button, Drawer, Select, Space } from "antd";
import { FilterField } from "../filters/FilterField";
import {
  MS_DRAWER_FIELDS,
  type MarketShareFiltersState,
  type MsMultiKey,
  type MsSingleKey,
} from "../../utils/useMarketShareFilters";
import type { MarketShareFilterOptions } from "../../types/marketing";

const ALL = "__all__";

interface Props {
  open: boolean;
  onClose: () => void;
  options?: MarketShareFilterOptions;
  filters: MarketShareFiltersState;
}

// Each field's draft is stored as an id array — single-select (Share) uses a
// 0/1-length array so one commit path (setMany) handles both kinds.
type Draft = Record<string, string[]>;

// Slide-in Filters panel. "Share" is a single-select; every other dropdown is
// multi-select. Edits stay in a local draft and only commit on "Apply filters";
// "Cancel" discards and "Clear all" empties the draft.
export const MarketShareFilterDrawer = ({ open, onClose, options, filters }: Props) => {
  const buildDraft = (): Draft => {
    const d: Draft = {};
    for (const f of MS_DRAWER_FIELDS) {
      if (f.multi) {
        d[f.key] = filters.multi[f.key as MsMultiKey] ?? [];
      } else {
        const v = filters.single[f.key as MsSingleKey];
        d[f.key] = v ? [v] : [];
      }
    }
    return d;
  };

  const [draft, setDraft] = useState<Draft>(buildDraft);

  // Re-sync the draft to the committed values on each open transition. Done in
  // render (not an effect) so the panel always opens showing the live state.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setDraft(buildDraft());
  }

  const apply = () => {
    const entries: Record<string, string | string[] | undefined> = {};
    for (const f of MS_DRAWER_FIELDS) {
      entries[f.key] = f.multi ? draft[f.key] ?? [] : draft[f.key]?.[0];
    }
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
        {MS_DRAWER_FIELDS.map((f) => {
          const opts = (options?.[f.optionsKey] ?? []).map((o) => ({ value: o.id, label: o.name }));
          return (
            <FilterField key={f.key} label={f.label}>
              {f.multi ? (
                <Select
                  mode="multiple"
                  allowClear
                  value={draft[f.key] ?? []}
                  onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
                  options={opts}
                  placeholder="All"
                  maxTagCount="responsive"
                  style={{ width: "100%" }}
                />
              ) : (
                <Select
                  value={draft[f.key]?.[0] ?? ALL}
                  onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v === ALL ? [] : [v] }))}
                  options={[{ value: ALL, label: "All" }, ...opts]}
                  style={{ width: "100%" }}
                />
              )}
            </FilterField>
          );
        })}
      </Space>
    </Drawer>
  );
};
