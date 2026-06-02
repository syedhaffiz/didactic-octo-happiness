import Highcharts from "highcharts";
// Side-effect imports register the solidgauge series type used by the
// Inventory Days panel on the Approved Budget page.
import "highcharts/highcharts-more";
import "highcharts/modules/solid-gauge";
import { useEffect, useMemo, useRef } from "react";
import { brand, chartPalette, fontFamily } from "../theme/tokens";

// NOTE: we drive Highcharts imperatively rather than via highcharts-react-official.
// That package ships as UMD/CJS, so Vite force-pre-bundles it with its own React
// reference baked in — which, under Module Federation, is NOT the host's shared
// React singleton. Its hooks then run against a null dispatcher ("Cannot read
// properties of null (reading 'useRef')"). This in-house wrapper uses our own
// (ESM, share-scope-resolved) React, so it works in both standalone and
// federated runs.

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

  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<Highcharts.Chart | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    // Datasets are small and only change on filter/range updates, so a full
    // recreate per options change is simpler than diffing via chart.update().
    chartRef.current = Highcharts.chart(hostRef.current, merged);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [merged]);

  return <div ref={hostRef} {...containerProps} />;
};
