import { Space, Tag } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useBrandTokens } from "../theme/useBrandTokens";

// One removable chip — a "Label: Value" pill. The caller flattens its filter
// state into these (one chip per selected value) so each can be cleared alone.
export interface FilterChip {
  key: string;
  label: string;
  value: string;
  onClose: () => void;
}

interface Props {
  chips: FilterChip[];
  onClearAll: () => void;
  /** Leading caption, e.g. "Applied Filters:". */
  caption?: string;
}

// The active-filter chip bar shown under a page header. Presentational — the
// caller owns the filter state and supplies the chips. Renders nothing when
// there are no active filters. Styling matches the Market Share pills (lavender
// border on a faint fill) so the two screens read as one system.
export const FilterChips = ({ chips, onClearAll, caption = "Applied Filters:" }: Props) => {
  const t = useBrandTokens();
  if (chips.length === 0) return null;

  return (
    <Space size={[8, 8]} wrap align="center" style={{ marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: t.textSecondary }}>{caption}</span>
      {chips.map((chip) => (
        <Tag
          key={chip.key}
          closable
          onClose={chip.onClose}
          closeIcon={<CloseOutlined style={{ fontSize: 11, color: t.textMuted }} />}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            margin: 0,
            padding: "2px 10px",
            fontSize: 13,
            lineHeight: "20px",
            borderRadius: 16,
            border: `1px solid ${t.filterTagBorder}`,
            background: t.filterTagBg,
          }}
        >
          <span>
            <span style={{ color: t.textSecondary }}>{chip.label}: </span>
            <span style={{ color: t.text, fontWeight: 600 }}>{chip.value}</span>
          </span>
        </Tag>
      ))}
      <a onClick={onClearAll} style={{ cursor: "pointer" }}>
        Clear All
      </a>
    </Space>
  );
};
