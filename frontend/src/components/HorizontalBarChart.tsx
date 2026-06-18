import { Empty } from "antd";
import { Chart } from "./Chart";

interface Row {
  category: string;
  value: number;
}

interface Props {
  rows?: Row[];
  color: string;
  /** Suffix appended to the bar label (e.g. "Cr"). */
  unit?: string;
  height?: number;
  /** Hide the loading overlay via Highcharts (use the chart's own loading state). */
  loading?: boolean;
}

// Reusable horizontal bar chart (Highcharts type: "bar"). Used by the Port
// Wise Profitability card; reusable for any future port-wise/zone-wise listing.
export const HorizontalBarChart = ({
  rows,
  color,
  unit = "",
  height,
  loading = false,
}: Props) => {
  const safeRows = (Array.isArray(rows) ? rows : []).filter(
    (r): r is Row => Boolean(r) && typeof r.value === "number" && Number.isFinite(r.value),
  );

  if (!loading && safeRows.length === 0) {
    return <Empty description="No data" style={{ padding: 24 }} />;
  }

  const chartHeight = height ?? Math.max(360, safeRows.length * 28);
  const suffix = unit ? unit : "";

  return (
    <Chart
      loading={loading}
      options={{
        chart: { type: "bar", height: chartHeight },
        xAxis: {
          categories: safeRows.map((r) => r.category),
          lineWidth: 0,
          tickWidth: 0,
        },
        yAxis: { visible: false, min: 0, title: { text: undefined } },
        legend: { enabled: false },
        tooltip: { pointFormat: `<b>{point.y:.1f} ${suffix}</b>` },
        plotOptions: {
          bar: {
            color,
            borderRadius: 4,
            pointWidth: 10,
            dataLabels: {
              enabled: true,
              format: `{y:.1f}${suffix ? ` ${suffix}` : ""}`,
              style: { fontSize: "11px", fontWeight: "500", textOutline: "none" },
            },
          },
        },
        series: [
          {
            type: "bar",
            name: "Value",
            data: safeRows.map((r) => r.value),
          },
        ],
      }}
    />
  );
};
