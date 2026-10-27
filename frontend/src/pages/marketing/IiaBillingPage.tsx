import { useMemo, useState } from "react";
import { Card, Table } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import type { FilterChip } from "../../components/FilterChips";
import { RefFilterChips } from "../../components/filters/RefFilterChips";
import { RefFilterDrawer } from "../../components/filters/RefFilterDrawer";
import { refName } from "../../components/filters/refFilterFields";
import { QUARTER_OPTIONS } from "../../components/filters/quarterOptions";
import { IiaBillingFilters } from "../../components/marketing/iiaBilling/IiaBillingFilters";
import { IiaBillingTabs } from "../../components/marketing/iiaBilling/IiaBillingTabs";
import { IiaBillingSummaryTiles } from "../../components/marketing/iiaBilling/IiaBillingSummaryTiles";
import { IiaPortVendorCard } from "../../components/marketing/iiaBilling/IiaPortVendorCard";
import { buildIiaBillingColumns } from "../../components/marketing/iiaBilling/iiaBillingColumns";
import { marketingApi } from "../../api/marketing";
import { useApi } from "../../api/useApi";
import { useBrandTokens } from "../../theme/useBrandTokens";
import {
  IIA_DRAWER_FIELDS,
  useIiaBillingFilters,
  useIiaPortType,
} from "../../utils/useIiaBillingFilters";
import type { IiaBillingRow } from "../../types/marketing";

const PAGE_SIZE = 20;

export const IiaBillingPage = () => {
  const t = useBrandTokens();
  const filters = useIiaBillingFilters();
  const [portType] = useIiaPortType();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: options,
    isLoading: optionsLoading,
    error: optionsError,
    refetch: refetchOptions,
  } = useApi(["marketing", "iia-billing", "filter-options"], marketingApi.iiaBillingFilterOptions, {
    cache: true,
  });

  const params = filters.params;
  const { data, isLoading, isError, error, refetch } = useApi(
    ["marketing", "iia-billing", portType, params],
    () => marketingApi.iiaBilling(portType, params),
  );

  // The table only ever sees a list of well-formed rows.
  const items = useMemo<IiaBillingRow[]>(
    () => (Array.isArray(data?.items) ? data.items.filter((r) => r?.id != null) : []),
    [data],
  );
  const columns = useMemo(() => buildIiaBillingColumns(portType), [portType]);

  // Top-bar chips (Fiscal Year, Quarter, Date Range) lead the side-panel ones.
  const leadingChips: FilterChip[] = [
    ...filters.multi.fiscalYears.map((id) => ({
      key: `fiscalYears:${id}`,
      label: "Fiscal Year",
      value: refName(options?.fiscalYears, id),
      onClose: () =>
        filters.setMulti(
          "fiscalYears",
          filters.multi.fiscalYears.filter((v) => v !== id),
        ),
    })),
    ...filters.multi.quarters.map((q) => ({
      key: `quarters:${q}`,
      label: "Quarter",
      value: QUARTER_OPTIONS.find((o) => o.value === q)?.label ?? q,
      onClose: () =>
        filters.setMulti(
          "quarters",
          filters.multi.quarters.filter((v) => v !== q),
        ),
    })),
  ];
  // The YTD default is implied, so only a picked range gets a chip; closing it
  // returns to YTD.
  if (filters.isCustomRange && filters.dateRange) {
    const [from, to] = filters.dateRange;
    leadingChips.push({
      key: "dateRange",
      label: "Date Range",
      value: `${from.format("DD MMM YY")} – ${to.format("DD MMM YY")}`,
      onClose: () => filters.setDateRange(null),
    });
  }

  // Any filter / tab change clears a crashed section.
  const resetKeys = [portType, params];

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
          title="IIA Billing"
          filters={
            <IiaBillingFilters
              filters={filters}
              fiscalYearOptions={options?.fiscalYears}
              onOpenFilters={() => setDrawerOpen(true)}
            />
          }
        />
        <RefFilterChips
          fields={IIA_DRAWER_FIELDS}
          options={options}
          values={filters.multi}
          onChange={filters.setMulti}
          onClearAll={filters.clearAll}
          leadingChips={leadingChips}
        />
      </div>

      <IiaBillingTabs />

      {isError ? (
        <ErrorRetry title="Could not load IIA billing" error={error} onRetry={refetch} />
      ) : (
        <>
          <ErrorBoundary level="section" label="IIA billing summary" resetKeys={resetKeys}>
            <IiaBillingSummaryTiles data={data} loading={isLoading} />
          </ErrorBoundary>

          <ErrorBoundary level="section" label="IIA billing by port & vendor" resetKeys={resetKeys}>
            <IiaPortVendorCard rows={data?.portVendor} loading={isLoading} />
          </ErrorBoundary>

          <Card styles={{ body: { padding: 0 } }}>
            <ErrorBoundary level="section" label="IIA billing table" resetKeys={resetKeys}>
              {/* Keyed by tab so sort + page reset when switching sides. */}
              <Table<IiaBillingRow>
                key={portType}
                rowKey="id"
                size="middle"
                columns={columns}
                dataSource={items}
                loading={isLoading}
                scroll={{ x: "max-content" }}
                pagination={{
                  pageSize: PAGE_SIZE,
                  showSizeChanger: false,
                  showTotal: (total, r) => `Showing ${r[0]}-${r[1]} of ${total} results`,
                }}
              />
            </ErrorBoundary>
          </Card>
        </>
      )}

      <RefFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        fields={IIA_DRAWER_FIELDS}
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
