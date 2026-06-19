import { useMemo } from "react";
import { Card, Table } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { VesselTabsNav, useVesselTab } from "../../components/finance/VesselTabsNav";
import {
  buildVesselHandlingColumns,
  buildVesselSalesColumns,
} from "../../components/finance/vesselColumns";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import type {
  VesselHandlingRow,
  VesselSalesRow,
} from "../../types/finance";

export const VesselProfitability = () => {
  const [tab] = useVesselTab();

  const salesQ = useApi(["finance", "vessel-sales"], () => financeApi.vesselSales());
  const handlingQ = useApi(["finance", "vessel-handling"], () =>
    financeApi.vesselHandling(),
  );

  const salesRows = salesQ.data?.items ?? [];
  const handlingRows = handlingQ.data?.items ?? [];

  // Column factories take the row set so the tree filters can offer the
  // unique values actually present in this dataset.
  const salesColumns = useMemo(() => buildVesselSalesColumns(salesRows), [salesRows]);
  const handlingColumns = useMemo(
    () => buildVesselHandlingColumns(handlingRows),
    [handlingRows],
  );

  const isError = tab === "sales" ? salesQ.isError : handlingQ.isError;
  const error = tab === "sales" ? salesQ.error : handlingQ.error;
  const refetch = tab === "sales" ? salesQ.refetch : handlingQ.refetch;
  const isLoading = tab === "sales" ? salesQ.isLoading : handlingQ.isLoading;

  return (
    <>
      <PageHeader title="Vessel Profitability" />

      <VesselTabsNav />

      {isError ? (
        <ErrorRetry title="Could not load vessels" error={error} onRetry={refetch} />
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <ErrorBoundary level="section" label="vessel table" resetKeys={[tab]}>
            {tab === "sales" ? (
              <Table<VesselSalesRow>
                rowKey={(r, i) => `${r.batchId}-${i}`}
                size="middle"
                columns={salesColumns}
                dataSource={salesRows}
                loading={isLoading}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                scroll={{ x: "max-content" }}
              />
            ) : (
              <Table<VesselHandlingRow>
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
      )}
    </>
  );
};
