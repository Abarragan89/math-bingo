/** How long a reel travels before it locks in. */
export const REEL_SPIN_MS = 1600;

/** The second reel stops this much later, which is what reads as a slot machine. */
export const REEL_STAGGER_MS = 450;

/** Total time from pressing Spin to the pair being called. */
export const TOTAL_SPIN_MS = REEL_SPIN_MS + REEL_STAGGER_MS;

export const AUTO_PRESETS_MS = [3000, 5000, 10000, 15000] as const;
export const AUTO_MIN_MS = 1000;
export const AUTO_MAX_MS = 30000;
export const AUTO_DEFAULT_MS = 5000;
