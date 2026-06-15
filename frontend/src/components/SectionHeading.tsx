import type { CSSProperties, ReactNode } from "react";
import { useBrandTokens } from "../theme/useBrandTokens";

interface Props {
  children: ReactNode;
  /** Override the heading color (defaults to the headline navy). */
  color?: string;
  style?: CSSProperties;
}

// Small bold sub-heading used inside cards/modals (e.g. "Brief Facts",
// "Current Status"). Always renders as <h4>; visual style is the brand
// headline color.
export const SectionHeading = ({ children, color, style }: Props) => {
  const t = useBrandTokens();
  return (
    <h4
      style={{
        margin: 0,
        fontSize: 14,
        fontWeight: 700,
        color: color ?? t.headline,
        ...style,
      }}
    >
      {children}
    </h4>
  );
};
