"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  className?: string;
  duration?: number;
};

// Animates a numeric value with a tabular monospace look. Briefly bumps and softly
// fades the new figure when the value changes — meant to make the total feel alive.
export default function AnimatedTotal({ value, className, duration = 380 }: Props) {
  const [display, setDisplay] = useState(value);
  const [bump, setBump] = useState(false);
  const prev = useRef(value);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (value === prev.current) return;
    const start = performance.now();
    const from = prev.current;
    const to = value;
    setBump(true);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = from + (to - from) * eased;
      setDisplay(cur);
      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        prev.current = to;
        setDisplay(to);
        setTimeout(() => setBump(false), 180);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  const formatted = formatLive(display);

  return (
    <span
      className={`inline-block tabular-nums transition-transform ${bump ? "scale-[1.04]" : "scale-100"} ${className ?? ""}`}
      style={{ transitionDuration: "180ms" }}
    >
      {formatted}
    </span>
  );
}

function formatLive(n: number): string {
  if (n === 0) return "$0";
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return `$${rounded}`;
  return `$${rounded.toFixed(2)}`;
}
