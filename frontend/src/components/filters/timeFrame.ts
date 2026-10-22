import type { TimeFrame } from "../../types/finance";

// Time Frame dropdown options, in the Figma order. Values are the API's
// `timeFrame` enum; labels are the display copy. Kept in a plain module (not the
// component file) so the component stays Fast-Refresh friendly.
export const TIME_FRAME_OPTIONS: { value: TimeFrame; label: string }[] = [
  { value: "7d", label: "last 7 days" },
  { value: "14d", label: "last 14 days" },
  { value: "30d", label: "last 30 days" },
  { value: "last-month", label: "last month" },
];

export const DEFAULT_TIME_FRAME: TimeFrame = "7d";

// True when `value` is one of the known time-frame options (guards against a
// stray URL value).
export const isTimeFrame = (value: string | undefined): value is TimeFrame =>
  TIME_FRAME_OPTIONS.some((o) => o.value === value);
