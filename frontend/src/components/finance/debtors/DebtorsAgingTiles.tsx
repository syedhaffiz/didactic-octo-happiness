import { Col, Row } from "antd";
import { StatTile } from "../../StatTile";
import { useBrandTokens } from "../../../theme/useBrandTokens";
import { formatMoney, toMoneyParts } from "../../../utils/format";
import type { Currency, DebtorsAgingBucket } from "../../../types/finance";

interface Props {
  buckets: DebtorsAgingBucket[];
  currency: Currency;
  loading?: boolean;
  /** Called with the aging bucket label when a tile is activated. */
  onSelect: (bucket: string) => void;
}

// The row of aging-bucket tiles at the top of the Debtors overview. Each tile
// reuses StatTile (label + value), colours the value red/navy by sign (matching
// the receivable tiles), and is clickable — drilling into the table filtered to
// that aging bucket.
export const DebtorsAgingTiles = ({ buckets, currency, loading = false, onSelect }: Props) => {
  const t = useBrandTokens();
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      {buckets.map((b) => {
        const { num, unit } = toMoneyParts(b.value, currency);
        const color = b.value < 0 ? t.receivableNegative : t.receivablePositive;
        return (
          <Col key={b.bucket} xs={12} sm={8} lg={6} xl={4} flex="1 1 0">
            <div
              role="button"
              tabIndex={0}
              onClick={() => onSelect(b.bucket)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(b.bucket);
                }
              }}
              style={{ cursor: "pointer", height: "100%" }}
            >
              <StatTile
                label={b.bucket}
                value={
                  <span style={{ color }}>
                    {num}
                    {unit ? <span style={{ fontSize: 15, marginLeft: 3 }}>{unit}</span> : null}
                  </span>
                }
                tooltip={formatMoney(b.value, currency)}
                loading={loading}
              />
            </div>
          </Col>
        );
      })}
    </Row>
  );
};
