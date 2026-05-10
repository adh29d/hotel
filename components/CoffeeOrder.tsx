"use client";

import { useEffect, useMemo, useState } from "react";
import {
  coffees,
  formatMoney,
  formatTime,
  milks,
  pickupLocation,
  pickupPresetMinutes,
  presetLabel,
  resolvePickupTime,
  sizes,
  sweeteners,
  syrups,
} from "@/lib/mockData";
import { useOrder } from "@/lib/OrderContext";
import QuantityStepper from "./QuantityStepper";
import CoffeeCupIcon from "./CoffeeCupIcon";
import Modal from "./Modal";

export default function CoffeeOrder() {
  const {
    state,
    addCoffeeLine,
    updateCoffeeLine,
    removeCoffeeLine,
    setPickupPreset,
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
          <span className="font-medium tabular-nums">at {formatTime(pickupAt)}</span>
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
        </div>
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
    sizeId: string;
    milkId: string;
    syrupId: string;
    sweetenerId: string;
    qty: number;
  };
  index: number;
  onChange: (patch: Partial<{ coffeeId: string; sizeId: string; milkId: string; syrupId: string; sweetenerId: string; qty: number }>) => void;
  onRemove: () => void;
};

function CoffeeLineCard({ line, index, onChange, onRemove }: LineProps) {
  const coffee = coffees.find((c) => c.id === line.coffeeId)!;
  const size = sizes.find((s) => s.id === line.sizeId)!;
  const milk = milks.find((m) => m.id === line.milkId)!;
  const syrup = syrups.find((s) => s.id === line.syrupId)!;
  const sweet = sweeteners.find((s) => s.id === line.sweetenerId)!;
  const unit =
    coffee.price + size.surcharge + milk.surcharge + syrup.surcharge + sweet.surcharge;
  const lineTotal = unit * line.qty;

  return (
    <div className="rounded-2xl bg-surface p-4 animate-fadeUp">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] tabular-nums text-muted w-5">{index}.</span>
          <CoffeePicker
            value={line.coffeeId}
            onSelect={(newCoffeeId) => {
              // Long black defaults to no milk; switching away from long black
              // when "none" was selected falls back to regular milk.
              const newMilkId =
                newCoffeeId === "long-black"
                  ? "none"
                  : line.milkId === "none"
                    ? "regular"
                    : line.milkId;
              onChange({ coffeeId: newCoffeeId, milkId: newMilkId });
            }}
          />
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

      <Section label="Size">
        {sizes.map((s) => (
          <Chip
            key={s.id}
            active={s.id === line.sizeId}
            onClick={() => onChange({ sizeId: s.id })}
          >
            {s.name}
            {s.surcharge > 0 ? ` +$${s.surcharge.toFixed(2)}` : ""}
          </Chip>
        ))}
      </Section>

      <Section label="Milk">
        {milks.map((m) => {
          const noMilkOnlyForLongBlack =
            m.id === "none" && line.coffeeId !== "long-black";
          return (
            <Chip
              key={m.id}
              active={m.id === line.milkId}
              disabled={noMilkOnlyForLongBlack}
              onClick={() => onChange({ milkId: m.id })}
            >
              {m.name}
              {m.surcharge > 0 ? ` +$${m.surcharge.toFixed(2)}` : ""}
            </Chip>
          );
        })}
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
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-[11px] rounded-full px-2.5 py-1 border transition inline-flex items-center gap-1 ${
        disabled
          ? "bg-white text-muted/40 border-line/60 cursor-not-allowed"
          : active
            ? "bg-ink text-white border-ink active:scale-95"
            : "bg-white text-muted border-line hover:border-ink/40 active:scale-95"
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
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

function CoffeePicker({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = coffees.find((c) => c.id === value)!;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex items-center gap-2 bg-white rounded-xl pl-3 pr-3 py-1.5 font-medium text-ink text-[15px] border border-line transition active:scale-[0.98] hover:border-ink/40"
      >
        <span>{selected.name}</span>
        <span className="text-muted">
          <CoffeeCupIcon />
        </span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="p-5">
          <h3 className="font-serif text-[20px] text-ink">Choose your coffee</h3>
          <p className="mt-1 text-[12px] text-muted">All options available.</p>
          <div className="mt-3 divide-y divide-line">
            {coffees.map((c) => {
              const isActive = c.id === value;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onSelect(c.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between py-3 text-left transition active:scale-[0.99]"
                >
                  <span
                    className={`text-[15px] ${isActive ? "text-ink font-medium" : "text-ink"}`}
                  >
                    {c.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-[13px] tabular-nums text-muted">
                      ${c.price}
                    </span>
                    {isActive && (
                      <span className="text-accent">
                        <PickedTick />
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </>
  );
}

function PickedTick() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
