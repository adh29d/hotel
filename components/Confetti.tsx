"use client";

import { useEffect, useMemo, useState } from "react";

const PIECE_COUNT = 60;
const DURATION_MS = 2200;

type Props = {
  /** Viewport-relative origin (px) the pieces explode out from. */
  originX: number;
  originY: number;
};

// Single-color confetti burst that explodes radially outward from a point
// in the viewport, with a slight gravity pull so pieces curve back down.
// Self-unmounts when the animation completes.
export default function Confetti({ originX, originY }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  const pieces = useMemo(() => {
    return Array.from({ length: PIECE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 90 + Math.random() * 220;
      const gravity = 200 + Math.random() * 220;
      return {
        delay: Math.random() * 0.06,
        duration: 1.4 + Math.random() * 0.7,
        startRot: Math.random() * 360,
        endRot: 360 + Math.random() * 720,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance + gravity,
        width: 5 + Math.random() * 4,
        height: 8 + Math.random() * 6,
      };
    });
  }, []);

  if (!visible) return null;

  return (
    <span
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute bg-accent rounded-[1px]"
          style={{
            left: `${originX}px`,
            top: `${originY}px`,
            width: `${p.width}px`,
            height: `${p.height}px`,
            ["--start-rot" as string]: `${p.startRot}deg`,
            ["--end-rot" as string]: `${p.endRot}deg`,
            ["--dx" as string]: `${p.dx}px`,
            ["--dy" as string]: `${p.dy}px`,
            animation: `confetti-burst ${p.duration}s ${p.delay}s cubic-bezier(0.18, 0.6, 0.4, 1) both`,
          } as React.CSSProperties}
        />
      ))}
    </span>
  );
}
