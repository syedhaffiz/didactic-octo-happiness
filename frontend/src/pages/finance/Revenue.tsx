import { financeApi } from "../../api/finance";
import { BreakdownPage } from "./BreakdownPage";

export const Revenue = () => (
  <BreakdownPage
    title="Revenue"
    sectionTitle="Revenue Breakdown"
    fetch={financeApi.revenue}
    cacheKey="revenue"
  />
);
