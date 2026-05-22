import { Breadcrumb, Space, Typography } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useBrandTokens } from "../theme/useBrandTokens";

const { Title } = Typography;

const labels: Record<string, string> = {
  finance: "Finance",
  overview: "Overview",
  revenue: "Revenue",
  "working-capital": "Working Capital",
  profitability: "Gross Margin Profitability",
  sales: "Sales",
  "approved-budget": "Approved Budget",
  dispatch: "Dispatch",
  "inventory-days": "Inventory Days",
  logistics: "Logistics",
  marketing: "Marketing",
  legal: "Legal",
  planning: "Planning",
  sourcing: "Sourcing",
  customs: "Customs",
  commercial: "Commercial",
};

const pretty = (seg: string) => labels[seg] ?? seg;

interface PageHeaderProps {
  title: string;
  /** Small pill rendered inline to the right of the title (e.g. a date range). */
  datePill?: string;
  filters?: ReactNode;
}

export const PageHeader = ({ title, datePill, filters }: PageHeaderProps) => {
  const t = useBrandTokens();
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  const items = [
    {
      title: (
        <Link to="/finance/overview">
          <HomeOutlined />
        </Link>
      ),
    },
    ...parts.slice(0, -1).map((seg, idx) => ({
      title: <Link to={`/${parts.slice(0, idx + 1).join("/")}`}>{pretty(seg)}</Link>,
    })),
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      <Breadcrumb items={items} style={{ marginBottom: 6, fontSize: 13 }} />
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <Title level={3} style={{ margin: 0 }}>
            {title}
          </Title>
          {datePill ? (
            <span
              style={{
                fontSize: 12,
                color: t.textSecondary,
                background: t.accentBg,
                borderRadius: 6,
                padding: "2px 8px",
                whiteSpace: "nowrap",
              }}
            >
              {datePill}
            </span>
          ) : null}
        </div>
        {filters ? <Space size="middle">{filters}</Space> : null}
      </div>
    </div>
  );
};
