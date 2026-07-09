import { Card, Divider, Skeleton, Tooltip } from "antd";
import { AimOutlined } from "@ant-design/icons";
import { CardTitle } from "../CardTitle";
import { DeltaStat } from "./DeltaStat";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { formatMoney, toMoneyParts } from "../../utils/format";
import type { Currency, NetMarginProfitabilityResponse } from "../../types/finance";

interface Props {
  total?: NetMarginProfitabilityResponse["total"];
  loading: boolean;
  currency: Currency;
}

// "Total Profitability" headline card — currency-aware value with two delta
// lines (vs Budget, vs last year). The card body renders its final structure
// even while loading; only the numbers swap from Skeleton to text so the card
// doesn't shift.
export const TotalProfitabilityCard = ({ total, loading, currency }: Props) => {
  const t = useBrandTokens();
  const valueParts = total ? toMoneyParts(total.value, currency) : null;
  return (
    <Card
      title={<CardTitle icon={<AimOutlined />}>Total Profitability</CardTitle>}
      style={{ height: "100%" }}
      styles={{ body: { paddingBlock: 28 } }}
    >
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ minHeight: 56, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {loading || !total ? (
            <Skeleton.Input active style={{ width: 120, height: 40 }} />
          ) : (
            <Tooltip title={formatMoney(total.value, currency)}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, justifyContent: "center" }}>
                <span style={{ fontSize: 44, fontWeight: 800, color: t.headline, lineHeight: 1 }}>
                  {valueParts?.num}
                </span>
                <span style={{ fontSize: 18, fontWeight: 600, color: t.textSecondary }}>
                  {valueParts?.unit}
                </span>
              </div>
            </Tooltip>
          )}
        </div>
        <div style={{ fontSize: 14, color: t.textSecondary }}>Profitability</div>
        <Divider style={{ margin: "4px 0 0" }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            minHeight: 40,
          }}
        >
          {loading || !total ? (
            <>
              <Skeleton.Input active size="small" style={{ width: 110, height: 12 }} />
              <Skeleton.Input active size="small" style={{ width: 110, height: 12 }} />
            </>
          ) : (
            <>
              <DeltaStat value={total.deltaVsBudget} label="vs Budget" />
              <DeltaStat value={total.deltaVsLastYear} label="vs last year" />
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
