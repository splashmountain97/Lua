import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { trackOnboarding } from '../lib/analytics';
import { useStageLayout } from '../lib/layout';
import ob1 from '../assets/ob-1-ruins.jpeg';
import ob2 from '../assets/ob-2-walking.jpeg';
import ob3 from '../assets/ob-3-helmet.jpeg';
import glassSwirl from '../assets/glass-swirl.png';
import {
  HEADS, BODY, VISOR_ORIGIN, VISOR_BOX, CAM_REST, CAM_FULL_AT_443,
  type OnboardScreen,
} from '../data/onboarding';

// Screens one and two are hand-drawn "paper" photos (ruins, moonwalk).
// Screen three is the astronaut's own helmet: tapping Start now pushes the
// camera into the visor, but the visor shows the app's real glass-swirl
// texture rather than the photo's own painted one — the same asset, same
// animation, as the moon Home reveals — so the push ends on the object
// itself instead of a colour that could (and once did) drift from it. See
// the visor overlay below for how that swap is done without touching the
// photo.

const EASE = 'cubic-bezier(.28,1,.34,1)';

// The image, text and button row share one fixed-width (402px) stage whose
// HEIGHT varies a lot by device — real browser chrome can leave it far short
// of the 874px design reference (see lib/layout.ts). Text wraps identically
// regardless of stageH since the width never changes, so the room the text
// block and button row below the photo need is constant per screen — only
// the photo should give up height on a short stage.
//
// That room used to be a hand-measured constant per screen, tuned against
// this one browser's font metrics. Real devices render the same text taller
// or shorter (different font-hinting, different fallback fonts while
// Newsreader/Source Sans load), so a fixed number was always one bad render
// away from either wasting space or — worse — running the text into the
// button row beneath it, which is exactly what happened here. The text
// block is now measured for real via ResizeObserver, per screen, and the
// constants below are only the guess used for the very first paint before
// that measurement lands.
const IMAGE_H_MAX = 443;
const IMAGE_H_MIN = 240;
const GAP_BELOW_IMAGE = 19;
const BUTTON_ROW_H = 121;
const FALLBACK_TEXT_H: Record<OnboardScreen, number> = { 1: 260, 2: 200, 3: 45 };

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

