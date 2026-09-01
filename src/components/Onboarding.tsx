import { useCallback, useEffect, useRef, useState } from 'react';
import astronaut from '../assets/onboard-astronaut-2048.jpg';
import moonBody from '../assets/moon-body.png';
import glassSwirl from '../assets/glass-swirl.png';
import { useStageLayout } from '../lib/layout';

// Three screens, typed out one character at a time, replacing the old welcome.
//
// The illustration pivots on the astronaut's visor: the layer's transform-origin
// sits exactly on it, so scaling the whole drawing between screens keeps the
// visor pinned while everything around it recedes. The swirl inside that visor
// is the same image the moon carries, which is what lets screen three hand over
// to the object itself — the reader has been looking at it the whole time.

const COPY = [
  'Earth is loud. The moon isn’t.',
  'Up here, there’s room to hear yourself think. Some people make journaling sound like a lot of work — the right notebook, the right hour, someone doing it ‘properly.’ Lua skips all that. Just a quiet second and one honest question, however that works for you.',
  'A question, once a day.',
];

const SCREENS = [
  { paper: 1, dusk: 0, app: 0, light: 1, dark: 0, illo: 1, t: 'none' },
  { paper: 0, dusk: 1, app: 0, light: .08, dark: .94, illo: 1, t: 'translateY(-26px) scale(.852)' },
  { paper: 0, dusk: 0, app: 1, light: 0, dark: 0, illo: 0, t: 'translateY(-96px) scale(.72)' },
];

const TYPE_MS = 26;
const SWIRL_S = 30;
const EARTH_S = 210;
const EASE = 'cubic-bezier(.28,1,.34,1)';

// Design positions are measured down from the top of an 874-tall canvas. The
// stage is shorter than that whenever browser chrome takes a bite, and all of
// this copy sits in the lower half, so it is anchored up from the bottom
// instead — which is what keeps its distance from the button and the dots.
const UP_FROM_BOTTOM = { loud: 202, room: 278, wordmark: 326, tagline: 238 };
// The drawing is fitted rather than moved. On the design's 874 it sits at top 20
// and ends 25 above the first line of type; a shorter stage has to take that
// difference out of something. Sliding the whole drawing up closes the gap over
// the copy at one end and pushes the Earth into the Skip button at the other, so
// it is scaled to land in the space that is actually there — top pinned, and
// pinned horizontally on the visor so the astronaut stays centred.
const ILLO_TOP = 20;
const ILLO_H = 627;
const illoFit = (stageH: number) =>
  Math.min(1, Math.max(.6, (stageH - ILLO_TOP - 25 - UP_FROM_BOTTOM.loud) / ILLO_H));
