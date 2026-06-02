import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Space,
  Table,
  Tabs,
  Tooltip,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  ContainerOutlined,
  RocketOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import type { ReactElement } from "react";
import type { ColumnsType } from "antd/es/table";
import { Chart } from "../../components/Chart";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { PortFilter } from "../../components/filters/PortFilter";
import { OriginFilter } from "../../components/filters/OriginFilter";
import { GradeFilter } from "../../components/filters/GradeFilter";
import { inventoryApi } from "../../api/inventory";
import { useApi } from "../../api/useApi";
import { useUrlParams } from "../../utils/useUrlParam";
import { brand, chartSeries } from "../../theme/tokens";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { formatSigned } from "../../utils/format";
import type {
  InventoryKpi,
  InventoryOverviewResponse,
  KpiIconKey,
  PortInventoryRow,
  SalesMonth,
  VesselRow,
} from "../../types/inventory";

const KPI_ICON: Record<KpiIconKey, ReactElement> = {
  physicalInventory: <ContainerOutlined />,
  salesBooking: <BarChartOutlined />,
  dispatch: <TruckOutlined />,
  vessels: <RocketOutlined />,
};

const fmtInt = (n: number) => n.toLocaleString("en-IN");
const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00Z");
  return `${String(d.getUTCDate()).padStart(2, "0")}-${d.toLocaleString("en", {
    month: "short",
    timeZone: "UTC",
  })}-${d.getUTCFullYear()}`;
};

// --- KPI summary card ------------------------------------------------------

const InventoryKpiCard = ({ kpi }: { kpi: InventoryKpi }) => {
  const t = useBrandTokens();
  return (
    <Card
      style={{ height: "100%" }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: t.accentText, fontSize: 16 }}>{KPI_ICON[kpi.id]}</span>
        <span style={{ fontWeight: 600, color: t.text, fontSize: 13 }}>{kpi.title}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 12 }}>
        <Stat label={kpi.primaryLabel} value={kpi.primaryValue} unit={kpi.primaryUnit} />
        <Stat
          label={kpi.secondaryLabel}
          value={kpi.secondaryValue}
          unit={kpi.secondaryUnit}
        />
      </div>
      <div style={{ marginTop: 14, paddingTop: 8, borderTop: `1px solid ${t.border}` }}>
        <span style={{ fontSize: 11, color: t.textSecondary }}>
          Last updated : {fmtDate(kpi.lastUpdated)}
        </span>
      </div>
    </Card>
  );
};

const Stat = ({ label, value, unit }: { label: string; value: number; unit?: string }) => {
  const t = useBrandTokens();
  return (
    <div style={{ textAlign: "center" }}>
      <Tooltip title={fmtInt(value)}>
        <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>{fmtInt(value)}</div>
      </Tooltip>
      <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 2 }}>
        {label}
        {unit ? ` (${unit})` : ""}
      </div>
    </div>
  );
};

// --- Charts ----------------------------------------------------------------

const currentInventoryOptions = (rows: PortInventoryRow[]): Highcharts.Options => ({
  chart: { type: "column", height: 300, backgroundColor: "transparent" },
  xAxis: { categories: rows.map((r) => r.port) },
  yAxis: { title: { text: "Metric Tonnes", style: { fontSize: "11px" } } },
  legend: { enabled: true, align: "center", verticalAlign: "bottom" },
  tooltip: { shared: true, valueSuffix: " MT" },
  plotOptions: {
    column: {
      groupPadding: 0.12,
      dataLabels: { enabled: true, format: "{y:,.0f}" },
    },
  },
  series: [
    {
      type: "column",
      name: "Physical Stock",
      data: rows.map((r) => r.physicalStock),
      color: brand.accent,
    },
    {
      type: "column",
      name: "Physical Unsold",
      data: rows.map((r) => r.physicalUnsold),
      color: chartSeries.budget,
    },
  ],
});

const salesOptions = (rows: SalesMonth[]): Highcharts.Options => ({
  chart: { type: "column", height: 220, backgroundColor: "transparent" },
  xAxis: { categories: rows.map((r) => r.month) },
  yAxis: { title: { text: "Metric Tonnes", style: { fontSize: "11px" } } },
  legend: { enabled: false },
  tooltip: { valueSuffix: " MT" },
  plotOptions: { column: { pointWidth: 26 } },
  series: [
    {
      type: "column",
      name: "Sales",
      data: rows.map((r) => r.value),
      color: brand.accent,
    },
  ],
});

// --- Dispatch summary tiles ------------------------------------------------

