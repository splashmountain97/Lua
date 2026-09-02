/**
 * The free limits, and the only place their numbers live.
 *
 * This is a fake door. Nothing here grants anything, takes payment, or unlocks:
 * the whole outcome of hitting a limit is a wall that asks whether you would
 * want it lifted. `lua.unlocked` is not touched by any of it.
 */

/** Reveals per calendar day, across the whole app — Self included. */
export const DAY_CAP = 5;

/**
 * Saved entries in total, not per day. It does not reset overnight: at the cap
 * the save control stays shut until something is removed, which is why removing
 * and un-saving are never blocked — the state has to be escapable.
 */
export const SAVE_CAP = 20;

/** The counter appears on the fourth, where it is a warning rather than a scoreboard. */
export const DAY_COUNTER_FROM = 4;

export const dayLabel = (used: number) => `${Math.min(used, DAY_CAP)} / ${DAY_CAP} today`;
