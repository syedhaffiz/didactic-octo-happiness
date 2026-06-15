import { Segmented } from "antd";
import { useUrlParam } from "../../utils/useUrlParam";

export type LegalTab = "critical-cases" | "critical-issues";

const DEFAULT_TAB: LegalTab = "critical-cases";

export const isLegalTab = (v: string | undefined): v is LegalTab =>
  v === "critical-cases" || v === "critical-issues";

const OPTIONS: { value: LegalTab; label: string }[] = [
  { value: "critical-cases", label: "Critical Cases" },
  { value: "critical-issues", label: "Critical Issues" },
];

// Segmented control that drives the active Legal tab via the `?tab=` URL
// param. URL is the source of truth: deep-linkable + back/forward friendly.
// The default tab writes no param (clean URL).
export const useLegalTab = (): [LegalTab, (tab: LegalTab) => void] => {
  const [raw, setRaw] = useUrlParam("tab");
  const active: LegalTab = isLegalTab(raw) ? raw : DEFAULT_TAB;
  const set = (tab: LegalTab) => setRaw(tab === DEFAULT_TAB ? undefined : tab);
  return [active, set];
};

export const LegalTabsNav = () => {
  const [active, setActive] = useLegalTab();
  return (
    <Segmented<LegalTab>
      options={OPTIONS}
      value={active}
      onChange={setActive}
      style={{ marginBottom: 16 }}
    />
  );
};
