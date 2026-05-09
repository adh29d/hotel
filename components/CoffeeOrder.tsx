"use client";

import { useEffect, useMemo, useState } from "react";
import {
  coffees,
  formatMoney,
  formatTime,
  kitchenHours,
  milks,
  pickupLocation,
  pickupPresetMinutes,
  presetLabel,
  resolvePickupTime,
} from "@/lib/mockData";
import { useOrder } from "@/lib/OrderContext";
import QuantityStepper from "./QuantityStepper";

export default function CoffeeOrder() {
  const {
    state,
    addCoffeeLine,
    updateCoffeeLine,
    removeCoffeeLine,
    setPickupPreset,
    setPickupCustom,
  } = useOrder();

  // Tick every 30s so "in 5 min" stays honest while the sheet is open.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const pickupAt = useMemo(
    () => resolvePickupTime(state.pickup, now),
    [state.pickup, now],
  );

  return (
    <div className="space-y-4">
      {/* Pickup chooser */}
      <div className="rounded-2xl bg-surface p-3.5">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted">Pickup</div>
        <div className="mt-1 text-[14px] text-ink leading-snug">
          {pickupLocation} ·{" "}
          <span className="font-medium tabular-nums">by {formatTime(pickupAt)}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {pickupPresetMinutes.map((min) => {
            const active =
              state.pickup.kind === "preset" && state.pickup.minutes === min;
            return (
              <button
                key={min}
                type="button"
                onClick={() => setPickupPreset(min)}
                className={`text-[11px] rounded-full px-2.5 py-1 border transition active:scale-95 ${
                  active
                    ? "bg-ink text-white border-ink"
                    : "bg-white text-muted border-line hover:border-ink/40"
                }`}
              >
                {presetLabel(min)}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPickupCustom()}
            className={`text-[11px] rounded-full px-2.5 py-1 border transition active:scale-95 inline-flex items-center gap-1 ${
              state.pickup.kind === "custom"
                ? "bg-ink text-white border-ink"
                : "bg-white text-muted border-line hover:border-ink/40"
            }`}
          >
            <ClockIcon /> Pick a time
          </button>
        </div>

        {state.pickup.kind === "custom" && (
          <div className="mt-3 flex items-center gap-2 animate-fadeUp">
            <input
              type="time"
              value={state.pickup.time}
              min={kitchenHours.open}
              max={kitchenHours.close}
              step={300}
              onChange={(e) => setPickupCustom(e.target.value)}
              className="rounded-xl bg-white border border-line px-3 py-2 text-[14px] text-ink tabular-nums focus:outline-none focus:border-ink/40"
            />
            <span className="text-[11px] text-muted">
              Kitchen hours {kitchenHours.open}–{kitchenHours.close}
            </span>
          </div>
        )}
      </div>

      {/* Coffee lines */}
      <div className="space-y-2">
        {state.coffeeLines.map((line) => {
          const coffee = coffees.find((c) => c.id === line.coffeeId)!;
          const milk = milks.find((m) => m.id === line.milkId)!;
          const lineTotal = (coffee.price + milk.surcharge) * line.qty;
          return (
            <div
              key={line.id}
              className="rounded-2xl bg-surface p-3 animate-fadeUp"
            >
              <div className="flex items-center justify-between gap-2">
                <select
                  value={line.coffeeId}
                  onChange={(e) => updateCoffeeLine(line.id, { coffeeId: e.target.value })}
                  className="bg-transparent font-medium text-ink text-[15px] focus:outline-none"
                >
                  {coffees.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2.5">
                  <span className="text-[13px] tabular-nums text-muted">
                    {formatMoney(lineTotal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCoffeeLine(line.id)}
                    aria-label="Remove coffee"
                    className="text-muted hover:text-ink transition text-base leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {milks.map((m) => {
                    const active = m.id === line.milkId;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => updateCoffeeLine(line.id, { milkId: m.id })}
                        className={`text-[11px] rounded-full px-2.5 py-1 border transition active:scale-95 ${
                          active
                            ? "bg-ink text-white border-ink"
                            : "bg-white text-muted border-line hover:border-ink/40"
                        }`}
                      >
                        {m.name}
                        {m.surcharge > 0 ? ` +$${m.surcharge.toFixed(2)}` : ""}
                      </button>
                    );
                  })}
                </div>
                <QuantityStepper
                  size="sm"
                  value={line.qty}
                  min={1}
                  max={4}
                  onChange={(v) => updateCoffeeLine(line.id, { qty: v })}
                />
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addCoffeeLine}
          className="w-full rounded-2xl border border-dashed border-line py-2.5 text-[13px] text-muted hover:text-ink hover:border-ink/40 transition active:scale-[0.99]"
        >
          {state.coffeeLines.length === 0 ? "Add a coffee" : "Add another coffee"}
        </button>
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
