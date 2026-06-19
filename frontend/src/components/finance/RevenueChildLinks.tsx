import { Link } from "react-router-dom";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { brand } from "../../theme/tokens";

// Two wide pill-buttons below the Revenue Breakdown card linking to the
// Port and Segment ledger drilldowns.
export const RevenueChildLinks = () => {
  const t = useBrandTokens();
  const pillStyle: React.CSSProperties = {
    flex: 1,
    background: brand.panelBlue,
    color: t.text,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    padding: "14px 20px",
    textAlign: "center",
    fontWeight: 600,
    fontSize: 14,
    textDecoration: "none",
    transition: "background 160ms ease, color 160ms ease",
  };

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <Link
        to="/finance/overview/revenue/port"
        style={pillStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = brand.accent;
          e.currentTarget.style.color = brand.white;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = brand.panelBlue;
          e.currentTarget.style.color = t.text;
        }}
      >
        Port
      </Link>
      <Link
        to="/finance/overview/revenue/segment"
        style={pillStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = brand.accent;
          e.currentTarget.style.color = brand.white;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = brand.panelBlue;
          e.currentTarget.style.color = t.text;
        }}
      >
        Segment
      </Link>
    </div>
  );
};
