import { useEffect, useRef } from 'react';
import moonBody from '../assets/moon-body.png';
import glassSwirl from '../assets/glass-swirl.png';
import { CATS, PROMPTS, WEIGHTS, WEIGHT_ANY_NOTE, WEIGHT_NOTE } from '../data/content';
import { PHASES, EASE_IN, EASE_OUT, M, CX, WX, WY, WPX, AP_R, apertureY, targetY } from '../lib/phases';
import { useStageLayout } from '../lib/layout';
import { moonPhase } from '../lib/streak';
import Spotlight from './Spotlight';
import WriteModal from './WriteModal';
import SavedPanel from './SavedPanel';
import Wall from './Wall';
import { DAY_CAP, SAVE_CAP, DAY_COUNTER_FROM, dayLabel } from '../lib/limits';
import { setSafeToUpdate } from '../lib/updates';
import type { useLua } from '../hooks/useLua';

type Lua = ReturnType<typeof useLua>;

// The two flanking actions are deliberately quiet: same size, same weight, no
// fill. 'Shake again' carries a border and a ground so it reads as the primary
// action from its appearance rather than from sitting in the middle.
const iconAction: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 44, height: 44, padding: 0,
  background: 'none', border: 0, cursor: 'pointer', color: '#9397ab',
};

const wdotStyle = (i: number, pw: number): React.CSSProperties => ({
  display: 'block', width: 4, height: 4, borderRadius: '50%',
  background: i <= pw ? 'rgba(242,193,78,.72)' : 'rgba(233,237,245,.16)',
});

