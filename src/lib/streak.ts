/**
 * The streak as a moon, in five bands across a thirty-day cycle.
 *
 * Waxing only. A real moon wanes back to new, and this one deliberately does
 * not: the number beside it is a run of days that is still unbroken, so an
 * indicator that dimmed on day 31 would report a loss where nothing has been
 * lost. It fills, then holds at full for as long as the streak survives.
 *
 * There is no calculation here beyond the mapping. Whether the run is still
 * alive, and what it is worth, is decided by readStreak and markStreakToday in
 * storage — this only draws whatever number those two arrive at, which is what
 * keeps the picture and the count from ever disagreeing.
 */
const PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕'] as const;

/** Days 1-6 new, then a phase every six days, full from 25 onwards. */
export function moonPhase(streakDays: number): string {
  if (streakDays <= 0) return PHASES[0];
  return PHASES[Math.min(PHASES.length - 1, Math.floor((streakDays - 1) / 6))];
}
