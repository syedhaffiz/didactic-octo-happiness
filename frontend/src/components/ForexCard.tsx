import { Card, Select, Space, Tooltip } from "antd";
import { LineChartOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chart } from "./Chart";
import { financeApi } from "../api/finance";
import { brand } from "../theme/tokens";
import type { ForexRange } from "../types/finance";

const rangeOptions: { value: ForexRange; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "all", label: "All" },
];

export const ForexCard = () => {
  const [range, setRange] = useState<ForexRange>("week");
  const { data, isLoading, error } = useQuery({
    queryKey: ["forex", range],
    queryFn: () => financeApi.forex(range),
  });

  return (
    <Card
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <LineChartOutlined style={{ color: brand.purple }} /> Forex Movement
        </span>
      }
      extra={
        <Select
          size="small"
          value={range}
          onChange={(v: ForexRange) => setRange(v)}
          options={rangeOptions}
          style={{ width: 96 }}
        />
      }
      style={{ height: "100%" }}
      styles={{ body: { paddingTop: 12 } }}
    >
      {error ? (
        <span style={{ color: "#D14343" }}>Could not load forex data.</span>
      ) : (
        <>
          <Chart
            options={{
              chart: { type: "spline", height: 220 },
              xAxis: { categories: data?.points.map((p) => p.day) ?? [] },
              yAxis: { tickAmount: 5 },
              tooltip: {
                pointFormat: '<span style="color:{point.color}">●</span> Rate: <b>{point.y:.4f}</b>',
              },
              legend: { enabled: false },
              series: [
                {
                  type: "spline",
                  name: "USD/INR",
                  data: data?.points.map((p) => p.rate) ?? [],
                  color: brand.purple,
                  marker: { enabled: false },
                  lineWidth: 2.5,
                },
              ],
            }}
          />
          <Space size={12} style={{ marginTop: 14, width: "100%", justifyContent: "space-around" }}>
            <Tooltip title="Latest spot rate">
              <Stat label="Exchange Rate" value={data?.exchangeRate} loading={isLoading} />
            </Tooltip>
            <Tooltip title="Average across the selected period">
              <Stat label="Month Average" value={data?.monthAverage} loading={isLoading} />
            </Tooltip>
          </Space>
        </>
      )}
    </Card>
  );
};

const Stat = ({ label, value, loading }: { label: string; value?: number; loading: boolean }) => (
  <div
    style={{
      flex: 1,
      background: brand.purpleSoft,
      borderRadius: 10,
      padding: "10px 14px",
      textAlign: "center",
      minWidth: 110,
    }}
  >
    <div style={{ fontSize: 11, color: brand.textMuted }}>{label}</div>
    <div style={{ fontSize: 16, fontWeight: 600, color: brand.purple, marginTop: 2 }}>
      {loading || value === undefined ? "—" : value.toFixed(value < 100 ? 4 : 2)}
    </div>
  </div>
);
