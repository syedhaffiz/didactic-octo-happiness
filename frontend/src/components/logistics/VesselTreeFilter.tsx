import { useMemo } from "react";
import { TreeSelect } from "antd";
import type { VesselSailedRow } from "../../types/logistics";

// The three filterable columns. Each becomes a top-level (non-selectable) tree
// node whose children are the distinct values found in the data.
const DIMS = [
  { key: "vessel", title: "Vessel" },
  { key: "coalGrade", title: "Coal Grade" },
  { key: "origin", title: "Origin" },
] as const;

type DimKey = (typeof DIMS)[number]["key"];

// Checked leaves are encoded as "<dim>:<value>". Values never contain ":" so
// the first colon is an unambiguous separator.
export type VesselFilterValue = string[];

const encode = (dim: DimKey, value: string) => `${dim}:${value}`;
const decode = (entry: string): { dim: string; value: string } => {
  const idx = entry.indexOf(":");
  return { dim: entry.slice(0, idx), value: entry.slice(idx + 1) };
};

const distinct = (rows: VesselSailedRow[], key: DimKey): string[] =>
  Array.from(new Set(rows.map((r) => r[key]))).sort((a, b) => a.localeCompare(b));

// Builds the TreeSelect data: one branch per filterable column.
const buildTreeData = (rows: VesselSailedRow[]) =>
  DIMS.map((d) => ({
    title: d.title,
    value: `dim:${d.key}`,
    selectable: false,
    children: distinct(rows, d.key).map((v) => ({
      title: v,
      value: encode(d.key, v),
    })),
  }));

// Applies a selection to the rows. Within a column the checked values are OR-ed;
// across columns they are AND-ed (a row must satisfy every constrained column).
// An empty selection passes everything through.
export const filterVesselRows = (
  rows: VesselSailedRow[],
  value: VesselFilterValue,
): VesselSailedRow[] => {
  if (!value.length) return rows;
  const byDim = new Map<string, Set<string>>();
  for (const entry of value) {
    const { dim, value: v } = decode(entry);
    if (!byDim.has(dim)) byDim.set(dim, new Set());
    byDim.get(dim)!.add(v);
  }
  return rows.filter((row) =>
    [...byDim.entries()].every(([dim, set]) => set.has(row[dim as DimKey])),
  );
};

export const VesselTreeFilter = ({
  rows,
  value,
  onChange,
}: {
  rows: VesselSailedRow[];
  value: VesselFilterValue;
  onChange: (value: VesselFilterValue) => void;
}) => {
  const treeData = useMemo(() => buildTreeData(rows), [rows]);

  return (
    <TreeSelect
      treeData={treeData}
      value={value}
      onChange={onChange}
      treeCheckable
      showCheckedStrategy={TreeSelect.SHOW_CHILD}
      placeholder="Filter by Vessel, Coal Grade, Origin"
      maxTagCount="responsive"
      allowClear
      showSearch
      treeNodeFilterProp="title"
      style={{ minWidth: 280, maxWidth: 420 }}
    />
  );
};
