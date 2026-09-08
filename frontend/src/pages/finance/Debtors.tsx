import { useMemo, useState } from "react";
import { Card, Table } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { FilterChips, type FilterChip } from "../../components/FilterChips";
import { DebtorsFilters } from "../../components/finance/DebtorsFilters";
import { DebtorsFilterDrawer } from "../../components/finance/DebtorsFilterDrawer";
import { DebtorsSummaryBanner } from "../../components/finance/DebtorsSummaryBanner";
import { buildDebtorsColumns } from "../../components/finance/debtorsColumns";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useBrandTokens } from "../../theme/useBrandTokens";
import {
  DEBTORS_DRAWER_FIELDS,
  useDebtorsFilters,
} from "../../utils/useDebtorsFilters";
import type { DebtorRow, DebtorTotals } from "../../types/finance";

const PAGE_SIZE = 20;

const fmtTotal = (value: number): string =>
  value.toLocaleString(undefined, { maximumFractionDigits: 2 });

export const Debtors = () => {
  const t = useBrandTokens();
  const filters = useDebtorsFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: options } = useApi(
    ["finance", "debtors", "filter-options"],
    financeApi.debtorsFilterOptions,
    { cache: true },
  );

  const params = filters.params;
  const { data, isLoading, isError, error, refetch } = useApi(
    ["finance", "debtors", params],
    () => financeApi.debtors(params),
  );

  const columns = useMemo(() => buildDebtorsColumns(), []);
  const rows = data?.items ?? [];

  // Flatten the active drawer filters (plus the as-of date) into removable chips.
  const chips: FilterChip[] = [];
  if (filters.tillDate) {
    chips.push({
      key: "tillDate",
      label: "Till Date",
      value: filters.tillDate.format("DD MMM YY"),
      onClose: () => filters.setTillDate(null),
    });
  }
  for (const { key, label } of DEBTORS_DRAWER_FIELDS) {
    const value = filters.values[key];
    if (value) {
      chips.push({ key, label, value, onClose: () => filters.setValue(key, undefined) });
    }
  }

  const totals: DebtorTotals | undefined = data?.totals;

  // Pinned "Total" row above the body — column-wise sums for the money columns.
  const renderSummary = () =>
    totals ? (
      <Table.Summary fixed="top">
        <Table.Summary.Row style={{ background: t.filterTagBg }}>
          <Table.Summary.Cell index={0} />
          <Table.Summary.Cell index={1}>
            <span style={{ fontWeight: 600 }}>Total</span>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={2} />
          <Table.Summary.Cell index={3} />
          <Table.Summary.Cell index={4} />
          <Table.Summary.Cell index={5} />
          <Table.Summary.Cell index={6} align="right">
            {fmtTotal(totals.balanceOutstanding)}
          </Table.Summary.Cell>
          <Table.Summary.Cell index={7} align="right">
            {fmtTotal(totals.notedLc)}
          </Table.Summary.Cell>
          <Table.Summary.Cell index={8} align="right">
            {fmtTotal(totals.lc)}
          </Table.Summary.Cell>
          <Table.Summary.Cell index={9} align="right">
            <span style={{ color: t.headline }}>{fmtTotal(totals.netReceivable)}</span>
          </Table.Summary.Cell>
        </Table.Summary.Row>
      </Table.Summary>
    ) : null;

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
          title="Debtors"
          datePill={data?.periodLabel}
          filters={
            <DebtorsFilters
              tillDate={filters.tillDate}
              currency={filters.currency}
              drawerActiveCount={filters.drawerActiveCount}
              onTillDateChange={filters.setTillDate}
              onCurrencyChange={filters.setCurrency}
              onOpenFilters={() => setDrawerOpen(true)}
              // Export to Excel — placeholder only; not wired up yet.
              onExport={() => {}}
              onRefresh={refetch}
            />
          }
        />
        <FilterChips chips={chips} onClearAll={filters.clearAll} />
      </div>

      {isError ? (
        <ErrorRetry title="Could not load debtors" error={error} onRetry={refetch} />
      ) : (
        <>
          <ErrorBoundary level="section" label="debtors summary">
            <DebtorsSummaryBanner
              totalOutstanding={data?.totalOutstanding ?? 0}
              customerCount={data?.customerCount ?? 0}
              currency={filters.currency}
              loading={isLoading || !data}
            />
          </ErrorBoundary>

          <Card styles={{ body: { padding: 0 } }}>
            <ErrorBoundary level="section" label="debtors table">
              <Table<DebtorRow>
                rowKey={(r, i) => `${r.customerNumber}-${i}`}
                size="middle"
                columns={columns}
                dataSource={rows}
                loading={isLoading}
                summary={renderSummary}
                scroll={{ x: "max-content", y: 1600 }}
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

      <DebtorsFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        options={options}
        filters={filters}
      />
    </div>
  );
};
