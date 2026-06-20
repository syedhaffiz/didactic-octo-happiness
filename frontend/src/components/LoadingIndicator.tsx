import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import type { CSSProperties } from "react";
import { useBrandTokens } from "../theme/useBrandTokens";

// Custom indicator matching antd's "Custom indicator" Spin demo — a single
// rotating LoadingOutlined glyph, sized up to read clearly across cards.
export const loadingIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;

interface OverlayProps {
  show: boolean;
  /** Override default; useful for tighter footprints inside small cells. */
  iconSize?: number;
  zIndex?: number;
}

// Absolutely-positioned overlay used to drape the LoadingOutlined Spin on top
// of a chart container without reflowing it. The parent must establish a
// stacking context (e.g. position: relative).
export const LoadingOverlay = ({ show, iconSize, zIndex = 5 }: OverlayProps) => {
  const t = useBrandTokens();
  if (!show) return null;
  const indicator =
    iconSize === undefined ? (
      loadingIcon
    ) : (
      <LoadingOutlined style={{ fontSize: iconSize }} spin />
    );
  const style: CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: t.loadingOverlay,
    zIndex,
    pointerEvents: "none",
  };
  return (
    <div style={style}>
      <Spin indicator={indicator} />
    </div>
  );
};
