"use client";

import { coffees, formatMoney, milks, pickupLocation } from "@/lib/mockData";
import { useOrder } from "@/lib/OrderContext";
import QuantityStepper from "./QuantityStepper";

export default function CoffeeOrder() {
  const {
    state,
    addCoffeeLine,
    updateCoffeeLine,
    removeCoffeeLine,
  } = useOrder();

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-muted leading-relaxed">
        Ready at {pickupLocation} in 5 minutes.
      </p>

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
