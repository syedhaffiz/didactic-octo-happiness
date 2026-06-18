import { Card, Skeleton } from "antd";
import { AimOutlined, ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { brand } from "../../theme/tokens";
import { formatSigned } from "../../utils/format";
import type { NetMarginProfitabilityResponse } from "../../types/finance";

interface Props {
  total?: NetMarginProfitabilityResponse["total"];
  loading: boolean;
}

// "Total Profitability" headline card — value + unit + trend % vs last year.
// Card body renders its final structure even while loading; only the numbers
// swap from Skeleton.Input to text so the card doesn't shift.
export const TotalProfitabilityCard = ({ total, loading }: Props) => {
  const t = useBrandTokens();
  const isUp = total?.trend === "up";
  const deltaColor = isUp ? t.deltaUp : t.deltaDown;
  return (
    <Card
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <AimOutlined style={{ color: t.accentText }} /> Total Profitability
        </span>
      }
      styles={{ body: { paddingBlock: 28 } }}
    >
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ minHeight: 56, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {loading || !total ? (
            <Skeleton.Input active style={{ width: 120, height: 40 }} />
          ) : (
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, justifyContent: "center" }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: t.headline, lineHeight: 1 }}>
                {total.value}
              </span>
              <span style={{ fontSize: 18, fontWeight: 600, color: t.textSecondary }}>
                {total.unit}
              </span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 14, color: t.textSecondary }}>Profitability</div>
        <div
          style={{
            marginTop: 6,
            paddingTop: 10,
            borderTop: `1px solid ${brand.border}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            minHeight: 18,
          }}
        >
          {loading || !total ? (
            <Skeleton.Input active size="small" style={{ width: 100, height: 12 }} />
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
                {formatSigned(total.deltaPct)}
              </span>
              <span style={{ color: t.textSecondary }}>vs last year</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