export default function Home({ lua }: { lua: Lua }) {
  const { state, streakDays, coachSeen, introStep, revealsTotal, shareCoachSeen, streakCoachSeen, saved, dayUsed, quiet, actions } = lua;
  const { titleY, moonCY, lineY, height: stageH } = useStageLayout();
  const promptRef = useRef<HTMLDivElement>(null);
  const catsRef = useRef<HTMLDivElement>(null);
  const writeRef = useRef<HTMLButtonElement>(null);
  const savedRef = useRef<HTMLButtonElement>(null);
  const wallFromRef = useRef<HTMLButtonElement>(null);
  const shareRef = useRef<HTMLButtonElement>(null);
  const streakRef = useRef<HTMLButtonElement>(null);
  const weightsRef = useRef<HTMLDivElement>(null);
  const ph = state.phase;
  // The number is what is still put aside, matching the panel's own 'Saved'
  // header — a question reflected on is history, not a pending one. The button
  // survives a zero there so that history stays reachable, and only disappears
  // when there is nothing at all behind it.
  const savedCount = saved.filter(r => !r.done).length;
  const savedNow = saved.some(r => r.id === PROMPTS[state.promptIx].id);
  const savedFull = saved.length >= SAVE_CAP;
  const daySpent = dayUsed >= DAY_CAP;
  // Silent for the first three: a counter present from the first shake makes
  // the limit the subject of the app rather than the question.
  const showDay = dayUsed >= DAY_COUNTER_FROM;
  const dayColour = daySpent ? 'rgba(242,193,78,.85)' : '#75798c';
  const dayCounter: React.CSSProperties = {
    font: '400 10px/1 ui-monospace,Menlo,monospace', letterSpacing: '.1em',
    opacity: showDay ? 1 : 0, color: dayColour,
    transition: 'opacity 300ms linear, color 300ms linear',
  };
  // The line below the moon says where you stand once it matters, and stands
  // down again tomorrow. No time-of-day word anywhere near it: someone opens
  // this over breakfast as readily as at midnight, so 'today' and 'tomorrow'
  // are the only safe ones.
  const dayNote = daySpent
    ? 'That’s five today. Come back tomorrow.'
    : dayUsed === DAY_CAP - 1 ? 'One question left today.' : null;
  const lockGlyph = (size: number, w: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.5" y="10.5" width="15" height="10" rx="1.6" />
      <path d="M8 10.5V7.4a4 4 0 0 1 8 0v3.1" />
    </svg>
  );
  const v = PHASES[ph];
  const big = ph === 'reveal' || ph === 'settled';
  const ease = ph === 'reveal' ? EASE_IN : EASE_OUT;
  const tx = state.tiltX * (big ? .06 : 1);
  const ty = state.tiltY * (big ? .06 : 1);
  const jitterOn = ph === 'agitate';
  // The breathing and its ground belong to the resting object only — never
  // through the shake, the push-in, or while a question is being read.
  const idle = ph === 'idle';
  // The moon's vertical anchor moves with the stage, so the distance it travels
  // to reach the centre has to be measured rather than baked into the phase.
  const pushY = v.push ? targetY(stageH) - apertureY(moonCY) : 0;
  const swirlBlur = 1 + state.energy * 3.2;
  const prompt = PROMPTS[state.promptIx];
  const pw = prompt.w;
  const promptLen = prompt.t.length;
  const promptFs = promptLen > 92 ? 21.5 : promptLen > 74 ? 23.5 : promptLen > 56 ? 26 : promptLen > 38 ? 28 : 31;
  const dur = v.dur;
  // The slot that held 'Ready to begin?' now rotates through the nudges, at the
  // same size. It says nothing during the agitation: the swirl is the message.
  const hintTitle = ph === 'idle' ? state.idleLine : ph === 'agitate' ? '' : state.settlingLine;
  const infoCat = CATS.find(c => c.id === state.infoOpen);
  const promptCat = CATS.find(c => c.id === prompt.c)!;

  // At rest, with nothing open over it: the only moment a reload costs nobody
  // anything. A waiting update applies here and nowhere else.
  const atRest = ph === 'idle' && !state.wall && !state.panelOpen
    && state.writeModal === null && !state.infoOpen;
  useEffect(() => { setSafeToUpdate(atRest); }, [atRest]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>

      {/* chrome: pill filter + streak glyph */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 24, opacity: v.chrome,
        pointerEvents: v.chrome > .8 ? 'auto' : 'none',
        transition: `opacity ${Math.round(dur * 0.5)}ms linear`,
      }}>
        {/* The mirror of the streak button in the opposite corner: two quiet
            counters, one composition, no new pattern. Hidden at zero — there is
            nothing to open, and it keeps the first-run screen bare. */}
        {saved.length > 0 && (
          <button ref={savedRef} type="button" onClick={actions.openPanel}
            aria-label={`Saved questions: ${savedCount}`} style={{
              position: 'absolute', top: 70, left: 14,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              width: 46, height: 46, background: 'none', border: 0, padding: 0, cursor: 'pointer',
              color: savedFull ? 'rgba(242,193,78,.85)' : '#9397ab',
            }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6.5 4.5h11a1 1 0 0 1 1 1v14.2l-6.5-4.4-6.5 4.4V5.5a1 1 0 0 1 1-1z" />
            </svg>
            <span style={{ font: '400 10px/1 ui-monospace,Menlo,monospace', letterSpacing: '.02em', color: 'inherit' }}>{savedCount}</span>
          </button>
        )}

        {/* A third quiet counter, centred between the other two, so the row
            reads as three of a kind rather than a new sort of thing. */}
        <div style={{
          position: 'absolute', top: 78, left: 0, right: 0, textAlign: 'center',
          pointerEvents: 'none', ...dayCounter,
        }}>{dayLabel(dayUsed)}</div>

        {/* Placed by its own corner rather than by a full-width flex row. The
            row was invisible but 402 wide, sat at the same height as the
            bookmark in the opposite corner, and came after it — so it took
            every tap along the top of the screen. Being a div and not a
            button, it also passed the stage's tap test, and a tap meant for
            the bookmark shook the moon instead. */}
        <button ref={streakRef} type="button" onClick={actions.goStreak}
          aria-label={`Streak: ${streakDays} ${streakDays === 1 ? 'day' : 'days'}`} style={{
            position: 'absolute', top: 70, right: 14,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            width: 46, height: 46, background: 'none', border: 0, padding: 0, cursor: 'pointer',
          }}>
            {/* Replaces an 11px gradient dot that waxed with the streak. It said
                the same thing, but at that size almost nobody could see it was
                saying anything. Decorative to a screen reader: the button's
                label carries the count in words. */}
            <span aria-hidden="true" style={{
              display: 'block',
              font: '15px/1 "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif',
            }}>{moonPhase(streakDays)}</span>
          <span style={{ font: '400 10px/1 ui-monospace,Menlo,monospace', color: '#9397ab', letterSpacing: '.02em' }}>{streakDays}d</span>
        </button>

        <div style={{ position: 'absolute', top: titleY, left: 0, right: 0, textAlign: 'center', padding: '0 32px' }}>
          <div style={{ font: '300 25px/1.2 Inter,sans-serif', letterSpacing: '-.028em', color: '#f0eef2' }}>{hintTitle}</div>
        </div>
        <div style={{
          position: 'absolute', top: lineY, left: 0, right: 0, textAlign: 'center', padding: '0 40px',
          font: '400 11px/1.5 ui-monospace,Menlo,monospace', letterSpacing: '.06em', color: 'rgba(147,151,171,.9)',
          animation: 'lua-hint 5.2s ease-in-out infinite',
          display: infoCat ? 'none' : 'block',
        }}>{dayNote ?? state.tipLine}</div>

        <div style={{ position: 'absolute', bottom: 46, left: 0, right: 0, padding: '0 20px' }}>
          {infoCat && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: 20, right: 20, maxWidth: 236, zIndex: 11,
              padding: '9px 11px 10px', borderRadius: 8, background: '#20222f',
              boxShadow: '0 0 0 1px #3f424d, 0 10px 26px rgba(0,0,0,.6)',
              animation: 'lua-rise .18s cubic-bezier(.33,1,.68,1) both',
            }}>
              <div style={{ font: '500 10px/1 ui-monospace,Menlo,monospace', letterSpacing: '.1em', textTransform: 'uppercase', color: '#9184d9', marginBottom: 5 }}>
                {infoCat.label}
              </div>
              <div style={{ font: '400 11.5px/1.55 Inter,sans-serif', color: '#cfd3e5' }}>
                {infoCat.desc}
              </div>
            </div>
          )}

          <div ref={catsRef}>
            <div style={{ margin: '0 0 3px', padding: '0 2px' }}>
              <span style={{ font: '400 11.5px/1.4 Inter,sans-serif', letterSpacing: '.01em', color: '#9397ab' }}>Tap to choose what you'd like to reflect on</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {CATS.map(c => {
                const on = state.selected.includes(c.id);
                // Not open yet. The pill keeps its exact resting geometry and
                // swaps the dot for a padlock, so nothing reflows and it reads
                // as present-but-shut rather than missing. Still focusable and
                // still tappable: tapping is how the wall is reached.
                const shut = c.id === 'life' || c.id === 'world';
                return (
                  <div key={c.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button type="button" onClick={(e) => actions.toggleCategory(c.id, e)}
                      aria-disabled={shut || undefined}
                      aria-label={shut ? `${c.label} — not open yet` : undefined}
                      ref={shut ? wallFromRef : undefined}
                      style={{ display: 'flex', alignItems: 'center', height: 46, padding: 0, background: 'none', border: 0, cursor: 'pointer' }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', height: 32, padding: '0 10px 0 11px', borderRadius: '100px 0 0 100px',
                        font: '400 12.5px/1 Inter,sans-serif', letterSpacing: '.012em', transition: 'all .18s',
                        border: `1px solid ${on && !shut ? `rgba(145,132,217,${quiet ? .34 : .6})` : 'rgba(147,151,171,.16)'}`,
                        borderRight: 0,
                        background: on && !shut ? `rgba(145,132,217,${quiet ? .05 : .13})` : 'transparent',
                        color: shut ? '#75798c' : on ? (quiet ? '#b5abfc' : '#d2cefd') : '#9397ab',
                      }}>
                        {shut ? (
                          <span style={{ display: 'flex', flex: 'none', marginRight: 7 }}>{lockGlyph(9, 2)}</span>
                        ) : (
                          <span style={{
                            display: 'block', flex: 'none', width: 8, height: 8, marginRight: 7, borderRadius: '50%', transition: 'all .18s',
                            boxShadow: `inset 0 0 0 1px ${on ? 'rgba(181,171,252,.9)' : 'rgba(147,151,171,.5)'}`,
                            background: on ? '#b5abfc' : 'transparent',
                          }} />
                        )}
                        {c.label}
                      </span>
                    </button>
                    <button type="button" onClick={(e) => actions.toggleInfo(c.id, e)} aria-label="About this category" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: 38, height: 46, padding: 0, background: 'none', border: 0, cursor: 'pointer' }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 32, borderRadius: '0 100px 100px 0',
                        font: '500 9.5px/1 ui-monospace,Menlo,monospace', transition: 'all .18s',
                        border: `1px solid ${on ? `rgba(145,132,217,${quiet ? .34 : .6})` : 'rgba(147,151,171,.16)'}`,
                        background: 'transparent',
                        color: state.infoOpen === c.id ? '#d2cefd' : on ? 'rgba(181,171,252,.6)' : 'rgba(117,121,140,.75)',
                      }}>i</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div ref={weightsRef}>
          <div style={{ margin: '6px 0 3px', padding: '0 2px' }}>
            <span style={{ font: '400 11.5px/1.4 Inter,sans-serif', letterSpacing: '.01em', color: '#9397ab' }}>How hard do you want to think?</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {WEIGHTS.map(w => {
              const on = state.weight === w.id;
              return (
                <button key={String(w.id)} type="button" onClick={(e) => actions.setWeight(w.id, e)} style={{ display: 'flex', alignItems: 'center', height: 46, padding: 0, background: 'none', border: 0, cursor: 'pointer' }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', height: 32, padding: '0 13px', borderRadius: 100,
                    font: '400 12.5px/1 Inter,sans-serif', letterSpacing: '.012em', transition: 'all .18s',
                    border: `1px solid ${on ? 'rgba(145,132,217,.5)' : 'rgba(147,151,171,.14)'}`,
                    background: on ? 'rgba(145,132,217,.09)' : 'transparent',
                    color: on ? '#d2cefd' : '#9397ab',
                  }}>{w.label}</span>
                </button>
              );
            })}
          </div>
          </div>
          <div style={{
            padding: '0 2px', margin: '7px 0 0', font: '400 11px/1.4 Inter,sans-serif',
            color: state.weight === null ? 'rgba(147,151,171,.75)' : 'rgba(181,171,252,.8)',
          }}>
            {state.weight === null ? WEIGHT_ANY_NOTE : WEIGHT_NOTE[state.weight]}
          </div>
        </div>
      </div>

      {/* the object */}
      <div style={{
        position: 'absolute', left: CX - M / 2, top: moonCY - M / 2, width: M, height: M, zIndex: 2,
        transformOrigin: `${WX * 100}% ${WY * 100}%`, willChange: 'transform',
        transform: `translate3d(${v.tx + tx}px, ${pushY + v.ty + ty}px, 0) scale(${v.k})`,
        transition: `transform ${dur}ms ${ease}`,
      }}>
        <div style={{
          position: 'absolute', left: '-22%', top: '-8%', width: '144%', height: '144%',
          borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(closest-side, rgba(5,5,10,.62) 0%, rgba(5,5,10,.4) 44%, rgba(5,5,10,0) 74%)',
          // The animation drives opacity while resting; with it gone the inline
          // value takes over and the ground fades out rather than cutting.
          opacity: idle ? undefined : 0,
          transition: 'opacity 600ms linear',
          animation: idle ? 'lua-ground 5.2s ease-in-out infinite' : undefined,
        }} />
        <div style={{ position: 'absolute', inset: 0, animation: idle ? 'lua-pulse 5.2s ease-in-out infinite' : undefined }}>
        <div style={{ position: 'absolute', inset: 0, animation: jitterOn ? `lua-jitter ${(0.72 - state.energy * 0.3).toFixed(2)}s ease-in-out infinite` : undefined }}>
          <img src={moonBody} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', borderRadius: '50%', boxShadow: 'inset 0 0 34px 6px rgba(9,8,14,.5)', pointerEvents: 'none' }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none', mixBlendMode: 'screen',
            background: `radial-gradient(circle at ${22 + streakDays * 1.4}% 24%, rgba(214,222,240,${Math.min(.13, 0.015 + streakDays * 0.006).toFixed(3)}) 0%, rgba(214,222,240,0) 46%)`,
          }} />
          <div style={{ position: 'absolute', left: '42.94%', top: '17.82%', width: '34.8%', height: '34.8%', borderRadius: '50%', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              filter: `blur(${jitterOn ? swirlBlur.toFixed(1) : '0.7'}px) saturate(${jitterOn ? (1 + state.energy * .5).toFixed(2) : '0.88'}) brightness(${jitterOn ? 1 : 0.9})`,
              transition: 'filter 320ms linear',
            }}>
              <img src={glassSwirl} alt="" draggable={false} style={{
                position: 'absolute', left: '-8%', top: '-8%', width: '116%', height: '116%',
                animation: `lua-swirl ${jitterOn ? 4 : big ? 30 : 22}s linear infinite`,
              }} />
            </div>
          </div>
          <div style={{
            position: 'absolute', left: '42.94%', top: '17.82%', width: '34.8%', height: '34.8%', borderRadius: '50%', pointerEvents: 'none',
            boxShadow: 'inset 0 2px 5px rgba(233,237,245,.2), inset 0 -8px 15px rgba(0,0,0,.6), inset 0 0 0 1px rgba(233,237,245,.07)',
          }} />
          <div style={{
            position: 'absolute', left: '47.5%', top: '20.5%', width: '13%', height: '7%', borderRadius: '50%',
            background: 'linear-gradient(150deg, rgba(240,244,252,.62), rgba(240,244,252,0) 78%)',
            filter: 'blur(1.6px)', pointerEvents: 'none', transform: 'rotate(-14deg)',
          }} />
          <div style={{
            position: 'absolute', left: '42.94%', top: '17.82%', width: '34.8%', height: '34.8%', borderRadius: '50%', pointerEvents: 'none',
            opacity: v.sw,
            boxShadow: '0 0 26px 5px rgba(142,63,168,.42), 0 0 60px 14px rgba(107,46,134,.2)',
            transition: `opacity ${dur}ms ${ease}`,
          }} />
        </div>
        </div>
      </div>

      {/* the aperture: the window's own edge, growing into the screen edge */}
      <div style={{
        position: 'absolute', left: WPX - AP_R, top: apertureY(moonCY) - AP_R, width: AP_R * 2, height: AP_R * 2, borderRadius: '50%',
        zIndex: 3, pointerEvents: 'none', transformOrigin: '50% 50%', willChange: 'transform',
        opacity: v.ap,
        transform: `translate3d(${v.tx + tx}px, ${pushY + v.ty + ty}px, 0) scale(${v.k})`,
        boxShadow: `0 0 0 9999px rgba(14,15,24,${v.occ})`,
        transition: `transform ${dur}ms ${ease}, opacity ${Math.round(dur * 0.3)}ms linear, box-shadow ${Math.round(dur * 0.75)}ms linear`,
      }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', background: '#171320' }}>
          <img src={glassSwirl} alt="" draggable={false} style={{
            position: 'absolute', left: '-10%', top: '-10%', width: '120%', height: '120%',
            animation: 'lua-swirl-rev 38s linear infinite',
            opacity: big ? 1 : .9,
            filter: `blur(${big ? 1.2 : 1.4}px) saturate(${ph === 'settled' ? .26 : 1}) brightness(${ph === 'settled' ? .3 : .82})`,
            transition: `filter ${dur}ms linear`,
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%', opacity: v.calm,
            background: 'radial-gradient(circle at 50% 42%, rgba(242,193,78,.1) 0%, rgba(184,121,31,.07) 34%, rgba(16,13,22,.86) 82%)',
            transition: `opacity ${dur}ms linear`,
          }} />
        </div>
      </div>

      {/* vignette: the moon's rim, seen from inside */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', opacity: v.vig, transition: `opacity ${Math.round(dur * 0.85)}ms ${ease}` }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 74% 58% at 50% 46%, rgba(9,8,14,0) 0%, rgba(9,8,14,.42) 54%, rgba(7,6,12,.86) 82%, rgba(4,4,8,.99) 100%)',
          animation: 'lua-drift 17s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 92% 74% at 50% 46%, rgba(0,0,0,0) 66%, rgba(104,110,128,.14) 82%, rgba(0,0,0,0) 95%)',
          animation: 'lua-drift 23s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          opacity: ((pw - 1) * 0.17).toFixed(2),
          background: 'radial-gradient(ellipse 82% 64% at 50% 46%, rgba(6,5,12,0) 0%, rgba(6,5,12,.5) 58%, rgba(3,3,7,.9) 100%)',
        }} />
      </div>

      {/* the prompt */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '0 32px', opacity: v.txt,
        transform: `scale(${v.txt ? 1 : 1.05})`,
        pointerEvents: ph === 'settled' ? 'auto' : 'none',
        transition: `opacity ${Math.round(dur * 0.55)}ms linear ${ph === 'reveal' ? Math.round(dur * 0.46) : 0}ms, transform ${dur}ms ${ease}`,
      }}>
        <div ref={promptRef} style={{ width: 302, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, margin: '0 0 22px' }}>
            <span style={{ font: '500 9.5px/1 ui-monospace,Menlo,monospace', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(242,193,78,.78)' }}>
              {promptCat.label}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3.5 }}>
              <span style={wdotStyle(1, pw)} /><span style={wdotStyle(2, pw)} /><span style={wdotStyle(3, pw)} />
            </span>
          </div>
          <p style={{
            margin: 0, font: `400 ${promptFs}px/1.34 Inter,sans-serif`, letterSpacing: '-.014em', color: '#f0eef2',
            textShadow: '0 0 22px rgba(242,193,78,.2), 0 0 60px rgba(145,132,217,.14)',
          }}>{prompt.t}</p>
        </div>

        <button type="button" onClick={actions.dismiss} aria-label="Close this question" title="Close" style={{
          position: 'absolute', top: 34, right: 16, width: 44, height: 44,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 0, cursor: 'pointer', color: 'rgba(147,151,171,.8)',
          opacity: ph === 'settled' ? 1 : 0,
          pointerEvents: ph === 'settled' ? 'auto' : 'none',
          transition: `opacity 700ms linear ${ph === 'settled' ? '300ms' : '0ms'}`,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6" />
          </svg>
        </button>

        {/* Two rows rather than four items in one. A fourth element makes the
            old arrangement — two quiet icons balanced around a wide pill —
            lopsided whichever side it lands on. Split, the icons read as three
            equal quiet actions and the pill reads as primary from its own
            appearance rather than from being flanked. */}
        <div style={{
          position: 'absolute', bottom: 158, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30,
          opacity: ph === 'settled' ? 1 : 0,
          pointerEvents: ph === 'settled' ? 'auto' : 'none',
          transition: `opacity 700ms linear ${ph === 'settled' ? '300ms' : '0ms'}`,
        }}>
          <button ref={writeRef} type="button" onClick={actions.writeItDown} aria-label="Write about this question" title="Write about it" style={iconAction}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="9.5" height="16" rx="1.4" />
              <path d="M5.8 4v16" />
              <path d="M7.7 9h3.2M7.7 12.5h3.2" />
              <path d="M20.6 8.2l-1.6-1.6a.85.85 0 0 0-1.2 0l-4.4 4.4-.85 2.65 2.65-.85 4.4-4.4a.85.85 0 0 0 0-1.2z" />
              <path d="M16.9 8.1l1.7 1.7" />
            </svg>
          </button>
          {/* At the cap it keeps its glyph and gains a padlock badge on a
              ground dark enough to read over it — the control is the same one,
              shut, rather than a different control. */}
          <button type="button" onClick={actions.saveCurrent}
            aria-pressed={savedNow}
            aria-label={savedFull && !savedNow
              ? 'Saved list full — remove one to save another'
              : savedNow ? 'Remove this question from saved' : 'Save this question for later'}
            title={savedNow ? 'Saved' : savedFull ? 'Saved list full' : 'Save for later'}
            style={{
              ...iconAction, position: 'relative', transition: 'color .2s',
              color: savedNow ? 'rgba(242,193,78,.9)' : savedFull ? 'rgba(242,193,78,.85)' : '#9397ab',
            }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={savedNow ? 'rgba(242,193,78,.9)' : 'none'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6.5 4.5h11a1 1 0 0 1 1 1v14.2l-6.5-4.4-6.5 4.4V5.5a1 1 0 0 1 1-1z" />
            </svg>
            {savedFull && !savedNow && (
              <span style={{
                position: 'absolute', right: 4, bottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 13, height: 13, borderRadius: '50%', background: '#0e0f18',
              }}>{lockGlyph(9, 2.4)}</span>
            )}
          </button>
          <button ref={shareRef} type="button" onClick={actions.share} aria-label="Send this question to someone" title="Send to a friend" style={iconAction}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.5 3.5L10.8 13.2" />
              <path d="M20.5 3.5l-6.2 17-3.5-7.3-7.3-3.5 17-6.2z" />
            </svg>
          </button>
        </div>

        <div style={{
          position: 'absolute', bottom: 52, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9,
          opacity: ph === 'settled' ? 1 : 0,
          pointerEvents: ph === 'settled' ? 'auto' : 'none',
          transition: `opacity 700ms linear ${ph === 'settled' ? '300ms' : '0ms'}`,
        }}>
          {/* Still tappable when spent — tapping is how the wall is reached.
              The padlock grows into the pill from nothing rather than appearing
              beside the label, so the button keeps one identity through the
              change instead of becoming a different control. */}
          <button type="button" onClick={actions.again}
            aria-label={daySpent ? 'Shake again — five a day is the free limit' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              background: daySpent ? 'none' : 'rgba(145,132,217,.10)',
              border: `1px solid ${daySpent ? 'rgba(147,151,171,.22)' : 'rgba(145,132,217,.55)'}`,
              borderRadius: 100, padding: '17px 34px', cursor: 'pointer',
              font: '400 15px/1 Inter,sans-serif', letterSpacing: '.03em',
              color: daySpent ? '#75798c' : '#d2cefd',
              transition: 'color .2s, border-color .2s, background .2s',
            }}>
            <span style={{
              display: 'flex', alignItems: 'center', overflow: 'hidden',
              width: daySpent ? 13 : 0, opacity: daySpent ? 1 : 0,
              transition: 'width .25s, opacity .25s',
            }}>{lockGlyph(13, 1.9)}</span>
            Shake again
          </button>
          {/* Reading the count directly under the control that spends one is
              where it does the most good. Note the off-by-one: the question in
              front of you is already counted, so 4/5 means this yields your
              fifth. */}
          <div style={{ minHeight: 12, ...dayCounter }}>{dayLabel(dayUsed)}</div>
        </div>

      </div>

      {/* Lifted out of the prompt layer: that layer carries its own opacity and
          transform, which make a stacking context the toast could not rise out
          of, and the write modal has to pass underneath this.
          It cost the toast its old ride, though — inside that layer it faded
          out with the question whatever its own state said. Out here nothing
          hides it but itself, so it is held to the settled screen it belongs
          to and cannot paint over the moon. */}
      <div style={{
        position: 'absolute', zIndex: 42, bottom: 214, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none',
        font: '400 11px/1 ui-monospace,Menlo,monospace', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(242,193,78,.8)',
        opacity: state.shareNote && ph === 'settled' ? 1 : 0,
        transition: 'opacity 260ms linear',
      }}>{state.shareNote || ''}</div>

      <Wall
        door={state.wall}
        onClose={actions.closeWall}
        onJoin={actions.joinWaitlist}
        returnFocusRef={wallFromRef}
      />

      <SavedPanel
        open={state.panelOpen}
        rows={saved}
        onClose={actions.closePanel}
        onToggleDone={actions.toggleDone}
        onRemove={actions.removeSaved}
        onRestore={actions.restoreSaved}
        onCommit={actions.commitSaved}
        returnFocusRef={savedRef}
      />

      <WriteModal
        tier={state.writeModal}
        tip={state.writeTip}
        onClose={actions.closeWrite}
        onCopy={actions.copyFromModal}
        returnFocusRef={writeRef}
      />

      <Spotlight
        targetRef={catsRef}
        show={ph === 'idle' && introStep === 0 && !state.infoOpen}
        text="Pick the ground your question comes from — yourself, your life, or the world beyond it. Change it whenever you like."
        place="above"
        onDismiss={actions.advanceIntro}
      />
      <Spotlight
        targetRef={weightsRef}
        show={ph === 'idle' && introStep === 1 && !state.infoOpen}
        text="And how far you want to be pushed. Some questions are a passing thought, some stay with you for days."
        place="above"
        onDismiss={actions.advanceIntro}
      />
      <Spotlight
        targetRef={promptRef}
        show={ph === 'settled' && !coachSeen && !state.shareNote}
        text="That's a reflection. Sit with it as long as you like."
        place="below"
        onDismiss={actions.dismissCoach}
      />

      {/* Waits for the second question: the first already carries the reflection
          mark, and two coach marks on one screen teach neither. */}
      <Spotlight
        targetRef={shareRef}
        show={ph === 'settled' && coachSeen && !shareCoachSeen && revealsTotal >= 2 && !state.shareNote}
        text="Send a question to someone — they’ll get the prompt, no app required to open it."
        place="above"
        onDismiss={actions.dismissShareCoach}
      />
      {/* Held until the streak means something. It is counted during the reveal,
          when the chrome is hidden, so this lands back on the idle screen. */}
      <Spotlight
        targetRef={streakRef}
        show={ph === 'idle' && introStep >= 2 && !streakCoachSeen && streakDays >= 2}
        text="Two days. That’s the start of a streak — come back tomorrow to keep it going."
        place="below"
        onDismiss={actions.dismissStreakCoach}
      />
    </div>
  );
}
