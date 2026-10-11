import { describe, expect, it } from 'vitest';
import { DEFAULT_STAGE_DURATIONS_MS, growthAt } from '../src/lib/growth';

const D = DEFAULT_STAGE_DURATIONS_MS;
const TOTAL = D.reduce((a, b) => a + b, 0);
const T0 = 1_700_000_000_000;

describe('growthAt', () => {
  it('starts as a seed at the moment of planting', () => {
    const g = growthAt(T0, T0);
    expect(g).toMatchObject({ stage: 'seed', stageIndex: 0, progress: 0, complete: false });
  });

  it('moves to the next stage exactly at each boundary', () => {
    let t = 0;
    const names = ['sprout', 'stem', 'leaves', 'bloom'];
    for (let i = 0; i < names.length; i++) {
      t += D[i];
      expect(growthAt(T0, T0 + t - 1).stageIndex).toBe(i);
      const g = growthAt(T0, T0 + t);
      expect(g.stage).toBe(names[i]);
      expect(g.stageProgress).toBe(0);
    }
  });

  it('is complete at and after the total duration', () => {
    expect(growthAt(T0, T0 + TOTAL)).toMatchObject({ stage: 'bloom', progress: 1, complete: true });
    expect(growthAt(T0, T0 + TOTAL * 50).complete).toBe(true);
  });

  it('never goes backwards as time advances', () => {
    let prev = -1;
    for (let i = 0; i <= 200; i++) {
      const p = growthAt(T0, T0 + (TOTAL * i) / 200).progress;
      expect(p).toBeGreaterThanOrEqual(prev);
      prev = p;
    }
  });

  it('is deterministic: same inputs, same output, no hidden state', () => {
    const now = T0 + 13.5 * 60 * 60 * 1000;
    expect(growthAt(T0, now)).toEqual(growthAt(T0, now));
  });

  it('reconstructs the same state after a long gap (reopen)', () => {
    const later = T0 + 30 * 60 * 60 * 1000;
    const watchedAllAlong = [1, 5, 10, 20, 30].map((h) => growthAt(T0, T0 + h * 3.6e6)).pop();
    expect(growthAt(T0, later)).toEqual(watchedAllAlong);
  });

  it('treats a clock before planting or invalid timestamps as just planted', () => {
    expect(growthAt(T0, T0 - 5000).progress).toBe(0);
    expect(growthAt(NaN, T0).stage).toBe('seed');
    expect(growthAt(T0, Infinity).stage).toBe('seed');
  });

  it('rejects invalid duration tables', () => {
    expect(() => growthAt(T0, T0, [1, 2, 3])).toThrow(RangeError);
    expect(() => growthAt(T0, T0, [1, 1, 0, 1, 1])).toThrow(RangeError);
  });
});
