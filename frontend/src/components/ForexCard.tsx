import { Card, Select, Space, Tooltip } from "antd";
import { LineChartOutlined } from "@ant-design/icons";
import { Chart } from "./Chart";
import { financeApi } from "../api/finance";
import { useApi } from "../api/useApi";
import { useUrlParam } from "../utils/useUrlParam";
import { useBrandTokens } from "../theme/useBrandTokens";
import type { ForexRange } from "../types/finance";

const rangeOptions: { value: ForexRange; label: string }[] = [
  { value: "all", label: "All" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const isForexRange = (v: string | undefined): v is ForexRange =>
  v === "all" || v === "week" || v === "month";

export const ForexCard = () => {
  const t = useBrandTokens();
  const [rawRange, setRange] = useUrlParam("forexRange");
  const range: ForexRange = isForexRange(rawRange) ? rawRange : "all";
  const { data, isLoading, error } = useApi(["forex", range], () =>
    financeApi.forex(range),
  );

  return (
    <Card
      title={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <LineChartOutlined style={{ color: t.accentText }} /> Forex Movement
        </span>
      }
      extra={
        <Select
          size="small"
          value={range}
          onChange={(v: ForexRange) => setRange(v === "all" ? undefined : v)}
          options={rangeOptions}
          style={{ width: 90 }}
        />
      }
      style={{ height: "100%", background: t.forexCardBg }}
      styles={{ header: { borderBottom: "none" }, body: { paddingTop: 4 } }}
    >
      {error ? (
        <span style={{ color: t.deltaDown }}>Could not load forex data.</span>
      ) : (
        <>
          <Chart
            options={{
              chart: { type: "spline", height: 230, backgroundColor: "transparent" },
              xAxis: { categories: data?.points.map((p) => p.day) ?? [] },
              yAxis: { tickAmount: 5 },
              tooltip: {
                pointFormat:
                  '<span style="color:{point.color}">●</span> Rate: <b>{point.y:.4f}</b>',
              },
              legend: { enabled: false },
              series: [
                {
                  type: "spline",
                  name: "USD/INR",
                  data: data?.points.map((p) => p.rate) ?? [],
                  color: t.accentText,
                  marker: { enabled: false },
                  lineWidth: 2.5,
                },
              ],
            }}
          />
          <Space size={12} style={{ marginTop: 6, width: "100%", justifyContent: "space-around" }}>
            <Tooltip title="Latest spot rate">
              <Stat
                label="Exchange Rate"
                value={data?.exchangeRate}
                loading={isLoading}
                bg={t.forexTileBg}
                color={t.forexTileText}
              />
            </Tooltip>
            <Tooltip title="Average across the selected period">
              <Stat
                label="Month Average"
                value={data?.monthAverage}
                loading={isLoading}
                bg={t.forexTileBg}
                color={t.forexTileText}
              />
            </Tooltip>
          </Space>
        </>
      )}
    </Card>
  );
};

interface StatProps {
  label: string;
  value?: number;
  loading: boolean;
  bg: string;
  color: string;
}

const Stat = ({ label, value, loading, bg, color }: StatProps) => (
  <div
    style={{
      flex: 1,
      background: bg,
      borderRadius: 10,
      padding: "10px 14px",
      textAlign: "center",
      minWidth: 110,
    }}
  >
    <div style={{ fontSize: 11, color, opacity: 0.8 }}>{label}</div>
    <div style={{ fontSize: 17, fontWeight: 700, color, marginTop: 2 }}>
      {loading || value === undefined ? "—" : value.toFixed(value < 100 ? 4 : 2)}
    </div>
  </div>
);
