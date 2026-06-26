import type { Unit } from "../types/finance";

// "Cr" represents crore = 10,000,000; "MMT" = million metric tonnes; "Days" is unitless.
const CR = 10_000_000;
const MMT = 1_000_000;

// Locale for all number formatting — follows the user's browser language,
// falling back to en-US outside the browser (build / SSR).
const LOCALE =
  typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";

// Cache Intl.NumberFormat instances — constructing one is relatively expensive,
// so we reuse a formatter per distinct set of options.
const formatterCache = new Map<string, Intl.NumberFormat>();
const numberFormat = (options?: Intl.NumberFormatOptions): Intl.NumberFormat => {
  const key = JSON.stringify(options ?? {});
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
};

export const expandRaw = (value: number, unit: Unit): number => {
  switch (unit) {
    case "Cr":
      return value * CR;
    case "MMT":
      return value * MMT;
    case "Days":
      return value;
  }
};

export const formatRawWithCommas = (value: number, unit: Unit): string => {
  const raw = expandRaw(value, unit);
  const rounded = unit === "MMT" ? raw : Math.round(raw);
  const withCommas = numberFormat().format(rounded);
  if (unit === "Cr") return `₹ ${withCommas}`;
  if (unit === "MMT") return `${withCommas} t`;
  return `${withCommas} days`;
};

export const formatSigned = (n: number): string => (n >= 0 ? `+${n}%` : `${n}%`);

// Rupee currency formatter for ledger amounts (already raw INR). Uses the INR
// currency style so the ₹ symbol and grouping come from Intl; whole rupees
// only — these balances are large enough that paise add noise.
export const formatInr = (value: number): string =>
  numberFormat({ style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

// Compact thousands formatter for chart axes/labels (e.g. 350000 → "350K").
// Tolerates non-numeric / non-finite input (returns ""). Grouping is disabled on
// the abbreviated value so the axis reads "1000K" rather than "1,000K".
export const fmtK = (n: unknown): string => {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return "";
  if (Math.abs(v) >= 1000) {
    return `${numberFormat({ maximumFractionDigits: 0, useGrouping: false }).format(
      Math.round(v / 1000),
    )}K`;
  }
  return numberFormat({ maximumFractionDigits: 1 }).format(v);
};

// e.g. -2,500 -> "(2,500)" like the Figma's Profit column.
export const formatAccounting = (n: number): string => {
  const abs = numberFormat({ maximumFractionDigits: 2 }).format(Math.abs(n));
  return n < 0 ? `(${abs})` : abs;
};
