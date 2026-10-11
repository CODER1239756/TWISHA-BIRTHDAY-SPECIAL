/**
 * Deterministic plant growth.
 *
 * Growth is a pure function of (when a thought was planted, what time it is
 * now). Nothing about animation is ever stored: on reopen the garden calls
 * growthAt() again for every saved thought and gets the same answer a
 * continuously-open tab would have shown.
 *
 * NOTE (Stage 1): this module is tested but not yet wired to the UI. The
 * stage durations are PLACEHOLDERS to be tuned in Stage 3.
 */

export const STAGES = ['seed', 'sprout', 'stem', 'leaves', 'bloom'] as const;
export type Stage = (typeof STAGES)[number];

const HOUR = 60 * 60 * 1000;

/** Time spent in each stage before moving to the next, in ms. The final
 *  stage ("bloom") has a duration too: it is the time over which the bloom
 *  opens fully. PLACEHOLDER values: 72 hours in total. */
export const DEFAULT_STAGE_DURATIONS_MS: readonly number[] = [
  2 * HOUR,
  10 * HOUR,
  20 * HOUR,
  20 * HOUR,
  20 * HOUR,
];

export interface GrowthState {
  /** Overall progress, 0 (just planted) to 1 (fully bloomed). */
  progress: number;
  stage: Stage;
  stageIndex: number;
  /** Progress inside the current stage, 0 to 1. */
  stageProgress: number;
  /** True once the plant has finished growing. */
  complete: boolean;
}

export function growthAt(
  plantedAt: number,
  now: number,
  durations: readonly number[] = DEFAULT_STAGE_DURATIONS_MS,
): GrowthState {
  if (durations.length !== STAGES.length || durations.some((d) => !(d > 0))) {
    throw new RangeError(`durations must be ${STAGES.length} positive numbers`);
  }

  const total = durations.reduce((a, b) => a + b, 0);
  // Bad timestamps or a clock set before planting both read as "just planted".
  let elapsed = Number.isFinite(plantedAt) && Number.isFinite(now) ? now - plantedAt : 0;
  if (elapsed < 0) elapsed = 0;

  if (elapsed >= total) {
    return {
      progress: 1,
      stage: 'bloom',
      stageIndex: STAGES.length - 1,
      stageProgress: 1,
      complete: true,
    };
  }

  let remaining = elapsed;
  for (let i = 0; i < STAGES.length; i++) {
    const d = durations[i];
    if (remaining < d) {
      return {
        progress: elapsed / total,
        stage: STAGES[i],
        stageIndex: i,
        stageProgress: remaining / d,
        complete: false,
      };
    }
    remaining -= d;
  }
  // Unreachable: elapsed < total always lands in a stage above.
  throw new Error('growthAt: no stage matched');
}
