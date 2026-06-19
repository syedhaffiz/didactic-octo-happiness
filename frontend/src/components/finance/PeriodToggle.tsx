import { Segmented } from "antd";
import type { RevenuePeriod } from "../../types/finance";
import { useUrlParam } from "../../utils/useUrlParam";

const isPeriod = (v: string | undefined): v is RevenuePeriod =>
  v === "YTD" || v === "MTD";

// YTD / MTD toggle, mirrored to ?period= so the choice survives reloads.
export const useRevenuePeriod = (): [RevenuePeriod, (next: RevenuePeriod) => void] => {
  const [raw, setRaw] = useUrlParam("period");
  const period: RevenuePeriod = isPeriod(raw) ? raw : "YTD";
  const set = (next: RevenuePeriod) => setRaw(next === "YTD" ? undefined : next);
  return [period, set];
};

export const PeriodToggle = () => {
  const [period, setPeriod] = useRevenuePeriod();
  return (
    <Segmented<RevenuePeriod>
      options={[
        { value: "YTD", label: "YTD" },
        { value: "MTD", label: "MTD" },
      ]}
      value={period}
      onChange={setPeriod}
    />
  );
};
