// Multi-select filter values travel comma-joined in the URL / query string
// ("zone-1,zone-2"). Missing or blank → empty list ("All").
export const splitCsv = (v: string | null | undefined): string[] =>
  v ? v.split(",").filter(Boolean) : [];
