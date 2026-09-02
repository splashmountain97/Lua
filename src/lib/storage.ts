// All persisted, on-device state. No account, no backend — matches the product's promise.

const SEEN_KEY = 'lua.hasOpenedBefore';
const COACH_SEEN_KEY = 'lua.coachSeen';
const PILL_INTRO_KEY = 'lua.pillIntroSeen';
const SHARE_COACH_KEY = 'lua.shareCoachSeen';
const STREAK_COACH_KEY = 'lua.streakCoachSeen';
const REVEALS_TOTAL_KEY = 'lua.revealsTotal';
const WRITE_INTRO_KEY = 'lua.writeIntroSeen';
const SAVED_KEY = 'lua.saved';
const UNLOCKED_KEY = 'lua.unlocked';
const STREAK_DAYS_KEY = 'lua.streakDays';
const STREAK_LAST_KEY = 'lua.streakLastOpen';
const PREFS_KEY = 'lua.prefs';
const DAY_COUNT_KEY = 'lua.dayCount';
const WAITLIST_KEY = 'lua.waitlist';

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

/**
 * A question put aside, and whether it has been reflected on. That is the
 * whole record: the text, its category and its weight are looked up from
 * PROMPTS by id when the list is drawn, never written down. Nothing about
 * what someone thought, wrote, or did with a question is kept, which is the
 * same bargain the rest of the app makes.
 */
export interface SavedEntry { id: number; done: boolean }

export function getSaved(): SavedEntry[] {
  const raw = safeGet(SAVED_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Anything that is not the shape above is dropped rather than repaired:
    // this is a convenience list, and a half-understood entry is worth less
    // than a clean one.
    return parsed.filter((r): r is SavedEntry =>
      !!r && typeof r === 'object'
      && typeof (r as SavedEntry).id === 'number'
      && Number.isSafeInteger((r as SavedEntry).id)
      && typeof (r as SavedEntry).done === 'boolean');
  } catch {
    return [];
  }
}

export function setSaved(rows: SavedEntry[]) {
  safeSet(SAVED_KEY, JSON.stringify(rows));
}

/**
 * Whether the write modal has explained itself once. The first tap gets the
 * long form with the illustration; every tap after gets the short one.
 */
export function getWriteIntroSeen(): boolean {
  return !!safeGet(WRITE_INTRO_KEY);
}
export function markWriteIntroSeen() {
  safeSet(WRITE_INTRO_KEY, '1');
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

export function todayKey(d = new Date()): string {
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

/** Reveals opened today. Resets by itself: a count from another day reads 0. */
export function getDayCount(): number {
  const raw = safeGet(DAY_COUNT_KEY);
  if (!raw) return 0;
  try {
    const v: unknown = JSON.parse(raw);
    if (!v || typeof v !== 'object') return 0;
    const { day, n } = v as { day?: unknown; n?: unknown };
    if (day !== todayKey() || typeof n !== 'number' || !Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  } catch {
    return 0;
  }
}

export function bumpDayCount(): number {
  const next = getDayCount() + 1;
  safeSet(DAY_COUNT_KEY, JSON.stringify({ day: todayKey(), n: next }));
  return next;
}

/**
 * An address left at the wall, and which door it was left at.
 *
 * Local only: there is no backend, and this is a fake door. The one thing it
 * must not become is a quiet account, so nothing else is kept — not which
 * questions were seen, not when they were seen. Pointing this at a real
 * endpoint later is a change to this one function.
 */
export interface WaitlistEntry { email: string; door: string; at: number }

export function joinWaitlist(entry: WaitlistEntry) {
  let list: WaitlistEntry[] = [];
  try {
    const raw = safeGet(WAITLIST_KEY);
    const v: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(v)) list = v as WaitlistEntry[];
  } catch { /* a corrupt list is replaced, not repaired */ }
  safeSet(WAITLIST_KEY, JSON.stringify([...list, entry]));
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
