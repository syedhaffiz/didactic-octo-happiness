import { useMemo, useState } from "react";
import { Button, Flex, Table, Tag } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { FilterValue, Key } from "antd/es/table/interface";
import { useBrandTokens } from "../theme/useBrandTokens";

interface Props<T> extends Omit<TableProps<T>, "columns" | "onChange"> {
  columns: ColumnsType<T>;
}

// One selected value of one column — the design shows a chip per value, so a
// column filtered on two values contributes two chips.
interface ActiveFilter<T> {
  columnKey: string;
  label: string;
  value: Key | boolean;
  onFilter: NonNullable<ColumnType<T>["onFilter"]>;
}

const isFilterable = <T,>(col: ColumnsType<T>[number]): col is ColumnType<T> =>
  "filters" in col || "filterDropdown" in col;

// A column's title is a ReactNode in general; only a plain string can label a
// chip, so anything else falls back to the column key.
const labelOf = <T,>(col: ColumnType<T>): string =>
  typeof col.title === "string" ? col.title : String(col.key);

// antd Table with a filter bar above it: the matched-row count, one removable
// chip per active filter value, and a "Clear all" link. The bar only appears
// once something is filtered.
//
// Filter state has to be controlled for any of that to work — a column only
// drops its selection when its `filteredValue` changes — so this holds the
// per-column state and feeds it back into the columns. Sorting stays
// uncontrolled.
//
// Filters are per-mount: give the element a `key` that changes with the dataset
// (e.g. the active tab) to start it clean.
export function FilterableTable<T extends object>({ columns, ...tableProps }: Props<T>) {
  const t = useBrandTokens();
  const [filters, setFilters] = useState<Record<string, FilterValue | null>>({});
  const rows = useMemo<readonly T[]>(() => tableProps.dataSource ?? [], [tableProps.dataSource]);

  const active = useMemo<ActiveFilter<T>[]>(
    () =>
      columns.filter(isFilterable).flatMap((col) => {
        const values = filters[String(col.key)];
        if (!values?.length || !col.onFilter) return [];
        const { onFilter } = col;
        return values.map((value) => ({
          columnKey: String(col.key),
          label: labelOf(col),
          value,
          onFilter,
        }));
      }),
    [columns, filters],
  );

  // Row count for the bar. Recomputed from the data rather than read off the
  // Table's onChange, so it stays right when the dataset itself refreshes.
  // Same semantics as antd: values within a column OR, columns AND.
  const matchedCount = useMemo(() => {
    if (active.length === 0) return rows.length;
    const byColumn = new Map<string, ActiveFilter<T>[]>();
    for (const f of active) byColumn.set(f.columnKey, [...(byColumn.get(f.columnKey) ?? []), f]);
    const groups = [...byColumn.values()];
    return rows.filter((row) => groups.every((g) => g.some((f) => f.onFilter(f.value, row))))
      .length;
  }, [active, rows]);

  const controlledColumns = useMemo<ColumnsType<T>>(
    () =>
      columns.map((col) =>
        isFilterable(col)
          ? { ...col, filteredValue: filters[String(col.key)] ?? null }
          : col,
      ),
    [columns, filters],
  );

  const removeFilter = (columnKey: string, value: Key | boolean) =>
    setFilters((prev) => {
      const remaining = (prev[columnKey] ?? []).filter((v) => v !== value);
      return { ...prev, [columnKey]: remaining.length ? remaining : null };
    });

  return (
    <>
      {/* Always rendered — chips come and go inside it, but the bar itself never
          appears or disappears, so the table below it never jumps. */}
      <Flex
        align="center"
        wrap
        gap={8}
        style={{ padding: "12px 16px", borderBottom: `1px solid ${t.border}`, minHeight: 52 }}
      >
        <Flex align="center" gap={6} style={{ color: t.textSecondary, fontSize: 13 }}>
          <FilterOutlined />
          {active.length > 0
            ? `${matchedCount} of ${rows.length} rows`
            : `${rows.length} rows`}
        </Flex>
        {active.map((f) => (
          <Tag
            key={`${f.columnKey}:${String(f.value)}`}
            closable
            onClose={() => removeFilter(f.columnKey, f.value)}
            style={{ marginInlineEnd: 0 }}
          >
            {f.label}: {String(f.value)}
          </Tag>
        ))}
        <Button
          type="link"
          size="small"
          disabled={active.length === 0}
          onClick={() => setFilters({})}
        >
          Clear all
        </Button>
      </Flex>
      <Table<T>
        {...tableProps}
        columns={controlledColumns}
        onChange={(_pagination, nextFilters) => setFilters(nextFilters)}
      />
    </>
  );
}
