import { Space } from "antd";
import { PageHeader } from "../../components/PageHeader";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { ErrorRetry } from "../../components/ErrorRetry";
import { OverallShareCard } from "../../components/marketing/OverallShareCard";
import { ZoneShareCard } from "../../components/marketing/ZoneShareCard";
import { marketingApi } from "../../api/marketing";
import { useApi } from "../../api/useApi";
import {
  formatDateRangePill,
  useDateRangeWithDefault,
} from "../../utils/useDateRangeWithDefault";

export const MarketSharePage = () => {
  const { start, end, value, fromDate, toDate, setRange } = useDateRangeWithDefault(1);

  const { data, isLoading, isError, error, refetch } = useApi(
    ["marketing", "market-share", fromDate, toDate],
    () => marketingApi.marketShare({ fromDate, toDate }),
  );

  const unit = data?.unit ?? "MMT";

  return (
    <>
      <PageHeader
        title="Market Share"
        datePill={formatDateRangePill(start, end)}
        filters={<DateRangeFilter value={value} onChange={setRange} />}
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
