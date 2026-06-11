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
import { useUrlDateRange, useUrlParam } from "../../utils/useUrlParam";

export const TargetAbove2Page = () => {
  const [dateRange, setDateRange, rawRange] = useUrlDateRange();
  const [rawMode, setRawMode] = useUrlParam("mode");
  const mode: TargetMode = isTargetMode(rawMode) ? rawMode : DEFAULT_MODE;

  const { data, isLoading, isError, error, refetch } = useApi(
    ["marketing", "target", rawRange],
    () => marketingApi.target({ dateRange: rawRange }),
  );

  const hasRange = Boolean(dateRange?.[0] && dateRange?.[1]);

  return (
    <>
      <PageHeader
        title="Target above 2 % quantity"
        datePill={hasRange ? rawRange : undefined}
        filters={<DateRangeFilter value={dateRange} onChange={setDateRange} />}
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
            <ErrorBoundary level="section" label={targetCardTitle[mode]} resetKeys={[mode, rawRange]}>
              <TargetChart mode={mode} data={data} />
            </ErrorBoundary>
          )}
        </Card>
      )}
    </>
  );
};
