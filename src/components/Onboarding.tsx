import { useEffect, useRef, useState } from 'react';
import { trackOnboarding } from '../lib/analytics';
import { useStageLayout } from '../lib/layout';
import ob1 from '../assets/ob-1-ruins.jpeg';
import ob2 from '../assets/ob-2-walking.jpeg';
import ob3 from '../assets/ob-3-helmet.jpeg';
import {
  HEADS, BODY, SAMPLE_QUESTION, CAM_REST, CAM_FULL, VISOR_ORIGIN,
  type OnboardScreen,
} from '../data/onboarding';

// Three hand-drawn "paper" screens (ruins, moonwalk, helmet), replacing the
// single-illustration onboarding. The helmet's visor carries the same glass
// swirl the moon does, so screen three's camera push into it — ending in a
// solid violet wash with a sample question — reads as hinting at the object
// the reader is about to actually use, without borrowing its exact palette:
// this violet (#3E2559) and Home's reveal amber are kept deliberately distinct,
// and the handoff to Home is a plain crossfade rather than a chained zoom, so
// the two "push into glass" moments never fight each other on screen at once.

type Phase = 'rest' | 'push' | 'question';

// Text position is measured up from the stage's bottom edge rather than down
// from its top, same reasoning as the rest of onboarding: the stage is 874
// tall design-wise but renders shorter once real browser chrome takes its
// cut, and anchoring from the edge that's actually stable keeps the clearance
// to the button intact instead of the text drifting into it.
const TEXT_UP_FROM_BOTTOM = 412;

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
  const [phase, setPhase] = useState<Phase>('rest');
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  const reducedRef = useRef(false);
  const typeTimer = useRef<number | undefined>(undefined);
  const advanceTimer = useRef<number | undefined>(undefined);

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
    setPhase('rest');
    typeHead(next);
  }

  function complete() {
    clearTimeout(advanceTimer.current);
    trackOnboarding('completed');
    onDone();
  }

  function skip() {
    clearTimeout(typeTimer.current);
    clearTimeout(advanceTimer.current);
    onStart();
    trackOnboarding('skipped');
    onDone();
  }

  // Chrome leaves in the first 240ms, the camera runs 1200ms (900ms under
  // reduced motion, which skips the transform entirely), and the question
  // only begins once the move has settled — never during it. The permission
  // request fires here, synchronously in the tap, rather than after the
  // animation: iOS only honours it inside the actual user gesture.
  function handleStart() {
    onStart();
    clearTimeout(advanceTimer.current);
    setPhase('push');
    const pushMs = reducedRef.current ? 400 : 1200;
    advanceTimer.current = window.setTimeout(() => {
      setPhase('question');
      advanceTimer.current = window.setTimeout(complete, 2600);
    }, pushMs);
  }

  function skipDwell() {
    if (phase !== 'question') return;
    complete();
  }

  const reduced = reducedRef.current;
  const moved = phase === 'push' || phase === 'question';
  const gone = screen === 3 && moved;
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

  const headline = (s: OnboardScreen) => (
    <h1 style={{
      margin: '0 0 18px', font: '400 30px/1.2 Newsreader,Georgia,serif', letterSpacing: '-.011em',
      color: '#2A2724', textWrap: 'pretty',
    }}>
      {HEADS[s].slice(0, n)}
      <span style={{
        display: 'inline-block', width: 2, height: '.78em', marginLeft: 4, verticalAlign: '-.04em',
        background: '#6B6459', opacity: done ? 0 : 1,
      }} />
    </h1>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F4EFE6', overflow: 'hidden' }}>

      {screen === 1 && (
        <div style={{ position: 'absolute', inset: 0, animation: 'lua-dim 400ms linear both' }}>
          <img
            src={ob1} alt="" draggable={false}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 443, objectFit: 'cover', objectPosition: 'center 89%', display: 'block' }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 363, height: 96, background: 'linear-gradient(rgba(244,239,230,0),#F4EFE6 74%)' }} />

          <div onClick={finishTyping} style={{ position: 'absolute', left: 26, right: 26, top: textTop, cursor: 'pointer' }}>
            {headline(1)}
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
            {headline(2)}
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
        <div style={{ position: 'absolute', inset: 0, animation: 'lua-dim 400ms linear both' }} onClick={skipDwell}>
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <img
              src={ob3} alt="" draggable={false}
              style={{
                position: 'absolute', left: -209.5, top: 0, width: 812, height: 443, display: 'block',
                transformOrigin: VISOR_ORIGIN, willChange: 'transform',
                transition: 'transform 1200ms cubic-bezier(.16,.84,.28,1), filter 1200ms linear',
                transform: reduced ? CAM_REST : moved ? CAM_FULL : CAM_REST,
                filter: reduced ? 'none' : moved ? 'blur(4px)' : 'none',
              }}
            />
            <div style={{
              position: 'absolute', left: 0, right: 0, top: 363, height: 96,
              background: 'linear-gradient(rgba(244,239,230,0),#F4EFE6 74%)',
              transition: 'opacity 300ms linear', opacity: gone ? 0 : 1,
            }} />
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(circle at 50% 50%,rgba(58,35,86,.78) 0%,rgba(44,26,66,.92) 46%,rgba(26,15,39,.99) 100%)',
              transition: `opacity ${reduced ? 400 : 1100}ms linear`, opacity: moved ? 0.96 : 0,
            }} />

            <div
              onClick={(e) => { e.stopPropagation(); finishTyping(); }}
              style={{
                position: 'absolute', left: 26, right: 26, top: textTop,
                transition: 'opacity 240ms linear', opacity: gone ? 0 : 1,
                pointerEvents: gone ? 'none' : 'auto', cursor: gone ? undefined : 'pointer',
              }}
            >
              {headline(3)}
            </div>

            <div style={{ position: 'absolute', left: 34, right: 34, top: '50%', translate: '0 -50%', transition: 'opacity 420ms linear', opacity: phase === 'question' ? 1 : 0 }}>
              <p style={{ margin: 0, font: '300 29px/1.42 Newsreader,Georgia,serif', letterSpacing: '-.006em', color: '#F6F1E7', textWrap: 'pretty' }}>{SAMPLE_QUESTION}</p>
            </div>

            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 26px 42px',
              transition: 'opacity 240ms linear', opacity: gone ? 0 : 1, pointerEvents: gone ? 'none' : 'auto',
            }}>
              <Dots active={2} />
              <button type="button" onClick={(e) => { e.stopPropagation(); handleStart(); }} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 52,
                border: 0, borderRadius: 999, cursor: 'pointer', color: '#F6F1E7',
                font: '500 17px/1 "Source Sans 3",sans-serif', letterSpacing: '.012em',
                backgroundColor: '#3E2559',
                backgroundImage: 'radial-gradient(128% 172% at 22% 16%,rgba(198,145,58,.44) 0%,rgba(124,74,124,.26) 34%,rgba(62,37,89,0) 62%)',
              }}>Start now</button>
            </div>
            <Grain />
          </div>
        </div>
      )}

      {/* Two Skips, crossing over with the ground beneath them: ink on paper, then light on violet. */}
      <button type="button" onClick={(e) => { e.stopPropagation(); skip(); }} style={skipStyle(gone ? 0 : 1, '#6a6472')}>Skip</button>
      <button type="button" onClick={(e) => { e.stopPropagation(); skip(); }} style={skipStyle(gone ? 1 : 0, '#cabfe0')}>Skip</button>
    </div>
  );
}
