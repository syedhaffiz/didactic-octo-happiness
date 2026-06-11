import { Space } from "antd";
import { PageHeader } from "../../components/PageHeader";
import { ErrorRetry } from "../../components/ErrorRetry";
import { DischargePortFilter } from "../../components/marketing/DischargePortFilter";
import { FreightChartCard } from "../../components/marketing/FreightChartCard";
import { marketingApi } from "../../api/marketing";
import { useApi } from "../../api/useApi";
import { useUrlParam } from "../../utils/useUrlParam";

const DEFAULT_PORT = "Hazira";
const VESSEL_TYPES = ["Capes", "Panamax"];

export const OceanFreightPage = () => {
  const [port, setPort] = useUrlParam("dischargePort");
  const dischargePort = port ?? DEFAULT_PORT;

  const { data, isLoading, isError, error, refetch } = useApi(
    ["marketing", "ocean-freight", dischargePort],
    () => marketingApi.oceanFreight({ dischargePort }),
  );

  return (
    <>
      <PageHeader
        title="M2M Ocean Freight"
        datePill="Apr 25 : May 24"
        filters={
          <DischargePortFilter
            value={dischargePort}
            onChange={(v) => setPort(v === DEFAULT_PORT ? undefined : v)}
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
