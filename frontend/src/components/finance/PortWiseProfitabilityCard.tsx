import { Card, Segmented } from "antd";
import { AimOutlined } from "@ant-design/icons";
import { HorizontalBarChart } from "../HorizontalBarChart";
import { brand } from "../../theme/tokens";
import { useBrandTokens } from "../../theme/useBrandTokens";
import type { Currency, NetMarginProfitabilityResponse } from "../../types/finance";

interface Props {
  data?: NetMarginProfitabilityResponse["portwise"];
  loading: boolean;
  currency: Currency;
  onCurrencyChange: (next: Currency) => void;
}

// "Port Wise Profitability" card on the Net Margin page. INR/USD toggle in the
// top-right. The bars are deep navy per the Figma.
export const PortWiseProfitabilityCard = ({
  data,
  loading,
  currency,
  onCurrencyChange,
}: Props) => {
  const t = useBrandTokens();
  return (
    <Card
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <AimOutlined style={{ color: t.accentText }} /> Port Wise Profitability
        </span>
      }
      extra={
        <Segmented<Currency>
          size="small"
          value={currency}
          onChange={onCurrencyChange}
          options={[
            { label: "INR", value: "INR" },
            { label: "USD", value: "USD" },
          ]}
        />
      }
    >
      <HorizontalBarChart
        rows={data?.rows.map((r) => ({ category: r.port, value: r.value }))}
        color={brand.headline}
        unit={currency === "INR" ? "Cr" : "M"}
        loading={loading}
      />
    </Card>
  );
};
