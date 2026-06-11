import { Empty } from "antd";
import { Chart } from "./Chart";
import { fmtK } from "../utils/format";

interface Row {
  category: string;
  budget: number;
  actual: number;
}

interface Props {
  rows?: Row[];
  budgetColor: string;
  actualColor: string;
  yTitle: string;
  /** Decimal places for labels/tooltip (0 → abbreviate with K). */
  decimals: number;
}

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

// Reusable grouped Budget-vs-Actual column chart.
export const BudgetActualColumnChart = ({
  rows,
  budgetColor,
  actualColor,
  yTitle,
  decimals,
}: Props) => {
  const safeRows = (Array.isArray(rows) ? rows : []).filter((r): r is Row => Boolean(r));
  if (safeRows.length === 0) {
    return <Empty description="No data" style={{ padding: 24 }} />;
  }

  const label = (v: unknown) => (decimals > 0 ? String(num(v) ?? "") : fmtK(v));

  return (
    <Chart
      options={{
        chart: { type: "column", height: 400 },
        xAxis: {
          categories: safeRows.map((r) => r.category ?? ""),
          labels: { style: { fontSize: "11px" } },
        },
        yAxis: {
          title: { text: yTitle, style: { fontSize: "11px" } },
          labels: { formatter(): string { return label(this.value); } },
        },
        legend: { enabled: true, align: "center", verticalAlign: "bottom", symbolRadius: 6 },
        tooltip: { shared: true, valueDecimals: decimals },
        plotOptions: {
          column: {
            groupPadding: 0.15,
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
            name: "Budget",
            data: safeRows.map((r) => num(r.budget)),
            color: budgetColor,
          },
          {
            type: "column",
            name: "Actual",
            data: safeRows.map((r) => num(r.actual)),
            color: actualColor,
          },
        ],
      }}
    />
  );
};
