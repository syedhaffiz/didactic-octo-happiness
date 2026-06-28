import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Empty } from "antd";
import Highcharts from "highcharts";
// Chart.tsx registers the drilldown module (after the Highcharts core import),
// so importing Chart here guarantees drilldown is available.
import { Chart } from "../Chart";
import { ErrorBoundary } from "../ErrorBoundary";
import { logisticsApi } from "../../api/logistics";
import { brand, fontFamily, logisticsColors } from "../../theme/tokens";
import type { PdaDrilldownSeries, PdaPiePoint, PdaRootPie } from "../../types/logistics";

// Root slices read as a navy ramp (matching the design); drilled "Operations"
// levels use a distinct categorical palette so the change in tier is obvious.
const { pdaRoot, pdaDrill } = logisticsColors;

const rootColorFor = (i: number) => pdaRoot[i % pdaRoot.length];
const drillColorFor = (i: number) => pdaDrill[i % pdaDrill.length];

// Tooltip: entity name, its PDA volume and the share of the level it sits in.
const tooltipFormatter = function (this: Highcharts.Point): string {
  const pct = typeof this.percentage === "number" ? this.percentage : 0;
  const header = `<span style="font-size:13px;font-weight:700;color:${brand.headline}">${this.name}</span><br/>`;
  return (
    header +
    `<b>PDA:</b> ${Highcharts.numberFormat(this.y ?? 0, 0)}<br/>` +
    `<b>Share:</b> ${pct.toFixed(1)}%`
  );
};

const toPoint = (pt: PdaPiePoint, color?: string) => ({
  name: pt.name,
  y: pt.y,
  drilldown: pt.drilldown ?? undefined,
  ...(color ? { color } : {}),
});

const toDrilldownSeries = (lvl: PdaDrilldownSeries): Highcharts.SeriesOptionsType =>
  ({
    id: lvl.id,
    name: lvl.tier,
    type: "pie",
    data: lvl.data.map((pt, i) => toPoint(pt, drillColorFor(i))),
  }) as Highcharts.SeriesOptionsType;

interface Props {
  title: string;
  /** Root level only; deeper levels are fetched on slice click. */
  root?: PdaRootPie;
  loading?: boolean;
  height?: number;
}

// Portwise PDA pie. Ships only the root (per-port PDA); each port slice click
// fetches that port's operations split from the drill endpoint and adds it via
// addSeriesAsDrilldown. Fetched levels are cached per id so drill-up/re-drill
// is instant. The Spin overlay shows while a level is in flight.
export const PortwisePdaCard = ({ title, root, loading, height = 360 }: Props) => {
  const [drilling, setDrilling] = useState(false);
  // id -> already-fetched level. Reset whenever the root payload changes.
  const cacheRef = useRef<Map<string, PdaDrilldownSeries>>(new Map());
  useEffect(() => {
    cacheRef.current.clear();
  }, [root]);

  const options = useMemo<Highcharts.Options>(() => {
    const rootSlices = root?.root ?? [];
    return {
      chart: {
        type: "pie",
        height,
        style: { fontFamily },
        events: {
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
            logisticsApi
              .pdaDrill(id)
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
          // Pin the diameter so the pie keeps a constant size across levels —
          // otherwise the longer drilled labels (agent names) reserve more room
          // and shrink it on drill. `crop:false` / `overflow:"allow"` let those
          // long labels extend past the plot instead of squeezing the pie.
          size: "72%",
          center: ["50%", "50%"],
          dataLabels: [
            {
              enabled: true,
              distance: 14,
              format: "<b>{point.name}</b>",
              crop: false,
              overflow: "allow",
            },
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
          name: root?.rootName ?? "Ports",
          data: rootSlices.map((pt, i) => toPoint(pt, rootColorFor(i))),
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
  }, [root, height]);

  const hasData = (root?.root?.length ?? 0) > 0;

  return (
    <Card
      title={<span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>}
      // Flex column so the body fills the (stretched) card height and the chart
      // sits centered — no dead space when this card is shorter than its row peer.
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
      styles={{
        header: { borderBottom: "none" },
        body: {
          paddingTop: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        },
      }}
    >
      {!hasData && !loading ? (
        <Empty description="No PDA data" style={{ padding: 32 }} />
      ) : (
        <ErrorBoundary level="section" label={title}>
          <Chart loading={loading || drilling} options={options} />
        </ErrorBoundary>
      )}
    </Card>
  );
};
