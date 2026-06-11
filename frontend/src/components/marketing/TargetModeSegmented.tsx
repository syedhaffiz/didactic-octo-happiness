import { Segmented } from "antd";

export type TargetMode = "portwise" | "originwise" | "segmentwise";

export const DEFAULT_MODE: TargetMode = "portwise";

export const isTargetMode = (v: string | undefined): v is TargetMode =>
  v === "portwise" || v === "originwise" || v === "segmentwise";

const MODES: { value: TargetMode; label: string }[] = [
  { value: "portwise", label: "Port Wise" },
  { value: "originwise", label: "Origin Wise" },
  { value: "segmentwise", label: "Segment Wise" },
];

export const TargetModeSegmented = ({
  value,
  onChange,
}: {
  value: TargetMode;
  onChange: (mode: TargetMode) => void;
}) => (
  <Segmented<TargetMode>
    options={MODES}
    value={value}
    onChange={onChange}
    style={{ marginBottom: 16 }}
  />
);
