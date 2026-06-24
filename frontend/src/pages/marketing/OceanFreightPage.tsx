import { Empty, Space } from "antd";
import { PageHeader } from "../../components/PageHeader";
import { ErrorRetry } from "../../components/ErrorRetry";
import { DischargePortFilter } from "../../components/marketing/DischargePortFilter";
import { FreightChartCard } from "../../components/marketing/FreightChartCard";
import { marketingApi } from "../../api/marketing";
import { filtersApi } from "../../api/filters";
import { useApi } from "../../api/useApi";
import { useUrlParam } from "../../utils/useUrlParam";

// Number of placeholder cards shown on the very first load, before the API
// reveals how many vessel-type charts this port actually has. Keeps the layout
// stable instead of flashing an empty page.
const LOADING_PLACEHOLDERS = 2;

export const OceanFreightPage = () => {
  const { data: filtersData, isError: filtersIsError } = useApi(["filters"], filtersApi.all, { cache: true });
  const defaultPort = filtersData?.dischargePorts[0]?.id;

  const [port, setPort] = useUrlParam("dischargePort");
  const dischargePort = port ?? defaultPort;

  const { data, isLoading, isError, error, refetch } = useApi(
    ["marketing", "ocean-freight", dischargePort, filtersIsError],
    // Wait for a port to resolve before firing; if filters failed and there is
    // no URL param to fall back on, reject so the page surfaces an error
    // instead of hanging in loading forever.
    () =>
      dischargePort
        ? marketingApi.oceanFreight({ dischargePort })
        : filtersIsError
        ? Promise.reject(new Error("Could not load port filters"))
        : new Promise<never>(() => {}),
  );

  return (
    <>
      <PageHeader
        title="M2M Ocean Freight"
        datePill="Apr 25 : May 24"
        filters={
          <DischargePortFilter
            value={dischargePort}
            onChange={(v) => setPort(v === defaultPort ? undefined : v)}
          />
        }
      />

      {isError ? (
        <ErrorRetry title="Could not load ocean freight" error={error} onRetry={refetch} />
      ) : !data ? (
        // First load — number of charts not yet known. Render a fixed set of
        // skeleton cards so the transition into real content is smooth.
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {Array.from({ length: LOADING_PLACEHOLDERS }, (_, i) => (
            <FreightChartCard key={i} loading />
          ))}
        </Space>
      ) : (data.items ?? []).length === 0 ? (
        <Empty description="No ocean freight charts for this discharge port" />
      ) : (
        // The API drives how many charts render — one per vessel type returned.
        // On a port switch `isLoading` keeps the existing cards in place and
        // swaps their bodies for skeletons rather than collapsing the layout.
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {(data.items ?? []).map((chart) => (
            <FreightChartCard
              key={chart.vesselType}
              title={chart.vesselType}
              chart={chart}
              loading={isLoading}
            />
          ))}
        </Space>
      )}
    </>
  );
};
