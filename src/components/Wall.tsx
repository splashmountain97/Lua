import { useEffect, useRef, useState } from 'react';
import moonBody from '../assets/moon-body.png';
import glassSwirl from '../assets/glass-swirl.png';

export type Door = 'life' | 'world' | 'day' | 'save';

// Two kinds of ask, because the address means two different things.
//
// Behind a category it means "tell me when this is built". Behind a limit that
// sentence does not hold: nothing is being unlocked and the count comes back on
// its own tomorrow, so an email offering to announce *that* is worthless and
// the reader knows it. The limit doors promise the limit's removal instead.
const LOCKED = 'This one’s still behind the moon. Leave your email and we’ll let you know the moment it unlocks.';
const lifts = (what: string) =>
  `${what} — for now. Leave your email and we’ll let you know the moment that limit goes away.`;

interface DoorCopy {
  kicker: string; head: string; body: string; cta: string; dismiss: string;
}

// The promise is identical whichever gate you hit, so it cannot read as four
// different products. Only the kicker, the headline and the dismiss change.
//
// The day door leads with 'Come back tomorrow' rather than 'Not open yet': it
// is the one gate where the thing refused arrives by itself.
const DOORS: Record<Door, DoorCopy> = {
  life: {
    kicker: 'Life · not open yet', head: 'Not open yet', body: LOCKED,
    cta: 'Tell me when it opens', dismiss: 'Stay with Self for now',
  },
  world: {
    kicker: 'World · not open yet', head: 'Not open yet', body: LOCKED,
    cta: 'Tell me when it opens', dismiss: 'Stay with Self for now',
  },
  day: {
    kicker: 'Five a day · free limit', head: 'Come back tomorrow',
    body: lifts('Five questions a day is the free limit'),
    cta: 'Tell me when it lifts', dismiss: 'That’s enough for today',
  },
  save: {
    kicker: 'Twenty saved · free limit', head: 'Full — for now',
    body: lifts('Twenty saved is the free limit'),
    cta: 'Tell me when it lifts', dismiss: 'I’ll clear a few first',
  },
};

const WINDOW: React.CSSProperties = {
  position: 'absolute', left: '42.94%', top: '17.82%', width: '34.8%', height: '34.8%',
  borderRadius: '50%',
};

const reduced = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

interface WallProps {
  door: Door | null;
  onClose: () => void;
  /** Called once, with a valid address. */
  onJoin: (door: Door, email: string) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}

