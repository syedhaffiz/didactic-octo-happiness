import { Card, Skeleton } from "antd";
import { PageHeader } from "../../components/PageHeader";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { DateRangeFilter } from "../../components/DateRangeFilter";
import { ErrorRetry } from "../../components/ErrorRetry";
import {
  TargetModeSegmented,
  DEFAULT_MODE,
  isTargetMode,
  type TargetMode,
} from "../../components/marketing/TargetModeSegmented";
import { TargetChart, targetCardTitle } from "../../components/marketing/TargetChart";
import { marketingApi } from "../../api/marketing";
import { useApi } from "../../api/useApi";
import { useUrlParam } from "../../utils/useUrlParam";
import {
  formatDateRangePill,
  useDateRangeWithDefault,
} from "../../utils/useDateRangeWithDefault";

export const TargetAbove2Page = () => {
  const { start, end, value, fromDate, toDate, setRange } = useDateRangeWithDefault(1);
  const [rawMode, setRawMode] = useUrlParam("mode");
  const mode: TargetMode = isTargetMode(rawMode) ? rawMode : DEFAULT_MODE;

  const { data, isLoading, isError, error, refetch } = useApi(
    ["marketing", "target", fromDate, toDate],
    () => marketingApi.target({ fromDate, toDate }),
  );

  return (
    <>
      <PageHeader
        title="Target above 2 % quantity"
        datePill={formatDateRangePill(start, end)}
        filters={<DateRangeFilter value={value} onChange={setRange} />}
      />

      <TargetModeSegmented
        value={mode}
        onChange={(m) => setRawMode(m === DEFAULT_MODE ? undefined : m)}
      />

      {isError ? (
        <ErrorRetry title="Could not load target" error={error} onRetry={refetch} />
      ) : (
        <Card title={targetCardTitle[mode]}>
          {isLoading || !data ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <ErrorBoundary level="section" label={targetCardTitle[mode]} resetKeys={[mode, fromDate, toDate]}>
              <TargetChart mode={mode} data={data} />
            </ErrorBoundary>
          )}
        </Card>
      )}
    </>
  );
};
