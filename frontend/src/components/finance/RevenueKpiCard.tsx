import { Card, Divider, Tooltip } from "antd";
import { useState } from "react";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { formatMoney, toMoneyParts } from "../../utils/format";
import { brand } from "../../theme/tokens";
import { DeltaStat } from "./DeltaStat";
import type { Currency } from "../../types/finance";

interface Props {
  segment: string;
  /** Whole-number amount in the response currency's base unit. */
  value: number;
  /** Signed percentage deltas shown beneath the value. */
  deltaVsBudget: number;
  deltaVsLastYear: number;
  currency: Currency;
  /** Hex color of the matching donut slice — used as the hover background. */
  hoverColor: string;
}

// KPI tile shown next to the donut. On hover the entire surface flips to the
// matching slice color (with white text) — same affordance the Figma uses to
// link a card visually to its slice. Below the value: two delta lines
// (vs Budget, vs last year).
export const RevenueKpiCard = ({
  segment,
  value,
  deltaVsBudget,
  deltaVsLastYear,
  currency,
  hoverColor,
}: Props) => {
  const t = useBrandTokens();
  const [hover, setHover] = useState(false);

  const valueColor = hover ? brand.white : t.breakdownValue;
  const labelColor = hover ? brand.white : t.textSecondary;
  const { num, unit } = toMoneyParts(value, currency);

  return (
    <Card
      hoverable
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? hoverColor : t.cardBg,
        borderColor: hover ? hoverColor : t.border,
        transition: "background 160ms ease, border-color 160ms ease",
        cursor: "default",
      }}
      styles={{ body: { padding: "20px 22px" } }}
      data-segment={segment}
    >
      <div style={{ color: labelColor, fontSize: 14, marginBottom: 6 }}>{segment}</div>
      <Tooltip title={formatMoney(value, currency)}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: valueColor }}>{num}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: valueColor }}>{unit}</span>
        </div>
      </Tooltip>
      <Divider style={{margin: 0}} />
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        <DeltaStat value={deltaVsBudget} label="vs Budget" labelColor={labelColor} />
        <DeltaStat value={deltaVsLastYear} label="vs last year" labelColor={labelColor} />
      </div>
    </Card>
  );
};
