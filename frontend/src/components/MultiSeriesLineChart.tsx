import { Empty } from "antd";
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
}

// Reusable multi-series line chart. Guards against missing/malformed data so a
// bad payload renders an empty state rather than crashing.
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
}: Props) => {
  const cats = Array.isArray(categories) ? categories : [];
  const safeSeries = (Array.isArray(series) ? series : []).filter(
    (s): s is Series => Boolean(s) && Array.isArray(s.data),
  );
  const palette = colors && colors.length > 0 ? colors : [FALLBACK_COLOR];

  if (safeSeries.length === 0 || cats.length === 0) {
    return <Empty description="No data" style={{ padding: 24 }} />;
  }

  return (
    <Chart
      options={{
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
      }}
    />
  );
};
