import "highcharts/modules/treemap";
import Highcharts from "highcharts";
import { Empty } from "antd";
import { Chart } from "./Chart";

interface Slice {
  name: string;
  value: number;
  color?: string;
}

interface Props {
  slices?: Slice[];
  /** Palette applied per-slice when an individual slice has no color. */
  palette?: readonly string[];
  height?: number;
  loading?: boolean;
}

// Reusable treemap. Used by Segment Wise Profitability; reusable for any
// future "share of total" by category visualisation. The treemap module is
// loaded as a side-effect import above so the series type is registered before
// the first render.
export const TreemapChart = ({ slices, palette, height = 360, loading = false }: Props) => {
  const safeSlices = (Array.isArray(slices) ? slices : []).filter(
    (s): s is Slice => Boolean(s) && typeof s.value === "number" && Number.isFinite(s.value),
  );

  if (!loading && safeSlices.length === 0) {
    return <Empty description="No data" style={{ padding: 24 }} />;
  }

  return (
    <Chart
      loading={loading}
      options={{
        chart: { type: "treemap", height },
        legend: { enabled: false },
        tooltip: { pointFormat: "<b>{point.name}</b>: {point.value:,.0f}" },
        series: [
          {
            type: "treemap",
            name: "Segments",
            layoutAlgorithm: "squarified",
            data: safeSlices.map((s, i) => ({
              name: s.name,
              value: s.value,
              color:
                s.color ?? (palette && palette.length > 0 ? palette[i % palette.length] : undefined),
            })),
            dataLabels: {
              enabled: true,
              align: "center",
              verticalAlign: "middle",
              useHTML: true,
              formatter(): string {
                const p = this as unknown as { point: { name: string; value: number } };
                return `<div style="text-align:center;color:#fff;font-weight:600;font-size:13px;line-height:1.3">${p.point.name}<br/><span style="font-size:15px;font-weight:700">${p.point.value.toLocaleString()}</span></div>`;
              },
            },
          } as unknown as Highcharts.SeriesOptionsType,
        ],
      }}
    />
  );
};
