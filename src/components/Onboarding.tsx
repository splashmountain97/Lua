import { useEffect, useRef, useState } from 'react';
import { trackOnboarding } from '../lib/analytics';
import { useStageLayout } from '../lib/layout';
import MoonMini from './MoonMini';
import ob1 from '../assets/ob-1-ruins.jpeg';
import ob2 from '../assets/ob-2-walking.jpeg';
import { HEADS, BODY, type OnboardScreen } from '../data/onboarding';

// Three screens: two hand-drawn "paper" photos (ruins, moonwalk), then the
// real moon object — not a photographed visor. An earlier pass zoomed the
// final screen into the astronaut helmet's own visor, but that visor's swirl
// was baked into the photograph rather than drawn from glass-swirl.png, the
// one texture every other purple-and-gold moment in the app actually shares —
// so it could (and did) drift from the real brand colour. Screen three shows
// the object itself instead, which cannot drift from itself.

const SWIRL_S = 30;
const EASE = 'cubic-bezier(.28,1,.34,1)';

// Text position is measured up from the stage's bottom edge rather than down
// from its top, same reasoning throughout onboarding: the stage is 874 tall
// design-wise but renders shorter once real browser chrome takes its cut, and
// anchoring from the edge that's actually stable keeps the clearance to the
// button intact instead of the text drifting into it.
const TEXT_UP_FROM_BOTTOM = 412;
const UP_FROM_BOTTOM = { wordmark: 326, tagline: 238 };
const MOON_ABOVE_WORDMARK = 376;

function Grain() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .55,
      backgroundImage:
        'repeating-linear-gradient(27deg,rgba(120,104,84,.055) 0 1px,rgba(0,0,0,0) 1px 3px),' +
        'repeating-linear-gradient(114deg,rgba(120,104,84,.045) 0 1px,rgba(0,0,0,0) 1px 4px)',
    }} />
  );
}

function Dots({ active }: { active: 0 | 1 | 2 }) {
  return (
    <div style={{ display: 'flex', gap: 7, margin: '0 0 22px', paddingLeft: 2 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          display: 'block', width: 5, height: 5, borderRadius: '50%',
          background: i === active ? '#2A2724' : 'rgba(42,39,36,.26)',
        }} />
      ))}
    </div>
  );
}

