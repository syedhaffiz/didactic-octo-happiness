import Highcharts from "highcharts";
// Side-effect imports register the solidgauge series type used by the
// Inventory Days panel on the Approved Budget page.
import "highcharts/highcharts-more";
import "highcharts/modules/solid-gauge";
import * as HCR from "highcharts-react-official";

// highcharts-react-official ships as a UMD bundle so Vite's CJS-to-ESM interop
// surfaces it as a namespace object — the actual component sits at `.HighchartsReact`.
interface HighchartsReactProps {
  highcharts: typeof Highcharts;
  options: Highcharts.Options;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
}
const HighchartsReact = (HCR as unknown as {
  HighchartsReact: React.ComponentType<HighchartsReactProps>;
}).HighchartsReact;
import { useMemo } from "react";
import { brand, chartPalette, fontFamily } from "../theme/tokens";

type Options = Highcharts.Options;

const baseDefaults: Options = {
  credits: { enabled: false },
  // Silences Highcharts' "include accessibility module" dev warning. When
  // we're ready to ship a11y support, import `highcharts/modules/accessibility`
  // in this file and flip this to `true`.
  accessibility: { enabled: false },
  title: { text: undefined },
  legend: { itemStyle: { fontFamily, fontWeight: "500" } },
  colors: [...chartPalette],
  chart: {
    backgroundColor: "transparent",
    style: { fontFamily },
    spacing: [8, 8, 8, 8],
  },
  tooltip: {
    backgroundColor: brand.white,
    borderColor: brand.border,
    borderRadius: 8,
    shadow: false,
    style: { fontFamily, color: brand.black },
  },
  xAxis: {
    lineColor: brand.border,
    tickColor: brand.border,
    labels: { style: { color: brand.textMuted, fontFamily, fontSize: "12px" } },
  },
  yAxis: {
    gridLineColor: brand.border,
    title: { text: undefined },
    labels: { style: { color: brand.textMuted, fontFamily, fontSize: "12px" } },
  },
  plotOptions: {
    series: { animation: { duration: 250 } },
    column: { borderRadius: 4, borderWidth: 0 },
    bar: { borderRadius: 4, borderWidth: 0 },
    pie: { borderWidth: 0 },
  },
};

const deepMerge = <T,>(target: T, source: T): T => {
  if (Array.isArray(source)) return source as T;
  if (source && typeof source === "object" && target && typeof target === "object") {
    const out: Record<string, unknown> = { ...(target as Record<string, unknown>) };
    for (const key of Object.keys(source as Record<string, unknown>)) {
      const a = (target as Record<string, unknown>)[key];
      const b = (source as Record<string, unknown>)[key];
      out[key] = deepMerge(a, b);
    }
    return out as T;
  }
  return source ?? target;
};

export const Chart = ({
  options,
  height,
  containerProps,
}: {
  options: Options;
  height?: number | string;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
}) => {
  const merged = useMemo<Options>(() => {
    const result = deepMerge(baseDefaults, options);
    if (height !== undefined) {
      result.chart = { ...(result.chart ?? {}), height };
    }
    return result;
  }, [options, height]);

  return <HighchartsReact highcharts={Highcharts} options={merged} containerProps={containerProps} />;
};
