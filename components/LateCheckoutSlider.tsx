"use client";

import { useEffect, useRef } from "react";
import { lateCheckoutConfig, lateCheckoutFee, lateCheckoutLabel } from "@/lib/mockData";

type Props = {
  hour: number;
  onHourChange: (h: number) => void;
};

export default function LateCheckoutSlider({ hour, onHourChange }: Props) {
  const lastHaptic = useRef(hour);
  useEffect(() => {
    if (hour !== lastHaptic.current) {
      lastHaptic.current = hour;
      // Tiny haptic feel on supported devices (Android Chrome). Silently ignored elsewhere.
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          (navigator as Navigator & { vibrate: (n: number) => void }).vibrate(8);
        } catch {
          /* noop */
        }
      }
    }
  }, [hour]);

  const { baseHour, maxHour, hourlyRate } = lateCheckoutConfig;
  const fee = lateCheckoutFee(hour);
  const ticks: number[] = [];
  for (let h = baseHour; h <= maxHour; h++) ticks.push(h);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-card animate-fadeUp">
      <div className="flex items-baseline justify-between">
        <h3 className="font-serif text-xl text-ink">When would you like to leave?</h3>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <div className="font-serif text-3xl text-ink tabular-nums">{lateCheckoutLabel(hour)}</div>
          <div className="text-xs text-muted mt-0.5">
            {hour === baseHour ? "Standard checkout · included" : `+$${fee} · late checkout`}
          </div>
        </div>
        <div className="text-right text-xs text-muted">
          <div>${hourlyRate} / extra hour</div>
        </div>
      </div>

      <div className="mt-5 px-1">
        <input
          type="range"
          className="rms-slider"
          min={baseHour}
          max={maxHour}
          step={1}
          value={hour}
          onChange={(e) => onHourChange(Number(e.target.value))}
          aria-label="Late checkout time"
        />
        <div className="mt-2 flex justify-between text-[11px] text-muted tabular-nums">
          {ticks.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onHourChange(t)}
              className={`px-1 transition ${t === hour ? "text-accent font-medium" : "hover:text-ink"}`}
            >
              {lateCheckoutLabel(t)}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-muted leading-relaxed">
        Late checkout subject to availability — confirmed on payment.
      </p>
    </section>
  );
}