export default function Onboarding({ onStart, onDone, onReveal }: { onStart: () => void; onDone: () => void; onReveal: () => void }) {
  const { height: stageH } = useStageLayout();
  const [screen, setScreen] = useState<OnboardScreen>(1);
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  const reducedRef = useRef(false);
  const typeTimer = useRef<number | undefined>(undefined);
  const advanceTimer = useRef<number | undefined>(undefined);
  const textRef = useRef<HTMLDivElement>(null);
  const [textH, setTextH] = useState<Partial<Record<OnboardScreen, number>>>({});
  const [pushed, setPushed] = useState(false);

  // The paragraphs are always in the DOM (opacity toggles them, layout keeps
  // them), so the block's real height is stable and measurable from first
  // mount — no need to wait for typing to finish.
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      setTextH(prev => (prev[screen] === h ? prev : { ...prev, [screen]: h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [screen]);

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
    return () => { clearTimeout(typeTimer.current); clearTimeout(advanceTimer.current); };
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
    trackOnboarding('completed');
    onReveal();
  }

  function skip() {
    clearTimeout(typeTimer.current);
    clearTimeout(advanceTimer.current);
    onStart();
    trackOnboarding('skipped');
    onDone();
  }

  // The permission request fires here, synchronously in the tap, rather than
  // after the push animation — iOS only honours it inside the actual user
  // gesture. The push itself just buys the swirl reveal its own beat before
  // handing straight to the real, already-open question (onReveal —
  // finishOnboardingRevealed — skips Home's own idle-then-shake, since the
  // push just played that beat).
  function handleStart() {
    onStart();
    clearTimeout(advanceTimer.current);
    setPushed(true);
    advanceTimer.current = window.setTimeout(complete, reducedRef.current ? 400 : 1200);
  }

  const imageH = (s: OnboardScreen) => {
    const t = textH[s] ?? FALLBACK_TEXT_H[s];
    return Math.max(IMAGE_H_MIN, Math.min(IMAGE_H_MAX, stageH - GAP_BELOW_IMAGE - t - BUTTON_ROW_H));
  };
  const seamTop = (s: OnboardScreen) => imageH(s) - 80;
  const textTop = (s: OnboardScreen) => imageH(s) + GAP_BELOW_IMAGE;

  // CAM_FULL_AT_443 was measured in px against the helmet artwork at its
  // native 812×443 design size (see the comment in data/onboarding.ts). The
  // artwork here renders at imageH(3) instead, which can be smaller on a
  // short stage, so the translate is scaled by the same ratio the artwork
  // itself is — the scale factor is dimensionless and needs no adjustment.
  const camK = imageH(3) / 443;
  const camW = 812 * camK;
  const camLeft = -(camW - 402) / 2;
  const camFull = `translate(${(CAM_FULL_AT_443.x * camK).toFixed(2)}px,${(CAM_FULL_AT_443.y * camK).toFixed(2)}px) scale(${CAM_FULL_AT_443.scale})`;

  const headline = (s: OnboardScreen) => (
    <span style={{ color: '#2A2724' }}>
      {HEADS[s].slice(0, n)}
      <span style={{
        display: 'inline-block', width: 2, height: '.86em', marginLeft: 5, verticalAlign: '-.06em',
        background: '#2A2724', opacity: done ? 0 : 1,
      }} />
    </span>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F4EFE6', overflow: 'hidden' }}>

      {screen === 1 && (
        <div style={{ position: 'absolute', inset: 0, animation: 'lua-dim 400ms linear both' }}>
          <img
            src={ob1} alt="" draggable={false}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, width: '100%', height: imageH(1), objectFit: 'cover', objectPosition: 'center 89%', display: 'block' }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, top: seamTop(1), height: 96, background: 'linear-gradient(rgba(244,239,230,0),#F4EFE6 74%)' }} />

          <div ref={textRef} onClick={finishTyping} style={{ position: 'absolute', left: 26, right: 26, top: textTop(1), cursor: 'pointer' }}>
            <h1 style={{ margin: '0 0 18px', font: '400 30px/1.2 Newsreader,Georgia,serif', letterSpacing: '-.011em', textWrap: 'pretty' }}>
              {headline(1)}
            </h1>
            <p style={{ margin: 0, maxWidth: '55ch', font: '400 17px/1.5 "Source Sans 3",sans-serif', color: '#46423C', textWrap: 'pretty', transition: 'opacity 420ms linear', opacity: done ? 1 : 0 }}>{BODY[1][0]}</p>
            <p style={{ margin: '10px 0 0', maxWidth: '55ch', font: '400 17px/1.5 "Source Sans 3",sans-serif', color: '#46423C', textWrap: 'pretty', transition: 'opacity 420ms linear', opacity: done ? 1 : 0 }}>{BODY[1][1]}</p>
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
            style={{ position: 'absolute', left: 0, right: 0, top: 0, width: '100%', height: imageH(2), objectFit: 'cover', objectPosition: 'center 72%', display: 'block' }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, top: seamTop(2), height: 96, background: 'linear-gradient(rgba(244,239,230,0),#F4EFE6 74%)' }} />

          <div ref={textRef} onClick={finishTyping} style={{ position: 'absolute', left: 26, right: 26, top: textTop(2), cursor: 'pointer' }}>
            <h1 style={{ margin: '0 0 18px', font: '400 30px/1.2 Newsreader,Georgia,serif', letterSpacing: '-.011em', textWrap: 'pretty' }}>
              {headline(2)}
            </h1>
            <p style={{ margin: 0, maxWidth: '55ch', font: '400 17px/1.5 "Source Sans 3",sans-serif', color: '#46423C', textWrap: 'pretty', transition: 'opacity 420ms linear', opacity: done ? 1 : 0 }}>{BODY[2][0]}</p>
            <p style={{ margin: '10px 0 0', maxWidth: '55ch', font: '400 17px/1.5 "Source Sans 3",sans-serif', color: '#46423C', textWrap: 'pretty', transition: 'opacity 420ms linear', opacity: done ? 1 : 0 }}>{BODY[2][1]}</p>
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
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', animation: 'lua-dim 400ms linear both' }}>
          <div style={{
            position: 'absolute', left: camLeft, top: 0, width: camW, height: imageH(3),
            transformOrigin: VISOR_ORIGIN, willChange: 'transform',
            transition: 'transform 1200ms cubic-bezier(.16,.84,.28,1), filter 1200ms linear',
            transform: reducedRef.current ? CAM_REST : (pushed ? camFull : CAM_REST),
            filter: reducedRef.current ? 'none' : (pushed ? 'blur(4px)' : 'none'),
          }}>
            <img src={ob3} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />

            {/* The visor's own painted swirl, replaced with the real glass-swirl
                texture — same asset and animation as Home's moon — positioned
                over the photo's visor (measured via a saturation scan; see
                VISOR_BOX in data/onboarding.ts) rather than composited into the
                photo itself. */}
            <div style={{
              position: 'absolute', left: `${VISOR_BOX.left}%`, top: `${VISOR_BOX.top}%`,
              width: `${VISOR_BOX.width}%`, height: `${VISOR_BOX.height}%`,
              borderRadius: '50%', overflow: 'hidden',
            }}>
              <img
                src={glassSwirl} alt="" draggable={false}
                style={{ position: 'absolute', left: '-8%', top: '-8%', width: '116%', height: '116%', animation: 'lua-swirl 30s linear infinite', filter: 'blur(.7px)' }}
              />
            </div>
            <div style={{
              position: 'absolute', left: `${VISOR_BOX.left}%`, top: `${VISOR_BOX.top}%`,
              width: `${VISOR_BOX.width}%`, height: `${VISOR_BOX.height}%`, borderRadius: '50%',
              boxShadow: 'inset 0 2px 5px rgba(233,237,245,.2), inset 0 -8px 15px rgba(0,0,0,.6), 0 0 30px 6px rgba(142,63,168,.34)',
            }} />
          </div>

          <div style={{
            position: 'absolute', left: 0, right: 0, top: seamTop(3), height: 96,
            background: 'linear-gradient(rgba(244,239,230,0),#F4EFE6 74%)',
            transition: 'opacity 300ms linear', opacity: pushed ? 0 : 1,
          }} />

          <div
            ref={textRef} onClick={finishTyping}
            style={{
              position: 'absolute', left: 26, right: 26, top: textTop(3), cursor: pushed ? undefined : 'pointer',
              transition: 'opacity 240ms linear', opacity: pushed ? 0 : 1, pointerEvents: pushed ? 'none' : 'auto',
            }}
          >
            <h1 style={{ margin: 0, font: '400 30px/1.2 Newsreader,Georgia,serif', letterSpacing: '-.011em', textWrap: 'pretty' }}>
              {headline(3)}
            </h1>
          </div>

          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 26px 42px',
            transition: 'opacity 240ms linear', opacity: pushed ? 0 : 1, pointerEvents: pushed ? 'none' : 'auto',
          }}>
            <Dots active={2} />
            <button type="button" onClick={(e) => { e.stopPropagation(); handleStart(); }} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 52,
              border: '1px solid rgba(42,39,36,.34)', borderRadius: 999, cursor: 'pointer', background: '#2A2724',
              color: '#F4EFE6', font: '500 17px/1 "Source Sans 3",sans-serif', letterSpacing: '.012em',
              animation: done ? `lua-rise 620ms ${EASE} both` : undefined,
            }}>Start now</button>
          </div>
          <Grain />
        </div>
      )}

      <button type="button" onClick={(e) => { e.stopPropagation(); skip(); }} style={{
        position: 'absolute', top: 34, right: 16, minWidth: 64, height: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 0, background: 'none', cursor: pushed ? undefined : 'pointer',
        font: '400 12.5px/1 "Source Sans 3",sans-serif', letterSpacing: '.07em', color: '#6a6472',
        transition: 'opacity 240ms linear', opacity: pushed ? 0 : 1, pointerEvents: pushed ? 'none' : 'auto',
      }}>Skip</button>
    </div>
  );
}
