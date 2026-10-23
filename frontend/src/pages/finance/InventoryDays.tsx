import { useMemo, useState } from "react";
import { Card, Col, Empty, Row, Skeleton } from "antd";
import { BarChartOutlined, PieChartOutlined } from "@ant-design/icons";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { CardTitle } from "../../components/CardTitle";
import { RevenueDonut } from "../../components/finance/RevenueDonut";
import { DeltaStat } from "../../components/finance/DeltaStat";
import { InventoryDaysSegmentCard } from "../../components/finance/InventoryDaysSegmentCard";
import { InventoryDaysPortChart } from "../../components/finance/InventoryDaysPortChart";
import { InventoryDaysFilters } from "../../components/finance/InventoryDaysFilters";
import { RefFilterDrawer } from "../../components/filters/RefFilterDrawer";
import { RefFilterChips } from "../../components/filters/RefFilterChips";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { donutColors } from "../../theme/tokens";
import { useBrandTokens } from "../../theme/useBrandTokens";
import {
  INVENTORY_DAYS_DRAWER_FIELDS,
  useInventoryDaysFilters,
} from "../../utils/useInventoryDaysFilters";

export const InventoryDays = () => {
  const t = useBrandTokens();
  const filters = useInventoryDaysFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: options,
    isLoading: optionsLoading,
    error: optionsError,
    refetch: refetchOptions,
  } = useApi(
    ["finance", "inventory-days", "filter-options"],
    financeApi.inventoryDaysFilterOptions,
    { cache: true },
  );

  const params = filters.params;
  const { data, isLoading, isError, error, refetch } = useApi(
    ["finance", "inventory-days", params],
    () => financeApi.inventoryDays(params),
  );

  const loading = isLoading || !data;
  // Guard against a malformed payload — the cards and donut only see an array.
  const segments = useMemo(
    () => (Array.isArray(data?.segments) ? data.segments.filter((s) => s != null) : []),
    [data],
  );

  // Slice/card colors are owned by the UI, not the API: assign from the shared
  // pool by the segment's position in the response (cycling if it ever exceeds
  // the pool) so cards and donut slices stay in lockstep.
  const colorBySegment = useMemo(() => {
    const out: Record<string, string> = {};
    segments.forEach((it, i) => {
      out[it.segment] = donutColors[i % donutColors.length];
    });
    return out;
  }, [segments]);

  // Export to Excel — placeholder only; not wired up yet.
  const handleExport = () => {};

  return (
    <div>
      {/* Header + applied filters stick to the top while the page scrolls. */}
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
          title="Inventory Days"
          datePill={data?.periodLabel}
          filters={
            <InventoryDaysFilters
              filters={filters}
              onOpenFilters={() => setDrawerOpen(true)}
              onExport={handleExport}
              onRefresh={refetch}
            />
          }
        />
        <RefFilterChips
          fields={INVENTORY_DAYS_DRAWER_FIELDS}
          options={options}
          values={filters.multi}
          onChange={filters.setMulti}
          onClearAll={filters.clearAll}
        />
      </div>

      {isError ? (
        <ErrorRetry title="Could not load inventory days" error={error} onRetry={refetch} />
      ) : (
        <>
          <Card
            title={<CardTitle icon={<PieChartOutlined />}>Segment Wise</CardTitle>}
            style={{ marginBottom: 16 }}
          >
            {/* Any filter change clears a crashed section. */}
            <ErrorBoundary
              level="section"
              label="inventory days segment wise"
              resetKeys={[params]}
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : segments.length === 0 ? (
                <Empty description="No segment data for these filters" />
              ) : (
                <Row gutter={[20, 20]} align="middle">
                  <Col xs={24} md={14}>
                    <Row gutter={[16, 16]}>
                      {segments.map((it) => (
                        <Col xs={12} key={it.segment}>
                          <InventoryDaysSegmentCard
                            segment={it.segment}
                            days={it.days}
                            deltaVsBudget={it.deltaVsBudget}
                            deltaVsLastYear={it.deltaVsLastYear}
                            hoverColor={colorBySegment[it.segment]}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Col>
                  <Col xs={24} md={10}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <RevenueDonut
                          items={segments}
                          colorBySegment={colorBySegment}
                          total={data.totalValue ?? 0}
                          currency="INR"
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <DeltaStat value={data.totalDeltaVsBudget ?? 0} label="vs Budget" />
                        <DeltaStat value={data.totalDeltaVsLastYear ?? 0} label="vs last year" />
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </ErrorBoundary>
          </Card>

          <Card title={<CardTitle icon={<BarChartOutlined />}>Port Wise</CardTitle>}>
            <ErrorBoundary level="section" label="inventory days port wise" resetKeys={[params]}>
              <InventoryDaysPortChart rows={data?.portwise} loading={loading} />
            </ErrorBoundary>
          </Card>
        </>
      )}

      <RefFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        fields={INVENTORY_DAYS_DRAWER_FIELDS}
        options={options}
        optionsLoading={optionsLoading}
        optionsError={optionsError}
        onRetryOptions={refetchOptions}
        values={filters.multi}
        onApply={filters.setMany}
      />
    </div>
  );
};
