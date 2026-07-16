import { useMemo, useState } from "react";
import { Card } from "antd";
import type { FilterValue } from "antd/es/table/interface";
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

type Filters = Record<string, FilterValue | null>;

const isCurrency = (v: string | undefined): v is Currency => v === "INR" || v === "USD";

// First selected value of a column's filter, as the plain search term (or
// undefined when the column isn't filtered).
const term = (filters: Filters, key: string): string | undefined => {
  const v = filters[key]?.[0];
  return typeof v === "string" && v ? v : undefined;
};

// Handling column set per sub-tab. All / Sagarmala / CIF show the same columns
// today; each is declared separately so one can change without disturbing the
// others.
const handlingColumnsFor: Record<
  HandlingCategory,
  () => ReturnType<typeof buildHandlingAllColumns>
> = {
  all: buildHandlingAllColumns,
  sagarmala: buildHandlingSagarmalaColumns,
  tph: buildHandlingTphColumns,
  cif: buildHandlingCifColumns,
};

export const VesselProfitability = () => {
  const [tab] = useVesselTab();
  const [category] = useHandlingCategory();
  const { value, fromDate, toDate, setRange } = useMonthRangeWithDefault();
  const [rawCurrency, setRawCurrency] = useUrlParam("currency");
  const currency: Currency = isCurrency(rawCurrency) ? rawCurrency : "INR";

  // Search terms are owned here (one filter map per tab) and sent to the API,
  // which returns the matching rows. The tables run in FilterableTable's server
  // mode — they never filter locally.
  const [salesSearch, setSalesSearch] = useState<Filters>({});
  const [handlingSearch, setHandlingSearch] = useState<Filters>({});

  // TPH searches on Port; the other sub-tabs search on Customer. Gate the term
  // by category so a stale Customer term doesn't filter the TPH query.
  const handlingCustomer = category === "tph" ? undefined : term(handlingSearch, "customer");
  const handlingPort = category === "tph" ? term(handlingSearch, "port") : undefined;

  const salesQ = useApi(
    [
      "finance",
      "vessel-sales",
      fromDate,
      toDate,
      currency,
      term(salesSearch, "batchId"),
      term(salesSearch, "vessel"),
      term(salesSearch, "segment"),
    ],
    () =>
      financeApi.vesselSales({
        fromDate,
        toDate,
        currency,
        batchId: term(salesSearch, "batchId"),
        vessel: term(salesSearch, "vessel"),
        segment: term(salesSearch, "segment"),
      }),
  );
  const handlingQ = useApi(
    [
      "finance",
      "vessel-handling",
      category,
      fromDate,
      toDate,
      currency,
      term(handlingSearch, "batchId"),
      term(handlingSearch, "vessel"),
      handlingCustomer,
      handlingPort,
    ],
    () =>
      financeApi.vesselHandling({
        category,
        fromDate,
        toDate,
        currency,
        batchId: term(handlingSearch, "batchId"),
        vessel: term(handlingSearch, "vessel"),
        customer: handlingCustomer,
        port: handlingPort,
      }),
  );

  const salesRows = salesQ.data?.items ?? [];
  const handlingRows = handlingQ.data?.items ?? [];

  const salesColumns = useMemo(() => buildVesselSalesColumns(), []);
  const handlingColumns = useMemo(() => handlingColumnsFor[category](), [category]);

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
                  rowKey={(r, i) => `${r.batchId}-${i}`}
                  size="middle"
                  columns={salesColumns}
                  dataSource={salesRows}
                  loading={isLoading}
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  scroll={{ x: "max-content" }}
                  filteredValues={salesSearch}
                  onFilteredValuesChange={setSalesSearch}
                  total={salesQ.data?.total}
                />
              ) : (
                <FilterableTable<VesselHandlingRow>
                  key={`handling-${category}`}
                  rowKey={(r, i) => `${r.batchId}-${i}`}
                  size="middle"
                  columns={handlingColumns}
                  dataSource={handlingRows}
                  loading={isLoading}
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  scroll={{ x: "max-content" }}
                  filteredValues={handlingSearch}
                  onFilteredValuesChange={setHandlingSearch}
                  total={handlingQ.data?.total}
                />
              )}
            </ErrorBoundary>
          </Card>
        </>
      )}
    </>
  );
};
