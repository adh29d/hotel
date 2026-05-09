"use client";

import { useState } from "react";

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
};

export default function QuantityStepper({ value, onChange, min = 0, max = 4, size = "md" }: Props) {
  const [pressed, setPressed] = useState<"-" | "+" | null>(null);
  const dim = size === "sm" ? "h-7 w-7 text-base" : "h-8 w-8 text-lg";
  const wrap = size === "sm" ? "h-7" : "h-8";

  const dec = () => value > min && onChange(value - 1);
  const inc = () => value < max && onChange(value + 1);

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full bg-surface p-0.5 ${wrap}`}>
      <button
        type="button"
        aria-label="Decrease"
        onMouseDown={() => setPressed("-")}
        onMouseUp={() => setPressed(null)}
        onMouseLeave={() => setPressed(null)}
        onTouchStart={() => setPressed("-")}
        onTouchEnd={() => setPressed(null)}
        onClick={dec}
        disabled={value <= min}
        className={`${dim} rounded-full bg-white text-ink shadow-soft transition disabled:opacity-30 disabled:cursor-not-allowed ${pressed === "-" ? "scale-90" : "scale-100"}`}
      >
        <span className="block leading-none -mt-0.5">−</span>
      </button>
      <span className="w-4 text-center text-sm tabular-nums font-medium">{value}</span>
      <button
        type="button"
        aria-label="Increase"
        onMouseDown={() => setPressed("+")}
        onMouseUp={() => setPressed(null)}
        onMouseLeave={() => setPressed(null)}
        onTouchStart={() => setPressed("+")}
        onTouchEnd={() => setPressed(null)}
        onClick={inc}
        disabled={value >= max}
        className={`${dim} rounded-full bg-white text-ink shadow-soft transition disabled:opacity-30 disabled:cursor-not-allowed ${pressed === "+" ? "scale-90" : "scale-100"}`}
      >
        <span className="block leading-none -mt-0.5">+</span>
      </button>
    </div>
  );
}
