import { useMemo } from "react";
import { Card } from "antd";
import { useParams } from "react-router-dom";
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
  HandlingBatchDetailRow,
  SalesBatchDetailRow,
} from "../../types/finance";

interface Props {
  mode: "sales" | "handling";
}

const VESSELS_PATH = "/finance/overview/profitability/vessels";

// Breadcrumb ancestors of a batch-detail page. The Sales/Handling level is a
// tab on the Vessel Profitability page (not its own route), so it links back
// there with the matching ?tab — the path segments themselves aren't routable.
const crumbsFor = (mode: "sales" | "handling") => [
  { label: "Gross Margin Profitability", to: "/finance/overview/profitability" },
  { label: "Vessel Profitability", to: `${VESSELS_PATH}?tab=${mode}` },
  { label: mode === "sales" ? "Sales" : "Handling", to: `${VESSELS_PATH}?tab=${mode}` },
];

// Single batch-detail page, parameterised by mode. The Sales and Handling
// routes each mount this with their respective mode — no in-page tab.
export const BatchDetail = ({ mode }: Props) => {
  const params = useParams<{ batchId: string }>();
  const batchId = decodeURIComponent(params.batchId ?? "");

  if (mode === "sales") return <SalesView batchId={batchId} />;
  return <HandlingView batchId={batchId} />;
};

const SalesView = ({ batchId }: { batchId: string }) => {
  const q = useApi(
    ["finance", "sales-batch-detail", batchId],
    () => financeApi.salesBatchDetail(batchId),
  );
  const rows = q.data?.items ?? [];
  const cols = useMemo(() => buildSalesBatchDetailColumns(rows), [rows]);
  return (
    <>
      <PageHeader title={`Batch ID - ${batchId}`} breadcrumb={crumbsFor("sales")} />
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
                key={batchId}
                rowKey={(r, i) => `${r.batchId}-${i}`}
                size="middle"
                columns={cols}
                dataSource={rows}
                loading={q.isLoading}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                scroll={{ x: "max-content" }}
              />
            </ErrorBoundary>
          </Card>
        </>
      )}
    </>
  );
};

const HandlingView = ({ batchId }: { batchId: string }) => {
  const q = useApi(
    ["finance", "handling-batch-detail", batchId],
    () => financeApi.handlingBatchDetail(batchId),
  );
  const rows = q.data?.items ?? [];
  const cols = useMemo(() => buildHandlingBatchDetailColumns(rows), [rows]);
  return (
    <>
      <PageHeader title={`Batch ID - ${batchId}`} breadcrumb={crumbsFor("handling")} />
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
                key={batchId}
                rowKey={(r, i) => `${r.batchId}-${i}`}
                size="middle"
                columns={cols}
                dataSource={rows}
                loading={q.isLoading}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                scroll={{ x: "max-content" }}
              />
            </ErrorBoundary>
          </Card>
        </>
      )}
    </>
  );
};
