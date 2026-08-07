import { useState } from "react";
import { Col, Row } from "antd";
import {
  PieChartOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  LineChartOutlined,
  ShopOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { PageHeader } from "../../components/PageHeader";
import { MarketShareFilters } from "../../components/marketing/MarketShareFilters";
import { MarketShareFilterDrawer } from "../../components/marketing/MarketShareFilterDrawer";
import { AppliedFilterTags } from "../../components/marketing/AppliedFilterTags";
import { MarketShareSplitCard } from "../../components/marketing/MarketShareSplitCard";
import { PairedColumnCard } from "../../components/marketing/PairedColumnCard";
import { QuarterwiseImportCard } from "../../components/marketing/QuarterwiseImportCard";
import { marketingApi } from "../../api/marketing";
import { useApi } from "../../api/useApi";
import { marketingColors } from "../../theme/tokens";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { useMarketShareFilters } from "../../utils/useMarketShareFilters";

const C = marketingColors.marketShare;

export const MarketSharePage = () => {
  const t = useBrandTokens();
  const filters = useMarketShareFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: options } = useApi(
    ["marketing", "market-share", "filter-options"],
    marketingApi.marketShareFilterOptions,
    { cache: true },
  );

  const params = filters.params;
  const key = (card: string) => ["marketing", "market-share", card, params];

  return (
    <div>
      {/* Header + filters stick to the top while the page scrolls with the
          window (no nested scrollbar). The opaque background hides cards
          passing underneath; negative offsets cancel the Content padding so it
          spans edge-to-edge. */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: t.pageBg,
          margin: "-24px -24px 0",
          padding: "24px 24px 8px",
        }}
      >
        <PageHeader
          title="Market Share"
          filters={
            <MarketShareFilters
              filters={filters}
              fiscalYearOptions={options?.fiscalYears ?? []}
              onOpenFilters={() => setDrawerOpen(true)}
            />
          }
        />
        <AppliedFilterTags filters={filters} options={options} />
      </div>

      {/* The seven cards flow in normal document order and scroll with the
          window. */}
      <div style={{ paddingTop: 4 }}>
        <Row gutter={[16, 16]} align="stretch">
          <Col xs={24} lg={8}>
            <MarketShareSplitCard
              title="Market Share Split"
              icon={<PieChartOutlined />}
              queryKey={key("split")}
              fetcher={() => marketingApi.marketShareSplit(params)}
            />
          </Col>
          <Col xs={24} lg={8}>
            <PairedColumnCard
              title="Import Quantity (MMT)"
              icon={<BarChartOutlined />}
              colorPair={C.importQuantity}
              queryKey={key("import-quantity")}
              fetcher={() => marketingApi.marketShareImportQuantity(params)}
            />
          </Col>
          <Col xs={24} lg={8}>
            <PairedColumnCard
              title="Market Share by Category"
              icon={<AppstoreOutlined />}
              colorPair={C.byCategory}
              queryKey={key("by-category")}
              fetcher={() => marketingApi.marketShareByCategory(params)}
            />
          </Col>
          <Col xs={24}>
            <QuarterwiseImportCard
              title="Quarterwise Import"
              icon={<LineChartOutlined />}
              queryKey={key("quarterwise")}
              fetcher={() => marketingApi.marketShareQuarterwise(params)}
            />
          </Col>
          <Col xs={24} lg={12}>
            <PairedColumnCard
              title="Industry Wise Import"
              icon={<ShopOutlined />}
              colorPair={C.industrywise}
              queryKey={key("industrywise")}
              fetcher={() => marketingApi.marketShareIndustrywise(params)}
            />
          </Col>
          <Col xs={24} lg={12}>
            <PairedColumnCard
              title="Origin Wise Import"
              icon={<GlobalOutlined />}
              colorPair={C.originwise}
              queryKey={key("originwise")}
              fetcher={() => marketingApi.marketShareOriginwise(params)}
            />
          </Col>
          <Col xs={24}>
            <PairedColumnCard
              title="Port Wise"
              icon={<EnvironmentOutlined />}
              colorPair={C.portwise}
              queryKey={key("portwise")}
              fetcher={() => marketingApi.marketSharePortwise(params)}
              labelRotation={-45}
              height={420}
              showDataLabels={false}
            />
          </Col>
        </Row>
      </div>

      <MarketShareFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        options={options}
        filters={filters}
      />
    </div>
  );
};
