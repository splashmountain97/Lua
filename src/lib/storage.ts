// All persisted, on-device state. No account, no backend — matches the product's promise.

const SEEN_KEY = 'lua.hasOpenedBefore';
const COACH_SEEN_KEY = 'lua.coachSeen';
const PILL_INTRO_KEY = 'lua.pillIntroSeen';
const SHARE_COACH_KEY = 'lua.shareCoachSeen';
const STREAK_COACH_KEY = 'lua.streakCoachSeen';
const REVEALS_TOTAL_KEY = 'lua.revealsTotal';
const UNLOCKED_KEY = 'lua.unlocked';
const STREAK_DAYS_KEY = 'lua.streakDays';
const STREAK_LAST_KEY = 'lua.streakLastOpen';
const PREFS_KEY = 'lua.prefs';

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* private mode */ }
}

export function hasOpenedBefore(): boolean {
  return !!safeGet(SEEN_KEY);
}
export function markOpened() {
  safeSet(SEEN_KEY, '1');
}

export function getCoachSeen(): boolean {
  return !!safeGet(COACH_SEEN_KEY);
}
export function markCoachSeen() {
  safeSet(COACH_SEEN_KEY, '1');
}

export function getPillIntroSeen(): boolean {
  return !!safeGet(PILL_INTRO_KEY);
}
export function markPillIntroSeen() {
  safeSet(PILL_INTRO_KEY, '1');
}

export function getShareCoachSeen(): boolean {
  return !!safeGet(SHARE_COACH_KEY);
}
export function markShareCoachSeen() {
  safeSet(SHARE_COACH_KEY, '1');
}

export function getStreakCoachSeen(): boolean {
  return !!safeGet(STREAK_COACH_KEY);
}
export function markStreakCoachSeen() {
  safeSet(STREAK_COACH_KEY, '1');
}

/**
 * Questions revealed ever, not today — the share coach waits for the second
 * one, and a per-day count would offer it again on every new day.
 */
export function getRevealsTotal(): number {
  return Number(safeGet(REVEALS_TOTAL_KEY) || '0');
}
export function bumpRevealsTotal(): number {
  const next = getRevealsTotal() + 1;
  safeSet(REVEALS_TOTAL_KEY, String(next));
  return next;
}

export function getUnlocked(): boolean {
  return safeGet(UNLOCKED_KEY) === '1';
}
export function setUnlocked(v: boolean) {
  safeSet(UNLOCKED_KEY, v ? '1' : '0');
}

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const DAY_MS = 86400000;

/**
 * The streak as it stands, without touching it. A run is alive while the last
 * day counted is today or yesterday; once a whole day passes uncounted it is
 * broken, and reads as nothing until the next question is opened.
 */
export function readStreak(): number {
  const last = safeGet(STREAK_LAST_KEY);
  const days = Number(safeGet(STREAK_DAYS_KEY) || '0');
  if (!last || !days) return 0;
  return last === todayKey() || last === todayKey(new Date(Date.now() - DAY_MS)) ? days : 0;
}

/**
 * Count today towards the streak, at most once. Called when a question is
 * actually opened, not when the app is: the number is meant to say how many
 * days running someone has sat with a question, and merely arriving is not
 * that. A fifth question on the same day changes nothing.
 */
export function markStreakToday(): number {
  const today = todayKey();
  const last = safeGet(STREAK_LAST_KEY);
  const days = Number(safeGet(STREAK_DAYS_KEY) || '0');
  if (last === today) return days || 1;

  const yesterday = todayKey(new Date(Date.now() - DAY_MS));
  const next = last === yesterday ? days + 1 : 1;
  safeSet(STREAK_DAYS_KEY, String(next));
  safeSet(STREAK_LAST_KEY, today);
  return next;
}

export interface Prefs {
  selected: string[];
  weight: number | null;
}
export function getPrefs(fallback: Prefs): Prefs {
  const raw = safeGet(PREFS_KEY);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.selected)) return { selected: parsed.selected, weight: parsed.weight ?? null };
  } catch { /* ignore */ }
  return fallback;
}
export function savePrefs(prefs: Prefs) {
  safeSet(PREFS_KEY, JSON.stringify(prefs));
}
