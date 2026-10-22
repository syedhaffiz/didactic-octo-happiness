import { useState } from "react";
import { Card } from "antd";
import { AimOutlined } from "@ant-design/icons";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { CardTitle } from "../../components/CardTitle";
import { AgingFilters } from "../../components/finance/aging/AgingFilters";
import { AgingFilterDrawer } from "../../components/finance/aging/AgingFilterDrawer";
import { AgingAppliedFilters } from "../../components/finance/aging/AgingAppliedFilters";
import {
  AGING_DRAWER_KEYS,
  type AgingDrawerValues,
} from "../../components/finance/aging/agingFilterFields";
import { AgingMeasureSegmented } from "../../components/finance/aging/AgingMeasureSegmented";
import {
  DEFAULT_AGING_MEASURE,
  isAgingMeasure,
} from "../../components/finance/aging/agingMeasure";
import { AgingBucketChart } from "../../components/finance/aging/AgingBucketChart";
import { AgingOriginChart } from "../../components/finance/aging/AgingOriginChart";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useUrlDateRange, useUrlParams } from "../../utils/useUrlParam";

const FILTER_KEYS = [...AGING_DRAWER_KEYS, "measure"];
const DATE_FMT = "YYYY-MM-DD";

export const Aging = () => {
  const { values, set, setMany } = useUrlParams(FILTER_KEYS);
  const { zone, port, origin, segment, mine } = values;
  const drawerValues: AgingDrawerValues = { zone, port, origin, segment, mine };
  const activeFilterCount = AGING_DRAWER_KEYS.filter((k) => Boolean(values[k])).length;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const measure = isAgingMeasure(values.measure) ? values.measure : DEFAULT_AGING_MEASURE;

  // No default window — the Figma shows an empty Start / End picker, i.e. the
  // full reporting period. A picked range narrows the stock considered.
  const [range, setRange] = useUrlDateRange();
  const fromDate = range?.[0]?.format(DATE_FMT);
  const toDate = range?.[1]?.format(DATE_FMT);

  const { data, isLoading, isError, error, refetch } = useApi(
    ["finance", "aging", measure, zone, port, origin, segment, mine, fromDate, toDate],
    () => financeApi.aging({ measure, zone, port, origin, segment, mine, fromDate, toDate }),
  );

  // Changing any filter (or the measure) should clear a crashed section.
  const resetKeys = [measure, zone, port, origin, segment, mine, fromDate, toDate];

  // Export to Excel — placeholder only; not wired up yet.
  const handleExport = () => {};

  return (
    <>
      <PageHeader
        title="Aging"
        filters={
          <AgingFilters
            dateValue={range}
            onDateChange={setRange}
            activeFilterCount={activeFilterCount}
            onOpenFilters={() => setDrawerOpen(true)}
            onExport={handleExport}
            onRefresh={refetch}
          />
        }
      />

      {/* Own row so the pills never share a line with the measure toggle. */}
      <div>
        <AgingAppliedFilters
          values={drawerValues}
          dateRange={range}
          onRemove={(key) => set(key, undefined)}
          onClearDate={() => setRange(null)}
          // One URL update for every key — separate setters would clobber.
          onClearAll={() =>
            setMany(
              Object.fromEntries(
                [...AGING_DRAWER_KEYS, "fromDate", "toDate"].map((k) => [k, undefined]),
              ),
            )
          }
        />
      </div>

      <AgingMeasureSegmented
        value={measure}
        // The default is implied, so keep it out of the URL.
        onChange={(m) => set("measure", m === DEFAULT_AGING_MEASURE ? undefined : m)}
      />

      {isError ? (
        <ErrorRetry title="Could not load aging" error={error} onRetry={refetch} />
      ) : (
        <>
          <Card
            title={<CardTitle icon={<AimOutlined />}>Aging</CardTitle>}
            style={{ marginBottom: 16 }}
          >
            <ErrorBoundary level="section" label="aging buckets" resetKeys={resetKeys}>
              <AgingBucketChart data={data} loading={isLoading} />
            </ErrorBoundary>
          </Card>

          <Card title={<CardTitle icon={<AimOutlined />}>Origin Wise</CardTitle>}>
            <ErrorBoundary level="section" label="aging origin wise" resetKeys={resetKeys}>
              <AgingOriginChart data={data} loading={isLoading} />
            </ErrorBoundary>
          </Card>
        </>
      )}

      <AgingFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        values={drawerValues}
        onApply={setMany}
      />
    </>
  );
};
