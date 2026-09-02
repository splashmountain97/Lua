import { useEffect, useRef, useState } from 'react';
import { CATS, PROMPTS, promptIndexById } from '../data/content';
import type { SavedEntry } from '../lib/storage';

const OPEN_X = -84;
/** A little rubber-band past the stop, so the drag has somewhere to go. */
const DRAG_LIMIT = OPEN_X - 18;
const UNDO_MS = 4200;
/** Under five, folding the done list costs more than it saves. */
const FOLD_ABOVE = 4;

const AMBER = 'rgba(242,193,78,.72)';
const OFF = 'rgba(233,237,245,.16)';

interface SavedPanelProps {
  open: boolean;
  rows: SavedEntry[];
  onClose: () => void;
  onToggleDone: (id: number) => void;
  onRemove: (id: number) => void;
  onRestore: (row: SavedEntry, at: number) => void;
  /** Write the list through once a removal is past taking back. */
  onCommit: () => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}

const reduced = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const sectionHeader: React.CSSProperties = {
  font: '500 10px/1 ui-monospace,Menlo,monospace', letterSpacing: '.14em',
  textTransform: 'uppercase', color: '#9397ab',
};
const countStyle: React.CSSProperties = {
  font: '400 10px/1 ui-monospace,Menlo,monospace', color: '#5c6070',
};
const removeAction: React.CSSProperties = {
  position: 'absolute', top: 0, right: 0, bottom: 0, width: 84,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
  border: 0, background: 'none', cursor: 'pointer', color: '#b2b6ca',
};

const dot = (lit: boolean, colour: string): React.CSSProperties => ({
  display: 'block', width: 4, height: 4, borderRadius: '50%',
  background: lit ? colour : OFF,
});

