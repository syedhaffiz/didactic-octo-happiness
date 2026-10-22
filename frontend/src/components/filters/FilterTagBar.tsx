import { Space, Tag } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useBrandTokens } from "../../theme/useBrandTokens";

export interface FilterTagItem {
  key: string;
  label: string;
  value: string;
  onClose: () => void;
}

interface Props {
  tags: FilterTagItem[];
  onClearAll: () => void;
}

// Shared "Applied Filters:" bar — one removable pill per active filter value
// plus a "Clear All" link. Presentational: callers build the tag list. Renders
// nothing when no filter is active.
export const FilterTagBar = ({ tags, onClearAll }: Props) => {
  const t = useBrandTokens();
  if (tags.length === 0) return null;

  return (
    <Space size={[8, 8]} wrap align="center" style={{ marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: t.textSecondary }}>Applied Filters:</span>
      {tags.map((tg) => (
        <Tag
          key={tg.key}
          closable
          onClose={tg.onClose}
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
            <span style={{ color: t.textSecondary }}>{tg.label}: </span>
            <span style={{ color: t.text, fontWeight: 600 }}>{tg.value}</span>
          </span>
        </Tag>
      ))}
      <a onClick={onClearAll} style={{ cursor: "pointer" }}>
        Clear All
      </a>
    </Space>
  );
};
