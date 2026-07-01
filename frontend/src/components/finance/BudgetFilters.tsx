import { Space } from "antd";
import { PortFilter } from "../filters/PortFilter";
import { GradeFilter } from "../filters/GradeFilter";
import { ZoneFilter } from "../filters/ZoneFilter";
import { OriginFilter } from "../filters/OriginFilter";

export const BUDGET_FILTER_KEYS = ["port", "grade", "zone", "origin"] as const;

interface Props {
  values: Record<string, string | undefined>;
  onChange: (key: string, value: string | undefined) => void;
}

// Port / Grade / Zone / Origin filter row for the Approved Budget header.
// Presentational — the URL-param state is owned by the page via `useUrlParams`.
export const BudgetFilters = ({ values, onChange }: Props) => (
  <Space size="middle" wrap>
    <PortFilter value={values.port} onChange={(v) => onChange("port", v)} />
    <GradeFilter value={values.grade} onChange={(v) => onChange("grade", v)} />
    <ZoneFilter value={values.zone} onChange={(v) => onChange("zone", v)} />
    <OriginFilter value={values.origin} onChange={(v) => onChange("origin", v)} />
  </Space>
);
