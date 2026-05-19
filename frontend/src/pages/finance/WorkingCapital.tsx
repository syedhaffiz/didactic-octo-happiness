import { financeApi } from "../../api/finance";
import { BreakdownPage } from "./BreakdownPage";

export const WorkingCapital = () => (
  <BreakdownPage
    title="Working Capital"
    sectionTitle="Working Capital Breakdown"
    fetch={financeApi.workingCapital}
    queryKey="working-capital"
  />
);
