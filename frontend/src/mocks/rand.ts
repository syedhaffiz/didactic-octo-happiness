// Deterministic LCG. Same seed → same sequence. Cheap, stable across runs so
// mock fixtures don't reshuffle on every render.
export const seeded = (seed: number) => {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
};

export const seedFromString = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
};

export const range = (rng: () => number, min: number, max: number) =>
  min + rng() * (max - min);

export const intRange = (rng: () => number, min: number, max: number) =>
  Math.floor(range(rng, min, max + 1));

export const pick = <T>(rng: () => number, items: readonly T[]): T => {
  if (items.length === 0) throw new Error("pick: empty");
  const idx = Math.floor(rng() * items.length);
  return items[Math.min(idx, items.length - 1)] as T;
};

export const round = (n: number, decimals = 1) => {
  const m = 10 ** decimals;
  return Math.round(n * m) / m;
};
