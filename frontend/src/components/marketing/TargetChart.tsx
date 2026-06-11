import { ColumnChart } from "../ColumnChart";
import { BudgetActualColumnChart } from "../BudgetActualColumnChart";
import type { TargetMode } from "./TargetModeSegmented";
import { marketingColors } from "../../theme/tokens";
import type { TargetResponse } from "../../types/marketing";

const Y_TITLE = "1000 metric tons (MT)";

export const targetCardTitle: Record<TargetMode, string> = {
  portwise: "Port Wise",
  originwise: "Origin wise",
  segmentwise: "Segmentwise",
};

// Picks the right column chart for the active Target tab. Each child guards its
// own rows, so a missing array degrades to an empty state.
export const TargetChart = ({ mode, data }: { mode: TargetMode; data?: TargetResponse }) => {
  if (mode === "originwise") {
    return (
      <BudgetActualColumnChart
        rows={data?.originwise}
        budgetColor={marketingColors.originBudget}
        actualColor={marketingColors.originActual}
        yTitle={Y_TITLE}
        decimals={0}
      />
    );
  }
  if (mode === "segmentwise") {
    return (
      <BudgetActualColumnChart
        rows={data?.segmentwise}
        budgetColor={marketingColors.segmentBudget}
        actualColor={marketingColors.segmentActual}
        yTitle={Y_TITLE}
        decimals={1}
      />
    );
  }
  return <ColumnChart rows={data?.portwise} color={marketingColors.portBar} yTitle="MT" />;
};
