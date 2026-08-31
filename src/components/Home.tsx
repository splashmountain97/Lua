import { useRef } from 'react';
import moonBody from '../assets/moon-body.png';
import glassSwirl from '../assets/glass-swirl.png';
import { CATS, PROMPTS, WEIGHTS, WEIGHT_ANY_NOTE, WEIGHT_NOTE } from '../data/content';
import { PHASES, EASE_IN, EASE_OUT, M, CX, WX, WY, WPX, AP_R, apertureY, targetY } from '../lib/phases';
import { useStageLayout } from '../lib/layout';
import Spotlight from './Spotlight';
import Wall from './Wall';
import type { useLua } from '../hooks/useLua';

type Lua = ReturnType<typeof useLua>;

const wdotStyle = (i: number, pw: number): React.CSSProperties => ({
  display: 'block', width: 4, height: 4, borderRadius: '50%',
  background: i <= pw ? 'rgba(242,193,78,.72)' : 'rgba(233,237,245,.16)',
});

export default function Home({ lua }: { lua: Lua }) {
  const { state, streakDays, coachSeen, introStep, quiet, freePerDay, actions } = lua;
  const { titleY, moonCY, lineY, height: stageH } = useStageLayout();
  const promptRef = useRef<HTMLDivElement>(null);
  const catsRef = useRef<HTMLDivElement>(null);
  const weightsRef = useRef<HTMLDivElement>(null);
  const ph = state.phase;
  const v = PHASES[ph];
  const big = ph === 'reveal' || ph === 'settled';
  const ease = ph === 'reveal' ? EASE_IN : EASE_OUT;
  const tx = state.tiltX * (big ? .06 : 1);
  const ty = state.tiltY * (big ? .06 : 1);
  const jitterOn = ph === 'agitate';
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

  return (
    <div style={{ position: 'absolute', inset: 0 }}>

      {/* chrome: pill filter + streak glyph */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 24, opacity: v.chrome,
        pointerEvents: v.chrome > .8 ? 'auto' : 'none',
        transition: `opacity ${Math.round(dur * 0.5)}ms linear`,
      }}>
        <div style={{ position: 'absolute', top: 70, left: 0, right: 0, display: 'flex', justifyContent: 'flex-end', padding: '0 14px' }}>
          <button type="button" onClick={actions.goStreak} aria-label="Streak" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            width: 46, height: 46, background: 'none', border: 0, padding: 0, cursor: 'pointer',
          }}>
            <span style={{
              display: 'block', width: 11, height: 11, borderRadius: '50%',
              background: `radial-gradient(circle at ${(96 - Math.min(78, streakDays * 3.1)).toFixed(0)}% 46%, rgba(242,193,78,.92) 0%, rgba(230,175,66,.8) 34%, rgba(63,66,77,1) 58%, rgba(47,50,60,1) 100%)`,
              boxShadow: 'inset 0 0 0 1px rgba(233,233,237,.1)',
            }} />
            <span style={{ font: '400 10px/1 ui-monospace,Menlo,monospace', color: '#9397ab', letterSpacing: '.02em' }}>{streakDays}d</span>
          </button>
        </div>

        <div style={{ position: 'absolute', top: titleY, left: 0, right: 0, textAlign: 'center', padding: '0 32px' }}>
          <div style={{ font: '300 25px/1.2 Inter,sans-serif', letterSpacing: '-.028em', color: '#f0eef2' }}>{hintTitle}</div>
        </div>
        <div style={{
          position: 'absolute', top: lineY, left: 0, right: 0, textAlign: 'center', padding: '0 40px',
          font: '400 11px/1.5 ui-monospace,Menlo,monospace', letterSpacing: '.06em', color: 'rgba(147,151,171,.9)',
          animation: 'lua-hint 5.2s ease-in-out infinite',
          display: infoCat ? 'none' : 'block',
        }}>{state.tipLine}</div>

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
                return (
                  <div key={c.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button type="button" onClick={(e) => actions.toggleCategory(c.id, e)} style={{ display: 'flex', alignItems: 'center', height: 46, padding: 0, background: 'none', border: 0, cursor: 'pointer' }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', height: 32, padding: '0 10px 0 11px', borderRadius: '100px 0 0 100px',
                        font: '400 12.5px/1 Inter,sans-serif', letterSpacing: '.012em', transition: 'all .18s',
                        border: `1px solid ${on ? `rgba(145,132,217,${quiet ? .34 : .6})` : 'rgba(147,151,171,.16)'}`,
                        borderRight: 0,
                        background: on ? `rgba(145,132,217,${quiet ? .05 : .13})` : 'transparent',
                        color: on ? (quiet ? '#b5abfc' : '#d2cefd') : '#9397ab',
                      }}>
                        <span style={{
                          display: 'block', flex: 'none', width: 8, height: 8, marginRight: 7, borderRadius: '50%', transition: 'all .18s',
                          boxShadow: `inset 0 0 0 1px ${on ? 'rgba(181,171,252,.9)' : 'rgba(147,151,171,.5)'}`,
                          background: on ? '#b5abfc' : 'transparent',
                        }} />
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

        <div style={{
          position: 'absolute', bottom: 74, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          opacity: ph === 'settled' ? 1 : 0,
          transition: `opacity 700ms linear ${ph === 'settled' ? '300ms' : '0ms'}`,
        }}>
          <button type="button" onClick={actions.dismiss} style={{ background: 'none', border: 0, padding: '16px 14px', cursor: 'pointer', font: '400 12px/1 Inter,sans-serif', letterSpacing: '.05em', color: '#9397ab' }}>I'm done</button>
          <button type="button" onClick={actions.again} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1px solid rgba(145,132,217,.42)', borderRadius: 100, padding: '15px 18px', cursor: 'pointer', font: '400 12px/1 Inter,sans-serif', letterSpacing: '.05em', color: '#b5abfc' }}>
            Another
            <span style={{ font: '400 10.5px/1 ui-monospace,Menlo,monospace', letterSpacing: '.02em', color: 'rgba(181,171,252,.55)' }}>
              {Math.min(state.revealsToday, freePerDay)}/{freePerDay}
            </span>
          </button>
          <button type="button" onClick={actions.share} aria-label="Send this question to someone" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 0, padding: '16px 14px', cursor: 'pointer', font: '400 12px/1 Inter,sans-serif', letterSpacing: '.05em', color: '#9397ab' }}>
            <span style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: 'rgba(242,193,78,.55)' }} />Send to a friend
          </button>
        </div>

        <div style={{
          position: 'absolute', bottom: 132, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none',
          font: '400 11px/1 ui-monospace,Menlo,monospace', letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(242,193,78,.8)',
          opacity: state.shareNote ? 1 : 0,
          transition: 'opacity 260ms linear',
        }}>{state.shareNote || ''}</div>
      </div>

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

      {state.wall && <Wall wall={state.wall} onClose={actions.closeWall} />}
    </div>
  );
}
