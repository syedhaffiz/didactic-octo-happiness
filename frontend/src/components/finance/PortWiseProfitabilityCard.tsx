import { Card } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import { CardTitle } from "../CardTitle";
import { BudgetActualColumnChart, type BudgetActualRow } from "./BudgetActualColumnChart";

interface Props {
  /** Per-port budget/actual pairs, pre-scaled to the display unit. */
  rows?: BudgetActualRow[];
  /** Y-axis title / tooltip suffix, e.g. "Cr" or "M". */
  unit: string;
  loading: boolean;
}

// "Port Wise" card on the Net Margin page — a full-width grouped Budget-vs-Actual
// column chart (Budget light blue, Actual navy), one bar pair per port. The
// currency toggle lives in the page header now, so this card is display-only.
export const PortWiseProfitabilityCard = ({ rows, unit, loading }: Props) => (
  <Card title={<CardTitle icon={<BarChartOutlined />}>Port Wise</CardTitle>}>
    <BudgetActualColumnChart rows={rows} unit={unit} loading={loading} />
  </Card>
);
