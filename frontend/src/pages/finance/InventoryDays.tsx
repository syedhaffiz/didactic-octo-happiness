import { useMemo } from "react";
import { Card, Col, Row, Skeleton } from "antd";
import { BarChartOutlined, PieChartOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorRetry } from "../../components/ErrorRetry";
import { PageHeader } from "../../components/PageHeader";
import { CardTitle } from "../../components/CardTitle";
import { RevenueDonut } from "../../components/finance/RevenueDonut";
import { DeltaStat } from "../../components/finance/DeltaStat";
import { InventoryDaysSegmentCard } from "../../components/finance/InventoryDaysSegmentCard";
import { InventoryDaysPortChart } from "../../components/finance/InventoryDaysPortChart";
import { InventoryDaysFilters } from "../../components/finance/InventoryDaysFilters";
import { DEFAULT_TIME_FRAME, isTimeFrame } from "../../components/filters/timeFrame";
import { financeApi } from "../../api/finance";
import { useApi } from "../../api/useApi";
import { donutColors } from "../../theme/tokens";
import { useUrlParams } from "../../utils/useUrlParam";

const FILTER_KEYS = ["zone", "port", "origin", "segment", "timeFrame", "month"] as const;

const MONTH_FMT = "YYYY-MM";

// Default Month: the current month once we're past the 7th, otherwise the
// previous month (early in a month the current month's book isn't settled yet).
const defaultMonth = (): Dayjs => {
  const today = dayjs();
  return today.date() > 7 ? today.startOf("month") : today.subtract(1, "month").startOf("month");
};

export const InventoryDays = () => {
  const { values, set } = useUrlParams(FILTER_KEYS);
  const { zone, port, origin, segment } = values;

  // Time Frame + Month select the as-of snapshot window. Both fall back to the
  // design defaults when absent / invalid in the URL.
  const timeFrame = isTimeFrame(values.timeFrame) ? values.timeFrame : DEFAULT_TIME_FRAME;
  const monthValue = useMemo(() => {
    const raw = values.month;
    // Validate the "YYYY-MM" shape before parsing, then append a day so dayjs
    // reads it as a full ISO date (no customParseFormat plugin is registered).
    if (raw && /^\d{4}-\d{2}$/.test(raw)) {
      const parsed = dayjs(`${raw}-01`);
      if (parsed.isValid()) return parsed.startOf("month");
    }
    return defaultMonth();
  }, [values.month]);
  const month = monthValue.format(MONTH_FMT);

  const { data, isLoading, isError, error, refetch } = useApi(
    ["inventory-days", timeFrame, month, zone, port, origin, segment],
    () => financeApi.inventoryDays({ timeFrame, month, zone, port, origin, segment }),
  );

  const loading = isLoading || !data;

  // Slice/card colors are owned by the UI, not the API: assign from the shared
  // pool by the segment's position in the response (cycling if it ever exceeds
  // the pool) so cards and donut slices stay in lockstep.
  const colorBySegment = useMemo(() => {
    const out: Record<string, string> = {};
    (data?.segments ?? []).forEach((it, i) => {
      out[it.segment] = donutColors[i % donutColors.length];
    });
    return out;
  }, [data]);

  // Export to Excel — placeholder only; not wired up yet.
  const handleExport = () => {};

  return (
    <>
      <PageHeader
        title="Inventory Days"
        datePill={data?.periodLabel}
        filters={
          <InventoryDaysFilters
            zone={zone}
            port={port}
            origin={origin}
            segment={segment}
            timeFrame={timeFrame}
            month={monthValue}
            onZoneChange={(v) => set("zone", v)}
            onPortChange={(v) => set("port", v)}
            onOriginChange={(v) => set("origin", v)}
            onSegmentChange={(v) => set("segment", v)}
            // Omit the default from the URL so it stays clean; any other value is
            // written explicitly.
            onTimeFrameChange={(v) => set("timeFrame", v === DEFAULT_TIME_FRAME ? undefined : v)}
            onMonthChange={(d) => set("month", d ? d.format(MONTH_FMT) : undefined)}
            onExport={handleExport}
            onRefresh={refetch}
          />
        }
      />

      {isError ? (
        <ErrorRetry title="Could not load inventory days" error={error} onRetry={refetch} />
      ) : (
        <>
          <Card
            title={<CardTitle icon={<PieChartOutlined />}>Segment Wise</CardTitle>}
            style={{ marginBottom: 16 }}
          >
            <ErrorBoundary level="section" label="inventory days segment wise">
              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <Row gutter={[20, 20]} align="middle">
                  <Col xs={24} md={14}>
                    <Row gutter={[16, 16]}>
                      {data.segments.map((it) => (
                        <Col xs={12} key={it.segment}>
                          <InventoryDaysSegmentCard
                            segment={it.segment}
                            days={it.days}
                            deltaVsBudget={it.deltaVsBudget}
                            deltaVsLastYear={it.deltaVsLastYear}
                            hoverColor={colorBySegment[it.segment]}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Col>
                  <Col xs={24} md={10}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <RevenueDonut
                          items={data.segments}
                          colorBySegment={colorBySegment}
                          total={data.totalValue}
                          currency="INR"
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <DeltaStat value={data.totalDeltaVsBudget} label="vs Budget" />
                        <DeltaStat value={data.totalDeltaVsLastYear} label="vs last year" />
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </ErrorBoundary>
          </Card>

          <Card title={<CardTitle icon={<BarChartOutlined />}>Port Wise</CardTitle>}>
            <ErrorBoundary level="section" label="inventory days port wise" resetKeys={[port, zone]}>
              <InventoryDaysPortChart rows={data?.portwise} loading={loading} />
            </ErrorBoundary>
          </Card>
        </>
      )}
    </>
  );
};
