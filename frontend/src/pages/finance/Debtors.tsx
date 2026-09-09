import { useMemo, useState } from "react";
import { Card, Table } from "antd";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { FilterChips, type FilterChip } from "../../components/FilterChips";
import { DebtorsFilters } from "../../components/finance/DebtorsFilters";
import { DebtorsFilterDrawer } from "../../components/finance/DebtorsFilterDrawer";
import { DebtorsSummaryBanner } from "../../components/finance/DebtorsSummaryBanner";
import { DebtorsColumnPicker } from "../../components/finance/DebtorsColumnPicker";
import {
  buildDebtorsColumns,
  DEBTOR_MONEY_COLUMNS,
  type DebtorMoneyKey,
} from "../../components/finance/debtorsColumns";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useBrandTokens } from "../../theme/useBrandTokens";
import {
  DEBTORS_DRAWER_FIELDS,
  useDebtorsFilters,
} from "../../utils/useDebtorsFilters";
import type { DebtorRow } from "../../types/finance";

const PAGE_SIZE = 20;

// Column keys that can never be hidden — the row-identity column stays put so the
// pinned "Total" label and the fixed-left anchor always have a home.
const LOCKED_KEYS = new Set<string>(["customer"]);

// Per-viewer column visibility, remembered in localStorage. We store the HIDDEN
// keys (not the visible ones) so columns added in a later release default to
// shown. Every access is guarded — storage can be unavailable or throw.
const HIDDEN_COLUMNS_KEY = "debtors:hiddenColumns";

