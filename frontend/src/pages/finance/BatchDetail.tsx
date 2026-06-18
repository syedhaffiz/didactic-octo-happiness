import { useMemo } from "react";
import { Card, Table } from "antd";
import { useParams } from "react-router-dom";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { VesselTabsNav, useVesselTab } from "../../components/finance/VesselTabsNav";
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

export const BatchDetail = () => {
  const params = useParams<{ batchId: string }>();
  const batchId = decodeURIComponent(params.batchId ?? "");
  const [tab] = useVesselTab();

  const salesQ = useApi(
    ["finance", "sales-batch-detail", batchId],
    () => financeApi.salesBatchDetail(batchId),
  );
  const handlingQ = useApi(
    ["finance", "handling-batch-detail", batchId],
    () => financeApi.handlingBatchDetail(batchId),
  );

  const salesCols = useMemo(() => buildSalesBatchDetailColumns(), []);
  const handlingCols = useMemo(() => buildHandlingBatchDetailColumns(), []);

  const isError = tab === "sales" ? salesQ.isError : handlingQ.isError;
  const error = tab === "sales" ? salesQ.error : handlingQ.error;
  const refetch = tab === "sales" ? salesQ.refetch : handlingQ.refetch;
  const isLoading = tab === "sales" ? salesQ.isLoading : handlingQ.isLoading;

  return (
    <>
      <PageHeader title={`Batch ID - ${batchId}`} />

      <VesselTabsNav />

      {isError ? (
        <ErrorRetry title="Could not load batch detail" error={error} onRetry={refetch} />
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <ErrorBoundary level="section" label="batch detail" resetKeys={[tab, batchId]}>
            {tab === "sales" ? (
              <Table<SalesBatchDetailRow>
                rowKey={(r, i) => `${r.batchId}-${i}`}
                size="middle"
                columns={salesCols}
                dataSource={salesQ.data?.items ?? []}
                loading={isLoading}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                scroll={{ x: "max-content" }}
              />
            ) : (
              <Table<HandlingBatchDetailRow>
                rowKey={(r, i) => `${r.batchId}-${i}`}
                size="middle"
                columns={handlingCols}
                dataSource={handlingQ.data?.items ?? []}
                loading={isLoading}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                scroll={{ x: "max-content" }}
              />
            )}
          </ErrorBoundary>
        </Card>
      )}
    </>
  );
};
