import { useCallback, useLayoutEffect, useRef, useState } from 'react';

const STAGE_W = 402;

const FADE_MS = 300;
/** Breathing room between the spotlit element and the edge of the lit area. */
const PAD_X = 14;
const PAD_Y = 12;
/** Gap between the lit area and the callout pointing at it. */
const GAP = 14;
const NOTCH = 7;

interface Rect { x: number; y: number; w: number; h: number }

interface SpotlightProps {
  /** The element to keep lit. Everything else on the stage dims behind it. */
  targetRef: React.RefObject<HTMLElement | null>;
  show: boolean;
  text: string;
  /** Which side of the target the callout sits on. */
  place: 'above' | 'below';
  onDismiss: () => void;
}

// A one-time coach moment: dim the stage, leave one element lit, and hang a
// short callout off it. Deliberately not a tour — there is no step counter and
// no next button, because the two places this is used are unrelated moments at
// opposite ends of the flow rather than a sequence to progress through.
//
// The lit area is a hole punched with a huge spread box-shadow, the same
// technique the aperture already uses to occlude the stage during the reveal.
// The overlay renders inside the canvas, so the shadow is clipped to it and the
// geometry can be measured in the design's own coordinate space: the overlay
// fills the canvas, so its own box is the reference frame and its rendered
// width over the design width gives the stage scale.
export default function Spotlight({ targetRef, show, text, place, onDismiss }: SpotlightProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);

  const measure = useCallback(() => {
    const overlay = overlayRef.current;
    const target = targetRef.current;
    if (!overlay || !target) return;
    const o = overlay.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    if (!o.width || !t.width) return;
    const scale = o.width / STAGE_W;
    setRect({
      x: (t.left - o.left) / scale - PAD_X,
      y: (t.top - o.top) / scale - PAD_Y,
      w: t.width / scale + PAD_X * 2,
      h: t.height / scale + PAD_Y * 2,
    });
  }, [targetRef]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (overlayRef.current) ro.observe(overlayRef.current);
    if (targetRef.current) ro.observe(targetRef.current);
    return () => ro.disconnect();
  }, [measure, targetRef]);

  const lit = show && rect;
  const calloutStyle: React.CSSProperties = place === 'above'
    ? { bottom: rect ? `calc(100% - ${rect.y - GAP}px)` : undefined }
    : { top: rect ? rect.y + rect.h + GAP : undefined };

  return (
    <div
      ref={overlayRef}
      onPointerDown={show ? (e) => { e.stopPropagation(); onDismiss(); } : undefined}
      style={{
        position: 'absolute', inset: 0, zIndex: 30,
        // Always mounted, shown by style alone. Mounting on `show` and
        // unmounting on a fade-out timer let the timer fire after the next
        // spotlight had already been asked to appear, taking it back off the
        // screen while it was still meant to be up. Visibility rather than
        // display so the overlay keeps its box: it is its own measuring stick
        // for the stage scale.
        opacity: show ? 1 : 0,
        visibility: show ? 'visible' : 'hidden',
        pointerEvents: show ? 'auto' : 'none',
        transition: `opacity ${FADE_MS}ms linear`,
      }}
    >
      {rect && (
        <div style={{
          position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h,
          borderRadius: 16, pointerEvents: 'none',
          boxShadow: '0 0 0 9999px rgba(6,6,12,.76), inset 0 0 0 1px rgba(145,132,217,.16)',
        }} />
      )}

      {lit && (
        <div style={{
          position: 'absolute', left: 0, right: 0, padding: '0 26px',
          display: 'flex', justifyContent: 'center', pointerEvents: 'none',
          animation: 'lua-rise .32s cubic-bezier(.33,1,.68,1) both',
          ...calloutStyle,
        }}>
          <div style={{
            position: 'relative', maxWidth: 268,
            padding: '10px 13px 11px', borderRadius: 8, background: '#20222f',
            boxShadow: '0 0 0 1px #3f424d, 0 10px 26px rgba(0,0,0,.6)',
          }}>
            <div style={{ font: '400 11.5px/1.55 Inter,sans-serif', color: '#cfd3e5' }}>{text}</div>
            <div style={{
              position: 'absolute', left: '50%', width: NOTCH, height: NOTCH,
              marginLeft: -NOTCH / 2, background: '#20222f', transform: 'rotate(45deg)',
              ...(place === 'above'
                ? { bottom: -NOTCH / 2, boxShadow: '1px 1px 0 0 #3f424d' }
                : { top: -NOTCH / 2, boxShadow: '-1px -1px 0 0 #3f424d' }),
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
