import { useEffect, useRef, useState } from 'react';
import { CATS, PROMPTS, promptIndexById, type CategoryId, type Weight, shareText } from '../data/content';
import { IDLE_FIRST, IDLE_RETURN, IDLE_TIPS, SETTLING } from '../data/content';
import { PHASES, REVEAL_MS, type Phase } from '../lib/phases';
import { copyOnly, shareOrCopy, sharedPromptId } from '../lib/share';
import { trackPromptShown } from '../lib/analytics';
import {
  getCoachSeen, getPillIntroSeen, getPrefs, getUnlocked, hasOpenedBefore,
  markCoachSeen, markOpened, markPillIntroSeen, rollStreakOnOpen, savePrefs, setUnlocked as persistUnlocked,
} from '../lib/storage';

export type Screen = 'onboard1' | 'home' | 'streak' | 'unlock';

interface LuaState {
  screen: Screen;
  phase: Phase;
  selected: CategoryId[];
  weight: Weight | null;
  infoOpen: CategoryId | null;
  promptIx: number;
  tiltX: number; tiltY: number; energy: number;
  /** A question arrived at through a share link, held back for the next reveal. */
  pinnedIx: number | null;
  /** The last question actually put on screen, so the next draw can avoid it. */
  lastShownIx: number;
  unlocked: boolean;
  holding: boolean;
  shareNote: string | null;
  /** The nudge above the moon, in the slot 'Ready to begin?' used to hold. */
  idleLine: string;
  /** The longer tip below the moon. Always present, alongside the nudge above. */
  tipLine: string;
  /** The line held while the object settles, drawn as the pause begins. */
  settlingLine: string;
  motionGranted: boolean;
}

function sharedIndex(): number | null {
  const id = sharedPromptId();
  if (id === null) return null;
  const ix = promptIndexById(id);
  return ix >= 0 ? ix : null;
}

const INTRO_DONE = 2;

const TILT_AMT = 1;
const QUIET_PILLS = true;

function pick(s: Pick<LuaState, 'selected' | 'weight' | 'lastShownIx'>): number {
  const sel = s.selected.length ? s.selected : CATS.map(c => c.id);
  const w = s.weight;
  let pool = PROMPTS.filter(p => sel.includes(p.c) && (w === null || p.w === w));
  if (!pool.length) pool = PROMPTS.filter(p => sel.includes(p.c));
  // Never hand back the question just shown. Drawing blind from the whole pool
  // repeats often enough to read as a bug, and a filter narrowing the pool to a
  // couple of dozen makes it common rather than rare.
  const last = PROMPTS[s.lastShownIx];
  const fresh = pool.length > 1 ? pool.filter(p => p !== last) : pool;
  const p = fresh[Math.floor(Math.random() * fresh.length)] || PROMPTS[0];
  return PROMPTS.indexOf(p);
}

