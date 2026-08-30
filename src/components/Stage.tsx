import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react';

const STAGE_W = 402;
const STAGE_H = 874;

interface StageProps {
  children: React.ReactNode;
  onPointerDown?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (e: PointerEvent<HTMLDivElement>) => void;
}

// Every pixel value in the ported design assumes a 402x874 canvas (an iPhone-
// sized viewport). Rather than recompute the design's coordinate math in
// percentages for arbitrary screens, the canvas is kept at its native size
// and scaled as a whole to fit the real viewport — the same technique used
// for pixel-precise canvas/game UIs. Pointer coordinates from real DOM events
// stay correct through this because they're read via getBoundingClientRect,
// which already reports the scaled box.
export default function Stage({ children, onPointerDown, onPointerMove, onPointerUp }: StageProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / STAGE_W, height / STAGE_H));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0e0f18',
      }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{
          position: 'relative', width: STAGE_W, height: STAGE_H, flex: 'none',
          overflow: 'hidden',
          background: 'radial-gradient(120% 80% at 50% 34%, #1c1e2e 0%, #161826 46%, #0f101a 100%)',
          touchAction: 'none', userSelect: 'none',
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
