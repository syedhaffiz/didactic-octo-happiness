import { Card, Col, Empty, Row, Space } from "antd";
import {
  AreaChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { Chart } from "../../components/Chart";
import { PortFilter } from "../../components/filters/PortFilter";
import { GradeFilter } from "../../components/filters/GradeFilter";
import { ZoneFilter } from "../../components/filters/ZoneFilter";
import { OriginFilter } from "../../components/filters/OriginFilter";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useUrlParam } from "../../utils/useUrlParam";
import {
  approvedBudgetSeries,
  inventoryColors,
  pbdColumn,
} from "../../theme/tokens";
import { useBrandTokens } from "../../theme/useBrandTokens";
import type { BudgetSeries, InventoryGauge, PbdRow } from "../../types/finance";

// All option builders below tolerate undefined / empty input (the data may not
// have resolved yet, or a filter combination may return nothing) and never
// dereference a missing array — the Chart renders empty under the loading
// overlay rather than throwing.

// Single "Budget" trend line. Margin reads in Cr (INR), Volume in MT.
const trendOptions = (s: BudgetSeries | undefined): Highcharts.Options => {
  const yTitle = s?.unit === "Cr" ? "Cr (INR)" : s?.unit ?? "";
  return {
    chart: { type: "line", height: 280 },
    xAxis: { categories: s?.months ?? [] },
    yAxis: { title: { text: yTitle, style: { fontSize: "11px" } } },
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
        data: s?.budget ?? [],
        color: approvedBudgetSeries.budget,
        marker: { fillColor: approvedBudgetSeries.budget },
      },
    ],
  };
};

const pbdOptions = (rows: PbdRow[] | undefined): Highcharts.Options => {
  const safe = rows ?? [];
  return {
    chart: { type: "column", height: 280 },
    xAxis: {
      categories: safe.map((r) => r.port),
      labels: { rotation: -45, style: { fontSize: "10px" } },
    },
    yAxis: { title: { text: "Days", style: { fontSize: "11px" } } },
    legend: { enabled: false },
    tooltip: { valueDecimals: 1, valueSuffix: " days" },
    plotOptions: { column: { groupPadding: 0.12, pointWidth: 22 } },
    series: [
      { type: "column", name: "PBD", data: safe.map((r) => r.days), color: pbdColumn },
    ],
  };
};

// Concentric KPI gauge — SEB is the outer ring, SNS sits inside. Modelled on
// https://www.highcharts.com/demo/highcharts/gauge-multiple-kpi.
const RING_RADII = [
  { outer: "92%", inner: "76%" },
  { outer: "70%", inner: "54%" },
] as const;
const RING_ORDER = ["SEB", "SNS"] as const;

// Day ticks shown around the dial (0, 05, … 35), single digits zero-padded.
const GAUGE_TICKS = [0, 5, 10, 15, 20, 25, 30, 35];
const padTick = (v: number) => (v > 0 && v < 10 ? `0${v}` : `${v}`);

const inventoryOptions = (
  g: InventoryGauge | undefined,
  tokens: { textSecondary: string; border: string },
): Highcharts.Options => {
  const colorFor: Record<string, string> = {
    SEB: inventoryColors.seb,
    SNS: inventoryColors.sns,
  };
  const slices = g?.slices ?? [];
  // Canonical SEB → SNS order so the outer / inner ring assignment is stable.
  const ordered = RING_ORDER.map((name) =>
    slices.find((s) => s.segment === name),
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
      size: "82%",
      // ~315° dial with a gap at the top so the 0 and 35 ticks don't collide.
      startAngle: 0,
      endAngle: 315,
      background: RING_RADII.map((r) => ({
        outerRadius: r.outer,
        innerRadius: r.inner,
        backgroundColor: tokens.border,
        borderWidth: 0,
      })),
    },
    yAxis: {
      min: 0,
      max: g?.max ?? 35,
      lineWidth: 0,
      tickWidth: 0,
      minorTickWidth: 0,
      tickPositions: GAUGE_TICKS,
      labels: {
        enabled: true,
        distance: 14,
        style: { fontSize: "10px", color: tokens.textSecondary },
        formatter() {
          return padTick(Number(this.value));
        },
      },
    },
    plotOptions: {
      solidgauge: {
        dataLabels: { enabled: false },
        rounded: true,
      },
    },
    // Highcharts' solidgauge legend swatch ignores the series color (renders
    // grey), so the legend is drawn in React below the chart instead.
    legend: { enabled: false },
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

// Custom legend for the gauge (see note in inventoryOptions on why the built-in
// one isn't used). Colors mirror the ring assignment.
const GaugeLegend = ({ segments, color }: { segments: string[]; color: string }) => (
  <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 4 }}>
    {segments.map((seg) => (
      <span
        key={seg}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color }}
      >
        <span
          style={{
            width: 11,
            height: 11,
            borderRadius: "50%",
            display: "inline-block",
            background: seg === "SEB" ? inventoryColors.seb : inventoryColors.sns,
          }}
        />
        {seg}
      </span>
    ))}
  </div>
);

export const ApprovedBudget = () => {
  const t = useBrandTokens();
  const [port, setPort] = useUrlParam("port");
  const [grade, setGrade] = useUrlParam("grade");
  const [zone, setZone] = useUrlParam("zone");
  const [origin, setOrigin] = useUrlParam("origin");

  const { data, isLoading, isError, error, refetch } = useApi(
    ["approved-budget", port, grade, zone, origin],
    () => financeApi.approvedBudget({ port, grade, zone, origin }),
  );

  const title = data ? `Budget ${data.fy}` : "Budget FY26";

  // Each card shows the Highcharts loading overlay while fetching, an antd
  // Empty once a resolved response carries no points, and the chart otherwise.
  const hasSeries = (s?: BudgetSeries) => (s?.budget?.length ?? 0) > 0;
  const showEmpty = (filled: boolean) => !isLoading && data && !filled;

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
        <ErrorRetry title="Could not load budget" error={error} onRetry={refetch} />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={cardTitle(<AreaChartOutlined />, "Volume", t.accentText)}>
              {showEmpty(hasSeries(data?.volume)) ? (
                <Empty description="No volume data" />
              ) : (
                <Chart loading={isLoading} options={trendOptions(data?.volume)} />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={cardTitle(<AreaChartOutlined />, "Margin", t.accentText)}>
              {showEmpty(hasSeries(data?.margin)) ? (
                <Empty description="No margin data" />
              ) : (
                <Chart loading={isLoading} options={trendOptions(data?.margin)} />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={cardTitle(<BarChartOutlined />, "PBD", t.accentText)}>
              {showEmpty((data?.pbd?.length ?? 0) > 0) ? (
                <Empty description="No PBD data" />
              ) : (
                <Chart loading={isLoading} options={pbdOptions(data?.pbd)} />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={cardTitle(<PieChartOutlined />, "Inventory Days", t.accentText)}>
              {showEmpty((data?.inventory?.slices?.length ?? 0) > 0) ? (
                <Empty description="No inventory data" />
              ) : (
                <>
                  <Chart
                    loading={isLoading}
                    options={inventoryOptions(data?.inventory, {
                      textSecondary: t.textSecondary,
                      border: t.border,
                    })}
                  />
                  <GaugeLegend
                    segments={RING_ORDER.filter((name) =>
                      data?.inventory?.slices?.some((s) => s.segment === name),
                    )}
                    color={t.text}
                  />
                </>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};
