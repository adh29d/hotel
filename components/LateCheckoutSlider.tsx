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
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          (navigator as Navigator & { vibrate: (n: number) => void }).vibrate(8);
        } catch {
          /* noop */
        }
      }
    }
  }, [hour]);

  const { baseHour, maxHour } = lateCheckoutConfig;
  const fee = lateCheckoutFee(hour);
  const ticks: number[] = [];
  for (let h = baseHour; h <= maxHour; h++) ticks.push(h);

  return (
    <div className="px-1">
      <div className="text-[13px] text-muted">What time would you like to leave today?</div>

      <div className="mt-1 text-[14px] tabular-nums">
        <span className="font-medium text-ink">{lateCheckoutLabel(hour)}</span>
        {fee > 0 && <span className="text-muted ml-2">+${fee}</span>}
      </div>

      <div className="mt-3">
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
        <div className="mt-1 flex justify-between text-[11px] tabular-nums">
          {ticks.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onHourChange(t)}
              className={`px-1 transition ${
                t === hour ? "text-ink font-medium" : "text-muted hover:text-ink"
              }`}
            >
              {lateCheckoutLabel(t)}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-muted leading-snug">
        These times are currently available, but subject to change at any time. Extensions are only confirmed once payment is made.
      </p>
    </div>
  );
}
