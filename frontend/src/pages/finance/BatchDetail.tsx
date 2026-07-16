import { useMemo, useState } from "react";
import { Card } from "antd";
import { useParams, useSearchParams } from "react-router-dom";
import type { FilterValue } from "antd/es/table/interface";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { FilterableTable } from "../../components/FilterableTable";
import { PageHeader } from "../../components/PageHeader";
import { BatchSummaryCards } from "../../components/finance/BatchSummaryCards";
import {
  buildHandlingBatchDetailColumns,
  buildSalesBatchDetailColumns,
} from "../../components/finance/batchDetailColumns";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import type {
  BatchDetailSearch,
  HandlingBatchDetailRow,
  SalesBatchDetailRow,
} from "../../types/finance";

interface Props {
  mode: "sales" | "handling";
}

type Filters = Record<string, FilterValue | null>;

const VESSELS_PATH = "/finance/overview/profitability/vessels";

// First selected value of a column's filter, as the plain search term (or
// undefined when the column isn't filtered).
const term = (filters: Filters, key: string): string | undefined => {
  const v = filters[key]?.[0];
  return typeof v === "string" && v ? v : undefined;
};

// The four searchable columns → the API's search params.
const toSearch = (filters: Filters): BatchDetailSearch => ({
  batchId: term(filters, "batchId"),
  customerName: term(filters, "customerName"),
  plantName: term(filters, "plantName"),
  tradeContractNo: term(filters, "tradeContractNo"),
});

// Query string for the "back to list" links. Carries whatever filters the list
// page forwarded onto the detail URL (date range, handling category, currency)
// so returning restores them, with the tab forced to this batch's mode. Sales
// is the default tab, represented by the absence of ?tab (matches useVesselTab).
const backSearch = (mode: "sales" | "handling", current: URLSearchParams): string => {
  const out = new URLSearchParams(current);
  if (mode === "sales") out.delete("tab");
  else out.set("tab", mode);
  const s = out.toString();
  return s ? `?${s}` : "";
};

// Breadcrumb ancestors of a batch-detail page. The Sales/Handling level is a
// tab on the Vessel Profitability page (not its own route), so it links back
// there with the matching ?tab — the path segments themselves aren't routable.
const crumbsFor = (mode: "sales" | "handling", search: string) => [
  { label: "Gross Margin Profitability", to: "/finance/overview/profitability" },
  { label: "Vessel Profitability", to: `${VESSELS_PATH}${search}` },
  { label: mode === "sales" ? "Sales" : "Handling", to: `${VESSELS_PATH}${search}` },
];

// Single batch-detail page, parameterised by mode. The Sales and Handling
// routes each mount this with their respective mode — no in-page tab. Keyed by
// batchId so navigating to a different batch resets the search state.
export const BatchDetail = ({ mode }: Props) => {
  const params = useParams<{ batchId: string }>();
  const batchId = decodeURIComponent(params.batchId ?? "");

  if (mode === "sales") return <SalesView key={batchId} batchId={batchId} />;
  return <HandlingView key={batchId} batchId={batchId} />;
};

const SalesView = ({ batchId }: { batchId: string }) => {
  const [urlParams] = useSearchParams();
  // Search terms are owned here and sent to the API, which returns the matching
  // rows. The table runs in FilterableTable's server mode — no local filtering.
  const [search, setSearch] = useState<Filters>({});
  const q = useApi(
    ["finance", "sales-batch-detail", batchId, JSON.stringify(toSearch(search))],
    () => financeApi.salesBatchDetail(batchId, toSearch(search)),
  );
  const rows = q.data?.items ?? [];
  const cols = useMemo(() => buildSalesBatchDetailColumns(), []);
  return (
    <>
      <PageHeader
        title={`Batch ID - ${batchId}`}
        breadcrumb={crumbsFor("sales", backSearch("sales", urlParams))}
      />
      {q.isError ? (
        <ErrorRetry title="Could not load batch detail" error={q.error} onRetry={q.refetch} />
      ) : (
        <>
          <ErrorBoundary level="section" label="batch summary">
            <BatchSummaryCards summary={q.data?.summary} loading={q.isLoading} />
          </ErrorBoundary>

          <Card styles={{ body: { padding: 0 } }}>
            <ErrorBoundary level="section" label="batch detail" resetKeys={[batchId]}>
              <FilterableTable<SalesBatchDetailRow>
                rowKey={(r, i) => `${r.batchId}-${i}`}
                size="middle"
                columns={cols}
                dataSource={rows}
                loading={q.isLoading}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                scroll={{ x: "max-content" }}
                filteredValues={search}
                onFilteredValuesChange={setSearch}
                total={q.data?.total}
              />
            </ErrorBoundary>
          </Card>
        </>
      )}
    </>
  );
};

const HandlingView = ({ batchId }: { batchId: string }) => {
  const [urlParams] = useSearchParams();
  const [search, setSearch] = useState<Filters>({});
  const q = useApi(
    ["finance", "handling-batch-detail", batchId, JSON.stringify(toSearch(search))],
    () => financeApi.handlingBatchDetail(batchId, toSearch(search)),
  );
  const rows = q.data?.items ?? [];
  const cols = useMemo(() => buildHandlingBatchDetailColumns(), []);
  return (
    <>
      <PageHeader
        title={`Batch ID - ${batchId}`}
        breadcrumb={crumbsFor("handling", backSearch("handling", urlParams))}
      />
      {q.isError ? (
        <ErrorRetry title="Could not load batch detail" error={q.error} onRetry={q.refetch} />
      ) : (
        <>
          <ErrorBoundary level="section" label="batch summary">
            <BatchSummaryCards summary={q.data?.summary} loading={q.isLoading} />
          </ErrorBoundary>

          <Card styles={{ body: { padding: 0 } }}>
            <ErrorBoundary level="section" label="batch detail" resetKeys={[batchId]}>
              <FilterableTable<HandlingBatchDetailRow>
                rowKey={(r, i) => `${r.batchId}-${i}`}
                size="middle"
                columns={cols}
                dataSource={rows}
                loading={q.isLoading}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                scroll={{ x: "max-content" }}
                filteredValues={search}
                onFilteredValuesChange={setSearch}
                total={q.data?.total}
              />
            </ErrorBoundary>
          </Card>
        </>
      )}
    </>
  );
};
