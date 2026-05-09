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
  sweeteners,
  syrups,
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
              <Chip
                key={min}
                active={active}
                onClick={() => setPickupPreset(min)}
              >
                {presetLabel(min)}
              </Chip>
            );
          })}
          <Chip
            active={state.pickup.kind === "custom"}
            onClick={() => setPickupCustom()}
            icon={<ClockIcon />}
          >
            Pick a time
          </Chip>
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
      <div className="space-y-2.5">
        {state.coffeeLines.map((line, idx) => (
          <CoffeeLineCard
            key={line.id}
            line={line}
            index={idx + 1}
            onChange={(patch) => updateCoffeeLine(line.id, patch)}
            onRemove={() => removeCoffeeLine(line.id)}
          />
        ))}

        <button
          type="button"
          onClick={addCoffeeLine}
          className="w-full rounded-2xl border border-dashed border-line py-3 text-[13px] text-muted hover:text-ink hover:border-ink/40 transition active:scale-[0.99] inline-flex items-center justify-center gap-1.5"
        >
          <PlusIcon />
          {state.coffeeLines.length === 0 ? "Add a coffee" : "Add another coffee"}
        </button>
      </div>
    </div>
  );
}

type LineProps = {
  line: {
    id: string;
    coffeeId: string;
    milkId: string;
    syrupId: string;
    sweetenerId: string;
    qty: number;
  };
  index: number;
  onChange: (patch: Partial<{ coffeeId: string; milkId: string; syrupId: string; sweetenerId: string; qty: number }>) => void;
  onRemove: () => void;
};

function CoffeeLineCard({ line, index, onChange, onRemove }: LineProps) {
  const coffee = coffees.find((c) => c.id === line.coffeeId)!;
  const milk = milks.find((m) => m.id === line.milkId)!;
  const syrup = syrups.find((s) => s.id === line.syrupId)!;
  const sweet = sweeteners.find((s) => s.id === line.sweetenerId)!;
  const unit = coffee.price + milk.surcharge + syrup.surcharge + sweet.surcharge;
  const lineTotal = unit * line.qty;

  return (
    <div className="rounded-2xl bg-surface p-4 animate-fadeUp">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] tabular-nums text-muted w-5">{index}.</span>
          <div className="relative">
            <select
              value={line.coffeeId}
              onChange={(e) => onChange({ coffeeId: e.target.value })}
              className="appearance-none bg-white rounded-xl pl-3 pr-7 py-1.5 font-medium text-ink text-[15px] border border-line focus:outline-none focus:border-ink/40"
            >
              {coffees.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted">
              <ChevronDown />
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] tabular-nums text-ink">
            {formatMoney(lineTotal)}
          </span>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove coffee"
            className="h-7 w-7 rounded-full bg-white text-muted hover:text-ink transition flex items-center justify-center text-base leading-none"
          >
            ×
          </button>
        </div>
      </div>

      <Section label="Milk">
        {milks.map((m) => (
          <Chip
            key={m.id}
            active={m.id === line.milkId}
            onClick={() => onChange({ milkId: m.id })}
          >
            {m.name}
            {m.surcharge > 0 ? ` +$${m.surcharge.toFixed(2)}` : ""}
          </Chip>
        ))}
      </Section>

      <Section label="Syrup">
        {syrups.map((s) => (
          <Chip
            key={s.id}
            active={s.id === line.syrupId}
            onClick={() => onChange({ syrupId: s.id })}
          >
            {s.name}
            {s.surcharge > 0 ? ` +$${s.surcharge.toFixed(2)}` : ""}
          </Chip>
        ))}
      </Section>

      <Section label="Sweetener">
        {sweeteners.map((s) => (
          <Chip
            key={s.id}
            active={s.id === line.sweetenerId}
            onClick={() => onChange({ sweetenerId: s.id })}
          >
            {s.name}
          </Chip>
        ))}
      </Section>

      <div className="mt-3 flex justify-end">
        <QuantityStepper
          size="sm"
          value={line.qty}
          min={1}
          max={4}
          onChange={(v) => onChange({ qty: v })}
        />
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted mb-1.5">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11px] rounded-full px-2.5 py-1 border transition active:scale-95 inline-flex items-center gap-1 ${
        active
          ? "bg-ink text-white border-ink"
          : "bg-white text-muted border-line hover:border-ink/40"
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
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

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
