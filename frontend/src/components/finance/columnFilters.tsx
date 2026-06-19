import { Button, Flex, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnType } from "antd/es/table/interface";
import { brand } from "../../theme/tokens";

// Two reusable column-filter shapes for the Profitability tables:
//   - textSearchFilter — input-driven substring match (Figma "Customized
//     filter panel" pattern: Search / Reset / Filter / close).
//   - treeFilter — antd's filterMode: "tree" with searchable checkboxes,
//     options derived from the live dataset.

type FilterProps<T> = Pick<
  ColumnType<T>,
  "filterDropdown" | "filterIcon" | "onFilter"
>;

type TreeFilterProps<T> = Pick<
  ColumnType<T>,
  "filters" | "filterMode" | "filterSearch" | "onFilter"
>;

export const textSearchFilter = <T,>(
  getValue: (row: T) => string,
  placeholder = "Search",
): FilterProps<T> => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
    <div style={{ padding: 8, minWidth: 240 }} onKeyDown={(e) => e.stopPropagation()}>
      <Input
        placeholder={placeholder}
        value={selectedKeys[0] as string}
        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => confirm()}
        style={{ marginBottom: 8, display: "block" }}
        autoFocus
      />
      <Flex justify="space-between">
        <Button
          size="small"
          type="link"
          onClick={() => {
            clearFilters?.();
            confirm();
          }}
        >
          Reset
        </Button>
        <Button
          type="primary"
          icon={<SearchOutlined />}
          size="small"
          onClick={() => confirm()}
        >
          Search
        </Button>
      </Flex>
    </div>
  ),
  filterIcon: (filtered) => (
    <SearchOutlined style={{ color: filtered ? brand.accent : undefined }} />
  ),
  onFilter: (value, record) =>
    getValue(record).toLowerCase().includes(String(value).toLowerCase()),
});

export const treeFilter = <T,>(
  options: readonly string[],
  getValue: (row: T) => string,
): TreeFilterProps<T> => ({
  filters: options.map((v) => ({ text: v, value: v })),
  filterMode: "tree",
  filterSearch: true,
  onFilter: (value, record) => getValue(record) === value,
});

export const uniqueValues = <T,>(
  rows: readonly T[],
  getValue: (row: T) => string,
): string[] => {
  const set = new Set<string>();
  for (const r of rows) {
    const v = getValue(r);
    if (v) set.add(v);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
};
