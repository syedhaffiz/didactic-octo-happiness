import { useState } from "react";
import { Skeleton } from "antd";
import { LineChartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { FilterChips, type FilterChip } from "../../components/FilterChips";
import { DebtorsFilters } from "../../components/finance/debtors/DebtorsFilters";
import { DebtorsFilterDrawer } from "../../components/finance/debtors/DebtorsFilterDrawer";
import { DebtorsAgingTiles } from "../../components/finance/debtors/DebtorsAgingTiles";
import { DebtorsBreakdownSection } from "../../components/finance/debtors/DebtorsBreakdownSection";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { DEBTORS_DRAWER_FIELDS, useDebtorsFilters } from "../../utils/useDebtorsFilters";

const DATE_FMT = "YYYY-MM-DD";
const TABLE_PATH = "/finance/debtors/table";

export const DebtorsOverview = () => {
  const t = useBrandTokens();
  const navigate = useNavigate();
  const filters = useDebtorsFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: options } = useApi(
    ["finance", "debtors", "filter-options"],
    financeApi.debtorsFilterOptions,
    { cache: true },
  );

  const params = filters.params;
  const { data, isLoading, isError, error, refetch } = useApi(
    ["finance", "debtors", "overview", params],
    () => financeApi.debtorsOverview(params),
  );

  const loading = isLoading || !data;

  // Build a table URL that carries the current view settings (currency, till
  // date) plus the current drawer filters, optionally overriding one dimension
  // to the drilled-in value. `dimension === null` drops all drawer filters (the
  // "net receivables" drill, which applies no filter).
  const goToTable = (dimension: string | null, value?: string) => {
    const sp = new URLSearchParams();
    if (filters.currency === "USD") sp.set("currency", "USD");
    if (filters.tillDate) sp.set("tillDate", filters.tillDate.format(DATE_FMT));
    if (dimension !== null) {
      for (const { key } of DEBTORS_DRAWER_FIELDS) {
        const vals = key === dimension ? (value ? [value] : []) : filters.values[key];
        if (vals.length) sp.set(key, vals.join(","));
      }
    }
    const qs = sp.toString();
    navigate(`${TABLE_PATH}${qs ? `?${qs}` : ""}`);
  };

  // Applied-filter chips (same set the drawer edits).
  const chips: FilterChip[] = [];
  if (filters.tillDate) {
    chips.push({
      key: "tillDate",
      label: "Till Date",
      value: filters.tillDate.format("DD MMM YY"),
      onClose: () => filters.setTillDate(null),
    });
  }
  for (const { key, label } of DEBTORS_DRAWER_FIELDS) {
    const vals = filters.values[key];
    vals.forEach((value) => {
      chips.push({
        key: `${key}:${value}`,
        label,
        value,
        onClose: () => filters.setValue(key, vals.filter((v) => v !== value)),
      });
    });
  }

  return (
    <div>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: t.pageBg,
          margin: "-24px -24px 0",
          padding: "24px 24px 8px",
        }}
      >
        <PageHeader
          title="Debtors"
          datePill={data?.periodLabel}
          filters={
            <DebtorsFilters
              tillDate={filters.tillDate}
              currency={filters.currency}
              drawerActiveCount={filters.drawerActiveCount}
              onTillDateChange={filters.setTillDate}
              onCurrencyChange={filters.setCurrency}
              onOpenFilters={() => setDrawerOpen(true)}
              // Export to Excel — placeholder only; not wired up yet.
              onExport={() => {}}
              onRefresh={refetch}
            />
          }
        />
        <FilterChips chips={chips} onClearAll={filters.clearAll} />
      </div>

      {isError ? (
        <ErrorRetry title="Could not load debtors" error={error} onRetry={refetch} />
      ) : (
        <>
          <ErrorBoundary level="section" label="debtors aging">
            {loading ? (
              <Skeleton active paragraph={{ rows: 2 }} style={{ marginBottom: 16 }} />
            ) : (
              <DebtorsAgingTiles
                buckets={data.aging}
                currency={filters.currency}
                onSelect={(bucket) => goToTable("aging", bucket)}
              />
            )}
          </ErrorBoundary>

          <ErrorBoundary level="section" label="debtors segment-wise">
            <DebtorsBreakdownSection
              title="Segment-wise Receivables"
              icon={<LineChartOutlined />}
              items={data?.segments ?? []}
              netReceivable={data?.netReceivable ?? 0}
              totalDue={data?.totalDue ?? 0}
              totalNotDue={data?.totalNotDue ?? 0}
              currency={filters.currency}
              loading={loading}
              onSelect={(name) => goToTable("segment", name)}
              onNetClick={() => goToTable(null)}
            />
          </ErrorBoundary>

          <ErrorBoundary level="section" label="debtors group-wise">
            <DebtorsBreakdownSection
              title="Group-wise Receivables"
              icon={<LineChartOutlined />}
              items={data?.groups ?? []}
              netReceivable={data?.netReceivable ?? 0}
              totalDue={data?.totalDue ?? 0}
              totalNotDue={data?.totalNotDue ?? 0}
              currency={filters.currency}
              loading={loading}
              onSelect={(name) => goToTable("group", name)}
              onNetClick={() => goToTable(null)}
            />
          </ErrorBoundary>
        </>
      )}

      <DebtorsFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        options={options}
        filters={filters}
      />
    </div>
  );
};