// One wall, four doors.
//
// Nothing here grants anything. There is no payment, no pricing, no restore and
// no unlock — the entire outcome is an address left for a list, and whether
// anyone leaves one is the result being measured. `lua.unlocked` stays where it
// is, untouched, and Unlock.tsx stays parked.
//
// It renders inside the canvas rather than a portal: the stage is scaled.
export default function Wall({ door, onClose, onJoin, returnFocusRef }: WallProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
  const openRef = useRef<Door | null>(null);
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const soft = reduced();

  useEffect(() => {
    if (!door) { openRef.current = null; return; }
    if (openRef.current === door) return;
    openRef.current = door;
    setEmail(''); setNote(''); setSent(false);
    fieldRef.current?.focus();
  }, [door]);

  const closeRef = useRef(() => {});
  useEffect(() => { closeRef.current = () => close(); });

  useEffect(() => {
    if (!door) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const card = cardRef.current;
      if (!card) return;
      const stops = [...card.querySelectorAll<HTMLElement>('input, button')];
      const at = stops.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey
        ? (at <= 0 ? stops.length - 1 : at - 1)
        : (at === stops.length - 1 ? 0 : at + 1);
      e.preventDefault();
      stops[next]?.focus();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [door]);

  function close() {
    returnFocusRef.current?.focus();
    onClose();
  }

  // A soft wall never scolds. An empty or malformed address gets the same muted
  // grey the field already sits beside, and the ring goes a shade dimmer — no
  // red, no shake, no icon. Nothing here is a failure.
  function submit() {
    if (!door) return;
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setNote(value ? 'That address looks incomplete — mind checking it?' : 'An address first, then we can tell you.');
      return;
    }
    setNote('');
    setSent(true);
    onJoin(door, value);
  }

  if (!door) return null;
  const copy = DOORS[door];

  return (
    <>
      <div
        onPointerDown={(e) => { e.stopPropagation(); close(); }}
        style={{
          position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(6,6,12,.82)',
          animation: soft ? undefined : 'lua-dim 220ms linear both',
        }}
      />

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={copy.kicker}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', zIndex: 41, left: 22, right: 22, top: '50%',
          // The `translate` longhand, deliberately: lua-rise ends on
          // `transform: none` and fills forwards, so a transform-based centring
          // would be overridden the moment the animation finished and the card
          // would sit half its own height low.
          translate: '0 -50%',
          padding: '30px 24px 22px', borderRadius: 8, background: '#20222f',
          boxShadow: '0 0 0 1px #3f424d, 0 26px 60px rgba(0,0,0,.72)',
          animation: soft ? undefined : 'lua-rise 280ms cubic-bezier(.28,1,.34,1) both',
        }}
      >
        {/* The object the reader already knows, with its light out and the
            accent surviving only in the lock. No new asset, and nothing has to
            be explained about what is shut. */}
        <div style={{ position: 'relative', width: 124, height: 124, margin: '0 auto 22px' }}>
          <img src={moonBody} alt="" style={{
            width: '100%', height: '100%', display: 'block',
            filter: 'grayscale(.72) brightness(.5) contrast(.94)',
          }} />
          <div style={{ ...WINDOW, overflow: 'hidden', background: '#0d0e16' }}>
            {/* Held still: the swirl turning would read as working. */}
            <img src={glassSwirl} alt="" style={{
              position: 'absolute', left: '-8%', top: '-8%', width: '116%', height: '116%',
              filter: 'blur(1.2px) grayscale(.8) brightness(.34)',
            }} />
          </div>
          <div style={{
            ...WINDOW, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 2px 5px rgba(233,237,245,.12), inset 0 -8px 15px rgba(0,0,0,.7), inset 0 0 0 1px rgba(233,237,245,.06)',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(181,171,252,.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4.5" y="10.5" width="15" height="10" rx="1.8" />
              <path d="M8 10.5V7.4a4 4 0 0 1 8 0v3.1" />
            </svg>
          </div>
        </div>

        <div style={{
          font: '500 9.5px/1 ui-monospace,Menlo,monospace', letterSpacing: '.16em',
          textTransform: 'uppercase', color: '#75798c', textAlign: 'center', margin: '0 0 12px',
        }}>{copy.kicker}</div>

        {sent ? (
          <>
            <h2 style={{ margin: '0 0 11px', font: '300 26px/1.2 Inter,sans-serif', letterSpacing: '-.03em', color: '#f0eef2', textAlign: 'center' }}>
              You’re on the list
            </h2>
            {/* The second sentence is the point: the app's whole promise is that
                it keeps nothing, so the one time it asks for something it says
                what it will and will not do with it. */}
            <p style={{ margin: '0 0 22px', font: '400 13.5px/1.62 Inter,sans-serif', color: '#b2b6ca', textAlign: 'center', textWrap: 'pretty' }}>
              One message, when that happens. Nothing else — that hasn’t changed.
            </p>
            <button type="button" onClick={close} style={{
              width: '100%', height: 48, borderRadius: 100, cursor: 'pointer',
              border: '1px solid rgba(145,132,217,.55)', background: 'rgba(145,132,217,.08)',
              color: '#d2cefd', font: '400 14.5px/1 Inter,sans-serif', letterSpacing: '.02em',
            }}>Back to your question</button>
          </>
        ) : (
          <>
            <h2 style={{ margin: '0 0 11px', font: '300 26px/1.2 Inter,sans-serif', letterSpacing: '-.03em', color: '#f0eef2', textAlign: 'center' }}>
              {copy.head}
            </h2>
            <p style={{ margin: '0 0 20px', font: '400 13.5px/1.62 Inter,sans-serif', color: '#b2b6ca', textAlign: 'center', textWrap: 'pretty' }}>
              {copy.body}
            </p>

            <input
              ref={fieldRef}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-label="Email address"
              aria-describedby="lua-wall-note"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setNote(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              style={{
                width: '100%', height: 46, padding: '0 15px', margin: '0 0 9px',
                border: 0, borderRadius: 8, background: 'rgba(233,237,245,.04)',
                boxShadow: `inset 0 0 0 1px ${note ? 'rgba(147,151,171,.45)' : '#3f424d'}`,
                color: '#f0eef2', font: '400 14px/1 Inter,sans-serif', transition: 'box-shadow .2s',
              }}
            />
            {/* Always present, so validating never moves the button under a thumb. */}
            <div id="lua-wall-note" aria-live="polite" style={{
              minHeight: 17, margin: '0 0 12px', padding: '0 3px',
              font: '400 11.5px/1.45 Inter,sans-serif', color: '#9397ab',
            }}>{note}</div>

            <button type="button" onClick={submit} style={{
              width: '100%', height: 48, borderRadius: 100, cursor: 'pointer',
              border: '1px solid rgba(145,132,217,.55)', background: 'rgba(145,132,217,.08)',
              color: '#d2cefd', font: '400 14.5px/1 Inter,sans-serif', letterSpacing: '.02em',
            }}>{copy.cta}</button>
            <button type="button" onClick={close} style={{
              width: '100%', padding: '11px 0 2px', background: 'none', border: 0,
              cursor: 'pointer', color: '#75798c', font: '400 12px/1 Inter,sans-serif',
            }}>{copy.dismiss}</button>
          </>
        )}

        <button type="button" onClick={close} aria-label="Close" style={{
          position: 'absolute', top: 4, right: 4, width: 44, height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 0, cursor: 'pointer', color: 'rgba(147,151,171,.75)',
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6" />
          </svg>
        </button>
      </div>
    </>
  );
}
