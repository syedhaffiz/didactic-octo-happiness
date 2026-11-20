import { useMemo } from "react";
import { Card, Empty, Skeleton } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import type Highcharts from "highcharts";
import { Chart } from "../Chart";
import { CardTitle } from "../CardTitle";
import { ErrorBoundary } from "../ErrorBoundary";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { commercialOpsColors } from "../../theme/tokens";
import { DASH, formatRupeesCompact, formatRupeesExact } from "./contractsFormat";
import type { PlotRentPortPoint } from "../../types/plotRent";

interface Props {
  items: PlotRentPortPoint[] | undefined;
  loading?: boolean;
}

const BLANK_LABEL = "(Blank)";

// Plot Rent by Port: one column per port (Σ valuated amount). Negative totals
// draw in the alert colour below the zero line; a port with no amounts shows a
// "—" label. Compact ₹ on the axis and labels, the exact figure in the tooltip.
export const PlotRentByPortCard = ({ items, loading = false }: Props) => {
  const t = useBrandTokens();
  const rows = useMemo(
    () => (Array.isArray(items) ? items.filter((p) => p && typeof p === "object") : []),
    [items],
  );

  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: "column", height: 380 },
      xAxis: {
        categories: rows.map((r) => r.port ?? BLANK_LABEL),
        labels: { style: { fontSize: "11px" } },
      },
      yAxis: {
        title: { text: "Amount (₹)", style: { color: t.textSecondary, fontSize: "12px" } },
        labels: {
          formatter() {
            return formatRupeesCompact(Number(this.value));
          },
        },
        plotLines: [{ value: 0, color: t.border, width: 1, zIndex: 3 }],
      },
      legend: { enabled: false },
      tooltip: {
        useHTML: true,
        formatter() {
          const idx = (this as unknown as { point?: { index?: number } }).point?.index;
          const row = idx != null ? rows[idx] : undefined;
          if (!row) return false;
          return `<b>${row.port ?? BLANK_LABEL}</b><br/>${formatRupeesExact(row.amount)}`;
        },
      },
      plotOptions: {
        column: {
          maxPointWidth: 64,
          borderRadius: 2,
          minPointLength: 2,
          dataLabels: {
            enabled: true,
            crop: false,
            overflow: "allow",
            style: { fontSize: "11px", fontWeight: "600", textOutline: "none" },
            formatter() {
              const row = rows[this.index];
              if (!row || row.amount === null) return DASH;
              return formatRupeesCompact(row.amount);
            },
          },
        },
      },
      series: [
        {
          type: "column",
          name: "Valuated amount",
          data: rows.map((r) => {
            const negative = typeof r.amount === "number" && r.amount < 0;
            const color = negative
              ? commercialOpsColors.plotRentNegative
              : commercialOpsColors.plotRentPositive;
            return {
              y: typeof r.amount === "number" && Number.isFinite(r.amount) ? r.amount : 0,
              color,
              dataLabels: { color: negative ? color : t.headline },
            };
          }),
        },
      ],
    }),
    [rows, t.textSecondary, t.border, t.headline],
  );

  return (
    <Card
      title={<CardTitle icon={<BarChartOutlined />}>Plot Rent by Port</CardTitle>}
      style={{ marginBottom: 16 }}
    >
      <ErrorBoundary level="section" label="plot rent by port">
        {loading && rows.length === 0 ? (
          <Skeleton active paragraph={{ rows: 7 }} />
        ) : rows.length === 0 ? (
          <Empty description="No plot rent for these filters" style={{ padding: 48 }} />
        ) : (
          <Chart options={options} loading={loading} />
        )}
      </ErrorBoundary>
    </Card>
  );
};
