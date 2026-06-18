import { useMemo } from "react";
import { Card, Table } from "antd";
import { useParams } from "react-router-dom";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
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
  const cols = useMemo(() => buildSalesBatchDetailColumns(), []);
  return (
    <>
      <PageHeader title={`Batch ID - ${batchId}`} />
      {q.isError ? (
        <ErrorRetry title="Could not load batch detail" error={q.error} onRetry={q.refetch} />
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <ErrorBoundary level="section" label="batch detail" resetKeys={[batchId]}>
            <Table<SalesBatchDetailRow>
              rowKey={(r, i) => `${r.batchId}-${i}`}
              size="middle"
              columns={cols}
              dataSource={q.data?.items ?? []}
              loading={q.isLoading}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              scroll={{ x: "max-content" }}
            />
          </ErrorBoundary>
        </Card>
      )}
    </>
  );
};

const HandlingView = ({ batchId }: { batchId: string }) => {
  const q = useApi(
    ["finance", "handling-batch-detail", batchId],
    () => financeApi.handlingBatchDetail(batchId),
  );
  const cols = useMemo(() => buildHandlingBatchDetailColumns(), []);
  return (
    <>
      <PageHeader title={`Batch ID - ${batchId}`} />
      {q.isError ? (
        <ErrorRetry title="Could not load batch detail" error={q.error} onRetry={q.refetch} />
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <ErrorBoundary level="section" label="batch detail" resetKeys={[batchId]}>
            <Table<HandlingBatchDetailRow>
              rowKey={(r, i) => `${r.batchId}-${i}`}
              size="middle"
              columns={cols}
              dataSource={q.data?.items ?? []}
              loading={q.isLoading}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              scroll={{ x: "max-content" }}
            />
          </ErrorBoundary>
        </Card>
      )}
    </>
  );
};
