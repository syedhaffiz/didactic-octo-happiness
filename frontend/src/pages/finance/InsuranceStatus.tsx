import { useMemo } from "react";
import { Card } from "antd";
import { LineChartOutlined } from "@ant-design/icons";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { CardTitle } from "../../components/CardTitle";
import { InsuranceStatusFilters } from "../../components/finance/insuranceStatus/InsuranceStatusFilters";
import { InsuranceKpiStrip } from "../../components/finance/insuranceStatus/InsuranceKpiStrip";
import { InsuranceSankey } from "../../components/finance/insuranceStatus/InsuranceSankey";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { filtersApi } from "../../api/filters";
import { useUrlParams } from "../../utils/useUrlParam";

const FILTER_KEYS = ["zone", "port", "policyType"] as const;

export const InsuranceStatus = () => {
  const { values, set } = useUrlParams(FILTER_KEYS);
  const { zone, port, policyType } = values;

  const { data: options } = useApi(
    ["finance", "insurance-status", "filter-options"],
    financeApi.insuranceFilterOptions,
    { cache: true },
  );

  const { data, isLoading, isError, error, refetch } = useApi(
    ["finance", "insurance-status", zone, port, policyType],
    () => financeApi.insuranceStatus({ zone, port, policyType }),
  );

  // Shared port catalogue (same cached fetch the Port dropdown uses) — fixes
  // each Sankey port's color so it doesn't shift as filters change.
  const { data: catalog } = useApi(["filters"], filtersApi.all, { cache: true });
  const portNames = useMemo(() => catalog?.ports.map((p) => p.name), [catalog]);

  const loading = isLoading || !data;

  // Stable identity so the chart only rebuilds when the segment list changes.
  const segmentNames = useMemo(() => data?.segments.map((s) => s.segment), [data]);

  // Export to Excel — placeholder only; not wired up yet.
  const handleExport = () => {};

  return (
    <>
      <PageHeader
        title="Insurance Status"
        filters={
          <InsuranceStatusFilters
            zone={zone}
            port={port}
            policyType={policyType}
            policyTypes={options?.policyTypes ?? []}
            onZoneChange={(v) => set("zone", v)}
            onPortChange={(v) => set("port", v)}
            onPolicyTypeChange={(v) => set("policyType", v)}
            onExport={handleExport}
            onRefresh={refetch}
          />
        }
      />

      {isError ? (
        <ErrorRetry title="Could not load insurance status" error={error} onRetry={refetch} />
      ) : (
        <>
          <ErrorBoundary level="section" label="insurance summary">
            <InsuranceKpiStrip
              loading={loading}
              totalSumInsured={data?.totalSumInsured}
              totalStockValue={data?.totalStockValue}
              segments={data?.segments}
            />
          </ErrorBoundary>

          <Card title={<CardTitle icon={<LineChartOutlined />}>Active Insurance Analysis</CardTitle>}>
            <ErrorBoundary
              level="section"
              label="active insurance analysis"
              resetKeys={[zone, port, policyType]}
            >
              <InsuranceSankey
                policies={data?.policies}
                segments={segmentNames}
                policyTypes={options?.policyTypes}
                ports={portNames}
                loading={loading}
              />
            </ErrorBoundary>
          </Card>
        </>
      )}
    </>
  );
};
