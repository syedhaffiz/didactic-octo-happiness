import { Card, Empty, Select, Skeleton, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { brand } from "../../theme/tokens";
import { ErrorRetry } from "../ErrorRetry";
import { logisticsApi } from "../../api/logistics";
import { useApi } from "../../api/useApi";
import { useUrlParam } from "../../utils/useUrlParam";
import type { HandlingRateRow } from "../../types/logistics";

const rateHeader = (label: string) => (
  <span>
    {label} <span style={{ fontWeight: 400, color: brand.textMuted }}>(INR/MT)</span>
  </span>
);

const columns: ColumnsType<HandlingRateRow> = [
  { title: "Port", dataIndex: "port", key: "port" },
  {
    title: rateHeader("Road"),
    dataIndex: "road",
    key: "road",
    align: "right",
    width: 140,
    sorter: (a, b) => a.road - b.road,
    render: (v: number) => v.toLocaleString("en-IN"),
  },
  {
    title: rateHeader("Rake"),
    dataIndex: "rake",
    key: "rake",
    align: "right",
    width: 140,
    sorter: (a, b) => a.rake - b.rake,
    render: (v: number) => v.toLocaleString("en-IN"),
  },
];

export const HandlingRatesCard = () => {
  // Fiscal-year list drives the header dropdown; the first entry is the default.
  const fy = useApi(["logistics", "fiscal-year"], () => logisticsApi.fiscalYears());
  const [year, setYear] = useUrlParam("handlingYear");
  const defaultYear = fy.data?.fiscalYear[0]?.fiscalYear;
  const activeYear = year ?? defaultYear;

  // Rates depend on the selected year. Wait for a year to resolve before firing
  // (unless the fiscal-year list failed, in which case fall back to the API's
  // own default year so the table still loads).
  const { data, isLoading, isError, error, refetch } = useApi(
    ["logistics", "handling-rates", activeYear, fy.isError],
    () =>
      activeYear
        ? logisticsApi.handlingRates(activeYear)
        : fy.isError
          ? logisticsApi.handlingRates(undefined)
          : new Promise<never>(() => {}),
  );
  const rows = data?.items;

  const yearSelect = (
    <Select
      size="small"
      value={activeYear}
      onChange={(v) => setYear(v === defaultYear ? undefined : v)}
      options={(fy.data?.fiscalYear ?? []).map((f) => ({
        value: f.fiscalYear,
        label: f.fiscalYearDisplay,
      }))}
      loading={fy.isLoading}
      placeholder="Fiscal Year"
      style={{ width: 140 }}
    />
  );

  return (
    <Card title="Handling Rates" extra={yearSelect} style={{ height: "100%" }}>
      {isError ? (
        <ErrorRetry title="Could not load handling rates" error={error} onRetry={refetch} />
      ) : isLoading || !rows ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : rows.length === 0 ? (
        <Empty description="No handling rates" />
      ) : (
        <Table
          rowKey="port"
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="middle"
        />
      )}
    </Card>
  );
};
