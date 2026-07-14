import { Col, Row } from "antd";
import { StatTile } from "../StatTile";
import { formatCrLakh, formatInr } from "../../utils/format";
import type { BatchSummary } from "../../types/finance";

interface Props {
  summary?: BatchSummary;
  loading?: boolean;
}

// The six stat tiles above a Batch ID detail table. Every figure but the volume
// is a rupee amount, shown compact (Cr / L) with the exact value on hover.
export const BatchSummaryCards = ({ summary, loading = false }: Props) => {
  const tiles: { label: string; value: string; tooltip?: string }[] = [
    {
      label: "Total Volume (MT)",
      value: summary ? summary.totalVolume.toLocaleString() : "—",
    },
    ...(
      [
        ["Profit", summary?.profit],
        ["Road Freight", summary?.roadFreight],
        ["Railway Freight", summary?.railwayFreight],
        ["Demurrage", summary?.demurrage],
        ["Penalty", summary?.penalty],
      ] as const
    ).map(([label, amount]) => ({
      label,
      value: amount === undefined ? "—" : formatCrLakh(amount),
      tooltip: amount === undefined ? undefined : formatInr(amount),
    })),
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      {tiles.map((tile) => (
        <Col key={tile.label} xs={24} sm={12} md={8} xl={4}>
          <StatTile
            label={tile.label}
            value={tile.value}
            tooltip={tile.tooltip}
            loading={loading}
          />
        </Col>
      ))}
    </Row>
  );
};
