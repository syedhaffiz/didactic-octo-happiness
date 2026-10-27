import { useMemo, useState } from "react";
import { Card } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { RefFilterChips } from "../../components/filters/RefFilterChips";
import { RefFilterDrawer } from "../../components/filters/RefFilterDrawer";
import { QUARTER_OPTIONS } from "../../components/filters/quarterOptions";
import type { FilterChip } from "../../components/FilterChips";
import { QualityFilters } from "../../components/marketing/quality/QualityFilters";
import { QualityKpiTiles } from "../../components/marketing/quality/QualityKpiTiles";
import { QualityTabs } from "../../components/marketing/quality/QualityTabs";
import { QualityVarianceChart } from "../../components/marketing/quality/QualityVarianceChart";
import { normalizeQuality } from "../../components/marketing/quality/qualityFormat";
import { marketingApi } from "../../api/marketing";
import { useApi } from "../../api/useApi";
import { useBrandTokens } from "../../theme/useBrandTokens";
import {
  QUALITY_TAB_OPTIONS,
  useQualityFilters,
  useQualityTradeType,
} from "../../utils/useQualityFilters";

export const QualityPage = () => {
  const t = useBrandTokens();
  const [tradeType] = useQualityTradeType();
  const filters = useQualityFilters(tradeType);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: options,
    isLoading: optionsLoading,
    error: optionsError,
    refetch: refetchOptions,
  } = useApi(["marketing", "quality", "filter-options"], marketingApi.qualityFilterOptions, {
    cache: true,
  });

  // The date range always applies (fiscal YTD unless picked); Quarter narrows
  // within it.
  const params = filters.params;
  const {
    data: raw,
    isLoading,
    isError,
    error,
    refetch,
  } = useApi(["marketing", "quality", tradeType, params], () =>
    marketingApi.quality(tradeType, params),
  );

  // Tiles and chart only ever see a sanitised response (no missing arrays / NaNs).
  const data = useMemo(() => normalizeQuality(raw), [raw]);

  const tabLabel = QUALITY_TAB_OPTIONS.find((o) => o.key === tradeType)?.label ?? "";

  // Top-bar chips (Quarter, Date Range) lead the side-panel ones.
  const leadingChips: FilterChip[] = filters.multi.quarters.map((q) => ({
    key: `quarters:${q}`,
    label: "Quarter",
    value: QUARTER_OPTIONS.find((o) => o.value === q)?.label ?? q,
    onClose: () =>
      filters.setMulti(
        "quarters",
        filters.multi.quarters.filter((v) => v !== q),
      ),
  }));
  // The YTD default is implied, so only a picked range gets a chip; closing it
  // returns to YTD.
  if (filters.isCustomRange) {
    const [from, to] = filters.dateRange;
    leadingChips.push({
      key: "dateRange",
      label: "Date Range",
      value: `${from.format("DD MMM YY")} – ${to.format("DD MMM YY")}`,
      onClose: () => filters.setDateRange(null),
    });
  }

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
          title="Quality"
          filters={<QualityFilters filters={filters} onOpenFilters={() => setDrawerOpen(true)} />}
        />
        <RefFilterChips
          fields={filters.drawerFields}
          options={options}
          values={filters.multi}
          onChange={filters.setMulti}
          onClearAll={filters.clearAll}
          leadingChips={leadingChips}
        />
      </div>

      <QualityTabs />

      {isError ? (
        <ErrorRetry title="Could not load quality" error={error} onRetry={refetch} />
      ) : (
        <>
          <ErrorBoundary level="section" label="quality summary" resetKeys={[tradeType, params]}>
            <QualityKpiTiles data={data} loading={isLoading} />
          </ErrorBoundary>

          <Card title={tabLabel}>
            {/* Any filter / tab change clears a crashed section. */}
            <ErrorBoundary level="section" label="quality variance" resetKeys={[tradeType, params]}>
              <QualityVarianceChart data={data} loading={isLoading} />
            </ErrorBoundary>
          </Card>
        </>
      )}

      <RefFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        fields={filters.drawerFields}
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
