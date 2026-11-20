import { useMemo } from "react";
import { Card, message, Table } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { FilterChips, type FilterChip } from "../../components/FilterChips";
import { ContractsFilters } from "../../components/commercialOps/ContractsFilters";
import { buildContractColumns } from "../../components/commercialOps/contractColumns";
import { commercialOpsApi } from "../../api/commercialOps";
import { useApi } from "../../api/useApi";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { useContractsFilters } from "../../utils/useContractsFilters";
import { formatDateRangePill } from "../../utils/useDateRangeWithDefault";
import type { ContractRow } from "../../types/commercialOps";

const PAGE_SIZE = 20;

// The details table sits under /commercial-ops/contracts/details, so the
// breadcrumb back to the overview is given explicitly.
const BREADCRUMB = [
  { label: "Commercial OPS", to: "/commercial-ops/contracts" },
  { label: "Contracts", to: "/commercial-ops/contracts" },
];

// Commercial Ops → Contract Details: the contract book as a table, reached from
// the overview's donut total / tiles. Filters arrive on the URL from the
// overview and show as removable chips; the header keeps just the Date Range,
// as in the Figma.
export const ContractDetails = () => {
  const t = useBrandTokens();
  const filters = useContractsFilters();
  const params = filters.params;

  const { data, isLoading, isError, error, refetch } = useApi(
    ["commercial-ops", "contracts", "details", params],
    () => commercialOpsApi.contracts(params),
  );

  // Chip labels (zone / port / segment ids → names) reuse the overview's
  // cached filter-options payload — no extra request when arriving from there.
  const { data: refs } = useApi(
    ["commercial-ops", "contracts", "filters"],
    () => commercialOpsApi.contractsFilterOptions(),
    { cache: true },
  );

  const rows = useMemo<ContractRow[]>(
    () => (Array.isArray(data?.items) ? data.items.filter(Boolean) : []),
    [data],
  );
  const columns = useMemo(() => buildContractColumns(rows), [rows]);

  // The overview breadcrumb link keeps the dimension filters but drops the
  // drill-only ones (status / EMD), which the overview doesn't use.
  const breadcrumb = useMemo(() => {
    const sp = new URLSearchParams(filters.search);
    sp.delete("status");
    sp.delete("emd");
    const qs = sp.toString();
    const to = `/commercial-ops/contracts${qs ? `?${qs}` : ""}`;
    return BREADCRUMB.map((c) => ({ ...c, to }));
  }, [filters.search]);

  const nameOf = (list: { id: string; name: string }[] | undefined, id: string) =>
    list?.find((x) => x.id === id)?.name ?? id;

  const chips: FilterChip[] = [];
  if (filters.zone) {
    chips.push({
      key: "zone",
      label: "Zone",
      value: nameOf(refs?.zones, filters.zone),
      onClose: () => filters.setValue("zone", undefined),
    });
  }
  if (filters.port) {
    chips.push({
      key: "port",
      label: "Port",
      value: nameOf(refs?.ports, filters.port),
      onClose: () => filters.setValue("port", undefined),
    });
  }
  if (filters.segment) {
    chips.push({
      key: "segment",
      label: "Segment",
      value: nameOf(refs?.segments, filters.segment),
      onClose: () => filters.setValue("segment", undefined),
    });
  }
  if (filters.status) {
    chips.push({
      key: "status",
      label: "Status",
      value: filters.status,
      onClose: () => filters.setValue("status", undefined),
    });
  }
  if (filters.emd) {
    chips.push({
      key: "emd",
      label: "EMD",
      value: "Pending",
      onClose: () => filters.setValue("emd", undefined),
    });
  }

  const pill = filters.dateValue
    ? formatDateRangePill(filters.dateValue[0], filters.dateValue[1])
    : undefined;

  return (
    <div>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: t.pageBg,
          margin: "-24px -24px 0",
          padding: "24px 24px 8px",
        }}
      >
        <PageHeader
          title="Contract Details"
          breadcrumb={breadcrumb}
          datePill={pill}
          filters={
            <ContractsFilters
              showDimensions={false}
              dateValue={filters.dateValue}
              onDateChange={filters.setDateRange}
              // Download is a placeholder, as on the other screens.
              onExport={() => message.info("Download will be available soon.")}
              exportDisabled={rows.length === 0}
            />
          }
        />
        <FilterChips chips={chips} onClearAll={filters.clearAll} />
      </div>

      {isError ? (
        <ErrorRetry title="Could not load contracts" error={error} onRetry={refetch} />
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <ErrorBoundary level="section" label="contracts table" resetKeys={[params]}>
            <Table<ContractRow>
              rowKey="tcNo"
              size="middle"
              columns={columns}
              dataSource={rows}
              loading={isLoading}
              scroll={{ x: "max-content", y: 1600 }}
              locale={{ emptyText: isLoading ? " " : "No contracts for these filters" }}
              pagination={{
                pageSize: PAGE_SIZE,
                showSizeChanger: false,
                showTotal: (total, r) => `Showing ${r[0]}-${r[1]} of ${total} contracts`,
              }}
            />
          </ErrorBoundary>
        </Card>
      )}
    </div>
  );
};
