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
  /** When true, draws a thin horizontal divider under every row. */
  divided?: boolean;
}

// Two-column key/value list rendered as a CSS grid. Drop-in for any detail
// pane (modal, side-panel, etc.). With `divided`, each row gets a border-bottom
// matching the brand border colour — used by the Case Information panel.
export const KeyValueList = ({
  items,
  labelWidth = 140,
  valueColor,
  divided = false,
}: Props) => {
  const t = useBrandTokens();
  const vc = valueColor ?? t.linkBlue;
  return (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: `${typeof labelWidth === "number" ? `${labelWidth}px` : labelWidth} 1fr`,
        rowGap: 0,
        columnGap: 16,
        margin: 0,
      }}
    >
      {items.map((it, i) => (
        <Row
          key={i}
          item={it}
          valueColor={vc}
          labelColor={t.text}
          divider={divided ? t.border : null}
          isLast={i === items.length - 1}
        />
      ))}
    </dl>
  );
};

const Row = ({
  item,
  valueColor,
  labelColor,
  divider,
  isLast,
}: {
  item: KeyValueItem;
  valueColor: string;
  labelColor: string;
  divider: string | null;
  isLast: boolean;
}) => {
  // When dividing, the last row gets no bottom border so the list doesn't
  // hug a container edge with a double line.
  const border = divider && !isLast ? `1px solid ${divider}` : "none";
  const pad = divider ? "10px 0" : "4px 0 0";
  return (
    <>
      <dt
        style={{
          color: labelColor,
          fontWeight: 500,
          fontSize: 13,
          borderBottom: border,
          padding: pad,
        }}
      >
        {item.label}
      </dt>
      <dd
        style={{
          margin: 0,
          color: valueColor,
          fontSize: 13,
          fontWeight: 500,
          borderBottom: border,
          padding: pad,
        }}
      >
        {item.value}
      </dd>
    </>
  );
};
