import { Card, Divider } from "antd";
import { useState } from "react";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { brand } from "../../theme/tokens";
import { DeltaStat } from "./DeltaStat";

interface Props {
  segment: string;
  /** Inventory days for this segment (whole number). */
  days: number;
  /** Signed percentage deltas shown beneath the value. */
  deltaVsBudget: number;
  deltaVsLastYear: number;
  /** Hex color of the matching donut slice — used as the hover background. */
  hoverColor: string;
}

// Segment KPI tile shown next to the donut on the Inventory Days screen. Mirrors
// the Revenue Segment Wise tile (hover flips the surface to the slice color with
// white text) but the headline is a plain "Days" figure, not a currency value.
export const InventoryDaysSegmentCard = ({
  segment,
  days,
  deltaVsBudget,
  deltaVsLastYear,
  hoverColor,
}: Props) => {
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
      <div style={{ color: labelColor, fontSize: 14, marginBottom: 6 }}>{segment}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: valueColor }}>{days}</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: valueColor }}>Days</span>
      </div>
      <Divider style={{ margin: 0 }} />
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        <DeltaStat value={deltaVsBudget} label="vs Budget" labelColor={labelColor} />
        <DeltaStat value={deltaVsLastYear} label="vs last year" labelColor={labelColor} />
      </div>
    </Card>
  );
};
