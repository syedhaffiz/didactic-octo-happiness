import { useMemo, useState } from "react";
import { Card } from "antd";
import { AimOutlined } from "@ant-design/icons";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { CardTitle } from "../../components/CardTitle";
import { AgingFilters } from "../../components/finance/aging/AgingFilters";
import { RefFilterDrawer } from "../../components/filters/RefFilterDrawer";
import { RefFilterChips } from "../../components/filters/RefFilterChips";
import { AgingMeasureSegmented } from "../../components/finance/aging/AgingMeasureSegmented";
import { AgingBucketChart } from "../../components/finance/aging/AgingBucketChart";
import { AgingOriginChart } from "../../components/finance/aging/AgingOriginChart";
import { normalizeAging } from "../../components/finance/aging/agingFormat";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { AGING_DRAWER_FIELDS, useAgingFilters } from "../../utils/useAgingFilters";

export const Aging = () => {
  const t = useBrandTokens();
  const filters = useAgingFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: options,
    isLoading: optionsLoading,
    error: optionsError,
    refetch: refetchOptions,
  } = useApi(["finance", "aging", "filter-options"], financeApi.agingFilterOptions, {
    cache: true,
  });

  // No default window — the Figma shows an empty Start / End picker, i.e. the
  // full reporting period. A picked range narrows the stock considered.
  const params = filters.params;
  const { data: raw, isLoading, isError, error, refetch } = useApi(
    ["finance", "aging", params],
    () => financeApi.aging(params),
  );

  // Charts only ever see a sanitised response (no missing arrays / NaNs).
  const data = useMemo(() => normalizeAging(raw), [raw]);

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
          title="Aging"
          filters={
            <AgingFilters
              filters={filters}
              onOpenFilters={() => setDrawerOpen(true)}
              onExport={handleExport}
              onRefresh={refetch}
            />
          }
        />
        <RefFilterChips
          fields={AGING_DRAWER_FIELDS}
          options={options}
          values={filters.multi}
          onChange={filters.setMulti}
          onClearAll={filters.clearAll}
          leadingChips={
            filters.dateRange
              ? [
                  {
                    key: "dateRange",
                    label: "Date Range",
                    value: `${filters.dateRange[0].format("DD MMM YY")} – ${filters.dateRange[1].format("DD MMM YY")}`,
                    onClose: () => filters.setDateRange(null),
                  },
                ]
              : []
          }
        />
      </div>

      <AgingMeasureSegmented value={filters.measure} onChange={filters.setMeasure} />

      {isError ? (
        <ErrorRetry title="Could not load aging" error={error} onRetry={refetch} />
      ) : (
        <>
          <Card
            title={<CardTitle icon={<AimOutlined />}>Aging</CardTitle>}
            style={{ marginBottom: 16 }}
          >
            {/* Any filter / measure change clears a crashed section. */}
            <ErrorBoundary level="section" label="aging buckets" resetKeys={[params]}>
              <AgingBucketChart data={data} loading={isLoading} />
            </ErrorBoundary>
          </Card>

          <Card title={<CardTitle icon={<AimOutlined />}>Origin Wise</CardTitle>}>
            <ErrorBoundary level="section" label="aging origin wise" resetKeys={[params]}>
              <AgingOriginChart data={data} loading={isLoading} />
            </ErrorBoundary>
          </Card>
        </>
      )}

      <RefFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        fields={AGING_DRAWER_FIELDS}
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
