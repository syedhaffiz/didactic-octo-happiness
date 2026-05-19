import { brand } from "../theme/tokens";

// Placeholder text mark until a licensed logo asset is added at /assets.
// Renders the product name only — no client brand string used in code.
export const Logo = ({ color = brand.white }: { color?: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      color,
      fontWeight: 700,
      letterSpacing: 0.2,
    }}
  >
    <span
      style={{
        display: "inline-block",
        width: 22,
        height: 22,
        borderRadius: 6,
        background: color === brand.white ? brand.white : brand.purple,
        opacity: 0.95,
      }}
    />
    <span style={{ fontSize: 14 }}>IRM Control Tower</span>
  </div>
);