export function useLua() {
  const startedOpen = hasOpenedBefore();
  const [sharedIx] = useState(sharedIndex);
  // World is off to begin with: the first question should land somewhere a
  // newcomer can answer from their own week, not out at the edge of the
  // existential. It is one tap away, and only the default changes — anyone who
  // has already set their filters keeps what they chose.
  const initialPrefs = getPrefs({ selected: ['you', 'life'], weight: null });

  const [state, setState] = useState<LuaState>(() => ({
    // A shared link opens on the question, full stop. Sending a first-time
    // visitor to the welcome screen first meant someone handed a specific
    // question arrived at a pitch and had to go looking for it — and a link
    // opened in a private tab, where nobody counts as returning, always landed
    // there. The welcome screen is still what a cold visitor to the root gets.
    screen: sharedIx !== null || startedOpen ? 'home' : 'onboard1',
    phase: sharedIx !== null ? 'settled' : 'idle',
    selected: initialPrefs.selected as CategoryId[],
    weight: initialPrefs.weight as Weight | null,
    infoOpen: null,
    promptIx: sharedIx ?? 0,
    tiltX: 0, tiltY: 0, energy: 0,
    pinnedIx: null,
    lastShownIx: sharedIx ?? -1,
    unlocked: getUnlocked(),
    holding: false,
    shareNote: null,
    idleLine: IDLE_FIRST[0],
    tipLine: IDLE_TIPS[0],
    settlingLine: SETTLING[0],
    motionGranted: false,
  }));

  const [streakDays] = useState(() => rollStreakOnOpen());
  const [coachSeen, setCoachSeenState] = useState(getCoachSeen());
  // The filter intro runs as two beats — subject, then difficulty — kept under
  // one flag because it is one moment, not a tour to be resumed part-way.
  const [introStep, setIntroStep] = useState(() => (getPillIntroSeen() ? INTRO_DONE : 0));

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const idleShownOnceRef = useRef(startedOpen);
  const shakeBoundRef = useRef(false);
  const motionAskedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  function patch(p: Partial<LuaState> | ((s: LuaState) => Partial<LuaState>)) {
    setState(s => ({ ...s, ...(typeof p === 'function' ? p(s) : p) }));
  }
  function after(ms: number, fn: () => void) {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }
  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }
  useEffect(() => clearTimers, []);

  /** Draw from a pool, never handing back the line already on screen. */
  function drawLine(pool: string[], current: string): string {
    const fresh = pool.filter(l => l !== current);
    const from = fresh.length ? fresh : pool;
    return from[Math.floor(Math.random() * from.length)];
  }

  function rollIdleLine() {
    const returning = idleShownOnceRef.current || hasOpenedBefore();
    idleShownOnceRef.current = true;
    markOpened();
    // A first-ever open always gets the dedicated pool — a newcomer needs
    // telling what to do, not a thought about journaling. After that the nudge
    // is the norm and the tip is the quarter-of-the-time surprise.
    // Two slots, both always filled: the nudge above the moon in the slot
    // 'Ready to begin?' held, and a longer tip below it. A first-ever open takes
    // the dedicated nudge pool — someone opening this for the first time needs
    // telling what the object does — but still gets a tip underneath.
    // Drawn outside the updater: React re-runs updaters under StrictMode, and a
    // draw inside one can settle on a line other than the one committed.
    const s = stateRef.current;
    patch({
      idleLine: drawLine(returning ? IDLE_RETURN : IDLE_FIRST, s.idleLine),
      tipLine: drawLine(IDLE_TIPS, s.tipLine),
    });
  }

  // A returning user skips the welcome screen (and so never calls
  // rollIdleLine via askMotion) — roll the real line once on mount instead of
  // leaving the idle placeholder showing.
  useEffect(() => {
    if (startedOpen) rollIdleLine();
    else if (sharedIx !== null) markOpened();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startShakeWatch() {
    if (shakeBoundRef.current) return;
    shakeBoundRef.current = true;
    let last = 0;
    window.addEventListener('devicemotion', (ev: DeviceMotionEvent) => {
      const a = ev.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
      const now = Date.now();
      if (mag < 26 || now - last < 220) return;
      last = now;
      if (stateRef.current.screen !== 'home') return;
      if (stateRef.current.phase === 'idle') {
        clearTimers();
        patch({ holding: true, phase: 'agitate', energy: 0.6 });
        after(900, () => { if (stateRef.current.holding) onUp(); });
      } else if (stateRef.current.phase === 'agitate') {
        patch(s => ({ energy: Math.min(1, s.energy + 0.12) }));
      }
    });
  }

  // Real DeviceMotion permission only grants inside a user gesture, so this
  // is invoked both from the welcome button and lazily from the first tap on
  // the object for a returning user who skipped the welcome screen.
  function requestMotionPermission(onSettled?: (granted: boolean) => void) {
    if (motionAskedRef.current) { onSettled?.(stateRef.current.motionGranted); return; }
    motionAskedRef.current = true;
    const DME = (window as unknown as { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent;
    const finish = (ok: boolean) => {
      if (ok) startShakeWatch();
      patch({ motionGranted: ok });
      onSettled?.(ok);
    };
    if (DME && typeof DME.requestPermission === 'function') {
      DME.requestPermission().then(r => finish(r === 'granted')).catch(() => finish(false));
    } else {
      finish(!!DME);
    }
  }

  function askMotion() {
    requestMotionPermission(() => {
      const shared = stateRef.current.pinnedIx !== null;
      rollIdleLine();
      go('home', shared ? 'settled' : 'idle');
    });
  }

  function go(screen: Screen, phase: Phase = 'idle') {
    clearTimers();
    patch(s => ({
      screen, phase, infoOpen: null, tiltX: 0, tiltY: 0, holding: false,
      energy: phase === 'anticipate' || phase === 'agitate' ? 1 : 0,
      promptIx: phase === 'settled' ? (s.pinnedIx ?? pick(s)) : s.promptIx,
      pinnedIx: phase === 'settled' ? null : s.pinnedIx,
      lastShownIx: phase === 'settled' ? (s.pinnedIx ?? s.lastShownIx) : s.lastShownIx,
    }));
  }

  function onDown(e: React.PointerEvent) {
    if (state.screen !== 'home') return;
    if ((e.target as HTMLElement)?.closest?.('button')) return;
    requestMotionPermission();
    const ph = state.phase;
    if (ph === 'settled') { dismiss(); return; }
    if (ph !== 'idle') return;
    clearTimers();
    patch({ holding: true, phase: 'agitate', energy: .5, infoOpen: null });
  }

  function onMove(e: React.PointerEvent) {
    if (state.screen !== 'home') return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
    patch(s => ({
      tiltX: nx * 26 * TILT_AMT, tiltY: ny * 16 * TILT_AMT,
      energy: s.holding ? Math.min(1, s.energy + .06) : s.energy,
    }));
  }

  // The index is resolved here rather than inside the state updater: React
  // re-runs updaters under StrictMode, and an analytics call in one would
  // report two reveals for every one the reader saw.
  function reveal() {
    const s = stateRef.current;
    const ix = s.pinnedIx ?? pick(s);
    patch({ phase: 'reveal', promptIx: ix, pinnedIx: null, lastShownIx: ix });
    trackPromptShown(PROMPTS[ix]);
    after(REVEAL_MS, () => patch({ phase: 'settled' }));
  }

  function onUp() {
    if (stateRef.current.screen !== 'home' || !stateRef.current.holding) return;
    patch({
      holding: false, phase: 'anticipate', tiltX: 0, tiltY: 0,
      settlingLine: drawLine(SETTLING, stateRef.current.settlingLine),
    });
    after(PHASES.anticipate.dur + 720, reveal);
  }

  // Both coach moments are dismissed by their own overlay rather than by the
  // gesture underneath it, so the tap that puts the dim away is not also the
  // tap that puts the question away.
  function dismissCoach() {
    if (coachSeen) return;
    setCoachSeenState(true);
    markCoachSeen();
  }

  function advanceIntro() {
    setIntroStep(step => {
      const next = step + 1;
      if (next >= INTRO_DONE) markPillIntroSeen();
      return next;
    });
  }

  function dismiss(e?: React.SyntheticEvent) {
    e?.stopPropagation();
    clearTimers();
    patch({ phase: 'dismiss' });
    if (!coachSeen) { setCoachSeenState(true); markCoachSeen(); }
    after(PHASES.dismiss.dur, () => { patch({ phase: 'idle' }); rollIdleLine(); });
  }

  function again(e?: React.SyntheticEvent) {
    e?.stopPropagation();
    clearTimers();
    // The unlock screen is parked until there is something to sell: it takes no
    // payment, and the offer on it (six hundred questions, one a day) describes
    // neither the pool the app ships with nor a limit anything enforces. Restore
    // this guard to put it back in the flow.
    patch({ phase: 'dismiss' });
    after(520, () => {
      patch({ phase: 'agitate', energy: 1 });
      after(700, () => {
        patch({ phase: 'anticipate', settlingLine: drawLine(SETTLING, stateRef.current.settlingLine) });
        after(PHASES.anticipate.dur + 620, reveal);
      });
    });
  }

  /** Take the question away to answer in your own words, wherever you keep them. */
  async function writeItDown(e?: React.SyntheticEvent) {
    e?.stopPropagation();
    await copyOnly(PROMPTS[stateRef.current.promptIx].t, (t) => {
      patch({ shareNote: t });
      after(2400, () => patch({ shareNote: null }));
    });
  }

  async function share(e?: React.SyntheticEvent) {
    e?.stopPropagation();
    const msg = shareText(PROMPTS[stateRef.current.promptIx]);
    await shareOrCopy(msg, (t) => {
      patch({ shareNote: t });
      after(2400, () => patch({ shareNote: null }));
    });
  }

  function toggleCategory(id: CategoryId, e?: React.SyntheticEvent) {
    e?.stopPropagation();
    patch(s => {
      const next = s.selected.includes(id) ? s.selected.filter(x => x !== id) : [...s.selected, id];
      const selected = next.length ? next : s.selected;
      savePrefs({ selected, weight: s.weight });
      return { selected, infoOpen: null };
    });
  }

  function toggleInfo(id: CategoryId, e?: React.SyntheticEvent) {
    e?.stopPropagation();
    patch(s => ({ infoOpen: s.infoOpen === id ? null : id }));
  }

  function setWeight(w: Weight | null, e?: React.SyntheticEvent) {
    e?.stopPropagation();
    patch(s => { savePrefs({ selected: s.selected, weight: w }); return { weight: w, infoOpen: null }; });
  }

  function goStreak(e?: React.SyntheticEvent) { e?.stopPropagation(); go('streak'); }
  function goHome() { rollIdleLine(); go('home', 'idle'); }
  function doUnlock() { persistUnlocked(true); patch({ unlocked: true }); go('home', 'idle'); }

  return {
    state, streakDays, coachSeen, introStep, quiet: QUIET_PILLS,
    actions: {
      askMotion, onDown, onMove, onUp, dismiss, again, share,
      toggleCategory, toggleInfo, setWeight, goStreak, goHome, doUnlock, writeItDown,
      dismissCoach, advanceIntro,
    },
  };
}
