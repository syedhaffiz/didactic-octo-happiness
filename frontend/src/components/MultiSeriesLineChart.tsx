import { useMemo } from "react";
import { Empty } from "antd";
import type Highcharts from "highcharts";
import { Chart } from "./Chart";

// Distinct marker shape per series (Highcharts default cycle): circle, diamond,
// square, triangle, triangle-down — matches the Figma index/freight charts.
const SYMBOLS = ["circle", "diamond", "square", "triangle", "triangle-down"] as const;

const FALLBACK_COLOR = "#5B8FF9";

interface Series {
  name: string;
  data: (number | null)[];
}

interface Props {
  categories?: string[];
  series?: Series[];
  colors?: readonly string[];
  height?: number;
  yTitle?: string;
  yMin?: number;
  yMax?: number;
  valueDecimals?: number;
  /** Show each point's value as a label along its own line. */
  dataLabels?: boolean;
  /** Drape the Spin overlay without swapping the chart for a skeleton. */
  loading?: boolean;
}

// Reusable multi-series line chart. Guards against missing/malformed data so a
// bad payload renders an empty state rather than crashing.
//
// The `options` object is memoised on its real inputs so that re-renders
// triggered by unrelated state (e.g. a sibling card updating a URL param) do
// not produce a new reference — without this, `Chart` would destroy and
// recreate the Highcharts instance on every parent render.
export const MultiSeriesLineChart = ({
  categories,
  series,
  colors,
  height = 320,
  yTitle,
  yMin,
  yMax,
  valueDecimals = 1,
  dataLabels = false,
  loading = false,
}: Props) => {
  const cats = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories],
  );
  const safeSeries = useMemo(
    () =>
      (Array.isArray(series) ? series : []).filter(
        (s): s is Series => Boolean(s) && Array.isArray(s.data),
      ),
    [series],
  );
  const palette = useMemo(
    () => (colors && colors.length > 0 ? colors : [FALLBACK_COLOR]),
    [colors],
  );

  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "line", height },
      xAxis: {
        categories: cats,
        labels: {
          rotation: cats.length > 14 ? -45 : 0,
          style: { fontSize: "10px" },
        },
        tickInterval: cats.length > 20 ? Math.ceil(cats.length / 10) : 1,
      },
      yAxis: {
        title: yTitle ? { text: yTitle, style: { fontSize: "11px" } } : { text: undefined },
        min: yMin,
        max: yMax,
        gridLineDashStyle: "Dash",
      },
      legend: { enabled: true, align: "center", verticalAlign: "bottom", symbolRadius: 6 },
      tooltip: { shared: false, valueDecimals },
      plotOptions: {
        line: {
          lineWidth: 2.5,
          marker: { enabled: true, radius: 4 },
          dataLabels: {
            enabled: dataLabels,
            allowOverlap: false,
            style: { fontSize: "9px", fontWeight: "500", textOutline: "none" },
          },
        },
      },
      series: safeSeries.map((s, i) => {
        const color = palette[i % palette.length];
        return {
          type: "line",
          name: s.name ?? `Series ${i + 1}`,
          data: s.data ?? [],
          color,
          marker: { fillColor: color, symbol: SYMBOLS[i % SYMBOLS.length] },
        };
      }),
    }),
    [cats, safeSeries, palette, height, yTitle, yMin, yMax, valueDecimals, dataLabels],
  );

  if (safeSeries.length === 0 || cats.length === 0) {
    return <Empty description="No data" style={{ padding: 24 }} />;
  }

  return <Chart loading={loading} options={options} />;
};
