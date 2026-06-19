import { Card, Tooltip } from "antd";
import { useState } from "react";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { formatRawWithCommas } from "../../utils/format";
import { brand } from "../../theme/tokens";

interface Props {
  segment: string;
  value: number;
  /** Hex color of the matching donut slice — used as the hover background. */
  hoverColor: string;
}

// KPI tile shown next to the donut. On hover the entire surface flips to the
// matching slice color (with white text) — same affordance the Figma uses to
// link a card visually to its slice.
export const RevenueKpiCard = ({ segment, value, hoverColor }: Props) => {
  const t = useBrandTokens();
  const [hover, setHover] = useState(false);

  const valueColor = hover ? brand.white : t.breakdownValue;
  const labelColor = hover ? brand.white : t.textSecondary;

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
      <Tooltip title={formatRawWithCommas(value, "Cr")}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: valueColor }}>{value}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: valueColor }}>Cr</span>
        </div>
      </Tooltip>
      <div style={{ marginTop: 6, color: labelColor, fontSize: 14 }}>{segment}</div>
    </Card>
  );
};
