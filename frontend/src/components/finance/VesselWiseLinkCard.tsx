import { Card } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { brand } from "../../theme/tokens";
import { useBrandTokens } from "../../theme/useBrandTokens";

interface Props {
  to: string;
}

// Decorative card on the Net Margin Profitability page that routes to the
// Vessel Profitability page. Whole card surface is clickable.
export const VesselWiseLinkCard = ({ to }: Props) => {
  const t = useBrandTokens();
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <Card
        hoverable
        styles={{ body: { paddingBlock: 36, textAlign: "center" } }}
        style={{ background: t.accentBg, height: "100%" }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: brand.headline,
            lineHeight: 1.35,
          }}
        >
          Vessel Wise
          <br />
          Profitability
        </div>
        <ExportOutlined
          style={{ color: brand.accent, fontSize: 22, marginTop: 8 }}
        />
      </Card>
    </Link>
  );
};
