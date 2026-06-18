import { Segmented } from "antd";
import { useUrlParam } from "../../utils/useUrlParam";

export type VesselTab = "sales" | "handling";

const DEFAULT_TAB: VesselTab = "sales";

export const isVesselTab = (v: string | undefined): v is VesselTab =>
  v === "sales" || v === "handling";

const OPTIONS: { value: VesselTab; label: string }[] = [
  { value: "sales", label: "Sales" },
  { value: "handling", label: "Handling" },
];

// Tab hook + UI for Sales/Handling, driven via the ?tab=… URL param. Reused
// by both the Vessel Profitability list and the Batch ID detail pages.
export const useVesselTab = (): [VesselTab, (next: VesselTab) => void] => {
  const [raw, setRaw] = useUrlParam("tab");
  const tab: VesselTab = isVesselTab(raw) ? raw : DEFAULT_TAB;
  const set = (next: VesselTab) => setRaw(next === DEFAULT_TAB ? undefined : next);
  return [tab, set];
};

export const VesselTabsNav = () => {
  const [tab, setTab] = useVesselTab();
  return (
    <Segmented<VesselTab>
      options={OPTIONS}
      value={tab}
      onChange={setTab}
      style={{ marginBottom: 16 }}
    />
  );
};
