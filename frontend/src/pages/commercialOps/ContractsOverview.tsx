import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { EnvironmentOutlined, PieChartOutlined } from "@ant-design/icons";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { ContractsFilters } from "../../components/commercialOps/ContractsFilters";
import { ContractBreakdownCard } from "../../components/commercialOps/ContractBreakdownCard";
import { EmdAgingCard } from "../../components/commercialOps/EmdAgingCard";
import type { DonutItem } from "../../components/commercialOps/ContractsDonut";
import { formatMtFull } from "../../components/commercialOps/contractsFormat";
import { commercialOpsApi } from "../../api/commercialOps";
import { useApi } from "../../api/useApi";
import { commercialOpsColors } from "../../theme/tokens";
import { useContractsFilters } from "../../utils/useContractsFilters";
import { formatDateRangePill } from "../../utils/useDateRangeWithDefault";

const CONTRACT_DETAILS_PATH = "/commercial-ops/contracts/details";

const colorAt = (palette: readonly string[], idx: number) => palette[idx % palette.length];

// Commercial Ops → Contracts overview: contract status split, port-wise split
// of pending-EMD contracts and the pending EMD aging chart. The donut totals and
// every tile drill into the Contract Details table, carrying the filters.
export const ContractsOverview = () => {
  const navigate = useNavigate();
  const filters = useContractsFilters();
  // Status / EMD are details-only drill filters; the overview shows every bucket.
  const params = useMemo(
    () => ({ ...filters.params, status: undefined, emd: undefined }),
    [filters.params],
  );

  // Filter dropdown options (zones / ports / segments) — one call, cached for
  // the session and shared with the details page's filter chips.
  const filterOptions = useApi(
    ["commercial-ops", "contracts", "filters"],
    () => commercialOpsApi.contractsFilterOptions(),
    { cache: true },
  );

  // All three cards (status, port-wise, EMD aging) come from this one call.
  const { data, isLoading, isError, error, refetch } = useApi(
    ["commercial-ops", "contracts", "overview", params],
    () => commercialOpsApi.contractsOverview(params),
  );
  const loading = isLoading || !data;

  const statusItems = useMemo<DonutItem[]>(
    () =>
      (data?.statuses ?? []).map((s, i) => ({
        name: s?.status ?? "Unknown",
        count: Number(s?.count) || 0,
        quantityMt: Number(s?.quantityMt) || 0,
        color: colorAt(commercialOpsColors.statuses, i),
      })),
    [data],
  );

  // Port display name → catalogue id, for the port drill-down URL.
  const portIdByName = useMemo(() => {
    const out = new Map<string, string>();
    for (const p of data?.ports ?? []) if (p?.port && p?.portId) out.set(p.port, p.portId);
    return out;
  }, [data]);

  const portItems = useMemo<DonutItem[]>(
    () =>
      (data?.ports ?? []).map((p, i) => ({
        name: p?.port ?? "Unknown",
        count: Number(p?.count) || 0,
        quantityMt: Number(p?.quantityMt) || 0,
        color: colorAt(commercialOpsColors.ports, i),
      })),
    [data],
  );

  // Drill into the details table with the current header filters, optionally
  // narrowed to one status, or to pending-EMD contracts (at one port).
  const goToDetails = (extra?: { status?: string; pendingEmd?: boolean; portId?: string }) => {
    const sp = new URLSearchParams(filters.search);
    sp.delete("status");
    sp.delete("emd");
    if (extra?.status) sp.set("status", extra.status);
    if (extra?.pendingEmd) sp.set("emd", "pending");
    if (extra?.portId) sp.set("port", extra.portId);
    const qs = sp.toString();
    navigate(`${CONTRACT_DETAILS_PATH}${qs ? `?${qs}` : ""}`);
  };

  const pill = filters.dateValue
    ? formatDateRangePill(filters.dateValue[0], filters.dateValue[1])
    : undefined;

  return (
    <>
      <PageHeader
        title="Contracts"
        datePill={pill}
        filters={
          <ContractsFilters
            options={filterOptions.data}
            optionsLoading={filterOptions.isLoading}
            zone={filters.zone}
            port={filters.port}
            segment={filters.segment}
            dateValue={filters.dateValue}
            onZoneChange={(v) => filters.setValue("zone", v)}
            onPortChange={(v) => filters.setValue("port", v)}
            onSegmentChange={(v) => filters.setValue("segment", v)}
            onDateChange={filters.setDateRange}
            // Download is a placeholder, as on the other screens.
            onExport={() => message.info("Download will be available soon.")}
          />
        }
      />

      {isError ? (
        <ErrorRetry title="Could not load contracts" error={error} onRetry={refetch} />
      ) : (
        <>
          <ErrorBoundary level="section" label="contract status" resetKeys={[params]}>
            <ContractBreakdownCard
              title="Contract status"
              icon={<PieChartOutlined />}
              items={statusItems}
              total={data?.totalContracts ?? 0}
              loading={loading}
              tilesPerRow={4}
              legendColumns={2}
              onSelect={(status) => goToDetails({ status })}
              onTotalClick={() => goToDetails()}
            />
          </ErrorBoundary>

          <ErrorBoundary level="section" label="port-wise contracts" resetKeys={[params]}>
            <ContractBreakdownCard
              title="Port-wise contracts"
              icon={<EnvironmentOutlined />}
              items={portItems}
              total={data?.portTotalContracts ?? 0}
              totalCaption={data ? formatMtFull(data.portTotalQuantityMt) : undefined}
              loading={loading}
              tilesPerRow={2}
              legendColumns={2}
              onSelect={(portName) =>
                goToDetails({ pendingEmd: true, portId: portIdByName.get(portName) })
              }
              onTotalClick={() => goToDetails({ pendingEmd: true })}
            />
          </ErrorBoundary>

          <ErrorBoundary level="section" label="pending EMD aging" resetKeys={[params]}>
            <EmdAgingCard points={data?.emdAging} loading={isLoading} />
          </ErrorBoundary>
        </>
      )}
    </>
  );
};
