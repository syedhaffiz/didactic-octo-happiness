import { Col, Row } from "antd";
import { AreaChartOutlined } from "@ant-design/icons";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { BudgetFilters, BUDGET_FILTER_KEYS } from "../../components/finance/BudgetFilters";
import { BudgetTrendCard } from "../../components/finance/BudgetTrendCard";
import { PbdCard } from "../../components/finance/PbdCard";
import { InventoryDaysCard } from "../../components/finance/InventoryDaysCard";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { useUrlParams } from "../../utils/useUrlParam";

export const ApprovedBudget = () => {
  const { values, set } = useUrlParams(BUDGET_FILTER_KEYS);
  const { port, grade, zone, origin } = values;

  const { data, isLoading, isError, error, refetch } = useApi(
    ["approved-budget", port, grade, zone, origin],
    () => financeApi.approvedBudget({ port, grade, zone, origin }),
  );

  return (
    <>
      <PageHeader
        title={data ? `Budget ${data.fy}` : "Budget FY26"}
        filters={<BudgetFilters values={values} onChange={set} />}
      />

      {isError ? (
        <ErrorRetry title="Could not load budget" error={error} onRetry={refetch} />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <BudgetTrendCard
              title="Volume"
              icon={<AreaChartOutlined />}
              series={data?.volume}
              loading={isLoading}
            />
          </Col>
          <Col xs={24} lg={12}>
            <BudgetTrendCard
              title="Margin"
              icon={<AreaChartOutlined />}
              series={data?.margin}
              loading={isLoading}
            />
          </Col>
          <Col xs={24} lg={12}>
            <PbdCard rows={data?.pbd} loading={isLoading} />
          </Col>
          <Col xs={24} lg={12}>
            <InventoryDaysCard gauge={data?.inventory} loading={isLoading} />
          </Col>
        </Row>
      )}
    </>
  );
};
