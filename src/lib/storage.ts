// All persisted, on-device state. No account, no backend — matches the product's promise.

const SEEN_KEY = 'lua.hasOpenedBefore';
const COACH_SEEN_KEY = 'lua.coachSeen';
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

export function getUnlocked(): boolean {
  return safeGet(UNLOCKED_KEY) === '1';
}
export function setUnlocked(v: boolean) {
  safeSet(UNLOCKED_KEY, v ? '1' : '0');
}

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/**
 * Real consecutive-day streak, derived from the last date the app was opened.
 * The design prototype only ever showed a static tweak (`streakDays`); this is
 * the real thing it was standing in for — same today, +1 from yesterday,
 * reset to 1 after any gap.
 */
export function rollStreakOnOpen(): number {
  const today = todayKey();
  const last = safeGet(STREAK_LAST_KEY);
  const prevDays = Number(safeGet(STREAK_DAYS_KEY) || '0');
  if (last === today) return prevDays || 1;

  const yesterday = todayKey(new Date(Date.now() - 86400000));
  const days = last === yesterday ? prevDays + 1 : 1;
  safeSet(STREAK_DAYS_KEY, String(days));
  safeSet(STREAK_LAST_KEY, today);
  return days;
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
