import { Button, Checkbox, Popover, Typography } from "antd";
import { ControlOutlined } from "@ant-design/icons";

const { Text } = Typography;

// One toggleable column. `locked` columns stay visible and their checkbox is
// disabled (e.g. the Customer identity column).
export interface ColumnOption {
  key: string;
  title: string;
  locked?: boolean;
}

interface Props {
  options: ColumnOption[];
  /** Keys currently hidden. */
  hidden: Set<string>;
  onToggle: (key: string) => void;
  onReset: () => void;
}

// A "Columns" button that opens a checkbox list for showing/hiding table
// columns. Presentational — the page owns the visibility state (and persists
// it). The button shows an "X/Y" count while any column is hidden.
export const DebtorsColumnPicker = ({ options, hidden, onToggle, onReset }: Props) => {
  const shown = options.length - options.filter((o) => hidden.has(o.key)).length;
  const someHidden = shown < options.length;

  const content = (
    <div style={{ width: 240 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          Toggle columns
        </Text>
        <a onClick={onReset} style={{ fontSize: 12 }} aria-disabled={!someHidden}>
          Reset
        </a>
      </div>
      <div
        style={{
          maxHeight: 320,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {options.map((o) => (
          <Checkbox
            key={o.key}
            checked={!hidden.has(o.key)}
            disabled={o.locked}
            onChange={() => onToggle(o.key)}
          >
            {o.title}
          </Checkbox>
        ))}
      </div>
    </div>
  );

  return (
    <Popover content={content} trigger="click" placement="bottomRight">
      <Button icon={<ControlOutlined />}>
        Columns{someHidden ? ` (${shown}/${options.length})` : ""}
      </Button>
    </Popover>
  );
};
