import type { Unit } from "../types/finance";

// "Cr" represents crore = 10,000,000; "MMT" = million metric tonnes; "Days" is unitless.
const CR = 10_000_000;
const MMT = 1_000_000;

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
  const withCommas = rounded.toLocaleString("en-IN");
  if (unit === "Cr") return `₹ ${withCommas}`;
  if (unit === "MMT") return `${withCommas} t`;
  return `${withCommas} days`;
};

export const formatValueWithUnit = (value: number, unit: Unit): string => {
  if (unit === "Days") return String(Math.round(value));
  return `${value}`;
};

export const formatSigned = (n: number): string => (n >= 0 ? `+${n}%` : `${n}%`);

export const formatNumberCompact = (n: number): string => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
};

// e.g. -2,500 -> "(2,500)" like the Figma's Profit column.
export const formatAccounting = (n: number): string => {
  const abs = Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return n < 0 ? `(${abs})` : abs;
};
