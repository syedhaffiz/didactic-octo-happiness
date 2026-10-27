import { Flex } from "antd";
import { StatTile } from "../../StatTile";
import {
  formatPct,
  formatPctFull,
  formatQualityDate,
  type NormalizedQuality,
} from "./qualityFormat";

interface Props {
  data?: NormalizedQuality;
  loading: boolean;
}

// Average Variance at LP / DP tiles above the chart. Both are derived by the
// API from the current filter selection; the full-precision figure is on hover.
export const QualityKpiTiles = ({ data, loading }: Props) => {
  const busy = loading || !data;
  const caption = `Last Updated Date: ${formatQualityDate(data?.lastUpdated ?? null)}`;
  const tiles = [
    {
      key: "lp",
      label: "Average Variance at LP",
      value: data?.avgVarianceLp ?? null,
      info: "How closely the quality measured at the load port matched plan, averaged across cargoes in the current selection.",
    },
    {
      key: "dp",
      label: "Average Variance at DP",
      value: data?.avgVarianceDp ?? null,
      info: "How closely the quality measured at the dispatch port matched plan, averaged across cargoes in the current selection.",
    },
  ];

  return (
    <Flex gap={16} wrap style={{ marginBottom: 16 }}>
      {tiles.map((tile) => (
        <div key={tile.key} style={{ flex: "0 1 280px" }}>
          <StatTile
            label={tile.label}
            value={formatPct(tile.value)}
            tooltip={formatPctFull(tile.value)}
            caption={caption}
            info={tile.info}
            loading={busy}
          />
        </div>
      ))}
    </Flex>
  );
};
