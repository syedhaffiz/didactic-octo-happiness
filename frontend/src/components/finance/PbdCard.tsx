import { Card, Empty } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import { Chart } from "../Chart";
import { CardTitle } from "../CardTitle";
import { pbdColumn } from "../../theme/tokens";
import type { PbdRow } from "../../types/finance";

interface Props {
  rows?: PbdRow[];
  loading: boolean;
}

const pbdOptions = (rows?: PbdRow[]): Highcharts.Options => {
  const safe = rows ?? [];
  return {
    chart: { type: "column", height: 280 },
    xAxis: {
      categories: safe.map((r) => r.port),
      labels: { rotation: -45, style: { fontSize: "10px" } },
    },
    yAxis: { title: { text: "Days", style: { fontSize: "11px" } } },
    legend: { enabled: false },
    tooltip: { valueDecimals: 1, valueSuffix: " days" },
    plotOptions: { column: { groupPadding: 0.12, pointWidth: 22 } },
    series: [{ type: "column", name: "PBD", data: safe.map((r) => r.days), color: pbdColumn }],
  };
};

export const PbdCard = ({ rows, loading }: Props) => {
  const empty = !loading && (rows?.length ?? 0) === 0;
  return (
    <Card title={<CardTitle icon={<BarChartOutlined />}>PBD</CardTitle>}>
      {empty ? (
        <Empty description="No PBD data" />
      ) : (
        <Chart loading={loading} options={pbdOptions(rows)} />
      )}
    </Card>
  );
};