const DispatchTile = ({
  value,
  caption,
  emphasis,
}: {
  value: string;
  caption: string;
  emphasis?: boolean;
}) => {
  const t = useBrandTokens();
  return (
    <div
      style={{
        background: t.accentBg,
        borderRadius: 10,
        padding: emphasis ? "16px 20px" : "12px 16px",
        textAlign: "center",
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: emphasis ? 22 : 16,
          fontWeight: 700,
          color: t.accentText,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: t.textSecondary, marginTop: 4 }}>{caption}</div>
    </div>
  );
};

// --- Vessel table ----------------------------------------------------------

const vesselColumns = (linkBlue: string): ColumnsType<VesselRow> => [
  {
    title: "Vessel",
    dataIndex: "vessel",
    key: "vessel",
    render: (v: string) => <span style={{ color: linkBlue, fontWeight: 500 }}>{v}</span>,
  },
  { title: "Coal Grade", dataIndex: "coalGrade", key: "coalGrade", width: 130 },
  {
    title: "Tonnage",
    dataIndex: "tonnage",
    key: "tonnage",
    align: "right",
    width: 110,
    render: (v: number) => fmtInt(v),
  },
  { title: "Origin", dataIndex: "origin", key: "origin", width: 100 },
  { title: "BL Date", dataIndex: "blDate", key: "blDate", width: 110, render: fmtDate },
  { title: "ETA DP", dataIndex: "etaDp", key: "etaDp", width: 110, render: fmtDate },
];

// --- Page ------------------------------------------------------------------

const FILTER_KEYS = ["port", "origin", "grade"] as const;

export const OverviewPage = () => {
  const t = useBrandTokens();
  const { values, set, reset } = useUrlParams(FILTER_KEYS);
  const port = values.port;
  const origin = values.origin;
  const grade = values.grade;

  const { data, isLoading, isError, error, refetch } = useApi(
    ["inventory", "overview", port, origin, grade],
    () => inventoryApi.overview({ port, origin, grade }),
  );
  // The wire envelope nests the payload under `items`; project to a local for
  // easier reads below.
  const overview = data?.items;

  // Vessel tables have their own endpoints — independent loading state so
  // the KPI/dispatch/sales blocks can render even if the vessel lists are
  // still streaming.
  const vesselsSailedOutQuery = useApi(
    ["inventory", "vessels", "sailed-out", port, origin, grade],
    () => inventoryApi.vesselsSailedOut({ port, origin, grade }),
  );
  const vesselsUnderloadingQuery = useApi(
    ["inventory", "vessels", "under-loading", port, origin, grade],
    () => inventoryApi.vesselsUnderloading({ port, origin, grade }),
  );

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        title="Could not load inventory"
        description={error instanceof Error ? error.message : "Unknown error"}
        action={<a onClick={() => refetch()} style={{ cursor: "pointer" }}>Retry</a>}
      />
    );
  }

  return (
    <>
      {/* Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <PortFilter value={port} onChange={(v) => set("port", v)} />
        <OriginFilter value={origin} onChange={(v) => set("origin", v)} />
        <GradeFilter value={grade} onChange={(v) => set("grade", v)} />
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <Button onClick={reset}>Reset Filters</Button>
        </div>
      </div>

      {/* KPI summary cards */}
      <ErrorBoundary level="section" label="KPIs" resetKeys={[port, origin, grade]}>
        {isLoading ? (
          <Row gutter={[16, 16]}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Col xs={24} sm={12} xl={6} key={`s${i}`}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </Col>
            ))}
          </Row>
        ) : !overview || overview.kpis.length === 0 ? (
          <Card><Empty description="No KPIs available" /></Card>
        ) : (
          <Row gutter={[16, 16]}>
            {overview.kpis.map((k) => (
              <Col xs={24} sm={12} xl={6} key={k.id}>
                <InventoryKpiCard kpi={k} />
              </Col>
            ))}
          </Row>
        )}
      </ErrorBoundary>

      {/* Current Inventory Level */}
      <Card
        title="Current Inventory Level"
        extra={
          <span style={{ color: t.textSecondary, fontSize: 12 }}>
            Last updated : {overview ? fmtDate(overview.asOf) : "—"}
          </span>
        }
        style={{ marginTop: 16 }}
      >
        <ErrorBoundary level="section" label="inventory chart" resetKeys={[port, origin, grade]}>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : !overview || overview.currentInventory.length === 0 ? (
            <Empty description="No inventory data" />
          ) : (
            <Chart options={currentInventoryOptions(overview.currentInventory)} />
          )}
        </ErrorBoundary>
      </Card>

      {/* Dispatch + Sales */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="Dispatch Summary" style={{ height: "100%" }}>
            <ErrorBoundary level="section" label="Dispatch" resetKeys={[port, origin, grade]}>
              {isLoading ? (
                <Skeleton active paragraph={{ rows: 5 }} />
              ) : !overview ? (
                <Empty description="No dispatch data" />
              ) : (
                <DispatchSummaryBlock data={overview} />
              )}
            </ErrorBoundary>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Sales" style={{ height: "100%" }}>
            <ErrorBoundary level="section" label="Sales" resetKeys={[port, origin, grade]}>
              {isLoading ? (
                <Skeleton active paragraph={{ rows: 5 }} />
              ) : !overview || overview.sales.length === 0 ? (
                <Empty description="No sales data" />
              ) : (
                <Chart options={salesOptions(overview.sales)} />
              )}
            </ErrorBoundary>
          </Card>
        </Col>
      </Row>

      {/* Vessels — two independent endpoints, each loads on its own */}
      <Card style={{ marginTop: 16 }} styles={{ body: { paddingTop: 4 } }}>
        <ErrorBoundary level="section" label="Vessels" resetKeys={[port, origin, grade]}>
          <VesselsBlock
            sailed={vesselsSailedOutQuery.data?.items}
            sailedLoading={vesselsSailedOutQuery.isLoading}
            sailedError={vesselsSailedOutQuery.error}
            loading={vesselsUnderloadingQuery.data?.items}
            loadingLoading={vesselsUnderloadingQuery.isLoading}
            loadingError={vesselsUnderloadingQuery.error}
            linkBlue={t.linkBlue}
          />
        </ErrorBoundary>
      </Card>
    </>
  );
};

