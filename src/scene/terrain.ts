/** Shared, deterministic terrain + seeded randomness (no Math.random). */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (t: number) => t * t * (3 - 2 * t);

export const WATER_LEVEL = -0.5;

/** Meadow height at (x, z). Gentle hills, sloping down into the lake at -z. */
export function heightAt(x: number, z: number): number {
  const hill =
    0.28 * Math.sin(x * 0.21 + 0.6) * Math.cos(z * 0.17) +
    0.14 * Math.sin(x * 0.55 + z * 0.4 + 1.3) +
    0.06 * Math.sin(x * 1.7 - z * 1.3);
  const shore = smooth(clamp01((-8 - z) / 8));
  const edge = smooth(clamp01((Math.abs(x) - 30) / 12));
  return hill * (1 - shore) - 1.3 * shore - 3 * edge;
}
