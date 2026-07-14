import { useMemo } from "react";
import { Card } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { FilterableTable } from "../../components/FilterableTable";
import { PageHeader } from "../../components/PageHeader";
import { VesselFilters } from "../../components/finance/VesselFilters";
import { VesselSummaryCards } from "../../components/finance/VesselSummaryCards";
import { VesselTabsNav, useVesselTab } from "../../components/finance/VesselTabsNav";
import {
  HandlingCategoryTabs,
  useHandlingCategory,
} from "../../components/finance/HandlingCategoryTabs";
import {
  buildHandlingAllColumns,
  buildHandlingCifColumns,
  buildHandlingSagarmalaColumns,
  buildHandlingTphColumns,
  buildVesselSalesColumns,
} from "../../components/finance/vesselColumns";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useMonthRangeWithDefault } from "../../utils/useDateRangeWithDefault";
import { useUrlParam } from "../../utils/useUrlParam";
import type {
  Currency,
  HandlingCategory,
  VesselHandlingRow,
  VesselSalesRow,
} from "../../types/finance";

const isCurrency = (v: string | undefined): v is Currency => v === "INR" || v === "USD";

// Handling column sets, one per sub-tab. All / Sagarmala / CIF happen to show the
// same columns today; each is declared separately so one can change without
// disturbing the others.
const handlingColumnsFor: Record<
  HandlingCategory,
  (rows: readonly VesselHandlingRow[]) => ReturnType<typeof buildHandlingAllColumns>
> = {
  all: buildHandlingAllColumns,
  sagarmala: buildHandlingSagarmalaColumns,
  tph: buildHandlingTphColumns,
  cif: buildHandlingCifColumns,
};

export const VesselProfitability = () => {
  const [tab] = useVesselTab();
  const [category] = useHandlingCategory();
  const { value, fromDate, toDate, setRange } = useMonthRangeWithDefault(6);
  const [rawCurrency, setRawCurrency] = useUrlParam("currency");
  const currency: Currency = isCurrency(rawCurrency) ? rawCurrency : "INR";

  const salesQ = useApi(["finance", "vessel-sales", fromDate, toDate, currency], () =>
    financeApi.vesselSales({ fromDate, toDate, currency }),
  );
  const handlingQ = useApi(
    ["finance", "vessel-handling", category, fromDate, toDate, currency],
    () => financeApi.vesselHandling({ category, fromDate, toDate, currency }),
  );

  const salesRows = salesQ.data?.items ?? [];
  const handlingRows = handlingQ.data?.items ?? [];

  // Column factories take the row set so the tree filters can offer the
  // unique values actually present in this dataset.
  const salesColumns = useMemo(() => buildVesselSalesColumns(salesRows), [salesRows]);
  const handlingColumns = useMemo(
    () => handlingColumnsFor[category](handlingRows),
    [category, handlingRows],
  );

  const isSales = tab === "sales";
  const { isError, error, refetch, isLoading, data } = isSales ? salesQ : handlingQ;

  return (
    <>
      <PageHeader
        title="Vessel wise Profitability"
        filters={
          <VesselFilters
            monthValue={value}
            currency={currency}
            onMonthChange={setRange}
            onCurrencyChange={(c) => setRawCurrency(c === "INR" ? undefined : c)}
            // Export to Excel — placeholder only; not wired up yet.
            onExport={() => {}}
            onRefresh={refetch}
          />
        }
      />

      <VesselTabsNav />
      {isSales ? null : <HandlingCategoryTabs />}

      {isError ? (
        <ErrorRetry title="Could not load vessels" error={error} onRetry={refetch} />
      ) : (
        <>
          <ErrorBoundary level="section" label="vessel summary">
            <VesselSummaryCards
              summary={data?.summary}
              currency={currency}
              loading={isLoading}
            />
          </ErrorBoundary>

          <Card styles={{ body: { padding: 0 } }}>
            <ErrorBoundary level="section" label="vessel table" resetKeys={[tab, category]}>
              {isSales ? (
                <FilterableTable<VesselSalesRow>
                  key="sales"
                  rowKey={(r, i) => `${r.batchId}-${i}`}
                  size="middle"
                  columns={salesColumns}
                  dataSource={salesRows}
                  loading={isLoading}
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  scroll={{ x: "max-content" }}
                />
              ) : (
                // Keyed by category so switching sub-tab starts with clean filters.
                <FilterableTable<VesselHandlingRow>
                  key={`handling-${category}`}
                  rowKey={(r, i) => `${r.batchId}-${i}`}
                  size="middle"
                  columns={handlingColumns}
                  dataSource={handlingRows}
                  loading={isLoading}
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  scroll={{ x: "max-content" }}
                />
              )}
            </ErrorBoundary>
          </Card>
        </>
      )}
    </>
  );
};
