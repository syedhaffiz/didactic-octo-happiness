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
import { useUrlDateRange, useUrlParams } from "../../utils/useUrlParam";

const FILTER_KEYS = ["zone", "port", "policyType"] as const;
const DATE_FMT = "YYYY-MM-DD";

export const InsuranceStatus = () => {
  const { values, set } = useUrlParams(FILTER_KEYS);
  const { zone, port, policyType } = values;

  // No default window — the Figma shows an empty Start / End picker, i.e. every
  // policy in force. A picked range keeps policies whose period overlaps it.
  const [range, setRange] = useUrlDateRange();
  const fromDate = range?.[0]?.format(DATE_FMT);
  const toDate = range?.[1]?.format(DATE_FMT);

  const { data: options } = useApi(
    ["finance", "insurance-status", "filter-options"],
    financeApi.insuranceFilterOptions,
    { cache: true },
  );

  const { data, isLoading, isError, error, refetch } = useApi(
    ["finance", "insurance-status", zone, port, policyType, fromDate, toDate],
    () => financeApi.insuranceStatus({ zone, port, policyType, fromDate, toDate }),
  );

  const loading = isLoading || !data;

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
            dateValue={range}
            onZoneChange={(v) => set("zone", v)}
            onPortChange={(v) => set("port", v)}
            onPolicyTypeChange={(v) => set("policyType", v)}
            onDateChange={setRange}
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
              resetKeys={[zone, port, policyType, fromDate, toDate]}
            >
              <InsuranceSankey policies={data?.policies} loading={loading} />
            </ErrorBoundary>
          </Card>
        </>
      )}
    </>
  );
};
