import { useEffect, useRef, useState } from 'react';
import { LANGS, resolveLang, type LangPref } from '../lib/i18n';
import { useLang } from '../hooks/useLang';
import { UI } from '../lib/strings';

const reduced = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Past this much of a downward drag on the grabber, the sheet goes. */
const DISMISS_DY = 56;

const HAIRLINE = 'rgba(233,237,245,.07)';

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  /** The gear, which the focus goes back to. */
  returnFocusRef: React.RefObject<HTMLElement | null>;
}

// Settings, as a bottom sheet over the home screen rather than a screen of its
// own. It is summoned from a corner and answers one question at a time, which
// is utility; a full drawer would read as a place, and SavedPanel already owns
// the left drawer besides.
//
// It renders inside the canvas, like every other overlay: the stage is scaled
// to the viewport, and a portal at document level would land at the wrong size.
//
// Two row types and no others, so the list stays a list as it grows: a value
// row that expands its options in place, and — when the sound toggle arrives —
// a toggle row of identical height and padding. The sheet sizes to its content
// and starts scrolling only once there is more than fits.
//
// It holds no language of its own: the preference lives in LangProvider, and
// picking one here is the same write any other screen would make.
export default function SettingsSheet({ open, onClose, returnFocusRef }: SettingsSheetProps) {
  const { pref, setPref, t } = useLang();
  const sheetRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const [langOpen, setLangOpen] = useState(false);
  // Where the finger went down, and the stage's scale at that moment. Both are
  // read only inside the pointer handlers, never during a render — the drag's
  // one rendered value is `dy`.
  const startY = useRef(0);
  const scale = useRef(1);
  // How far it has been dragged, kept twice: state to render it, a ref so the
  // release can read it without closing over the render that began the drag.
  const dyRef = useRef(0);
  const [dy, setDy] = useState(0);
  const soft = reduced();

  // What Automatic would actually land on, named rather than described.
  const autoName = LANGS.find(l => l.id === resolveLang('system'))?.label ?? 'English';

  useEffect(() => {
    if (!open) { openRef.current = false; return; }
    if (openRef.current) return;
    openRef.current = true;
    sheetRef.current?.focus();
  }, [open]);

  // Reached through a ref so the key listener subscribes once per opening
  // rather than re-subscribing on every render — the same shape SavedPanel uses.
  const closeRef = useRef(() => {});
  useEffect(() => {
    closeRef.current = () => {
      // Folded on the way out rather than on the way in: the sheet stays
      // mounted between openings, so an expanded row left behind would be the
      // first thing the next opening showed.
      setLangOpen(false);
      dyRef.current = 0;
      setDy(0);
      returnFocusRef.current?.focus();
      onClose();
    };
  });

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const sheet = sheetRef.current;
      if (!sheet) return;
      const stops = [sheet, ...sheet.querySelectorAll<HTMLElement>('button')]
        .filter(el => el === sheet || el.offsetParent !== null);
      const at = stops.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey
        ? (at <= 0 ? stops.length - 1 : at - 1)
        : (at === stops.length - 1 ? 0 : at + 1);
      e.preventDefault();
      stops[next]?.focus();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  function close() { closeRef.current(); }

  // The grabber drags, and only downwards: a sheet that could be hauled up off
  // its own edge would leave a gap under it.
  function onGrabDown(e: React.PointerEvent) {
    startY.current = e.clientY;
    // The pointer moves in viewport pixels and the sheet is drawn inside a
    // scaled canvas, so the two have to be reconciled or the sheet lags the
    // finger by however far the stage is from 1:1. Measured here rather than
    // assumed: the stage scale is a function of the viewport and changes under
    // a rotation. Spotlight reads the scale the same way.
    const el = sheetRef.current;
    scale.current = el && el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1;
    dyRef.current = 0;
    setDy(0);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onGrabMove(e: React.PointerEvent) {
    if (!e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
    dyRef.current = Math.max(0, (e.clientY - startY.current) / scale.current);
    setDy(dyRef.current);
  }
  function onGrabUp(e: React.PointerEvent) {
    if (!e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    const go = dyRef.current > DISMISS_DY;
    dyRef.current = 0;
    setDy(0);
    // Outside any updater: StrictMode runs those twice, and this one closes a
    // dialog. close() folds the sheet's own state as well, so a drag that gets
    // there leaves exactly what the X and the backdrop leave.
    if (go) close();
  }

  const title = t(UI.settings.title);
  const closeLabel = t(UI.settings.close);
  const rows: { id: LangPref; label: string; note?: string }[] = [
    { id: 'system', label: t(UI.settings.auto), note: t(UI.settings.autoNote(autoName)) },
    ...LANGS.map(l => ({ id: l.id as LangPref, label: l.label, note: l.note })),
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40 }}>
      <div
        onPointerDown={(e) => { e.stopPropagation(); close(); }}
        style={{
          position: 'absolute', inset: 0, background: 'rgba(6,6,12,.76)',
          animation: soft ? undefined : 'lua-dim 200ms linear both',
        }}
      />

      {/* Two elements, because the entry and the drag both want `transform`
          and an animation wins that argument: `lua-sheet` fills `both`, so its
          final `transform: none` would go on overriding the drag's inline one
          for as long as the sheet was open, and the sheet would refuse to
          follow the finger. The wrapper rides in, the sheet inside it drags.

          The ceiling lives out here too, where a percentage has something
          definite to measure against: this box is positioned against the
          canvas, so 78% is 78% of the stage. On the row region itself it would
          have resolved against a sheet whose own height comes from that
          region — circular, and no ceiling at all once there were enough rows
          to need one. */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '78%',
        display: 'flex',
        animation: soft ? undefined : 'lua-sheet 300ms cubic-bezier(.28,1,.34,1) both',
      }}>
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            outline: 'none', flex: 1, minHeight: 0,
            display: 'flex', flexDirection: 'column',
            background: '#171927', borderRadius: '16px 16px 0 0',
            boxShadow: `0 -1px 0 ${HAIRLINE}, 0 -24px 60px rgba(0,0,0,.62)`,
            padding: '10px 0 30px',
            transform: dy ? `translateY(${dy}px)` : undefined,
            // Under the finger it tracks it exactly, so no transition; let go
            // short of the threshold and dy returns to nothing, which the
            // curve then springs back.
            transition: dy ? 'none' : 'transform 220ms cubic-bezier(.28,1,.34,1)',
          }}
        >
          <div
            onPointerDown={onGrabDown}
            onPointerMove={onGrabMove}
            onPointerUp={onGrabUp}
            onPointerCancel={onGrabUp}
            style={{
              flex: 'none', display: 'flex', justifyContent: 'center', padding: '0 0 12px',
              touchAction: 'none', cursor: 'grab',
            }}
          >
            <span aria-hidden="true" style={{
              display: 'block', width: 36, height: 4, borderRadius: 2,
              background: 'rgba(233,237,245,.14)',
            }} />
          </div>

          <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px 0 22px' }}>
            <div style={{
              font: '500 10px/1 ui-monospace,Menlo,monospace', letterSpacing: '.16em',
              textTransform: 'uppercase', color: '#9397ab',
            }}>{title}</div>
            <button type="button" onClick={close} aria-label={closeLabel} title={closeLabel} style={{
              width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 0, cursor: 'pointer', color: 'rgba(147,151,171,.8)',
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6" />
              </svg>
            </button>
          </div>

          <div style={{ flex: 'none', height: 1, margin: '6px 0 0', background: HAIRLINE }} />

          {/* One section, so no section header yet — that arrives with the
              second one, as the SavedPanel kicker. The scroll is already here
              so that growth is a matter of adding rows and nothing else. */}
          <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
            <button
              type="button"
              data-lua-row
              onClick={() => setLangOpen(v => !v)}
              aria-expanded={langOpen}
              aria-controls="lua-lang-options"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                width: '100%', minHeight: 58, padding: '0 20px 0 22px',
                background: 'none', border: 0, cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ font: '400 14.5px/1.3 Inter,sans-serif', color: '#cfd3e5' }}>{t(UI.settings.language)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
                <span style={{ font: '400 13px/1.3 Inter,sans-serif', color: '#9397ab' }}>
                  {pref === 'system'
                    ? t(UI.settings.autoValue(autoName))
                    : LANGS.find(l => l.id === pref)?.label}
                </span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#75798c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                  style={{ transition: 'transform 220ms', transform: langOpen ? 'rotate(90deg)' : undefined }}>
                  <path d="M9 5.5l7 6.5-7 6.5" />
                </svg>
              </span>
            </button>

            <div id="lua-lang-options" hidden={!langOpen}>
              {langOpen && (
                <div style={{
                  padding: '0 12px 8px',
                  animation: soft ? undefined : 'lua-rise 200ms cubic-bezier(.33,1,.68,1) both',
                }}>
                  {rows.map(row => {
                    const on = row.id === pref;
                    return (
                      <button
                        key={row.id}
                        type="button"
                        data-lua-row
                        // Applies at once, behind the open sheet: no restart and
                        // no confirm, and the sheet stays where it is so the
                        // change is visible where it was made.
                        onClick={() => setPref(row.id)}
                        aria-pressed={on}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                          width: '100%', minHeight: 52, padding: '0 10px',
                          border: 0, borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                          background: on ? 'rgba(145,132,217,.08)' : 'transparent',
                        }}
                      >
                        <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span style={{
                            font: '400 14px/1.3 Inter,sans-serif',
                            color: on ? '#e9e9ed' : '#cfd3e5',
                          }}>{row.label}</span>
                          {row.note && (
                            <span style={{ font: '400 11.5px/1.35 Inter,sans-serif', color: '#75798c' }}>{row.note}</span>
                          )}
                        </span>
                        <span style={{
                          flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 21, height: 21, borderRadius: '50%',
                          background: on ? 'rgba(145,132,217,.9)' : 'transparent',
                          boxShadow: on ? undefined : 'inset 0 0 0 1.4px rgba(147,151,171,.5)',
                        }}>
                          {on && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#171927" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: 'none', height: 1, background: HAIRLINE }} />

          <p style={{
            flex: 'none', margin: '16px 22px 0', font: '400 11.5px/1.6 Inter,sans-serif',
            color: '#75798c', textWrap: 'pretty',
          }}>{t(UI.settings.footer)}</p>
        </div>
      </div>
    </div>
  );
}
