import { Alert, Card, Col, Row, Skeleton, Space } from "antd";
import {
  AreaChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/PageHeader";
import { Chart } from "../../components/Chart";
import { PortFilter } from "../../components/filters/PortFilter";
import { GradeFilter } from "../../components/filters/GradeFilter";
import { ZoneFilter } from "../../components/filters/ZoneFilter";
import { OriginFilter } from "../../components/filters/OriginFilter";
import { financeApi } from "../../api/finance";
import {
  approvedBudgetSeries,
  inventoryColors,
  pbdColumn,
} from "../../theme/tokens";
import { useBrandTokens } from "../../theme/useBrandTokens";
import type { BudgetSeries, InventoryGauge, PbdRow } from "../../types/finance";

const trendOptions = (s: BudgetSeries): Highcharts.Options => ({
  chart: { type: "line", height: 280 },
  xAxis: { categories: s.months },
  yAxis: { title: { text: s.unit, style: { fontSize: "11px" } } },
  legend: { enabled: true, align: "center", verticalAlign: "bottom" },
  tooltip: { shared: true, valueDecimals: 1 },
  plotOptions: {
    line: {
      marker: { enabled: true, radius: 3 },
      dataLabels: { enabled: true, style: { fontSize: "10px", fontWeight: "500" } },
    },
  },
  series: [
    {
      type: "line",
      name: "Budget",
      data: s.budget,
      color: approvedBudgetSeries.budget,
      marker: { fillColor: approvedBudgetSeries.budget },
    },
    {
      type: "line",
      name: "Actual",
      data: s.actual,
      color: approvedBudgetSeries.actual,
      marker: { fillColor: approvedBudgetSeries.actual },
      connectNulls: false,
    },
  ],
});

const pbdOptions = (rows: PbdRow[]): Highcharts.Options => ({
  chart: { type: "column", height: 260 },
  xAxis: { categories: rows.map((r) => r.port), labels: { rotation: -45, style: { fontSize: "10px" } } },
  yAxis: { title: { text: "Days", style: { fontSize: "11px" } } },
  legend: { enabled: false },
  tooltip: { valueDecimals: 1, valueSuffix: " days" },
  plotOptions: {
    column: { groupPadding: 0.12, pointWidth: 22 },
  },
  series: [
    {
      type: "column",
      name: "PBD",
      data: rows.map((r) => r.days),
      color: pbdColumn,
    },
  ],
});

// Multiple KPI gauge — concentric rings sharing one center, modelled on
// https://www.highcharts.com/demo/highcharts/gauge-multiple-kpi.
// Per design: SEB is the outer ring; SNS sits inside SEB.
const RING_RADII = [
  { outer: "100%", inner: "82%" },
  { outer: "78%", inner: "60%" },
] as const;

const RING_ORDER = ["SEB", "SNS"] as const;

const inventoryOptions = (
  g: InventoryGauge,
  tokens: { text: string; textSecondary: string; border: string },
): Highcharts.Options => {
  const colorFor: Record<string, string> = {
    SEB: inventoryColors.seb,
    SNS: inventoryColors.sns,
  };

  // Use a canonical SEB → SNS order so the outer / inner ring assignment is stable.
  const ordered = RING_ORDER.map((name) =>
    g.slices.find((s) => s.segment === name),
  ).filter((s): s is NonNullable<typeof s> => Boolean(s));

  return {
    chart: { type: "solidgauge", height: 280, backgroundColor: "transparent" },
    title: { text: undefined },
    tooltip: {
      borderWidth: 0,
      backgroundColor: "transparent",
      shadow: false,
      useHTML: true,
      headerFormat: "",
      pointFormat:
        `<span style="color:{point.color};font-size:12px;font-weight:600">` +
        `{series.name}: {point.y} days</span>`,
    },
    pane: {
      startAngle: 0,
      endAngle: 360,
      background: RING_RADII.map((r) => ({
        outerRadius: r.outer,
        innerRadius: r.inner,
        backgroundColor: tokens.border,
        borderWidth: 0,
      })),
    },
    yAxis: {
      min: 0,
      max: g.max,
      lineWidth: 0,
      tickPositions: [],
      labels: { enabled: false },
    },
    plotOptions: {
      solidgauge: {
        dataLabels: { enabled: false },
        rounded: true,
        showInLegend: true,
      },
    },
    legend: {
      enabled: true,
      align: "center",
      verticalAlign: "bottom",
      symbolRadius: 6,
      itemStyle: { color: tokens.text, fontWeight: "500", fontSize: "12px" },
      labelFormatter: function () {
        const series = this as unknown as { name: string; points?: { y: number }[] };
        const y = series.points?.[0]?.y ?? 0;
        return `${series.name}: ${y}`;
      },
    },
    series: ordered.map((s, i) => {
      const color = colorFor[s.segment] ?? inventoryColors.sns;
      return {
        type: "solidgauge",
        name: s.segment,
        color,
        data: [
          {
            y: s.days,
            color,
            radius: RING_RADII[i].outer,
            innerRadius: RING_RADII[i].inner,
          },
        ],
      } as unknown as Highcharts.SeriesOptionsType;
    }),
  };
};

const cardTitle = (icon: React.ReactNode, text: string, accent: string) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
    <span style={{ color: accent, fontSize: 16 }}>{icon}</span>
    {text}
  </span>
);

export const ApprovedBudget = () => {
  const t = useBrandTokens();
  const [port, setPort] = useState<string | undefined>();
  const [grade, setGrade] = useState<string | undefined>();
  const [zone, setZone] = useState<string | undefined>();
  const [origin, setOrigin] = useState<string | undefined>();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["approved-budget", port, grade, zone, origin],
    queryFn: () => financeApi.approvedBudget({ port, grade, zone, origin }),
  });

  const title = data ? `Budget ${data.fy}` : "Budget FY26";

  return (
    <>
      <PageHeader
        title={title}
        filters={
          <Space size="middle" wrap>
            <PortFilter value={port} onChange={setPort} />
            <GradeFilter value={grade} onChange={setGrade} />
            <ZoneFilter value={zone} onChange={setZone} />
            <OriginFilter value={origin} onChange={setOrigin} />
          </Space>
        }
      />

      {isError ? (
        <Alert
          type="error"
          showIcon
          message="Could not load budget"
          description={error instanceof Error ? error.message : "Unknown error"}
          action={
            <a onClick={() => refetch()} style={{ cursor: "pointer" }}>
              Retry
            </a>
          }
        />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={cardTitle(<AreaChartOutlined />, "Volume", t.accentText)}>
              {isLoading || !data ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <Chart options={trendOptions(data.volume)} />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={cardTitle(<AreaChartOutlined />, "Margin", t.accentText)}>
              {isLoading || !data ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <Chart options={trendOptions(data.margin)} />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={cardTitle(<BarChartOutlined />, "PBD", t.accentText)}>
              {isLoading || !data ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <Chart options={pbdOptions(data.pbd)} />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={cardTitle(<PieChartOutlined />, "Inventory Days", t.accentText)}>
              {isLoading || !data ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <Chart
                  options={inventoryOptions(data.inventory, {
                    text: t.text,
                    textSecondary: t.textSecondary,
                    border: t.border,
                  })}
                />
              )}
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};
