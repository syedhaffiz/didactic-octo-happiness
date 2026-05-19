import type { ForexResponse, ForexRange } from "../types/finance.js";
import { round, seedFromString, seeded } from "./rand.js";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export const buildForex = (range: ForexRange, anchor: Date): ForexResponse => {
  const rng = seeded(seedFromString(`forex:${range}:${anchor.getUTCFullYear()}-${anchor.getUTCMonth() + 1}`));
  const base = 92.5;
  const amplitude = 1.6;

  const length = range === "month" ? 30 : 7;
  const points = Array.from({ length }, (_, i) => {
    const r = rng();
    const t = i / Math.max(length - 1, 1);
    // Soft wave + jitter for a believable line.
    const wave = Math.sin(t * Math.PI * 2) * amplitude * 0.6;
    const rate = base + wave + (r - 0.5) * amplitude;
    return {
      day: range === "month" ? `D${i + 1}` : (WEEKDAYS[i % 7] as string),
      rate: round(rate, 4),
    };
  });

  const exchangeRate = points[points.length - 1]?.rate ?? base;
  const monthAverage = round(points.reduce((s, p) => s + p.rate, 0) / points.length, 2);

  return {
    range,
    points,
    exchangeRate,
    monthAverage,
  };
};
