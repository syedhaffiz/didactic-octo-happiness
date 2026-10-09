import type { ReactNode } from "react";
import { Card, Skeleton, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useBrandTokens } from "../theme/useBrandTokens";
import { brand } from "../theme/tokens";

interface Props {
  label: string;
  /** Formatted value — pass the display string, not the raw number. */
  value: ReactNode;
  /** Full-precision figure shown on hover. Omit for counts that need no expansion. */
  tooltip?: string;
  loading?: boolean;
  /** Small secondary line under the value, e.g. "Dated: 31-Aug-26". */
  caption?: ReactNode;
  /** Explanation shown from an info icon in the top-right corner. */
  info?: ReactNode;
}

// Compact metric tile: a gradient rule down the left edge, an uppercase label,
// and one large value. Used for the stat rows above the vessel and batch-detail
// tables.
export const StatTile = ({ label, value, tooltip, loading = false, caption, info }: Props) => {
  const t = useBrandTokens();

  const figure = (
    <div
      style={{
        fontSize: 26,
        fontWeight: 700,
        color: t.headline,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </div>
  );

  return (
    <Card
      style={{ height: "100%" }}
      styles={{ body: { padding: "14px 20px", position: "relative" } }}
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
        {label}
      </div>
      {info ? (
        <Tooltip title={info}>
          <InfoCircleOutlined
            style={{ position: "absolute", top: 14, right: 14, color: t.textMuted }}
          />
        </Tooltip>
      ) : null}
      {loading ? (
        <Skeleton.Input active style={{ width: 120, height: 30 }} />
      ) : tooltip ? (
        <Tooltip title={tooltip}>{figure}</Tooltip>
      ) : (
        figure
      )}
      {caption && !loading ? (
        <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 4 }}>{caption}</div>
      ) : null}
    </Card>
  );
};
