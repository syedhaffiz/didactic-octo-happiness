import { Space } from "antd";
import { PageHeader } from "../../components/PageHeader";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { ErrorRetry } from "../../components/ErrorRetry";
import { OverallShareCard } from "../../components/marketing/OverallShareCard";
import { ZoneShareCard } from "../../components/marketing/ZoneShareCard";
import { marketingApi } from "../../api/marketing";
import { useApi } from "../../api/useApi";
import { useUrlDateRange } from "../../utils/useUrlParam";

export const MarketSharePage = () => {
  const [dateRange, setDateRange, rawRange] = useUrlDateRange();

  const { data, isLoading, isError, error, refetch } = useApi(
    ["marketing", "market-share", rawRange],
    () => marketingApi.marketShare({ dateRange: rawRange }),
  );

  const unit = data?.unit ?? "MMT";
  const hasRange = Boolean(dateRange?.[0] && dateRange?.[1]);

  return (
    <>
      <PageHeader
        title="Market Share"
        datePill={hasRange ? rawRange : undefined}
        filters={<DateRangeFilter value={dateRange} onChange={setDateRange} />}
      />

      {isError ? (
        <ErrorRetry title="Could not load market share" error={error} onRetry={refetch} />
      ) : (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <OverallShareCard overall={data?.overall} unit={unit} loading={isLoading} />
          <ZoneShareCard byZone={data?.byZone} unit={unit} loading={isLoading} />
        </Space>
      )}
    </>
  );
};
