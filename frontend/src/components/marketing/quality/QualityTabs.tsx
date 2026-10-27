import { Tabs } from "antd";
import { QUALITY_TAB_OPTIONS, useQualityTradeType } from "../../../utils/useQualityFilters";
import type { QualityTradeType } from "../../../types/marketing";

// Purchase / Sales tabs, bound to the `?tab=` URL param.
export const QualityTabs = () => {
  const [active, setActive] = useQualityTradeType();
  return (
    <Tabs
      activeKey={active}
      onChange={(key) => setActive(key as QualityTradeType)}
      items={QUALITY_TAB_OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
    />
  );
};
