import type { ReactElement } from "react";
import { Card, Skeleton, Tooltip } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ExportOutlined,
  BankOutlined,
  RiseOutlined,
  LineChartOutlined,
  WalletOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Chart } from "./Chart";
import { useBrandTokens } from "../theme/useBrandTokens";
import { brand, kpiSparkColors } from "../theme/tokens";
import { formatRawWithCommas, formatSigned, splitCrValue } from "../utils/format";
import type { IconKey, KPI } from "../types/finance";

const iconMap: Record<IconKey, ReactElement> = {
  revenue: <BankOutlined />,
  sales: <LineChartOutlined />,
  profitability: <RiseOutlined />,
  workingCapital: <WalletOutlined />,
  inventoryDays: <ClockCircleOutlined />,
};

// Destination routes live in the UI, not the API. Only these three KPIs have a
// detail page to open; the rest (Sales, Inventory Days) render no export link.
const hrefMap: Partial<Record<IconKey, string>> = {
  revenue: "/finance/overview/revenue",
  profitability: "/finance/overview/profitability",
  workingCapital: "/finance/working-capital",
};

interface Props {
  /** KPI data; undefined while loading or when the API hasn't delivered yet. */
  kpi?: KPI;
  /** Hide value/spark/delta behind the antd Skeleton primitives. */
  loading?: boolean;
}

// One KPI tile. While loading, the icon tile, label slot, value placeholder
// and spark area all render in their final positions — only the actual numbers
// and chart data fill in once the API resolves. This keeps the Card frame
// completely stable; no layout shift when data arrives.
export const KpiCard = ({ kpi, loading = false }: Props) => {
  const t = useBrandTokens();
  const icon = kpi ? iconMap[kpi.id] : null;
  const href = kpi ? hrefMap[kpi.id] : undefined;
  // Crore figures get the compact Cr/L formatter; non-monetary units (MMT, Days)
  // render their stored value + unit as-is.
  const valueParts = kpi
    ? kpi.unit === "Cr"
      ? splitCrValue(kpi.value)
      : { num: String(kpi.value), unit: kpi.unit }
    : null;
  const sparkColor = kpi ? kpiSparkColors[kpi.id] ?? brand.purple : brand.accent;
  const isUp = kpi?.trend === "up";
  const deltaColor = isUp ? t.deltaUp : t.deltaDown;
  const showSpark = !loading && kpi && Array.isArray(kpi.spark) && kpi.spark.length > 0;

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
    series: [{ type: "areaspline", data: kpi?.spark ?? [], name: kpi?.label ?? "" }],
  };

  return (
    <Card style={{ height: "100%" }} styles={{ body: { padding: 18 } }} hoverable>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: brand.accent,
            color: brand.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          {icon}
        </div>
        {href ? (
          <Link
            to={href}
            aria-label={`Open ${kpi?.label ?? ""}`}
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: brand.accentSoft,
              color: brand.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
            }}
          >
            <ExportOutlined />
          </Link>
        ) : !kpi ? (
          // Loading: reserve the slot so the header doesn't shift when data
          // lands. Once loaded, KPIs without an href render no link at all.
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: brand.accentSoft,
            }}
          />
        ) : null}
      </div>

      <div style={{ marginTop: 14, color: t.textSecondary, fontSize: 13, minHeight: 18 }}>
        {kpi?.label ?? <Skeleton.Input active size="small" style={{ width: 90, height: 14 }} />}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 8,
          marginTop: 2,
          minHeight: 36,
        }}
      >
        {loading || !kpi ? (
          <Skeleton.Input active style={{ width: 80, height: 28 }} />
        ) : (
          <Tooltip title={formatRawWithCommas(kpi.value, kpi.unit)}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: t.headline, lineHeight: 1.1 }}>
                {valueParts?.num}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary }}>
                {valueParts?.unit}
              </span>
            </div>
          </Tooltip>
        )}
        <div style={{ flex: 1, minWidth: 80, maxWidth: 116, minHeight: 48 }}>
          {showSpark ? <Chart options={sparkOptions} loading={loading} /> : null}
        </div>
      </div>

      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: `1px solid ${brand.border}`,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          minHeight: 18,
        }}
      >
        {loading || !kpi ? (
          <Skeleton.Input active size="small" style={{ width: 110, height: 12 }} />
        ) : (
          <>
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
          </>
        )}
      </div>
    </Card>
  );
};
