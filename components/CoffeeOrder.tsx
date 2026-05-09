"use client";

import { coffees, formatMoney, milks, pastries } from "@/lib/mockData";
import { useOrder } from "@/lib/OrderContext";
import QuantityStepper from "./QuantityStepper";

export default function CoffeeOrder() {
  const {
    state,
    addCoffeeLine,
    updateCoffeeLine,
    removeCoffeeLine,
    setPastryQty,
    coffeeSubtotal,
    pastrySubtotal,
    orderSubtotal,
  } = useOrder();

  const sectionTotal = coffeeSubtotal + pastrySubtotal;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-card animate-fadeUp">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-xl text-ink">Grab something on the way out?</h3>
      </div>
      <p className="mt-1 text-sm text-muted leading-relaxed">
        Order now and we&rsquo;ll have it ready at reception in 5 minutes.
      </p>

      {/* Coffee lines */}
      <div className="mt-5 space-y-3">
        {state.coffeeLines.map((line) => {
          const coffee = coffees.find((c) => c.id === line.coffeeId)!;
          const milk = milks.find((m) => m.id === line.milkId)!;
          const lineTotal = (coffee.price + milk.surcharge) * line.qty;
          return (
            <div
              key={line.id}
              className="rounded-xl border border-line bg-bone/40 p-3 animate-fadeUp"
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
                <div className="flex items-center gap-3">
                  <span className="text-sm tabular-nums text-muted">
                    {formatMoney(lineTotal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCoffeeLine(line.id)}
                    aria-label="Remove coffee"
                    className="text-muted hover:text-ink transition text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {milks.map((m) => {
                    const active = m.id === line.milkId;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => updateCoffeeLine(line.id, { milkId: m.id })}
                        className={`text-xs rounded-full px-2.5 py-1 border transition active:scale-95 ${
                          active
                            ? "bg-accent text-white border-accent"
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
          className="w-full rounded-xl border border-dashed border-line py-3 text-sm text-muted hover:text-ink hover:border-ink/40 transition active:scale-[0.99]"
        >
          {state.coffeeLines.length === 0 ? "Add a coffee" : "Add another coffee"}
        </button>
      </div>

      {/* Pastries */}
      <div className="mt-6">
        <div className="text-xs uppercase tracking-[0.12em] text-muted">Pastries</div>
        <div className="mt-3 divide-y divide-line">
          {pastries.map((p) => {
            const line = state.pastryLines.find((x) => x.pastryId === p.id);
            const qty = line?.qty ?? 0;
            return (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-[15px] text-ink">{p.name}</div>
                  <div className="text-xs text-muted tabular-nums">{formatMoney(p.price)}</div>
                </div>
                <QuantityStepper
                  size="sm"
                  value={qty}
                  min={0}
                  max={4}
                  onChange={(v) => setPastryQty(p.id, v)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Section subtotal + pickup */}
      <div className="mt-5 rounded-xl bg-accent-soft px-4 py-3 flex items-center justify-between">
        <div className="text-xs text-accent leading-tight">
          <div className="font-medium">Pickup at reception</div>
          <div className="opacity-80">In 5 minutes · staff notified on payment</div>
        </div>
        <div className="text-sm tabular-nums text-accent font-medium">
          {sectionTotal === 0 ? "—" : formatMoney(orderSubtotal)}
        </div>
      </div>
    </section>
  );
}
