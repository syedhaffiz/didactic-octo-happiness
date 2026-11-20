import { useMemo } from "react";
import { Card, Table } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { ContractsFilters } from "../../components/commercialOps/ContractsFilters";
import { PlotRentByPortCard } from "../../components/commercialOps/PlotRentByPortCard";
import { buildPlotRentColumns } from "../../components/commercialOps/plotRentColumns";
import { commercialOpsApi } from "../../api/commercialOps";
import { plotRentApi } from "../../api/plotRent";
import { useApi } from "../../api/useApi";
import { useContractsFilters } from "../../utils/useContractsFilters";
import { formatDateRangePill } from "../../utils/useDateRangeWithDefault";
import type { PlotRentEntry, PlotRentFilters } from "../../types/plotRent";

const PAGE_SIZE = 20;

// Commercial Ops → Plot Rent: the "Plot Rent by Port" chart over the plot-rent
// ledger table. Zone / Port / Date filters live in the URL (same hook as the
// Contracts screens) and drive both sections. The Zone / Port options come from
// the Contracts filters API — the same cached payload, no separate endpoint.
export const PlotRentPage = () => {
  const filters = useContractsFilters();

  // Plot Rent only understands zone / port / date — drop the Contracts-only keys.
  const params = useMemo<PlotRentFilters>(() => {
    const { zone, port, fromDate, toDate } = filters.params;
    return { zone, port, fromDate, toDate };
  }, [filters.params]);

  const filterOptions = useApi(
    ["commercial-ops", "contracts", "filters"],
    () => commercialOpsApi.contractsFilterOptions(),
    { cache: true },
  );

  const byPort = useApi(["commercial-ops", "plot-rent", "by-port", params], () =>
    plotRentApi.byPort(params),
  );
  const entries = useApi(["commercial-ops", "plot-rent", "entries", params], () =>
    plotRentApi.entries(params),
  );

  const rows = useMemo<PlotRentEntry[]>(
    () => (Array.isArray(entries.data?.items) ? entries.data.items.filter(Boolean) : []),
    [entries.data],
  );
  const columns = useMemo(() => buildPlotRentColumns(rows), [rows]);

  const pill = filters.dateValue
    ? formatDateRangePill(filters.dateValue[0], filters.dateValue[1])
    : undefined;

  return (
    <>
      <PageHeader
        title="Plot Rent"
        datePill={pill}
        filters={
          <ContractsFilters
            options={filterOptions.data}
            optionsLoading={filterOptions.isLoading}
            zone={filters.zone}
            port={filters.port}
            dateValue={filters.dateValue}
            onZoneChange={(v) => filters.setValue("zone", v)}
            onPortChange={(v) => filters.setValue("port", v)}
            onDateChange={filters.setDateRange}
          />
        }
      />

      {byPort.isError ? (
        <div style={{ marginBottom: 16 }}>
          <ErrorRetry
            title="Could not load plot rent by port"
            error={byPort.error}
            onRetry={byPort.refetch}
          />
        </div>
      ) : (
        <ErrorBoundary level="section" label="plot rent by port" resetKeys={[params]}>
          <PlotRentByPortCard items={byPort.data?.items} loading={byPort.isLoading} />
        </ErrorBoundary>
      )}

      {entries.isError ? (
        <ErrorRetry
          title="Could not load plot rent entries"
          error={entries.error}
          onRetry={entries.refetch}
        />
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <ErrorBoundary level="section" label="plot rent table" resetKeys={[params]}>
            <Table<PlotRentEntry>
              rowKey="id"
              size="middle"
              columns={columns}
              dataSource={rows}
              loading={entries.isLoading}
              scroll={{ x: "max-content" }}
              locale={{ emptyText: entries.isLoading ? " " : "No plot rent for these filters" }}
              pagination={{
                pageSize: PAGE_SIZE,
                showSizeChanger: false,
                showTotal: (total, r) => `Showing ${r[0]}-${r[1]} of ${total} entries`,
              }}
            />
          </ErrorBoundary>
        </Card>
      )}
    </>
  );
};
