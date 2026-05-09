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
      <div className="flex items-baseline justify-between">
        <div className="text-[13px] text-muted">Leaving at</div>
        <div className="text-[13px] tabular-nums text-ink">
          <span className="font-medium">{lateCheckoutLabel(hour)}</span>
          <span className="text-muted ml-1.5">
            {hour === baseHour ? "· included" : `· +$${fee}`}
          </span>
        </div>
      </div>
      <div className="mt-2.5">
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
    </div>
  );
}
