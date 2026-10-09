import { useMemo, useState } from "react";
import { Card, Table } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { IiaBillingFilters } from "../../components/marketing/iiaBilling/IiaBillingFilters";
import { IiaBillingFilterDrawer } from "../../components/marketing/iiaBilling/IiaBillingFilterDrawer";
import { IiaBillingFilterChips } from "../../components/marketing/iiaBilling/IiaBillingFilterChips";
import { IiaBillingTabs } from "../../components/marketing/iiaBilling/IiaBillingTabs";
import { IiaBillingSummaryTiles } from "../../components/marketing/iiaBilling/IiaBillingSummaryTiles";
import { buildIiaBillingColumns } from "../../components/marketing/iiaBilling/iiaBillingColumns";
import { marketingApi } from "../../api/marketing";
import { useApi } from "../../api/useApi";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { useIiaBillingFilters, useIiaPortType } from "../../utils/useIiaBillingFilters";
import type { IiaBillingRow } from "../../types/marketing";

const PAGE_SIZE = 20;

export const IiaBillingPage = () => {
  const t = useBrandTokens();
  const filters = useIiaBillingFilters();
  const [portType] = useIiaPortType();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: options } = useApi(
    ["marketing", "iia-billing", "filter-options"],
    marketingApi.iiaBillingFilterOptions,
    { cache: true },
  );

  const params = filters.params;
  const { data, isLoading, isError, error, refetch } = useApi(
    ["marketing", "iia-billing", portType, params],
    () => marketingApi.iiaBilling(portType, params),
  );

  const columns = useMemo(() => buildIiaBillingColumns(portType), [portType]);

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
              fiscalYearOptions={options?.fiscalYears ?? []}
              onOpenFilters={() => setDrawerOpen(true)}
            />
          }
        />
        <IiaBillingFilterChips filters={filters} options={options} />
      </div>

      <IiaBillingTabs />

      {isError ? (
        <ErrorRetry title="Could not load IIA billing" error={error} onRetry={refetch} />
      ) : (
        <>
          <ErrorBoundary level="section" label="IIA billing summary">
            <IiaBillingSummaryTiles data={data} loading={isLoading} />
          </ErrorBoundary>

          <Card styles={{ body: { padding: 0 } }}>
            <ErrorBoundary level="section" label="IIA billing table">
              {/* Keyed by tab so sort + page reset when switching sides. */}
              <Table<IiaBillingRow>
                key={portType}
                rowKey="id"
                size="middle"
                columns={columns}
                dataSource={data?.items ?? []}
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

      <IiaBillingFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        options={options}
        filters={filters}
      />
    </div>
  );
};
