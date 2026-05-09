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
  const dim = size === "sm" ? "h-8 w-8 text-base" : "h-9 w-9 text-lg";
  const bg = size === "sm" ? "h-8" : "h-9";

  const dec = () => value > min && onChange(value - 1);
  const inc = () => value < max && onChange(value + 1);

  return (
    <div className={`inline-flex items-center gap-2 rounded-full bg-line/60 p-0.5 ${bg}`}>
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
        className={`${dim} rounded-full bg-bone text-ink shadow-sm transition disabled:opacity-30 disabled:cursor-not-allowed ${pressed === "-" ? "scale-90" : "scale-100"}`}
      >
        <span className="block leading-none -mt-0.5">−</span>
      </button>
      <span className="w-5 text-center text-sm tabular-nums font-medium">{value}</span>
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
        className={`${dim} rounded-full bg-bone text-ink shadow-sm transition disabled:opacity-30 disabled:cursor-not-allowed ${pressed === "+" ? "scale-90" : "scale-100"}`}
      >
        <span className="block leading-none -mt-0.5">+</span>
      </button>
    </div>
  );
}