// The questions someone put aside, and the ones they have since sat with.
//
// A left drawer, because it opens from the button in the top-left that summons
// it. It renders inside the canvas rather than a portal at document level: the
// stage is scaled to the viewport, and a portal would escape that.
//
// Removal is held rather than dropped. The row leaves the list at once so the
// count is honest, but storage is not written until the undo window lapses —
// so a removal interrupted by closing the app is a removal that never
// happened. That is the forgiving reading, and it costs nothing.
export default function SavedPanel({
  open, rows, onClose, onToggleDone, onRemove, onRestore, onCommit, returnFocusRef,
}: SavedPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ id: number; dx: number } | null>(null);
  const [pending, setPending] = useState<{ row: SavedEntry; at: number } | null>(null);
  const [doneOpen, setDoneOpen] = useState(false);
  const soft = reduced();

  const startX = useRef(0);
  const base = useRef(0);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) { openRef.current = false; return; }
    if (openRef.current) return;
    openRef.current = true;
    panelRef.current?.focus();
  }, [open]);

  function settle() {
    if (undoTimer.current) { clearTimeout(undoTimer.current); undoTimer.current = null; }
    if (pending) { setPending(null); onCommit(); }
  }

  function close() {
    settle();
    setOpenId(null);
    setDrag(null);
    returnFocusRef.current?.focus();
    onClose();
  }

  // Reached through a ref so the key listener below can subscribe once per
  // opening rather than re-subscribing on every render.
  const closeRef = useRef(() => {});
  useEffect(() => { closeRef.current = () => close(); });

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const stops = [panel, ...panel.querySelectorAll<HTMLElement>('button')]
        .filter(el => el === panel || el.offsetParent !== null);
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

  useEffect(() => () => { if (undoTimer.current) clearTimeout(undoTimer.current); }, []);

  function remove(id: number) {
    settle();
    const at = rows.findIndex(r => r.id === id);
    if (at < 0) return;
    setPending({ row: rows[at], at });
    setOpenId(null);
    setDrag(null);
    onRemove(id);
    undoTimer.current = setTimeout(() => { setPending(null); onCommit(); }, UNDO_MS);
  }

  function undo() {
    if (undoTimer.current) { clearTimeout(undoTimer.current); undoTimer.current = null; }
    if (pending) onRestore(pending.row, pending.at);
    setPending(null);
  }

  function toggle(id: number) {
    settle();
    setOpenId(null);
    setDrag(null);
    onToggleDone(id);
  }

  function onDown(id: number, e: React.PointerEvent) {
    startX.current = e.clientX;
    base.current = openId === id ? OPEN_X : 0;
    setDrag({ id, dx: base.current });
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onMove(id: number, e: React.PointerEvent) {
    if (drag?.id !== id) return;
    setDrag({ id, dx: Math.max(DRAG_LIMIT, Math.min(0, base.current + (e.clientX - startX.current))) });
  }
  function onUp(id: number) {
    if (drag?.id !== id) return;
    // Past half of the action's width commits to open, as list rows everywhere do.
    setOpenId(drag.dx < OPEN_X / 2 ? id : null);
    setDrag(null);
  }

  const saved = rows.filter(r => !r.done);
  const done = rows.filter(r => r.done);
  const folds = done.length > FOLD_ABOVE;
  const doneShown = folds && !doneOpen ? [] : done;

  if (!open) return null;

  function card(entry: SavedEntry) {
    const ix = promptIndexById(entry.id);
    if (ix < 0) return null;
    const prompt = PROMPTS[ix];
    const cat = CATS.find(c => c.id === prompt.c);
    const x = drag?.id === entry.id ? drag.dx : openId === entry.id ? OPEN_X : 0;
    const lit = entry.done ? 'rgba(147,151,171,.42)' : AMBER;

    return (
      <div key={entry.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: 'rgba(233,237,245,.05)' }}>
        {/* Behind the card in DOM order, so the swipe is a shortcut and never
            the only route — this stays reachable by keyboard. */}
        <button type="button" onClick={() => remove(entry.id)} style={removeAction}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4.5 6.5h15M9.5 6.5V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.7" />
            <path d="M6.5 6.5l.9 12.2a1 1 0 0 0 1 .9h7.2a1 1 0 0 0 1-.9l.9-12.2" />
          </svg>
          <span style={{ font: '400 10px/1 ui-monospace,Menlo,monospace', letterSpacing: '.08em', textTransform: 'uppercase' }}>Remove</span>
        </button>

        <div
          onPointerDown={(e) => onDown(entry.id, e)}
          onPointerMove={(e) => onMove(entry.id, e)}
          onPointerUp={() => onUp(entry.id)}
          onPointerCancel={() => onUp(entry.id)}
          style={{
            position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '13px 14px 14px', borderRadius: 8,
            background: entry.done ? '#1c1e29' : '#20222f',
            boxShadow: `0 0 0 1px ${entry.done ? '#2c2f3b' : '#3f424d'}`,
            touchAction: 'pan-y',
            transform: `translateX(${x}px)`,
            transition: drag?.id === entry.id || soft ? 'none' : 'transform 260ms cubic-bezier(.28,1,.34,1)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 7px' }}>
              <span style={{
                font: '500 9.5px/1 ui-monospace,Menlo,monospace', letterSpacing: '.16em', textTransform: 'uppercase',
                color: entry.done ? 'rgba(147,151,171,.6)' : 'rgba(242,193,78,.78)',
              }}>{cat?.label}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3.5 }}>
                <span style={dot(prompt.w >= 1, lit)} />
                <span style={dot(prompt.w >= 2, lit)} />
                <span style={dot(prompt.w >= 3, lit)} />
              </span>
            </div>
            <div style={{
              font: '400 13.5px/1.45 Inter,sans-serif', letterSpacing: '-.004em',
              color: entry.done ? '#8a8fa3' : '#cfd3e5', textWrap: 'pretty',
            }}>{prompt.t}</div>
          </div>

          <button
            type="button"
            onClick={() => toggle(entry.id)}
            aria-pressed={entry.done}
            aria-label={entry.done ? 'Move back to saved' : 'Mark as reflected on'}
            style={{
              flex: 'none', width: 44, height: 44, margin: '-11px -10px 0 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 0, cursor: 'pointer',
            }}
          >
            {entry.done ? (
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 21, height: 21, borderRadius: '50%', background: 'rgba(145,132,217,.9)',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#171927" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
            ) : (
              <span style={{
                display: 'block', width: 21, height: 21, borderRadius: '50%',
                boxShadow: 'inset 0 0 0 1.4px rgba(147,151,171,.5)',
              }} />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        onPointerDown={(e) => { e.stopPropagation(); close(); }}
        style={{
          position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(6,6,12,.76)',
          animation: soft ? undefined : 'lua-dim 200ms linear both',
        }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Saved questions"
        tabIndex={-1}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', zIndex: 41, left: 0, top: 0, bottom: 0, width: 344,
          background: '#171927',
          boxShadow: '1px 0 0 rgba(233,237,245,.07), 24px 0 60px rgba(0,0,0,.6)',
          animation: soft ? undefined : 'lua-slide 280ms cubic-bezier(.28,1,.34,1) both',
          display: 'flex', flexDirection: 'column', outline: 'none',
        }}
      >
        <div style={{ flex: 'none', padding: '64px 22px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{
                font: '500 10px/1 ui-monospace,Menlo,monospace', letterSpacing: '.16em',
                textTransform: 'uppercase', color: '#9397ab', margin: '0 0 10px',
              }}>Put aside for later</div>
              <div style={{ font: '300 27px/1.2 Inter,sans-serif', letterSpacing: '-.028em', color: '#f0eef2' }}>Saved</div>
            </div>
            <button type="button" onClick={close} aria-label="Close" style={{
              flex: 'none', width: 44, height: 44, margin: '-8px -10px 0 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 0, cursor: 'pointer', color: 'rgba(147,151,171,.8)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6" />
              </svg>
            </button>
          </div>
          <p style={{ margin: '12px 0 0', font: '400 12px/1.55 Inter,sans-serif', color: '#9397ab', maxWidth: 250 }}>
            Only the question is kept — never what you did with it.
          </p>
        </div>

        {/* Cards dissolve under the sticky headers rather than colliding with them. */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 180, height: 18, zIndex: 3,
          pointerEvents: 'none', background: 'linear-gradient(#171927, rgba(23,25,39,0))',
        }} />

        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', padding: '0 22px 96px' }}>
          <div style={{
            position: 'sticky', top: 0, zIndex: 2, display: 'flex', alignItems: 'baseline', gap: 8,
            margin: '0 0 10px', padding: '10px 2px 8px', background: '#171927',
          }}>
            <span style={sectionHeader}>Saved</span>
            <span style={countStyle}>{saved.length}</span>
          </div>

          {saved.length === 0 && (
            <div style={{
              padding: '16px 14px', borderRadius: 8, background: 'rgba(233,237,245,.02)',
              boxShadow: 'inset 0 0 0 1px rgba(233,237,245,.06)',
              font: '400 12px/1.55 Inter,sans-serif', color: '#75798c',
            }}>Nothing put aside. Bookmark a question when you like it but the moment is wrong.</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {saved.map(card)}
          </div>

          {done.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => { if (folds) { settle(); setOpenId(null); setDoneOpen(o => !o); } }}
                aria-expanded={folds ? doneOpen : true}
                aria-controls="lua-reflected-list"
                style={{
                  position: 'sticky', top: 0, zIndex: 2, width: '100%',
                  display: 'flex', alignItems: 'center', gap: 8, margin: '26px 0 10px',
                  padding: '10px 2px 8px', background: '#171927', border: 0,
                  cursor: folds ? 'pointer' : 'default', textAlign: 'left',
                }}
              >
                {folds && (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#9397ab" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                    style={{ flex: 'none', transition: 'transform .2s', transform: doneOpen ? 'none' : 'rotate(-90deg)' }}>
                    <path d="M5 8.5L12 16l7-7.5" />
                  </svg>
                )}
                <span style={sectionHeader}>Reflected on</span>
                <span style={countStyle}>{done.length}</span>
              </button>
              <div id="lua-reflected-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {doneShown.map(card)}
              </div>
            </>
          )}
        </div>

        <div style={{
          position: 'absolute', left: 22, right: 22, bottom: 24, zIndex: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '11px 12px 11px 15px', borderRadius: 8, background: '#262938',
          boxShadow: '0 0 0 1px #3f424d, 0 12px 30px rgba(0,0,0,.55)',
          transition: soft ? undefined : 'opacity 220ms linear, transform 220ms cubic-bezier(.28,1,.34,1)',
          opacity: pending ? 1 : 0,
          transform: pending ? 'none' : 'translateY(10px)',
          pointerEvents: pending ? 'auto' : 'none',
        }}>
          <span style={{ font: '400 12.5px/1 Inter,sans-serif', color: '#cfd3e5' }}>Removed</span>
          <button type="button" onClick={undo} style={{
            padding: '7px 14px', borderRadius: 100, border: '1px solid rgba(145,132,217,.55)',
            background: 'rgba(145,132,217,.10)', color: '#d2cefd',
            font: '400 12px/1 Inter,sans-serif', letterSpacing: '.02em', cursor: 'pointer',
          }}>Undo</button>
        </div>
      </div>
    </>
  );
}
