import { Empty } from "antd";
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
}

// Reusable single-series column chart (e.g. Target Port-Wise). Labels/axis use
// the compact K formatter.
export const ColumnChart = ({ rows, color, yTitle, height = 400 }: Props) => {
  const safeRows = (Array.isArray(rows) ? rows : []).filter((r): r is Row => Boolean(r));
  if (safeRows.length === 0) {
    return <Empty description="No data" style={{ padding: 24 }} />;
  }

  return (
    <Chart
      options={{
        chart: { type: "column", height },
        xAxis: {
          categories: safeRows.map((r) => r.category ?? ""),
          labels: { rotation: -45, style: { fontSize: "10px", fontStyle: "italic" } },
        },
        yAxis: {
          title: { text: yTitle, style: { fontSize: "11px" } },
          labels: { formatter(): string { return fmtK(this.value); } },
        },
        legend: { enabled: false },
        tooltip: { pointFormat: `<b>{point.y:,.0f} ${yTitle}</b>` },
        plotOptions: {
          column: {
            pointPadding: 0.05,
            borderRadius: 2,
            dataLabels: {
              enabled: true,
              formatter(): string { return fmtK(this.y); },
              style: { fontSize: "9px", textOutline: "none" },
            },
          },
        },
        series: [
          {
            type: "column",
            name: yTitle,
            data: safeRows.map((r) => (typeof r.value === "number" ? r.value : null)),
            color,
            pointWidth: 14,
          },
        ],
      }}
    />
  );
};
