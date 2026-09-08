import { Card, Skeleton } from "antd";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { brand } from "../../theme/tokens";
import { toMoneyParts } from "../../utils/format";
import type { Currency } from "../../types/finance";

interface Props {
  totalOutstanding: number;
  customerCount: number;
  currency: Currency;
  loading?: boolean;
}

// The headline banner above the Debtors table: the total outstanding (compact
// Cr / $M) beside a caption naming the customer count, with a brand accent bar
// down the left edge.
export const DebtorsSummaryBanner = ({
  totalOutstanding,
  customerCount,
  currency,
  loading = false,
}: Props) => {
  const t = useBrandTokens();
  const { num, unit } = toMoneyParts(totalOutstanding, currency);

  return (
    <Card styles={{ body: { padding: 0 } }} style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <div
          style={{
            width: 6,
            borderTopLeftRadius: 14,
            borderBottomLeftRadius: 14,
            background: brand.purple,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 14,
            padding: "18px 20px",
            flexWrap: "wrap",
          }}
        >
          {loading ? (
            <Skeleton.Input active size="large" style={{ width: 220 }} />
          ) : (
            <>
              <span style={{ fontSize: 30, fontWeight: 700, color: t.headline, lineHeight: 1 }}>
                {num}
                {unit ? <span style={{ fontSize: 20, marginLeft: 4 }}>{unit}</span> : null}
              </span>
              <span style={{ fontSize: 14, color: t.textSecondary }}>
                Total Outstanding Across {customerCount.toLocaleString()} customers
              </span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
