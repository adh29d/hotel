"use client";

import { useEffect, useMemo, useState } from "react";

const PIECE_COUNT = 60;
const DURATION_MS = 2800;

// Single-color confetti burst from the top of the viewport. Pieces are
// spread horizontally, drift sideways, rotate, and fall off-screen. The
// component unmounts itself after the animation finishes.
export default function Confetti() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  const pieces = useMemo(() => {
    return Array.from({ length: PIECE_COUNT }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 1.6 + Math.random() * 1.1,
      startRot: Math.random() * 360,
      endRot: 540 + Math.random() * 540,
      drift: (Math.random() - 0.5) * 260,
      width: 5 + Math.random() * 4,
      height: 8 + Math.random() * 6,
    }));
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 bg-accent rounded-[1px]"
          style={{
            left: `${p.left}%`,
            width: `${p.width}px`,
            height: `${p.height}px`,
            ["--start-rot" as string]: `${p.startRot}deg`,
            ["--end-rot" as string]: `${p.endRot}deg`,
            ["--drift" as string]: `${p.drift}px`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s linear forwards`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
