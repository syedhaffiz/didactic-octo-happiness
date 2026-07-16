import { useMemo, useState } from "react";
import { Button, Flex, Table, Tag } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type { FilterValue, Key } from "antd/es/table/interface";
import { useBrandTokens } from "../theme/useBrandTokens";

type Filters = Record<string, FilterValue | null>;

interface Props<T> extends Omit<TableProps<T>, "columns" | "onChange"> {
  columns: ColumnsType<T>;
  /**
   * Controlled filter state. Provide together with `onFilteredValuesChange` to
   * run in server mode — the table then does NOT filter locally; it reports the
   * selected terms up and shows whatever `dataSource` the caller supplies.
   * Omit both to run in client mode (internal state + antd client-side filter).
   */
  filteredValues?: Filters;
  onFilteredValuesChange?: (next: Filters) => void;
  /** Total row count for the "X of Y rows" label. Server mode only (the
   *  dataSource is already filtered); defaults to the dataSource length. */
  total?: number;
}

// One selected value of one column — the design shows a chip per value, so a
// column filtered on two values contributes two chips.
interface ActiveFilter {
  columnKey: string;
  label: string;
  value: Key | boolean;
}

const isFilterable = <T,>(col: ColumnsType<T>[number]): col is ColumnType<T> =>
  "filters" in col || "filterDropdown" in col;

// A column's title is a ReactNode in general; only a plain string can label a
// chip, so anything else falls back to the column key.
const labelOf = <T,>(col: ColumnType<T>): string =>
  typeof col.title === "string" ? col.title : String(col.key);

// antd Table with a filter bar above it: the matched-row count, one removable
// chip per active filter value, and a "Clear all" link. The bar is always
// rendered (chips come and go inside it) so the table never jumps.
//
// Two modes:
//   - client (default): internal filter state, antd filters the dataSource.
//   - server (pass `onFilteredValuesChange`): the caller owns the filter state,
//     sends the terms to an API, and supplies pre-filtered rows + `total`.
//
// Either way the filter state has to be controlled into the columns (a column
// only drops its selection when its `filteredValue` changes). Sorting stays
// uncontrolled. In client mode, give the element a `key` that changes with the
// dataset (e.g. the active tab) to start it clean.
export function FilterableTable<T extends object>({
  columns,
  filteredValues,
  onFilteredValuesChange,
  total,
  ...tableProps
}: Props<T>) {
  const t = useBrandTokens();
  const serverMode = onFilteredValuesChange !== undefined;

  const [internal, setInternal] = useState<Filters>({});
  const filters = serverMode ? filteredValues ?? {} : internal;
  const setFilters = (next: Filters) =>
    serverMode ? onFilteredValuesChange(next) : setInternal(next);

  const rows = useMemo<readonly T[]>(() => tableProps.dataSource ?? [], [tableProps.dataSource]);

  // Chips — independent of `onFilter`, so server-mode columns (which have none)
  // still render their selected terms.
  const active = useMemo<ActiveFilter[]>(
    () =>
      columns.filter(isFilterable).flatMap((col) => {
        const values = filters[String(col.key)];
        if (!values?.length) return [];
        return values.map((value) => ({
          columnKey: String(col.key),
          label: labelOf(col),
          value,
        }));
      }),
    [columns, filters],
  );

  const totalRows = total ?? rows.length;

  // Replay each column's onFilter (values within a column OR, columns AND) so
  // the count is right even after the dataset itself refreshes. Columns without
  // an onFilter pass through — in server mode those are already filtered into
  // `rows`, so this also counts correctly when server-filtered and client-
  // filtered (e.g. tree-filter) columns are mixed in one table.
  const matchedCount = useMemo(() => {
    if (active.length === 0) return rows.length;
    const filterable = columns.filter(isFilterable);
    return rows.filter((row) =>
      filterable.every((col) => {
        const values = filters[String(col.key)];
        if (!values?.length || !col.onFilter) return true;
        return values.some((v) => col.onFilter!(v, row));
      }),
    ).length;
  }, [active.length, rows, columns, filters]);

  const controlledColumns = useMemo<ColumnsType<T>>(
    () =>
      columns.map((col) =>
        isFilterable(col)
          ? { ...col, filteredValue: filters[String(col.key)] ?? null }
          : col,
      ),
    [columns, filters],
  );

  const removeFilter = (columnKey: string, value: Key | boolean) => {
    const remaining = (filters[columnKey] ?? []).filter((v) => v !== value);
    setFilters({ ...filters, [columnKey]: remaining.length ? remaining : null });
  };

  return (
    <>
      <Flex
        align="center"
        wrap
        gap={8}
        style={{ padding: "12px 16px", borderBottom: `1px solid ${t.border}`, minHeight: 52 }}
      >
        <Flex align="center" gap={6} style={{ color: t.textSecondary, fontSize: 13 }}>
          <FilterOutlined />
          {active.length > 0 ? `${matchedCount} of ${totalRows} rows` : `${totalRows} rows`}
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
