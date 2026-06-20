import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Card, Empty } from "antd";
import Highcharts from "highcharts";
// Chart.tsx registers the drilldown module (after the Highcharts core import),
// so importing Chart here guarantees drilldown is available.
import { Chart } from "../Chart";
import { ErrorBoundary } from "../ErrorBoundary";
import { marketingApi } from "../../api/marketing";
import { marketingColors, brand, fontFamily } from "../../theme/tokens";
import type {
  MarketShareDimension,
  MarketShareDrilldownSeries,
  MarketSharePiePoint,
  MarketShareRootPie,
} from "../../types/marketing";

const { own: OWN, nonOwn: NON_OWN, drill: DRILL } = marketingColors.marketShare;

// Tooltip: at every level show the Own-vs-Others split + total volume for the
// hovered entity, mirroring the reference drilldown tooltip.
const tooltipFormatter = function (this: Highcharts.Point): string {
  const p = this as Highcharts.Point & { own?: number; nonOwn?: number };
  const own = p.own ?? 0;
  const nonOwn = p.nonOwn ?? 0;
  const total = own + nonOwn;
  const fmt = (n: number) => Highcharts.numberFormat(n, 0);
  const ownShare = total > 0 ? (own / total) * 100 : 0;
  const otherShare = total > 0 ? (nonOwn / total) * 100 : 0;
  const header = `<span style="font-size:13px;font-weight:700;color:${brand.headline}">${this.name}</span><br/>`;
  if (total === own && nonOwn === 0) {
    return `${header}<b>Volume:</b> ${fmt(own)} MT`;
  }
  return (
    header +
    `<table style="margin-top:4px">` +
    `<tr><td style="padding-right:12px;color:${OWN}"><b>Own:</b></td>` +
    `<td style="text-align:right"><b>${ownShare.toFixed(1)}%</b> <span style="color:#888;font-size:10px">(${fmt(own)} MT)</span></td></tr>` +
    `<tr><td style="padding-right:12px;color:${NON_OWN}"><b>Others:</b></td>` +
    `<td style="text-align:right"><b>${otherShare.toFixed(1)}%</b> <span style="color:#888;font-size:10px">(${fmt(nonOwn)} MT)</span></td></tr>` +
    `<tr style="border-top:1px solid #ddd"><td style="padding-top:4px"><b>Total:</b></td>` +
    `<td style="text-align:right;padding-top:4px"><b>${fmt(total)} MT</b></td></tr>` +
    `</table>`
  );
};

// Maps our serializable pie payload onto a Highcharts point, carrying own/nonOwn
// onto the point so the tooltip can read them. A non-null `drilldown` id keeps
// the point drillable (its children are fetched on click).
const toPoint = (pt: MarketSharePiePoint, color?: string) => ({
  name: pt.name,
  y: pt.y,
  drilldown: pt.drilldown ?? undefined,
  own: pt.own,
  nonOwn: pt.nonOwn,
  ...(color ? { color } : {}),
});

const rootColorFor = (name: string) => (name === "Non-Own" ? NON_OWN : OWN);
const drillColorFor = (i: number) => DRILL[i % DRILL.length];

// A fetched level -> a Highcharts drilldown series.
const toDrilldownSeries = (lvl: MarketShareDrilldownSeries): Highcharts.SeriesOptionsType =>
  ({
    id: lvl.id,
    name: lvl.tier,
    type: "pie",
    data: lvl.data.map((pt, i) => toPoint(pt, drillColorFor(i))),
  }) as Highcharts.SeriesOptionsType;

interface Props {
  title: string;
  subtitle?: string;
  /** Which pie — decides the drill endpoint dimension. */
  dim: MarketShareDimension;
  /** Root level only; deeper levels are fetched on click. */
  root?: MarketShareRootPie;
  loading?: boolean;
  height?: number;
}

// Reusable async drilldown pie. Ships only the root (Own/Non-Own); each slice
// click fetches that node's children from the drill endpoint and adds them via
// addSeriesAsDrilldown. Fetched levels are cached per id so drill-up/re-drill
// is instant. The antd Spin overlay shows while a level is in flight.
export const DrilldownPieCard = ({ title, subtitle, dim, root, loading, height = 360 }: Props) => {
  const [drilling, setDrilling] = useState(false);
  // id -> already-fetched level. Reset whenever the root payload changes.
  const cacheRef = useRef<Map<string, MarketShareDrilldownSeries>>(new Map());
  useEffect(() => {
    cacheRef.current.clear();
  }, [root, dim]);

  const options = useMemo<Highcharts.Options>(() => {
    const rootSlices = root?.root ?? [];
    return {
      chart: {
        type: "pie",
        height,
        style: { fontFamily },
        events: {
          // Async drilldown: when a slice with a `drilldown` id is clicked and
          // its level isn't preloaded, fetch it then add it.
          drilldown(this: Highcharts.Chart, e: Highcharts.DrilldownEventObject) {
            if (e.seriesOptions) return; // already present
            const id = (e.point as Highcharts.Point & { drilldown?: string }).drilldown;
            if (!id) return;
            const chart = this;

            const cached = cacheRef.current.get(id);
            if (cached) {
              chart.addSeriesAsDrilldown(e.point, toDrilldownSeries(cached));
              return;
            }

            setDrilling(true);
            marketingApi
              .marketShareDrill(dim, id)
              .then((level) => {
                cacheRef.current.set(id, level);
                chart.addSeriesAsDrilldown(e.point, toDrilldownSeries(level));
              })
              .catch(() => {
                /* swallow — chart stays at the current level */
              })
              .finally(() => setDrilling(false));
          },
        },
      },
      title: { text: undefined },
      tooltip: { useHTML: true, formatter: tooltipFormatter },
      plotOptions: {
        pie: {
          borderRadius: 4,
          dataLabels: [
            { enabled: true, distance: 14, format: "<b>{point.name}</b>" },
            {
              enabled: true,
              distance: "-30%",
              filter: { property: "percentage", operator: ">", value: 4 },
              format: "{point.percentage:.1f}%",
              style: { fontSize: "11px", textOutline: "none", color: brand.white },
            },
          ],
        },
      },
      series: [
        {
          type: "pie",
          name: root?.rootName ?? "Market Share",
          data: rootSlices.map((pt) => toPoint(pt, rootColorFor(pt.name))),
        },
      ],
      drilldown: {
        breadcrumbs: {
          buttonTheme: { style: { color: brand.accent, fontWeight: "bold" } },
        },
        activeDataLabelStyle: { color: brand.white, textDecoration: "none" },
        // Empty — every level is supplied lazily by the drilldown handler.
        series: [],
      },
    };
  }, [root, dim, height]);

  const hasData = (root?.root?.length ?? 0) > 0;

  return (
    <Card
      title={<span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>}
      styles={{ header: { borderBottom: "none" }, body: { paddingTop: 0 } }}
    >

      {subtitle ? (
        <Alert title={subtitle} type="info" showIcon style={{ marginTop: 8 }} />
      ) : null}
      {!hasData && !loading ? (
        <Empty description="No data" style={{ padding: 32 }} />
      ) : (
        <ErrorBoundary level="section" label={title}>
          <Chart loading={loading || drilling} options={options} />
        </ErrorBoundary>
      )}
    </Card>
  );
};
