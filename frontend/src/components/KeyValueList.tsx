import type { ReactNode } from "react";
import { useBrandTokens } from "../theme/useBrandTokens";

export interface KeyValueItem {
  label: string;
  value: ReactNode;
}

interface Props {
  items: KeyValueItem[];
  /** Width of the label column (CSS length). */
  labelWidth?: number | string;
  /** Override the value color (defaults to the accent blue). */
  valueColor?: string;
}

// Two-column key/value list rendered as a CSS grid. Drop-in for any detail
// pane (modal, side-panel, etc.).
export const KeyValueList = ({ items, labelWidth = 140, valueColor }: Props) => {
  const t = useBrandTokens();
  const vc = valueColor ?? t.linkBlue;
  return (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: `${typeof labelWidth === "number" ? `${labelWidth}px` : labelWidth} 1fr`,
        rowGap: 8,
        columnGap: 16,
        margin: 0,
      }}
    >
      {items.map((it, i) => (
        <Row key={i} item={it} valueColor={vc} labelColor={t.text} />
      ))}
    </dl>
  );
};

const Row = ({
  item,
  valueColor,
  labelColor,
}: {
  item: KeyValueItem;
  valueColor: string;
  labelColor: string;
}) => (
  <>
    <dt style={{ color: labelColor, fontWeight: 500, fontSize: 13 }}>{item.label}</dt>
    <dd style={{ margin: 0, color: valueColor, fontSize: 13, fontWeight: 500 }}>
      {item.value}
    </dd>
  </>
);