const DispatchSummaryBlock = ({ data }: { data: InventoryOverviewResponse["items"] }) => {
  const t = useBrandTokens();
  const isUp = data.dispatch.deltaPct >= 0;
  return (
    <Space size={12} style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      <DispatchTile
        emphasis
        value={`${fmtInt(data.dispatch.last24Hours)} MT`}
        caption="Last 24 hours"
      />
      <Row gutter={12}>
        <Col span={12}>
          <DispatchTile
            value={`${fmtInt(data.dispatch.last7Days)} MT`}
            caption="Last 7 Days aggregate"
          />
        </Col>
        <Col span={12}>
          <DispatchTile
            value={`${fmtInt(data.dispatch.mtdAggregate)} MT`}
            caption="MTD aggregate"
          />
        </Col>
      </Row>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
        <span
          style={{
            color: isUp ? t.deltaUp : t.deltaDown,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {formatSigned(data.dispatch.deltaPct)}
        </span>
        <span style={{ color: t.textSecondary }}>vs last 7 days aggregate</span>
      </div>
    </Space>
  );
};

const VesselsBlock = ({
  sailed,
  sailedLoading,
  sailedError,
  loading,
  loadingLoading,
  loadingError,
  linkBlue,
}: {
  sailed: VesselRow[] | undefined | null;
  sailedLoading: boolean;
  sailedError: Error | null;
  loading: VesselRow[] | undefined | null;
  loadingLoading: boolean;
  loadingError: Error | null;
  linkBlue: string;
}) => {
  const columns = vesselColumns(linkBlue);

  const renderTable = (
    rows: VesselRow[] | undefined | null,
    isLoading: boolean,
    error: Error | null,
  ) => {
    // Loading check first, on its own — once isLoading flips to false, we
    // commit to either error, empty, or table. Crucially, a successful
    // response with `items: null` lands in the Empty branch, not Skeleton.
    if (isLoading) {
      return <Skeleton active paragraph={{ rows: 6 }} style={{ padding: 16 }} />;
    }
    if (error) {
      return (
        <Alert
          type="error"
          showIcon
          title="Could not load vessels"
          description={error.message}
          style={{ margin: 16 }}
        />
      );
    }
    if (!rows || rows.length === 0) {
      return <Empty description="No vessels" style={{ padding: 32 }} />;
    }
    return (
      <Table
        rowKey={(r) => `${r.vessel}-${r.blDate}`}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        size="middle"
      />
    );
  };

  // Show "…" only while the fetch is in flight. A successful response with
  // null/empty items shows "0" — accurate, not misleading.
  const countLabel = (rows: VesselRow[] | undefined | null, isLoading: boolean) =>
    isLoading ? "…" : (rows?.length ?? 0);

  return (
    <Tabs
      defaultActiveKey="sailed"
      items={[
        {
          key: "sailed",
          label: `Vessels Sailed Out (${countLabel(sailed, sailedLoading)})`,
          children: renderTable(sailed, sailedLoading, sailedError),
        },
        {
          key: "loading",
          label: `Vessels Underloading (${countLabel(loading, loadingLoading)})`,
          children: renderTable(loading, loadingLoading, loadingError),
        },
      ]}
    />
  );
};