const readHiddenColumns = (): Set<string> => {
  try {
    const raw = localStorage.getItem(HIDDEN_COLUMNS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? new Set(parsed.filter((k): k is string => typeof k === "string"))
      : new Set();
  } catch {
    return new Set();
  }
};

const writeHiddenColumns = (hidden: Set<string>) => {
  try {
    localStorage.setItem(HIDDEN_COLUMNS_KEY, JSON.stringify([...hidden]));
  } catch {
    /* storage unavailable (private mode / SSR) — the choice just won't persist */
  }
};

const fmtTotal = (value: number): string =>
  value.toLocaleString(undefined, { maximumFractionDigits: 2 });

// Money-column lookups for the Total row — which keys carry a summed value, and
// which of those render emphasised (Net Receivable).
const MONEY_KEYS = new Set<string>(DEBTOR_MONEY_COLUMNS.map((c) => c.key));
const STRONG_KEYS = new Set<string>(
  DEBTOR_MONEY_COLUMNS.filter((c) => c.strong).map((c) => c.key),
);

export const Debtors = () => {
  const t = useBrandTokens();
  const filters = useDebtorsFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: options } = useApi(
    ["finance", "debtors", "filter-options"],
    financeApi.debtorsFilterOptions,
    { cache: true },
  );

  const params = filters.params;
  const { data, isLoading, isError, error, refetch } = useApi(
    ["finance", "debtors", params],
    () => financeApi.debtors(params),
  );

  const allColumns = useMemo(() => buildDebtorsColumns(), []);
  const rows = useMemo(() => data?.items ?? [], [data]);

  // Column show/hide. `hidden` holds the hidden keys; the picker toggles them and
  // the choice persists per viewer. The table + its Total row render from the
  // filtered `visibleColumns`, so both stay in lock-step whatever is hidden.
  const [hidden, setHidden] = useState<Set<string>>(readHiddenColumns);

  const setHiddenPersisted = (next: Set<string>) => {
    setHidden(next);
    writeHiddenColumns(next);
  };
  const toggleColumn = (key: string) => {
    const next = new Set(hidden);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setHiddenPersisted(next);
  };
  const resetColumns = () => setHiddenPersisted(new Set());

  const columnOptions = useMemo(
    () =>
      allColumns.map((c) => ({
        key: String(c.key),
        title: typeof c.title === "string" ? c.title : String(c.key),
        locked: LOCKED_KEYS.has(String(c.key)),
      })),
    [allColumns],
  );

  const visibleColumns = useMemo(
    () => allColumns.filter((c) => !hidden.has(String(c.key))),
    [allColumns, hidden],
  );

  // Flatten the active drawer filters (plus the as-of date) into removable chips.
  const chips: FilterChip[] = [];
  if (filters.tillDate) {
    chips.push({
      key: "tillDate",
      label: "Till Date",
      value: filters.tillDate.format("DD MMM YY"),
      onClose: () => filters.setTillDate(null),
    });
  }
  // One chip per selected value of each multi-select filter, each removable on
  // its own.
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

  // Column totals are derived on the client from the full filtered result
  // (`rows`) — not the current page — so paging never changes them, and they
  // update only when the filters bring in a different set of rows.
  const totals = useMemo(() => {
    const acc = Object.fromEntries(DEBTOR_MONEY_COLUMNS.map((c) => [c.key, 0])) as Record<
      DebtorMoneyKey,
      number
    >;
    for (const r of rows) {
      for (const c of DEBTOR_MONEY_COLUMNS) acc[c.key] += Number(r[c.key]) || 0;
    }
    for (const c of DEBTOR_MONEY_COLUMNS) acc[c.key] = Math.round(acc[c.key] * 100) / 100;
    return acc;
  }, [rows]);

  // Banner figures, also derived from the filtered rows: |Σ Balance Outstanding|
  // and the customer count.
  const totalOutstanding = Math.abs(totals.balanceOutstanding);
  const customerCount = rows.length;

  // Pinned "Total" row above the body. Built from the SAME visible-column list
  // the table renders, so cells line up whatever is hidden: the Customer column
  // carries the "Total" label, money columns show their sum (Net Receivable
  // emphasised), and every other column stays blank. Rendered only once rows are
  // present.
  const totalsMap = totals as Record<string, number>;
  const renderSummary = () =>
    rows.length > 0 ? (
      <Table.Summary fixed="top">
        <Table.Summary.Row style={{ background: t.filterTagBg }}>
          {visibleColumns.map((col, i) => {
            const key = String(col.key);
            if (key === "customer") {
              return (
                <Table.Summary.Cell key={key} index={i}>
                  <span style={{ fontWeight: 600 }}>Total</span>
                </Table.Summary.Cell>
              );
            }
            if (MONEY_KEYS.has(key)) {
              const value = fmtTotal(totalsMap[key]);
              return (
                <Table.Summary.Cell key={key} index={i} align="right">
                  {STRONG_KEYS.has(key) ? (
                    <span style={{ color: t.headline }}>{value}</span>
                  ) : (
                    value
                  )}
                </Table.Summary.Cell>
              );
            }
            return <Table.Summary.Cell key={key} index={i} />;
          })}
        </Table.Summary.Row>
      </Table.Summary>
    ) : null;

  return (
    <div>
      {/* Header + applied filters stick to the top while the page scrolls. */}
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
              columnPicker={
                <DebtorsColumnPicker
                  options={columnOptions}
                  hidden={hidden}
                  onToggle={toggleColumn}
                  onReset={resetColumns}
                />
              }
            />
          }
        />
        <FilterChips chips={chips} onClearAll={filters.clearAll} />
      </div>

      {isError ? (
        <ErrorRetry title="Could not load debtors" error={error} onRetry={refetch} />
      ) : (
        <>
          <ErrorBoundary level="section" label="debtors summary">
            <DebtorsSummaryBanner
              totalOutstanding={totalOutstanding}
              customerCount={customerCount}
              currency={filters.currency}
              loading={isLoading || !data}
            />
          </ErrorBoundary>

          <Card styles={{ body: { padding: 0 } }}>
            <ErrorBoundary level="section" label="debtors table">
              <Table<DebtorRow>
                rowKey={(r, i) => `${r.customerNumber}-${i}`}
                size="middle"
                columns={visibleColumns}
                dataSource={rows}
                loading={isLoading}
                summary={renderSummary}
                scroll={{ x: "max-content", y: 1600 }}
                pagination={{
                  pageSize: PAGE_SIZE,
                  showSizeChanger: false,
                  showTotal: (total, r) => `Showing ${r[0]}-${r[1]} of ${total} results`,
                }}
              />
            </ErrorBoundary>
          </Card>
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
