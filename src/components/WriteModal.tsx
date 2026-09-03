import { useEffect, useRef, useState } from 'react';
import AstronautBust from './AstronautBust';

/** 1 the first time the write icon is ever tapped, 2 every time after. */
export type WriteTier = 1 | 2 | null;

interface WriteModalProps {
  tier: WriteTier;
  /** Tier 2's line. Drawn by the caller, on the tap that opens this. */
  tip: string;
  /** Close, and for tier 1 raise the toast on the way out. */
  onClose: () => void;
  /** Tier 2 only: put the question on the clipboard and raise the toast now. */
  onCopy: () => void;
  /** Focus goes back here on close — the icon that opened it. */
  returnFocusRef: React.RefObject<HTMLElement | null>;
}

// Centring and the entrance are on two elements on purpose. lua-rise ends on
// `transform: none`, and an animation's own transform beats the inline one — so
// a card that both centred itself with translateY(-50%) and ran the rise would
// land half its own height too low the moment the animation filled forwards.
// The wrapper holds the position; the card inside it only moves.
const SHELL: React.CSSProperties = {
  position: 'absolute', zIndex: 41, left: 26, right: 26, top: '50%',
  transform: 'translateY(-50%)',
};

const CARD = {
  position: 'relative', borderRadius: 8, background: '#20222f',
} as const satisfies React.CSSProperties;

const CLOSE_BTN: React.CSSProperties = {
  position: 'absolute', width: 44, height: 44,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'none', border: 0, cursor: 'pointer', color: 'rgba(147,151,171,.8)',
};

const reduced = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// The modal that stands in for a text box. Lua has never had one, and the write
// icon copies the question out instead — silently, until now. Tapping it used
// to produce a two-second toast and nothing else, which reads as a bug the
// first time: something happened, but not what, and not why there is nowhere to
// type. This says it once, properly, and after that gets out of the way.
//
// Two tiers, and they copy at different moments on purpose. The first explains
// a copy that has already happened, so the clipboard is written on open and the
// toast waits for the dismissal. The second is the old behaviour with a
// sentence in front of it, so nothing reaches the clipboard until the button is
// actually pressed.
//
// It renders inside the canvas rather than a portal at document level: the
// stage is scaled to the viewport, and a portal would escape that and land at
// the wrong size.
export default function WriteModal({ tier, tip, onClose, onCopy, returnFocusRef }: WriteModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<WriteTier>(null);
  const [copied, setCopied] = useState(false);
  const soft = reduced();

  // Focus lands on the card, not the button: a reader arriving by keyboard is
  // told what this is before reaching the control that acts.
  useEffect(() => {
    if (tier === null) { openRef.current = null; return; }
    if (openRef.current === tier) return;
    openRef.current = tier;
    cardRef.current?.focus();
  }, [tier]);

  // Escape closes, and Tab stays inside. The card itself is the first stop, so
  // a reader arriving by keyboard is told what this is before reaching the
  // button that acts.
  //
  // The handler reaches `close` through a ref so this can subscribe once per
  // opening. Closing over it directly would mean re-subscribing on every
  // render — the callbacks come from the hook and are new objects each time —
  // which leaves the window without a listener for the moment in between.
  const closeRef = useRef(() => {});
  useEffect(() => { closeRef.current = () => close(); });

  useEffect(() => {
    if (tier === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const card = cardRef.current;
      if (!card) return;
      const stops = [card, ...card.querySelectorAll<HTMLElement>('button')];
      const at = stops.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey
        ? (at <= 0 ? stops.length - 1 : at - 1)
        : (at === stops.length - 1 ? 0 : at + 1);
      e.preventDefault();
      stops[next]?.focus();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tier]);

  function close() {
    // Reset here rather than on open: this component stays mounted between
    // openings, so a button left reading 'Copied' would still say so the next
    // time the card came up — and would refuse to copy again.
    setCopied(false);
    returnFocusRef.current?.focus();
    onClose();
  }

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  function copy() {
    if (copied) return;
    onCopy();
    setCopied(true);
    // Long enough to read the button change, short enough that it does not feel
    // like waiting for the modal to make up its mind. The toast outlives it.
    closeTimer.current = setTimeout(close, 900);
  }

  if (tier === null) return null;

  const closeButton = (style: React.CSSProperties) => (
    <button type="button" onClick={close} aria-label="Close" style={{ ...CLOSE_BTN, ...style }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
        <path d="M6.4 6.4l11.2 11.2M17.6 6.4L6.4 17.6" />
      </svg>
    </button>
  );

  return (
    <>
      <div
        onPointerDown={(e) => { e.stopPropagation(); close(); }}
        style={{
          position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(6,6,12,.76)',
          animation: soft ? undefined : 'lua-dim 200ms linear both',
        }}
      />

      <div style={SHELL}>
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={tier === 1 ? 'Copied to your clipboard' : 'Still no text box'}
        tabIndex={-1}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          ...CARD,
          padding: tier === 1 ? '24px 22px 26px' : 18,
          boxShadow: tier === 1
            ? '0 0 0 1px #3f424d, 0 24px 56px rgba(0,0,0,.7)'
            : '0 0 0 1px #3f424d, 0 20px 44px rgba(0,0,0,.66)',
          animation: soft ? undefined : `lua-rise ${tier === 1 ? 260 : 200}ms cubic-bezier(.33,1,.68,1) both`,
          outline: 'none',
        }}
      >
        {tier === 1 ? (
          <>
            <div style={{ margin: '0 0 18px' }}><AstronautBust size={70} /></div>

            <div style={{
              font: '400 11px/1 ui-monospace,Menlo,monospace', letterSpacing: '.08em',
              color: 'rgba(242,193,78,.8)', margin: '0 0 12px',
            }}>Copied to your clipboard.</div>
            <p style={{
              margin: 0, font: '400 14.5px/1.62 Inter,sans-serif', color: '#cfd3e5', textWrap: 'pretty',
            }}>Lua’s not built for typing — paper works better for this. Paste it into your favourite notes app if you’d rather write there instead.</p>

            {closeButton({ top: 6, right: 6 })}
          </>
        ) : (
          <>
            <div style={{
              font: '400 11.5px/1.4 Inter,sans-serif', letterSpacing: '.01em',
              color: '#9397ab', margin: '0 0 7px', paddingRight: 34,
            }}>Still no text box — on purpose.</div>
            <p style={{
              margin: '0 0 18px', font: '400 15px/1.5 Inter,sans-serif',
              letterSpacing: '-.004em', color: '#cfd3e5', textWrap: 'pretty',
            }}>{tip}</p>
            <button type="button" onClick={copy} style={{
              width: '100%', height: 44, borderRadius: 100, cursor: 'pointer',
              border: `1px solid ${copied ? 'rgba(242,193,78,.5)' : 'rgba(145,132,217,.55)'}`,
              background: copied ? 'rgba(242,193,78,.08)' : 'rgba(145,132,217,.10)',
              color: copied ? 'rgba(242,193,78,.9)' : '#d2cefd',
              font: '400 13.5px/1 Inter,sans-serif', letterSpacing: '.02em',
              transition: 'all .2s',
            }}>{copied ? 'Copied' : 'Copy to clipboard'}</button>

            {closeButton({ top: 2, right: 2 })}
          </>
        )}
      </div>
      </div>
    </>
  );
}
