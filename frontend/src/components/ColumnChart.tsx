import { useMemo } from "react";
import { Empty } from "antd";
import type Highcharts from "highcharts";
import { Chart } from "./Chart";
import { fmtK } from "../utils/format";

interface Row {
  category: string;
  value: number;
}

interface Props {
  rows?: Row[];
  color: string;
  yTitle: string;
  height?: number;
  /** Decimal places. 0 → labels and y-axis use the compact K formatter. */
  decimals?: number;
  /** When set, the legend is shown with this series name (e.g. "Budget"). */
  legendName?: string;
  /** X-axis label rotation; defaults to -45 for long category labels. */
  labelRotation?: number;
  /** Italicise x-axis labels; defaults to true (legacy Port-Wise styling). */
  labelItalic?: boolean;
  /** Drape the Spin overlay during data refetches. */
  loading?: boolean;
}

// Reusable single-series column chart. Used for Target Port-Wise, Origin-Wise
// (Budget only) and Segment-Wise (Budget only) charts.
export const ColumnChart = ({
  rows,
  color,
  yTitle,
  height = 400,
  decimals = 0,
  legendName,
  labelRotation = -45,
  labelItalic = true,
  loading = false,
}: Props) => {
  const safeRows = useMemo(
    () => (Array.isArray(rows) ? rows : []).filter((r): r is Row => Boolean(r)),
    [rows],
  );

  const label = (v: unknown) =>
    decimals > 0 ? Number(v ?? 0).toFixed(decimals) : fmtK(v);

  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "column", height },
      xAxis: {
        categories: safeRows.map((r) => r.category ?? ""),
        labels: {
          rotation: labelRotation,
          style: {
            fontSize: "10px",
            fontStyle: labelItalic ? "italic" : "normal",
          },
        },
      },
      yAxis: {
        title: { text: yTitle, style: { fontSize: "11px" } },
        labels: { formatter(): string { return label(this.value); } },
      },
      legend: legendName
        ? { enabled: true, align: "center", verticalAlign: "bottom", symbolRadius: 6 }
        : { enabled: false },
      tooltip: { pointFormat: `<b>{point.y:,.${decimals}f} ${yTitle}</b>` },
      plotOptions: {
        column: {
          pointPadding: 0.05,
          borderRadius: 2,
          dataLabels: {
            enabled: true,
            formatter(): string { return label(this.y); },
            style: { fontSize: "9px", textOutline: "none" },
          },
        },
      },
      series: [
        {
          type: "column",
          name: legendName ?? yTitle,
          data: safeRows.map((r) => (typeof r.value === "number" ? r.value : null)),
          color,
          pointWidth: 14,
        },
      ],
    }),
    [safeRows, color, yTitle, height, decimals, legendName, labelRotation, labelItalic],
  );

  if (safeRows.length === 0) {
    return <Empty description="No data" style={{ padding: 24 }} />;
  }

  return <Chart loading={loading} options={options} />;
};
