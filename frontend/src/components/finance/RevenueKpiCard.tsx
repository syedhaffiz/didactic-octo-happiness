import { Card, Tooltip } from "antd";
import { useState } from "react";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { formatInr, toCrLakh } from "../../utils/format";
import { brand } from "../../theme/tokens";

interface Props {
  segment: string;
  /** Whole-number rupee amount; formatted here as Cr or L. */
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
  const { num, unit } = toCrLakh(value);

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
      <Tooltip title={formatInr(value)}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: valueColor }}>{num}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: valueColor }}>{unit}</span>
        </div>
      </Tooltip>
      <div style={{ marginTop: 6, color: labelColor, fontSize: 14 }}>{segment}</div>
    </Card>
  );
};
