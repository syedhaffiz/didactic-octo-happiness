import type { ReactNode } from "react";
import { Card, Divider } from "antd";
import { useBrandTokens } from "../theme/useBrandTokens";

export interface SummaryStat {
  value: ReactNode;
  label: string;
}

interface Props {
  icon: ReactNode;
  title: string;
  stats: SummaryStat[];
  /** Override the icon color (defaults to the headline navy). */
  iconColor?: string;
  /** Override the stat value color (defaults to the headline navy). */
  valueColor?: string;
}

// Reusable summary card: small icon + title on top, then N centred stat
// segments separated by vertical dividers. Used by the Legal page (two cards
// side by side) and reusable for any future module that needs the same shape.
export const SummaryCard = ({
  icon,
  title,
  stats,
  iconColor,
  valueColor,
}: Props) => {
  const t = useBrandTokens();
  const iconC = iconColor ?? t.headline;
  const valueC = valueColor ?? t.headline;
  return (
    <Card styles={{ body: { padding: "14px 24px" } }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: t.text,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        <span style={{ color: iconC, fontSize: 18, display: "inline-flex" }}>{icon}</span>
        <span style={{ fontSize: 15 }}>{title}</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-around",
          gap: 8,
        }}
      >
        {stats.map((s, i) => (
          <SegmentGroup key={i} stat={s} valueColor={valueC} muted={t.textSecondary}>
            {i < stats.length - 1 ? (
              <Divider type="vertical" style={{ height: 44, margin: 0 }} />
            ) : null}
          </SegmentGroup>
        ))}
      </div>
    </Card>
  );
};

const SegmentGroup = ({
  stat,
  valueColor,
  muted,
  children,
}: {
  stat: SummaryStat;
  valueColor: string;
  muted: string;
  children: ReactNode;
}) => (
  <>
    <div
      style={{
        flex: 1,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <span style={{ fontSize: 26, fontWeight: 700, color: valueColor, lineHeight: 1.1 }}>
        {stat.value}
      </span>
      <span style={{ fontSize: 12, color: muted }}>{stat.label}</span>
    </div>
    {children}
  </>
);
