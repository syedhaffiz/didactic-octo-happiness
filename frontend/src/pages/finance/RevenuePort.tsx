import { useMemo } from "react";
import { Card, Table } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { PortFilter } from "../../components/filters/PortFilter";
import { buildRevenuePortColumns } from "../../components/finance/revenueLedgerColumns";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useUrlDateRange, useUrlParam } from "../../utils/useUrlParam";
import type { RevenuePortRow } from "../../types/finance";

export const RevenuePort = () => {
  const [port, setPort] = useUrlParam("port");
  const [range, setRange] = useUrlDateRange();

  const { data, isLoading, isError, error, refetch } = useApi(
    ["revenue-port", port],
    () => financeApi.revenuePort({ port }),
  );

  const columns = useMemo(() => buildRevenuePortColumns(), []);

  return (
    <>
      <PageHeader
        title="Revenue"
        datePill="Apr 25 : Feb 26"
        filters={
          <>
            <PortFilter value={port} onChange={setPort} />
            <DateRangeFilter value={range} onChange={setRange} />
          </>
        }
      />

      {isError ? (
        <ErrorRetry title="Could not load port ledger" error={error} onRetry={refetch} />
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <ErrorBoundary level="section" label="revenue port ledger" resetKeys={[port]}>
            <Table<RevenuePortRow>
              rowKey={(r, i) => `${r.port}-${r.accountNumber}-${i}`}
              size="middle"
              columns={columns}
              dataSource={data?.items ?? []}
              loading={isLoading}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              scroll={{ x: "max-content" }}
            />
          </ErrorBoundary>
        </Card>
      )}
    </>
  );
};