export default function Onboarding({ onStart, onDone }: { onStart: () => void; onDone: () => void }) {
  const { height: stageH } = useStageLayout();
  const [screen, setScreen] = useState<OnboardScreen>(1);
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  const reducedRef = useRef(false);
  const typeTimer = useRef<number | undefined>(undefined);

  function typeHead(s: OnboardScreen) {
    clearTimeout(typeTimer.current);
    const full = HEADS[s];
    if (reducedRef.current) { setN(full.length); setDone(true); return; }
    setN(0);
    setDone(false);
    let i = 0;
    const step = () => {
      i++;
      setN(i);
      if (i >= full.length) { setDone(true); return; }
      // Dwell on the sentence break so the two halves read as two thoughts.
      const ch = full[i - 1];
      const extra = '.?!'.includes(ch) ? 430 : ',—;:'.includes(ch) ? 180 : 0;
      typeTimer.current = window.setTimeout(step, 34 + extra);
    };
    typeTimer.current = window.setTimeout(step, 420);
  }

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    typeHead(1);
    return () => clearTimeout(typeTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tapping the text completes the line rather than making anyone wait it out.
  function finishTyping() {
    clearTimeout(typeTimer.current);
    setN(HEADS[screen].length);
    setDone(true);
  }

  function goto(next: OnboardScreen) {
    setScreen(next);
    typeHead(next);
  }

  function complete() {
    onStart();
    trackOnboarding('completed');
    onDone();
  }

  function skip() {
    clearTimeout(typeTimer.current);
    onStart();
    trackOnboarding('skipped');
    onDone();
  }

  const dark = screen === 3;
  const textTop = stageH - TEXT_UP_FROM_BOTTOM;

  const skipStyle = (opacity: number, color: string): React.CSSProperties => ({
    position: 'absolute', top: 34, right: 16, minWidth: 64, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 0, background: 'none', cursor: 'pointer',
    font: '400 12.5px/1 "Source Sans 3",sans-serif', letterSpacing: '.07em',
    transition: 'opacity 900ms', opacity, color,
    // Two Skips share this corner and cross-fade, so one is always invisible
    // and, without this, always on top of the other — taking the tap.
    pointerEvents: opacity ? 'auto' : 'none',
  });

  const headline = (s: OnboardScreen, style: React.CSSProperties) => (
    <span style={style}>
      {HEADS[s].slice(0, n)}
      <span style={{
        display: 'inline-block', width: 2, height: '.86em', marginLeft: 5, verticalAlign: '-.06em',
        background: style.color as string, opacity: done ? 0 : 1,
      }} />
    </span>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: dark ? '#161826' : '#F4EFE6', overflow: 'hidden' }}>

      {screen === 1 && (
        <div style={{ position: 'absolute', inset: 0, animation: 'lua-dim 400ms linear both' }}>
          <img
            src={ob1} alt="" draggable={false}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 443, objectFit: 'cover', objectPosition: 'center 89%', display: 'block' }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 363, height: 96, background: 'linear-gradient(rgba(244,239,230,0),#F4EFE6 74%)' }} />

          <div onClick={finishTyping} style={{ position: 'absolute', left: 26, right: 26, top: textTop, cursor: 'pointer' }}>
            <h1 style={{ margin: '0 0 18px', font: '400 30px/1.2 Newsreader,Georgia,serif', letterSpacing: '-.011em', textWrap: 'pretty' }}>
              {headline(1, { color: '#2A2724' })}
            </h1>
            <p style={{ margin: 0, maxWidth: '55ch', font: '400 17px/1.68 "Source Sans 3",sans-serif', color: '#46423C', textWrap: 'pretty', transition: 'opacity 420ms linear', opacity: done ? 1 : 0 }}>{BODY[1][0]}</p>
            <p style={{ margin: '15px 0 0', maxWidth: '55ch', font: '400 17px/1.68 "Source Sans 3",sans-serif', color: '#46423C', textWrap: 'pretty', transition: 'opacity 420ms linear', opacity: done ? 1 : 0 }}>{BODY[1][1]}</p>
          </div>

          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 26px 42px' }}>
            <Dots active={0} />
            <button type="button" onClick={() => goto(2)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 52,
              border: '1px solid rgba(42,39,36,.34)', borderRadius: 999, cursor: 'pointer', background: 'transparent',
              color: '#2A2724', font: '500 17px/1 "Source Sans 3",sans-serif', letterSpacing: '.012em',
            }}>Continue</button>
          </div>

          <div style={{ position: 'absolute', left: 28, top: 70, pointerEvents: 'none', font: '400 19px/1 Newsreader,Georgia,serif', letterSpacing: '.02em', color: 'rgba(42,39,36,.62)' }}>Lua</div>
          <Grain />
        </div>
      )}

      {screen === 2 && (
        <div style={{ position: 'absolute', inset: 0, animation: 'lua-dim 400ms linear both' }}>
          <img
            src={ob2} alt="" draggable={false}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 443, objectFit: 'cover', objectPosition: 'center 72%', display: 'block' }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 363, height: 96, background: 'linear-gradient(rgba(244,239,230,0),#F4EFE6 74%)' }} />

          <div onClick={finishTyping} style={{ position: 'absolute', left: 26, right: 26, top: textTop, cursor: 'pointer' }}>
            <h1 style={{ margin: '0 0 18px', font: '400 30px/1.2 Newsreader,Georgia,serif', letterSpacing: '-.011em', textWrap: 'pretty' }}>
              {headline(2, { color: '#2A2724' })}
            </h1>
            <p style={{ margin: 0, maxWidth: '55ch', font: '400 17px/1.68 "Source Sans 3",sans-serif', color: '#46423C', textWrap: 'pretty', transition: 'opacity 420ms linear', opacity: done ? 1 : 0 }}>{BODY[2][0]}</p>
            <p style={{ margin: '15px 0 0', maxWidth: '55ch', font: '400 17px/1.68 "Source Sans 3",sans-serif', color: '#46423C', textWrap: 'pretty', transition: 'opacity 420ms linear', opacity: done ? 1 : 0 }}>{BODY[2][1]}</p>
          </div>

          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 26px 42px' }}>
            <Dots active={1} />
            <button type="button" onClick={() => goto(3)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 52,
              border: '1px solid rgba(42,39,36,.34)', borderRadius: 999, cursor: 'pointer', background: 'transparent',
              color: '#2A2724', font: '500 17px/1 "Source Sans 3",sans-serif', letterSpacing: '.012em',
            }}>Continue</button>
          </div>
          <Grain />
        </div>
      )}

      {screen === 3 && (
        <div style={{
          position: 'absolute', inset: 0, animation: 'lua-dim 400ms linear both',
          background: 'radial-gradient(120% 80% at 50% 34%, #1c1e2e 0%, #161826 46%, #0f101a 100%)',
        }}>
          <div style={{
            position: 'absolute', left: 68, top: Math.max(24, stageH - UP_FROM_BOTTOM.wordmark - MOON_ABOVE_WORDMARK),
          }}>
            <MoonMini size={220} driftDur={15} swirlDur={SWIRL_S} glowAlpha={.34} breatheDur={6} />
          </div>

          <div style={{ position: 'absolute', left: 32, top: stageH - UP_FROM_BOTTOM.wordmark, font: '300 64px/1 Inter,sans-serif', letterSpacing: '-.045em', color: '#f0eef2' }}>Lua</div>
          <div onClick={finishTyping} style={{ position: 'absolute', left: 32, right: 32, top: stageH - UP_FROM_BOTTOM.tagline, cursor: 'pointer' }}>
            {headline(3, { font: '300 27px/1.24 Inter,sans-serif', letterSpacing: '-.025em', color: '#cfd3e5' } as React.CSSProperties)}
          </div>

          {done && (
            <button type="button" onClick={(e) => { e.stopPropagation(); complete(); }} style={{
              position: 'absolute', left: 32, right: 32, bottom: 56, padding: 15, borderRadius: 100, cursor: 'pointer',
              border: '1px solid rgba(145,132,217,.5)', background: 'rgba(145,132,217,.06)',
              color: '#d2cefd', font: '400 14.5px/1 Inter,sans-serif', letterSpacing: '.02em',
              animation: `lua-rise 620ms ${EASE} both`,
            }}>Start now</button>
          )}
        </div>
      )}

      {/* Two Skips, crossing over with the ground beneath them: ink on paper, then light on dark. */}
      <button type="button" onClick={(e) => { e.stopPropagation(); skip(); }} style={skipStyle(dark ? 0 : 1, '#6a6472')}>Skip</button>
      <button type="button" onClick={(e) => { e.stopPropagation(); skip(); }} style={skipStyle(dark ? 1 : 0, '#8d90a3')}>Skip</button>
    </div>
  );
}
