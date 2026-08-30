import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { DESIGN_H, StageLayoutProvider, layoutFor, stageFit } from '../lib/layout';

const STAGE_W = 402;

const BACKDROP = 'radial-gradient(120% 80% at 50% 34%, #1c1e2e 0%, #161826 46%, #0f101a 100%)';
// The colour the home vignette reaches at its outermost stop. Any strip of
// viewport the canvas does not cover has to arrive there with it, or the
// canvas edge reappears as a frame the moment the vignette darkens.
const VIGNETTE_EDGE = 'rgba(4,4,8,.99)';

interface StageProps {
  children: React.ReactNode;
  /** How far the home vignette has darkened, so the letterbox can follow it. */
  dim?: number;
  dimTransition?: string;
  onPointerDown?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (e: PointerEvent<HTMLDivElement>) => void;
}

// Every pixel value in the ported design assumes a 402-wide canvas, so the
// canvas is kept at that width and scaled as a whole to fit the real viewport —
// the same technique used for pixel-precise canvas/game UIs. Pointer
// coordinates from real DOM events stay correct through this because they're
// read via getBoundingClientRect, which already reports the scaled box.
//
// Width alone drives the scale. Fitting both axes would letterbox the app on
// every screen whose aspect ratio isn't exactly 402:874 — in iOS Safari the URL
// and tab bars take enough height to shrink it to ~85% and leave a bar down
// each side. Driving off width keeps it edge to edge, and the height that
// leaves becomes the canvas height, which the layout then composes against
// (see lib/layout) rather than assuming the design's 874.
//
// Two cases still can't fill the viewport: a screen too short for the
// composition to fit at all, and one so wide that filling it would blow the
// design up past legibility. Both letterbox, so the backdrop is painted on the
// full-viewport outer element and the canvas left transparent — one continuous
// background, and the leftover reads as margin instead of a frame.
export default function Stage({ children, dim = 0, dimTransition, onPointerDown, onPointerMove, onPointerUp }: StageProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState(() => ({ scale: 1, height: DESIGN_H, barX: 0, barY: 0 }));

  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const fit = stageFit(width, height);
      setBox({
        scale: fit.scale,
        height: fit.height,
        barX: Math.max(0, (width - STAGE_W * fit.scale) / 2),
        barY: Math.max(0, (height - fit.height * fit.scale) / 2),
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = layoutFor(box.height);
  const strip: React.CSSProperties = {
    position: 'absolute', background: VIGNETTE_EDGE, opacity: dim,
    transition: dimTransition, pointerEvents: 'none', zIndex: 1,
  };

  return (
    <div
      ref={outerRef}
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: BACKDROP,
        overflow: 'hidden',
      }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          position: 'relative', width: STAGE_W, height: box.height, flex: 'none',
          overflow: 'hidden',
          touchAction: 'none', userSelect: 'none',
          transform: `scale(${box.scale})`,
        }}
      >
        <StageLayoutProvider value={layout}>{children}</StageLayoutProvider>
      </div>

      {box.barX > 0 && <>
        <div style={{ ...strip, top: 0, bottom: 0, left: 0, width: box.barX }} />
        <div style={{ ...strip, top: 0, bottom: 0, right: 0, width: box.barX }} />
      </>}
      {box.barY > 0 && <>
        <div style={{ ...strip, left: 0, right: 0, top: 0, height: box.barY }} />
        <div style={{ ...strip, left: 0, right: 0, bottom: 0, height: box.barY }} />
      </>}
    </div>
  );
}
