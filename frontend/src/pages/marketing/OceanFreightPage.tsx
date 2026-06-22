import { Space } from "antd";
import { PageHeader } from "../../components/PageHeader";
import { ErrorRetry } from "../../components/ErrorRetry";
import { DischargePortFilter } from "../../components/marketing/DischargePortFilter";
import { FreightChartCard } from "../../components/marketing/FreightChartCard";
import { marketingApi } from "../../api/marketing";
import { filtersApi } from "../../api/filters";
import { useApi } from "../../api/useApi";
import { useUrlParam } from "../../utils/useUrlParam";

const VESSEL_TYPES = ["Capes", "Panamax"];

export const OceanFreightPage = () => {
  const { data: filtersData } = useApi(["filters"], filtersApi.all, { cache: true });
  const defaultPort = filtersData?.ports[0]?.id;

  const [port, setPort] = useUrlParam("dischargePort");
  const dischargePort = port ?? defaultPort;

  const { data, isLoading, isError, error, refetch } = useApi(
    ["marketing", "ocean-freight", dischargePort],
    // Stay in loading state until we know which port to fetch — avoids
    // firing the freight request before the first port id is available.
    () =>
      dischargePort
        ? marketingApi.oceanFreight({ dischargePort })
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
      ) : (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {VESSEL_TYPES.map((vesselType, i) => (
            <FreightChartCard
              key={vesselType}
              title={vesselType}
              chart={data?.items?.[i]}
              loading={isLoading}
            />
          ))}
        </Space>
      )}
    </>
  );
};
