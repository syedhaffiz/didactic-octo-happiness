import { useMemo, useState } from "react";
import { Card, Col, Input, Row, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { VesselTabsNav, useVesselTab } from "../../components/finance/VesselTabsNav";
import {
  buildVesselHandlingColumns,
  buildVesselSalesColumns,
} from "../../components/finance/vesselColumns";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import type {
  VesselHandlingRow,
  VesselSalesRow,
} from "../../types/finance";

const matches = (row: object, q: string) => {
  if (!q) return true;
  const needle = q.toLowerCase();
  return Object.values(row).some((v) =>
    String(v ?? "").toLowerCase().includes(needle),
  );
};

export const VesselProfitability = () => {
  const [tab] = useVesselTab();
  const [search, setSearch] = useState("");

  const salesQ = useApi(["finance", "vessel-sales"], () => financeApi.vesselSales());
  const handlingQ = useApi(["finance", "vessel-handling"], () =>
    financeApi.vesselHandling(),
  );

  const salesColumns = useMemo(() => buildVesselSalesColumns(), []);
  const handlingColumns = useMemo(() => buildVesselHandlingColumns(), []);

  const salesRows = (salesQ.data?.items ?? []).filter((r) => matches(r, search));
  const handlingRows = (handlingQ.data?.items ?? []).filter((r) =>
    matches(r, search),
  );

  const isError = tab === "sales" ? salesQ.isError : handlingQ.isError;
  const error = tab === "sales" ? salesQ.error : handlingQ.error;
  const refetch = tab === "sales" ? salesQ.refetch : handlingQ.refetch;
  const isLoading = tab === "sales" ? salesQ.isLoading : handlingQ.isLoading;

  return (
    <>
      <PageHeader title="Vessel Profitability" />

      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col>
          <VesselTabsNav />
        </Col>
        <Col xs={24} md={10} lg={8}>
          <Input
            allowClear
            size="middle"
            placeholder="Search"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 16 }}
          />
        </Col>
      </Row>

      {isError ? (
        <ErrorRetry title="Could not load vessels" error={error} onRetry={refetch} />
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <ErrorBoundary level="section" label="vessel table" resetKeys={[tab]}>
            {tab === "sales" ? (
              <Table<VesselSalesRow>
                rowKey={(r, i) => `${r.batchId}-${i}`}
                size="middle"
                columns={salesColumns}
                dataSource={salesRows}
                loading={isLoading}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                scroll={{ x: "max-content" }}
              />
            ) : (
              <Table<VesselHandlingRow>
                rowKey={(r, i) => `${r.batchId}-${i}`}
                size="middle"
                columns={handlingColumns}
                dataSource={handlingRows}
                loading={isLoading}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                scroll={{ x: "max-content" }}
              />
            )}
          </ErrorBoundary>
        </Card>
      )}
    </>
  );
};
