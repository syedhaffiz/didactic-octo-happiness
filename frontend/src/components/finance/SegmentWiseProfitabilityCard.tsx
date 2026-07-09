import { useMemo } from "react";
import { Card, Col, Row, Skeleton, Tooltip } from "antd";
import { LineChartOutlined } from "@ant-design/icons";
import { Chart } from "../Chart";
import { CardTitle } from "../CardTitle";
import { DeltaStat } from "./DeltaStat";
import { useBrandTokens } from "../../theme/useBrandTokens";
import { donutColors } from "../../theme/tokens";
import { formatMoney, toMoneyParts } from "../../utils/format";
import type { Currency, ProfitabilitySegmentItem } from "../../types/finance";

interface Props {
  items?: ProfitabilitySegmentItem[];
  loading: boolean;
  currency: Currency;
}

// Compact "86.6 Cr" / "$1.2M" form for the tooltip (toMoneyParts drops the unit
// for sub-abbreviation values).
const compactMoney = (value: number, currency: Currency): string => {
  const { num, unit } = toMoneyParts(value, currency);
  return unit ? `${num} ${unit}` : num;
};

// "Segment Wise Profitability" — a grid of per-segment KPI tiles paired with a
// donut of the same figures. Tiles and slices share colors (assigned from the
// shared pool by response order) so a tile reads as "its" slice. Mirrors the
// Revenue Segment Wise card.
export const SegmentWiseProfitabilityCard = ({ items, loading, currency }: Props) => {
  const t = useBrandTokens();

  const colorBySegment = useMemo(() => {
    const out: Record<string, string> = {};
    (items ?? []).forEach((it, i) => {
      out[it.segment] = donutColors[i % donutColors.length];
    });
    return out;
  }, [items]);

  return (
    <Card
      title={<CardTitle icon={<LineChartOutlined />}>Segment Wise Profitability</CardTitle>}
      style={{ height: "100%" }}
    >
      {loading || !items ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Row gutter={[20, 20]} align="middle">
          <Col xs={24} md={14}>
            <Row gutter={[16, 16]}>
              {items.map((it) => {
                const { num, unit } = toMoneyParts(it.value, currency);
                return (
                  <Col xs={12} key={it.segment}>
                    <div style={{ background: t.forexTileBg, borderRadius: 10, padding: "16px 18px" }}>
                      <div style={{ color: t.textSecondary, fontSize: 13, marginBottom: 6 }}>
                        {it.segment}
                      </div>
                      <Tooltip title={formatMoney(it.value, currency)}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          <span style={{ fontSize: 26, fontWeight: 700, color: t.forexTileText }}>
                            {num}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: t.forexTileText }}>
                            {unit}
                          </span>
                        </div>
                      </Tooltip>
                      <div style={{ marginTop: 8 }}>
                        <DeltaStat value={it.deltaVsBudget} label="vs Budget" />
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Col>
          <Col xs={24} md={10}>
            <Chart
              options={{
                chart: { type: "pie", height: 300 },
                tooltip: {
                  useHTML: true,
                  formatter() {
                    const key = String(this.key ?? "");
                    const item = items.find((s) => s.segment === key);
                    return `<b>${key}</b><br/>${item?.pct ?? 0}% <span style="color:${t.textSecondary}">(${
                      item ? compactMoney(item.value, currency) : ""
                    })</span>`;
                  },
                },
                plotOptions: {
                  pie: {
                    innerSize: "58%",
                    dataLabels: { enabled: false },
                    showInLegend: true,
                    borderWidth: 0,
                  },
                },
                legend: {
                  enabled: true,
                  align: "center",
                  verticalAlign: "bottom",
                  symbolRadius: 6,
                },
                series: [
                  {
                    type: "pie",
                    name: "Segments",
                    data: items.map((s) => ({
                      name: s.segment,
                      y: s.value,
                      color: colorBySegment[s.segment],
                    })),
                  },
                ],
              }}
            />
          </Col>
        </Row>
      )}
    </Card>
  );
};
