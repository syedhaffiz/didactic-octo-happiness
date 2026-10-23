// Multi-select filters arrive comma-joined ("zone-1,zone-2"). Blank entries and
// "all" mean no narrowing, so they're dropped; an empty list means "All".
export const csvList = (v: string | undefined): string[] =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && s !== "all");