/** Moon top on screen three, holding the design's gap down to the wordmark. */
const MOON_ABOVE_WORDMARK = 376;

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const { height: stageH } = useStageLayout();
  const [screen, setScreen] = useState(0);
  const [typed, setTyped] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // Only schedules; the caller resets what is on screen. Keeping the reset out
  // of here means mounting can start the timer without setting state as it goes.
  const startTyping = useCallback((n: number) => {
    window.clearTimeout(timer.current);
    const full = COPY[n];
    // Screen two's copy is about nine times screen one's, so it types
    // proportionally faster — a fixed rate would hold the reader for ten seconds.
    const base = TYPE_MS * (full.length > 90 ? 0.6 : 1);
    let i = 0;
    const step = () => {
      i++;
      setTyped(i);
      if (i >= full.length) { setDone(true); return; }
      const ch = full[i - 1];
      // Punctuation is where a voice would pause, so the typing pauses there too.
      const extra = '.?!'.includes(ch) ? base * 11 : ',—;:'.includes(ch) ? base * 5 : 0;
      timer.current = window.setTimeout(step, base + extra);
    };
    timer.current = window.setTimeout(step, 520);
  }, []);

  useEffect(() => { startTyping(0); return () => window.clearTimeout(timer.current); }, [startTyping]);

  const tap = () => {
    // First tap lands the rest of the line, second moves on. Screen three waits
    // for the button rather than tipping the reader into the app by accident.
    if (!done) { window.clearTimeout(timer.current); setTyped(COPY[screen].length); setDone(true); return; }
    if (screen < 2) {
      const n = screen + 1;
      setScreen(n); setTyped(0); setDone(false); startTyping(n);
    }
  };

  const cfg = SCREENS[screen];
  const text = COPY[screen].slice(0, typed);
  const caret = done ? 0 : 1;
  const dot = (i: number) =>
    i === screen ? 'rgba(145,132,217,.95)' : screen === 0 ? 'rgba(46,42,48,.22)' : 'rgba(233,237,245,.2)';
  const ground = (bg: string, opacity: number): React.CSSProperties => ({
    position: 'absolute', inset: 0, background: bg, opacity,
    transition: `opacity 900ms ${EASE}`,
  });
  const visor: React.CSSProperties = {
    position: 'absolute', left: '50.36%', top: '40.89%', width: '17.47%', height: '29.17%',
    transform: 'translate(-50%,-50%)', borderRadius: '50%',
  };
  const ink = (opacity: number, invert: boolean): React.CSSProperties => ({
    position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', opacity,
    filter: invert ? 'invert(1) grayscale(1) brightness(.9) contrast(1.06)' : undefined,
    WebkitMaskImage: 'radial-gradient(78% 72% at 50% 44%, #000 62%, rgba(0,0,0,0) 100%)',
    maskImage: 'radial-gradient(78% 72% at 50% 44%, #000 62%, rgba(0,0,0,0) 100%)',
    transition: `opacity 900ms ${EASE}`,
  });
  const earth = (opacity: number, invert: boolean): React.CSSProperties => ({
    position: 'absolute', inset: '-25%', opacity,
    backgroundImage: `url(${astronaut})`, backgroundSize: '1254% auto', backgroundPosition: '86.55% 10.36%',
    filter: invert ? 'invert(1) brightness(.92)' : undefined,
    animation: `lua-swirl ${EARTH_S}s linear infinite`,
    transition: 'opacity 900ms',
  });
  const caretStyle = (h: string, ml: number, va: string, bg: string): React.CSSProperties => ({
    display: 'inline-block', width: 2, height: h, marginLeft: ml, verticalAlign: va, background: bg,
    animation: 'lua-blink 1.05s step-end infinite', opacity: caret,
  });
  const skip = (opacity: number, color: string): React.CSSProperties => ({
    position: 'absolute', top: 34, right: 16, minWidth: 64, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 0, background: 'none', cursor: 'pointer',
    font: '400 12.5px/1 Inter,sans-serif', letterSpacing: '.07em',
    transition: 'opacity 900ms', opacity, color,
  });

  return (
    <div onClick={tap} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}>
      <div style={ground('radial-gradient(120% 80% at 50% 34%, #1c1e2e 0%, #161826 46%, #0f101a 100%)', cfg.app)} />
      <div style={ground('linear-gradient(180deg, #221e2f 0%, #15141f 55%, #0f101a 100%)', cfg.dusk)} />
      <div style={ground('#f4efe4', cfg.paper)} />

      <div style={{
        position: 'absolute', left: -378, top: ILLO_TOP, width: 1150, height: ILLO_H,
        transformOrigin: '50.36% 0', transform: `scale(${illoFit(stageH)})`,
      }}>
      <div style={{
        position: 'absolute', inset: 0,
        transformOrigin: '50.36% 40.89%', opacity: cfg.illo, transform: cfg.t,
        transition: `transform 1100ms ${EASE}, opacity 800ms ${EASE}`,
      }}>
        <img src={astronaut} alt="" draggable={false} style={ink(cfg.light, false)} />
        <img src={astronaut} alt="" draggable={false} style={ink(cfg.dark, true)} />

        <div style={{
          ...visor, overflow: 'hidden',
          background: 'radial-gradient(120% 120% at 34% 24%, #2a1c3f 0%, #150e22 70%, #0d0916 100%)',
        }}>
          <img src={glassSwirl} alt="" draggable={false} style={{
            position: 'absolute', left: '-9%', top: '-9%', width: '118%', height: '118%',
            animation: `lua-swirl ${SWIRL_S}s linear infinite`, filter: 'blur(.6px) saturate(1.1)',
          }} />
        </div>
        <div style={{
          ...visor, pointerEvents: 'none',
          boxShadow: 'inset 0 5px 14px rgba(233,237,245,.26), inset 0 -20px 34px rgba(0,0,0,.62), 0 0 46px 10px rgba(142,63,168,.3)',
        }} />

        <div style={{ position: 'absolute', left: '60.8%', top: '16.2%', width: '3.9%', height: '7.15%', borderRadius: '50%', overflow: 'hidden' }}>
          <div style={earth(cfg.light, false)} />
          <div style={earth(cfg.dark, true)} />
        </div>
      </div>
      </div>

      {screen === 2 && (
        <div style={{
          position: 'absolute', left: 68, top: Math.max(24, stageH - UP_FROM_BOTTOM.wordmark - MOON_ABOVE_WORDMARK),
          width: 220, height: 220,
        }}>
          <img src={moonBody} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block', animation: 'lua-drift 15s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', left: '42.94%', top: '17.82%', width: '34.8%', height: '34.8%', borderRadius: '50%', overflow: 'hidden' }}>
            <img src={glassSwirl} alt="" draggable={false} style={{
              position: 'absolute', left: '-8%', top: '-8%', width: '116%', height: '116%',
              animation: `lua-swirl ${SWIRL_S}s linear infinite`, filter: 'blur(.7px)',
            }} />
          </div>
          <div style={{
            position: 'absolute', left: '42.94%', top: '17.82%', width: '34.8%', height: '34.8%', borderRadius: '50%',
            boxShadow: 'inset 0 2px 5px rgba(233,237,245,.2), inset 0 -8px 15px rgba(0,0,0,.6), 0 0 30px 6px rgba(142,63,168,.34)',
            animation: 'lua-breathe 6s ease-in-out infinite',
          }} />
        </div>
      )}

      {screen === 0 && (
        <div style={{
          position: 'absolute', left: 32, right: 32, top: stageH - UP_FROM_BOTTOM.loud,
          font: '300 31px/1.26 Inter,sans-serif', letterSpacing: '-.03em', color: '#2e2a30', textWrap: 'pretty',
        }}>{text}<span style={caretStyle('.86em', 5, '-.06em', '#6d5f8a')} /></div>
      )}

      {screen === 1 && (
        <div style={{
          position: 'absolute', left: 32, right: 32, top: stageH - UP_FROM_BOTTOM.room,
          font: '400 15px/1.68 Inter,sans-serif', letterSpacing: '.002em', color: '#b2b6ca', textWrap: 'pretty',
        }}>{text}<span style={caretStyle('.9em', 4, '-.1em', '#9184d9')} /></div>
      )}

      {screen === 2 && (
        <>
          <div style={{
            position: 'absolute', left: 32, top: stageH - UP_FROM_BOTTOM.wordmark,
            font: '300 64px/1 Inter,sans-serif', letterSpacing: '-.045em', color: '#f0eef2',
          }}>Lua</div>
          <div style={{
            position: 'absolute', left: 32, right: 32, top: stageH - UP_FROM_BOTTOM.tagline,
            font: '300 27px/1.24 Inter,sans-serif', letterSpacing: '-.025em', color: '#cfd3e5', textWrap: 'pretty',
          }}>{text}<span style={caretStyle('.86em', 5, '-.06em', '#9184d9')} /></div>
          {done && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onDone(); }} style={{
              position: 'absolute', left: 32, right: 32, bottom: 56, padding: 15, borderRadius: 100, cursor: 'pointer',
              border: '1px solid rgba(145,132,217,.5)', background: 'rgba(145,132,217,.06)',
              color: '#d2cefd', font: '400 14.5px/1 Inter,sans-serif', letterSpacing: '.02em',
              animation: `lua-rise 620ms ${EASE} both`,
            }}>Pick it up</button>
          )}
        </>
      )}

      {/* Two Skips, crossing over with the ground beneath them: ink on paper, then light on dark. */}
      <button type="button" onClick={(e) => { e.stopPropagation(); onDone(); }} style={skip(cfg.paper, '#6a6472')}>Skip</button>
      <button type="button" onClick={(e) => { e.stopPropagation(); onDone(); }} style={skip(screen === 0 ? 0 : 1, '#8d90a3')}>Skip</button>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center', gap: 7, pointerEvents: 'none' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: dot(i), transition: 'background 700ms' }} />
        ))}
      </div>
    </div>
  );
}
