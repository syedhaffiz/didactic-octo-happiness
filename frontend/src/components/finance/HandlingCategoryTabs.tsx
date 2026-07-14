import { Tabs } from "antd";
import { useUrlParam } from "../../utils/useUrlParam";
import type { HandlingCategory } from "../../types/finance";

const DEFAULT_CATEGORY: HandlingCategory = "all";

const isHandlingCategory = (v: string | undefined): v is HandlingCategory =>
  v === "all" || v === "sagarmala" || v === "tph" || v === "cif";

const OPTIONS: { key: HandlingCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sagarmala", label: "Sagarmala" },
  { key: "tph", label: "TPH" },
  { key: "cif", label: "CIF" },
];

// Handling sub-tab (All / Sagarmala / TPH / CIF), driven via the ?category=…
// URL param so a filtered view is shareable and survives a reload.
export const useHandlingCategory = (): [
  HandlingCategory,
  (next: HandlingCategory) => void,
] => {
  const [raw, setRaw] = useUrlParam("category");
  const category: HandlingCategory = isHandlingCategory(raw) ? raw : DEFAULT_CATEGORY;
  const set = (next: HandlingCategory) =>
    setRaw(next === DEFAULT_CATEGORY ? undefined : next);
  return [category, set];
};

export const HandlingCategoryTabs = () => {
  const [category, setCategory] = useHandlingCategory();
  return (
    <Tabs
      activeKey={category}
      onChange={(key) => setCategory(key as HandlingCategory)}
      items={OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
    />
  );
};
