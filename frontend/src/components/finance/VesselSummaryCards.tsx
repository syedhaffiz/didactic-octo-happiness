import { Col, Row } from "antd";
import { StatTile } from "../StatTile";
import { formatMoney, toMoneyParts } from "../../utils/format";
import type { Currency, VesselSummary } from "../../types/finance";

interface Props {
  summary?: VesselSummary;
  currency: Currency;
  loading?: boolean;
}

const money = (value: number, currency: Currency): string => {
  const { num, unit } = toMoneyParts(value, currency);
  return unit ? `${num} ${unit}` : num;
};

const count = (value: number): string => value.toLocaleString();

// The four stat tiles above the Sales and Handling vessel tables.
export const VesselSummaryCards = ({ summary, currency, loading = false }: Props) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
    <Col xs={24} sm={12} xl={6}>
      <StatTile
        label="Revenue"
        value={summary ? money(summary.revenue, currency) : "—"}
        tooltip={summary ? formatMoney(summary.revenue, currency) : undefined}
        loading={loading}
      />
    </Col>
    <Col xs={24} sm={12} xl={6}>
      <StatTile
        label="Total Profit"
        value={summary ? money(summary.totalProfit, currency) : "—"}
        tooltip={summary ? formatMoney(summary.totalProfit, currency) : undefined}
        loading={loading}
      />
    </Col>
    <Col xs={24} sm={12} xl={6}>
      <StatTile
        label="Total Vessels"
        value={summary ? count(summary.totalVessels) : "—"}
        loading={loading}
      />
    </Col>
    <Col xs={24} sm={12} xl={6}>
      <StatTile
        label="Total Volume (MT)"
        value={summary ? count(summary.totalVolume) : "—"}
        loading={loading}
      />
    </Col>
  </Row>
);
