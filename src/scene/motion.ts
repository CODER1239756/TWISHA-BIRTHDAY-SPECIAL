/** True when the OS asks for reduced motion; the scene then holds still. */
export const reducedMotion: boolean =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
