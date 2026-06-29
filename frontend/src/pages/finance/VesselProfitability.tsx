import { useMemo } from "react";
import { Card, Table } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { MonthRangeFilter } from "../../components/MonthRangeFilter";
import { VesselTabsNav, useVesselTab } from "../../components/finance/VesselTabsNav";
import {
  buildVesselHandlingColumns,
  buildVesselSalesColumns,
} from "../../components/finance/vesselColumns";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useMonthRangeWithDefault } from "../../utils/useDateRangeWithDefault";
import type {
  VesselHandlingRow,
  VesselSalesRow,
} from "../../types/finance";

export const VesselProfitability = () => {
  const [tab] = useVesselTab();
  const { value, fromDate, toDate, setRange } = useMonthRangeWithDefault(6);

  const salesQ = useApi(["finance", "vessel-sales", fromDate, toDate], () =>
    financeApi.vesselSales({ fromDate, toDate }),
  );
  const handlingQ = useApi(["finance", "vessel-handling", fromDate, toDate], () =>
    financeApi.vesselHandling({ fromDate, toDate }),
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
      <PageHeader
        title="Vessel Profitability"
        filters={<MonthRangeFilter value={value} onChange={setRange} />}
      />

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
