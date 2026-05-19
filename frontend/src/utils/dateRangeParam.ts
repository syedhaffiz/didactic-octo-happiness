import type { Dayjs } from "dayjs";

export const formatDateRangeParam = (
  value: [Dayjs | null, Dayjs | null] | null | undefined,
): string | undefined => {
  if (!value || !value[0] || !value[1]) return undefined;
  return `${value[0].format("YYYY-MM-DD")}:${value[1].format("YYYY-MM-DD")}`;
};
