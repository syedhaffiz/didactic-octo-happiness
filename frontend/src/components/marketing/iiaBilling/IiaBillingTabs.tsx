import { Tabs } from "antd";
import { useIiaPortType } from "../../../utils/useIiaBillingFilters";
import type { IiaPortType } from "../../../types/marketing";

const OPTIONS: { key: IiaPortType; label: string }[] = [
  { key: "load", label: "Load Port" },
  { key: "discharge", label: "Discharge Port" },
];

// Load Port / Discharge Port tabs, bound to the `?tab=` URL param.
export const IiaBillingTabs = () => {
  const [active, setActive] = useIiaPortType();
  return (
    <Tabs
      activeKey={active}
      onChange={(key) => setActive(key as IiaPortType)}
      items={OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
    />
  );
};
