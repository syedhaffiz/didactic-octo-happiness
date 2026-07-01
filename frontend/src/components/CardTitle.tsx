import type { ReactNode } from "react";
import { useBrandTokens } from "../theme/useBrandTokens";

interface Props {
  /** Leading glyph, rendered in the accent color. */
  icon?: ReactNode;
  children: ReactNode;
}

// Card header title with an optional accent-colored leading icon. Replaces the
// `<span style={{ display:"inline-flex", alignItems:"center", gap:8 }}>…`
// snippet that was copy-pasted across chart cards.
export const CardTitle = ({ icon, children }: Props) => {
  const t = useBrandTokens();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {icon ? (
        <span style={{ color: t.accentText, display: "inline-flex", fontSize: 16 }}>{icon}</span>
      ) : null}
      {children}
    </span>
  );
};
