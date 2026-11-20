import { useMemo } from "react";
import { Card, Empty, Skeleton } from "antd";
import { FieldTimeOutlined } from "@ant-design/icons";
import type Highcharts from "highcharts";
import { Chart } from "../Chart";
import { CardTitle } from "../CardTitle";
import { ErrorBoundary } from "../ErrorBoundary";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { brand, commercialOpsColors, fontFamily } from "../../theme/tokens";
import { formatRupees, toLakhs } from "./contractsFormat";
import type { EmdAgingPoint } from "../../types/commercialOps";

interface Props {
  points: EmdAgingPoint[] | undefined;
  loading?: boolean;
}

const AXIS_LABELS = { style: { color: brand.textMuted, fontFamily, fontSize: "12px" } };

// Pending EMD Aging Analysis: one column per port (Σ pending EMD, in lakhs) on
// the left axis and the average days pending as a line on the right axis.
export const EmdAgingCard = ({ points, loading = false }: Props) => {
  const t = useBrandTokens();
  const rows = useMemo(
    () => (Array.isArray(points) ? points.filter((p) => p && typeof p.port === "string") : []),
    [points],
  );

  const options = useMemo<Highcharts.Options>(() => {
    const axisTitle = (text: string): Highcharts.YAxisTitleOptions => ({
      text,
      align: "high",
      rotation: 0,
      offset: 0,
      y: -14,
      style: { color: t.textSecondary, fontSize: "12px", fontWeight: "400" },
    });
    return {
      chart: { height: 360, spacingTop: 28 },
      xAxis: { categories: rows.map((r) => r.port), crosshair: true },
      // An axis array replaces Chart's yAxis defaults, so each restates labels.
      yAxis: [
        {
          title: axisTitle("EMD Amount (L)"),
          labels: AXIS_LABELS,
          gridLineColor: brand.border,
          min: 0,
        },
        {
          title: { ...axisTitle("Aging (Days)"), align: "high" },
          labels: AXIS_LABELS,
          opposite: true,
          gridLineWidth: 0,
          min: 0,
          allowDecimals: false,
        },
      ],
      legend: { enabled: true, align: "center", verticalAlign: "bottom", symbolRadius: 6 },
      tooltip: {
        shared: true,
        useHTML: true,
        formatter() {
          const ctx = this as unknown as { points?: { point?: { index?: number } }[] };
          const idx = ctx.points?.[0]?.point?.index;
          const row = idx != null ? rows[idx] : undefined;
          if (!row) return false;
          return (
            `<b>${row.port}</b><br/>` +
            `EMD Amount: <b>${toLakhs(row.emdAmount)} L</b> ` +
            `<span style="color:${t.textSecondary}">(${formatRupees(row.emdAmount)})</span><br/>` +
            `Aging: <b>${row.agingDays} days</b>`
          );
        },
      },
      plotOptions: {
        column: { maxPointWidth: 72, borderRadius: 2 },
        series: {
          dataLabels: {
            enabled: true,
            style: { fontSize: "12px", fontWeight: "600", color: t.headline, textOutline: "none" },
          },
        },
      },
      series: [
        {
          type: "column",
          name: "Sum of EMD Amount",
          color: commercialOpsColors.emdAmount,
          yAxis: 0,
          data: rows.map((r) => toLakhs(r.emdAmount)),
        },
        {
          type: "line",
          name: "Aging",
          color: commercialOpsColors.emdAging,
          yAxis: 1,
          marker: { enabled: true, radius: 4, symbol: "circle" },
          lineWidth: 2,
          data: rows.map((r) => (Number.isFinite(r.agingDays) ? r.agingDays : null)),
        },
      ],
    };
  }, [rows, t.textSecondary, t.headline]);

  return (
    <Card title={<CardTitle icon={<FieldTimeOutlined />}>Pending EMD Aging Analysis</CardTitle>}>
      <ErrorBoundary level="section" label="pending EMD aging">
        {loading && rows.length === 0 ? (
          <Skeleton active paragraph={{ rows: 7 }} />
        ) : rows.length === 0 ? (
          <Empty description="No pending EMD for these filters" style={{ padding: 48 }} />
        ) : (
          <Chart options={options} loading={loading} />
        )}
      </ErrorBoundary>
    </Card>
  );
};
