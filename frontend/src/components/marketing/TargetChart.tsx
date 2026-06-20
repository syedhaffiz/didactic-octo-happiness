import { ColumnChart } from "../ColumnChart";
import type { TargetMode } from "./TargetModeSegmented";
import { marketingColors } from "../../theme/tokens";
import type { BudgetActualRow, TargetResponse } from "../../types/marketing";

const Y_TITLE = "1000 metric tons (MT)";

export const targetCardTitle: Record<TargetMode, string> = {
  portwise: "Port Wise",
  originwise: "Origin wise",
  segmentwise: "Segmentwise",
};

const toBudgetRows = (rows: BudgetActualRow[] | undefined) =>
  (rows ?? []).map((r) => ({ category: r.category, value: r.budget }));

// Picks the right column chart for the active Target tab. Origin Wise and
// Segment Wise show Budget only (no Actual) per the latest figma.
export const TargetChart = ({ mode, data }: { mode: TargetMode; data?: TargetResponse }) => {
  if (mode === "originwise") {
    return (
      <ColumnChart
        rows={toBudgetRows(data?.originwise)}
        color={marketingColors.originBudget}
        yTitle={Y_TITLE}
        decimals={0}
        legendName="Budget"
        labelRotation={0}
        labelItalic={false}
      />
    );
  }
  if (mode === "segmentwise") {
    return (
      <ColumnChart
        rows={toBudgetRows(data?.segmentwise)}
        color={marketingColors.segmentBudget}
        yTitle={Y_TITLE}
        decimals={1}
        legendName="Budget"
        labelRotation={0}
        labelItalic={false}
      />
    );
  }
  return <ColumnChart rows={data?.portwise} color={marketingColors.portBar} yTitle="MT" />;
};
