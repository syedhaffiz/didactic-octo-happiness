import { useMemo } from "react";
import { Card, Table } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { SegmentFilter } from "../../components/filters/SegmentFilter";
import { buildRevenueSegmentColumns } from "../../components/finance/revenueLedgerColumns";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useUrlDateRange, useUrlParam } from "../../utils/useUrlParam";
import type { RevenueSegmentRow } from "../../types/finance";

export const RevenueSegment = () => {
  const [segment, setSegment] = useUrlParam("segment");
  const [range, setRange] = useUrlDateRange();

  const { data, isLoading, isError, error, refetch } = useApi(
    ["revenue-segment", segment],
    () => financeApi.revenueSegment({ segment }),
  );

  const columns = useMemo(() => buildRevenueSegmentColumns(), []);

  return (
    <>
      <PageHeader
        title="Revenue"
        datePill="Apr 25 : Feb 26"
        filters={
          <>
            <SegmentFilter value={segment} onChange={setSegment} />
            <DateRangeFilter value={range} onChange={setRange} />
          </>
        }
      />

      {isError ? (
        <ErrorRetry title="Could not load segment ledger" error={error} onRetry={refetch} />
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <ErrorBoundary level="section" label="revenue segment ledger" resetKeys={[segment]}>
            <Table<RevenueSegmentRow>
              rowKey={(r, i) => `${r.segment}-${r.accountNumber}-${i}`}
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
