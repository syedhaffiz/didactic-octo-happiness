// Null-safe display helpers shared by the Contracts screens. Every helper takes
// `unknown`-ish input (null / undefined / NaN) and degrades to an em dash, so a
// gap in the upstream data never renders as "NaN" or crashes a cell.

export const DASH = "—";

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

const fmt = (v: number, maxFrac: number, minFrac = 0) =>
  v.toLocaleString(undefined, { minimumFractionDigits: minFrac, maximumFractionDigits: maxFrac });

/** "1,807" */
export const formatCount = (v: number | null | undefined): string => (isNum(v) ? fmt(v, 0) : DASH);

/** Tile MT: million-tonne figures read as MMT ("1.92 MMT"), the rest as grouped MT ("27,672.36 MT"). */
export const formatMt = (v: number | null | undefined): string => {
  if (!isNum(v)) return DASH;
  if (Math.abs(v) >= 1_000_000) return `${fmt(v / 1_000_000, 2)} MMT`;
  return `${fmt(v, 2)} MT`;
};

/** Full-precision MT for tooltips, e.g. "1,922,925.39 MT". */
export const formatMtFull = (v: number | null | undefined): string =>
  isNum(v) ? `${fmt(v, 3)} MT` : DASH;

/** Grouped quantity (no unit), e.g. "10,000". */
export const formatQty = (v: number | null | undefined): string => (isNum(v) ? fmt(v, 3) : DASH);

/** Two-decimal amount, e.g. "7,600,000.00". */
export const formatAmount = (v: number | null | undefined): string =>
  isNum(v) ? fmt(v, 2, 2) : DASH;

/** Rupees → lakhs (2 dp) for the EMD chart. */
export const toLakhs = (rupees: number | null | undefined): number =>
  isNum(rupees) ? Math.round((rupees / 100_000) * 100) / 100 : 0;

/** Full rupee figure for tooltips, e.g. "₹ 14,31,000". */
export const formatRupees = (v: number | null | undefined): string =>
  isNum(v)
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(v)
    : DASH;

/** Rupees to the paisa, e.g. "₹6,820,166.01" / "−₹8,644.98". */
export const formatRupeesExact = (v: number | null | undefined): string =>
  isNum(v)
    ? `${v < 0 ? "-" : ""}₹${Math.abs(v).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : DASH;

/** Compact rupees for chart labels / axes, e.g. "₹68.2 L", "₹1.5 Cr", "-₹8.64K". */
export const formatRupeesCompact = (v: number | null | undefined): string => {
  if (!isNum(v)) return DASH;
  const compact = new Intl.NumberFormat("en-IN", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  }).format(Math.abs(v));
  return `${v < 0 ? "-" : ""}₹${compact}`;
};

/** "14-04-26" from "YYYY-MM-DD" (the Plot Rent table's date style). */
export const formatShortDate = (iso: string | null | undefined): string => {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return DASH;
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y.slice(2)}`;
};

/** "18 Apr 2026" from "YYYY-MM-DD"; em dash for missing / invalid input. */
export const formatPostingDate = (iso: string | null | undefined): string => {
  if (!iso) return DASH;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? DASH
    : d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

/** Share of `part` in `total` as a whole-number percentage (0 when total is 0). */
export const pctOf = (part: number, total: number): number =>
  total > 0 && Number.isFinite(part) ? Math.round((part / total) * 100) : 0;

/** Legend share label: "43%", or "<1%" for a non-zero sliver that rounds to 0. */
export const formatShare = (part: number, total: number): string => {
  const pct = pctOf(part, total);
  return pct === 0 && part > 0 ? "<1%" : `${pct}%`;
};

/** Text or em dash. */
export const textOr = (v: string | null | undefined): string => (v && v.trim() ? v : DASH);
