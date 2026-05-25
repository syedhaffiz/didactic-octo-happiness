import {
  Alert,
  Button,
  Card,
  Col,
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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnsType } from "antd/es/table";
import { Chart } from "../../components/Chart";
import { PortFilter } from "../../components/filters/PortFilter";
import { OriginFilter } from "../../components/filters/OriginFilter";
import { GradeFilter } from "../../components/filters/GradeFilter";
import { inventoryApi } from "../../api/inventory";
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

export const OverviewPage = () => {
  const t = useBrandTokens();
  const [port, setPort] = useState<string | undefined>();
  const [origin, setOrigin] = useState<string | undefined>();
  const [grade, setGrade] = useState<string | undefined>();
  const reset = () => {
    setPort(undefined);
    setOrigin(undefined);
    setGrade(undefined);
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["inventory", "overview", port, origin, grade],
    queryFn: () => inventoryApi.overview({ port, origin, grade }),
  });

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Could not load inventory"
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
        <PortFilter value={port} onChange={setPort} />
        <OriginFilter value={origin} onChange={setOrigin} />
        <GradeFilter value={grade} onChange={setGrade} />
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <Button onClick={reset}>Reset Filters</Button>
        </div>
      </div>

      {/* KPI summary cards */}
      <Row gutter={[16, 16]}>
        {(isLoading ? Array.from({ length: 4 }) : data?.kpis ?? []).map((k, i) => (
          <Col xs={24} sm={12} xl={6} key={k ? (k as InventoryKpi).id : `s${i}`}>
            {isLoading || !k ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <InventoryKpiCard kpi={k as InventoryKpi} />
            )}
          </Col>
        ))}
      </Row>

      {/* Current Inventory Level */}
      <Card
        title="Current Inventory Level"
        extra={
          <span style={{ color: t.textSecondary, fontSize: 12 }}>
            Last updated : {data ? fmtDate(data.asOf) : "—"}
          </span>
        }
        style={{ marginTop: 16 }}
      >
        {isLoading || !data ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Chart options={currentInventoryOptions(data.currentInventory)} />
        )}
      </Card>

      {/* Dispatch + Sales */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="Dispatch Summary" style={{ height: "100%" }}>
            {isLoading || !data ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : (
              <DispatchSummaryBlock data={data} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Sales" style={{ height: "100%" }}>
            {isLoading || !data ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : (
              <Chart options={salesOptions(data.sales)} />
            )}
          </Card>
        </Col>
      </Row>

      {/* Vessels */}
      <Card style={{ marginTop: 16 }} styles={{ body: { paddingTop: 4 } }}>
        {isLoading || !data ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <VesselsBlock data={data} linkBlue={t.linkBlue} />
        )}
      </Card>
    </>
  );
};

const DispatchSummaryBlock = ({ data }: { data: InventoryOverviewResponse }) => {
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
  data,
  linkBlue,
}: {
  data: InventoryOverviewResponse;
  linkBlue: string;
}) => {
  const columns = vesselColumns(linkBlue);
  return (
    <Tabs
      defaultActiveKey="sailed"
      items={[
        {
          key: "sailed",
          label: `Vessels Sailed Out (${data.vesselsSailedOut.length})`,
          children: (
            <Table
              rowKey={(r) => `${r.vessel}-${r.blDate}`}
              columns={columns}
              dataSource={data.vesselsSailedOut}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              size="middle"
            />
          ),
        },
        {
          key: "loading",
          label: `Vessels Underloading (${data.vesselsUnderloading.length})`,
          children: (
            <Table
              rowKey={(r) => `${r.vessel}-${r.blDate}`}
              columns={columns}
              dataSource={data.vesselsUnderloading}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              size="middle"
            />
          ),
        },
      ]}
    />
  );
};
