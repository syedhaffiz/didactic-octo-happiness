import { Card, Col, Row, Skeleton, Tooltip } from "antd";
import { StatTile } from "../../StatTile";
import { useBrandTokens } from "../../../theme/useBrandTokens";
import { brand } from "../../../theme/tokens";
import { formatCrFixed, formatInr } from "../../../utils/format";
import type { InsuranceSegmentSummary } from "../../../types/finance";

interface Props {
  totalSumInsured: number | undefined;
  totalStockValue: number | undefined;
  segments: InsuranceSegmentSummary[] | undefined;
  loading?: boolean;
}

// Stock value caption under a sum-insured figure, with the full rupee amount on
// hover.
const StockCaption = ({ value }: { value: number }) => (
  <Tooltip title={formatInr(value)}>
    <span>Stock Value: ₹{formatCrFixed(value)}</span>
  </Tooltip>
);

// One segment column inside the grouped KPI card. The value turns red when any
// of the segment's policies is expiring soon.
const SegmentStat = ({ item, first }: { item: InsuranceSegmentSummary; first: boolean }) => {
  const t = useBrandTokens();
  return (
    <div
      style={{
        padding: "14px 24px",
        borderLeft: first ? undefined : `1px solid ${t.border}`,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: t.textSecondary,
          marginBottom: 4,
          whiteSpace: "nowrap",
        }}
      >
        {item.segment}
      </div>
      <Tooltip
        title={
          item.atRisk
            ? `${formatInr(item.sumInsured)} · has policies expiring soon`
            : formatInr(item.sumInsured)
        }
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            color: item.atRisk ? t.deltaDown : t.headline,
          }}
        >
          {formatCrFixed(item.sumInsured)}
        </div>
      </Tooltip>
      <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 4 }}>
        <StockCaption value={item.stockValue} />
      </div>
    </div>
  );
};

// KPI row above the Sankey: the overall Total Sum Insured tile beside one card
// splitting the total by segment.
export const InsuranceKpiStrip = ({
  totalSumInsured,
  totalStockValue,
  segments,
  loading = false,
}: Props) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
    <Col xs={24} lg={6}>
      <StatTile
        label="Total Sum Insured"
        loading={loading}
        value={totalSumInsured !== undefined ? formatCrFixed(totalSumInsured) : null}
        tooltip={totalSumInsured !== undefined ? formatInr(totalSumInsured) : undefined}
        caption={totalStockValue !== undefined ? <StockCaption value={totalStockValue} /> : null}
      />
    </Col>
    <Col xs={24} lg={18}>
      <Card
        style={{ height: "100%" }}
        styles={{ body: { padding: 0, position: "relative", height: "100%" } }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 12,
            bottom: 12,
            width: 4,
            borderRadius: "0 4px 4px 0",
            background: brand.gradient,
          }}
        />
        {loading || !segments ? (
          <div style={{ padding: "18px 24px" }}>
            <Skeleton active paragraph={false} title={{ width: "60%" }} />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              alignItems: "center",
              height: "100%",
            }}
          >
            {segments.map((it, i) => (
              <SegmentStat key={it.segment} item={it} first={i === 0} />
            ))}
          </div>
        )}
      </Card>
    </Col>
  </Row>
);
