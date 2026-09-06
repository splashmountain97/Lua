import { useEffect, useRef, useState } from 'react';
import { trackOnboarding } from '../lib/analytics';
import { useStageLayout } from '../lib/layout';
import ob1 from '../assets/ob-1-ruins.jpeg';
import ob2 from '../assets/ob-2-walking.jpeg';
import { HEADS, BODY, type OnboardScreen } from '../data/onboarding';

// Three screens, all the same hand-drawn "paper" photo treatment (ruins,
// moonwalk, moonwalk again) — screen three reuses screen two's photo rather
// than its own, since the design's photographed helmet visor baked in a swirl
// colour that could (and did) drift from glass-swirl.png, the one texture
// every other purple-and-gold moment in the app actually shares.

const EASE = 'cubic-bezier(.28,1,.34,1)';

// The image, text and button row share one fixed-width (402px) stage whose
// HEIGHT varies a lot by device — real browser chrome can leave it far short
// of the 874px design reference (see lib/layout.ts). Text wraps identically
// regardless of stageH since the width never changes, so the space the text
// block and button row need is constant; only the photo should give up
// height on a short stage. IMAGE_RESERVE is that constant (gap below the
// photo + text block + button row) measured at the design height: 874 -
// IMAGE_H_MAX(443) = 431.
const IMAGE_H_MAX = 443;
const IMAGE_H_MIN = 240;
const IMAGE_RESERVE = 431;

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

  const imageH = Math.max(IMAGE_H_MIN, Math.min(IMAGE_H_MAX, stageH - IMAGE_RESERVE));
  const seamTop = imageH - 80;
  const textTop = imageH + 19;

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
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: imageH, objectFit: 'cover', objectPosition: 'center 89%', display: 'block' }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, top: seamTop, height: 96, background: 'linear-gradient(rgba(244,239,230,0),#F4EFE6 74%)' }} />

          <div onClick={finishTyping} style={{ position: 'absolute', left: 26, right: 26, top: textTop, cursor: 'pointer' }}>
            <h1 style={{ margin: '0 0 18px', font: '400 30px/1.2 Newsreader,Georgia,serif', letterSpacing: '-.011em', textWrap: 'pretty' }}>
              {headline(1)}
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
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: imageH, objectFit: 'cover', objectPosition: 'center 72%', display: 'block' }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, top: seamTop, height: 96, background: 'linear-gradient(rgba(244,239,230,0),#F4EFE6 74%)' }} />

          <div onClick={finishTyping} style={{ position: 'absolute', left: 26, right: 26, top: textTop, cursor: 'pointer' }}>
            <h1 style={{ margin: '0 0 18px', font: '400 30px/1.2 Newsreader,Georgia,serif', letterSpacing: '-.011em', textWrap: 'pretty' }}>
              {headline(2)}
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
        <div style={{ position: 'absolute', inset: 0, animation: 'lua-dim 400ms linear both' }}>
          <img
            src={ob2} alt="" draggable={false}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: imageH, objectFit: 'cover', objectPosition: 'center 72%', display: 'block' }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, top: seamTop, height: 96, background: 'linear-gradient(rgba(244,239,230,0),#F4EFE6 74%)' }} />

          <div onClick={finishTyping} style={{ position: 'absolute', left: 26, right: 26, top: textTop, cursor: 'pointer' }}>
            <h1 style={{ margin: 0, font: '400 30px/1.2 Newsreader,Georgia,serif', letterSpacing: '-.011em', textWrap: 'pretty' }}>
              {headline(3)}
            </h1>
          </div>

          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 26px 42px' }}>
            <Dots active={2} />
            <button type="button" onClick={(e) => { e.stopPropagation(); complete(); }} style={{
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
        border: 0, background: 'none', cursor: 'pointer',
        font: '400 12.5px/1 "Source Sans 3",sans-serif', letterSpacing: '.07em', color: '#6a6472',
      }}>Skip</button>
    </div>
  );
}
