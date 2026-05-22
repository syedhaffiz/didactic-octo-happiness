import type { ReactElement } from "react";
import { Card, Tooltip } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ExportOutlined,
  BankOutlined,
  RiseOutlined,
  LineChartOutlined,
  WalletOutlined,
  TruckOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Chart } from "./Chart";
import { useBrandTokens } from "../theme/useBrandTokens";
import { brand, kpiSparkColors } from "../theme/tokens";
import { formatRawWithCommas, formatSigned } from "../utils/format";
import type { IconKey, KPI } from "../types/finance";

const iconMap: Record<IconKey, ReactElement> = {
  revenue: <BankOutlined />,
  sales: <LineChartOutlined />,
  profitability: <RiseOutlined />,
  workingCapital: <WalletOutlined />,
  dispatch: <TruckOutlined />,
  inventoryDays: <ClockCircleOutlined />,
};

export const KpiCard = ({ kpi }: { kpi: KPI }) => {
  const t = useBrandTokens();
  const isUp = kpi.trend === "up";
  const deltaColor = isUp ? t.deltaUp : t.deltaDown;
  const sparkColor = kpiSparkColors[kpi.id] ?? brand.purple;

  const sparkOptions: Highcharts.Options = {
    chart: { type: "areaspline", height: 48, margin: [4, 0, 4, 0] },
    xAxis: { visible: false },
    yAxis: { visible: false, gridLineWidth: 0 },
    legend: { enabled: false },
    tooltip: { enabled: false },
    plotOptions: {
      areaspline: {
        marker: { enabled: false },
        lineWidth: 2,
        fillOpacity: 0.16,
        color: sparkColor,
      },
    },
    series: [{ type: "areaspline", data: kpi.spark, name: kpi.label }],
  };

  return (
    <Card style={{ height: "100%" }} styles={{ body: { padding: 18 } }} hoverable>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: t.accentBg,
            color: t.accentText,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          {iconMap[kpi.id]}
        </div>
        <Link
          to={kpi.href}
          aria-label={`Open ${kpi.label}`}
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: brand.purple,
            color: brand.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
          }}
        >
          <ExportOutlined />
        </Link>
      </div>

      <div style={{ marginTop: 14, color: t.textSecondary, fontSize: 13 }}>{kpi.label}</div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 8,
          marginTop: 2,
        }}
      >
        <Tooltip title={formatRawWithCommas(kpi.value, kpi.unit)}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: t.headline, lineHeight: 1.1 }}>
              {kpi.value}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>
              {kpi.unit}
            </span>
          </div>
        </Tooltip>
        <div style={{ flex: 1, minWidth: 80, maxWidth: 116 }}>
          <Chart options={sparkOptions} />
        </div>
      </div>

      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
        <span
          style={{
            color: deltaColor,
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            fontWeight: 600,
          }}
        >
          {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {formatSigned(kpi.deltaPct)}
        </span>
        <span style={{ color: t.textSecondary }}>vs last week</span>
      </div>
    </Card>
  );
};
