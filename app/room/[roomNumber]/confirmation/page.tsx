"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrder } from "@/lib/OrderContext";
import {
  addMinutes,
  coffees,
  formatMoney,
  formatTime,
  lateCheckoutLabel,
  milks,
  orderPrepMinutes,
  pastries,
} from "@/lib/mockData";
import SuccessTick from "@/components/SuccessTick";
import ReviewCard from "@/components/ReviewCard";

export default function ConfirmationPage() {
  const params = useParams<{ roomNumber: string }>();
  const {
    initRoom,
    reservation,
    state,
    outstandingBalance,
    lateCheckoutCharge,
    coffeeSubtotal,
    pastrySubtotal,
    orderSubtotal,
    total,
  } = useOrder();
  const [pickupTime, setPickupTime] = useState<string>("");

  useEffect(() => {
    initRoom(params.roomNumber);
  }, [params.roomNumber, initRoom]);

  useEffect(() => {
    setPickupTime(formatTime(addMinutes(new Date(), orderPrepMinutes)));
  }, []);

  const hasOrder = state.coffeeLines.length > 0 || state.pastryLines.length > 0;
  const hasLate = state.checkoutHour > 10;

  const message = useMemo(() => {
    if (!reservation) return "";
    const parts: string[] = [];
    if (hasLate) {
      parts.push(`Checkout extended to ${lateCheckoutLabel(state.checkoutHour)}.`);
    }
    if (hasOrder && pickupTime) {
      parts.push(`Your order will be ready at reception by ${pickupTime}.`);
    }
    parts.push("Just drop your keys when you're done.");
    return parts.join(" ");
  }, [reservation, hasLate, hasOrder, pickupTime, state.checkoutHour]);

  if (!reservation) return null;

  return (
    <main className="px-5 pt-12 pb-12">
      <div className="text-center animate-fadeUp">
        <SuccessTick />
        <h1 className="mt-6 font-serif text-[30px] leading-tight text-ink">
          You&rsquo;re checked out.
        </h1>
        <p className="mt-2.5 text-[14px] text-muted leading-relaxed max-w-[320px] mx-auto">
          {message}
        </p>
      </div>

      <section className="mt-8 rounded-3xl bg-surface p-5 animate-fadeUp">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-[18px] text-ink">Receipt</h2>
          <span className="text-[11px] text-muted">
            Room {reservation.roomNumber} · {reservation.guestFirstName}
          </span>
        </div>

        <ul className="mt-3 divide-y divide-line/80 text-[14px]">
          {reservation.charges.length > 0 && !reservation.alreadyPaid && (
            <>
              {reservation.charges.map((c) => (
                <li key={c.label} className="flex justify-between py-2">
                  <span className="text-muted">{c.label}</span>
                  <span className="tabular-nums text-ink">{formatMoney(c.amount)}</span>
                </li>
              ))}
            </>
          )}
          {hasLate && (
            <li className="flex justify-between py-2">
              <span className="text-muted">
                Late checkout · {lateCheckoutLabel(state.checkoutHour)}
              </span>
              <span className="tabular-nums text-ink">{formatMoney(lateCheckoutCharge)}</span>
            </li>
          )}

          {state.coffeeLines.map((line) => {
            const c = coffees.find((x) => x.id === line.coffeeId)!;
            const m = milks.find((x) => x.id === line.milkId)!;
            const lineTotal = (c.price + m.surcharge) * line.qty;
            return (
              <li key={line.id} className="flex justify-between py-2">
                <span className="text-muted">
                  {line.qty}× {c.name}
                  {m.surcharge > 0 ? ` · ${m.name}` : ""}
                </span>
                <span className="tabular-nums text-ink">{formatMoney(lineTotal)}</span>
              </li>
            );
          })}

          {state.pastryLines.map((line) => {
            const p = pastries.find((x) => x.id === line.pastryId)!;
            return (
              <li key={line.pastryId} className="flex justify-between py-2">
                <span className="text-muted">
                  {line.qty}× {p.name}
                </span>
                <span className="tabular-nums text-ink">{formatMoney(p.price * line.qty)}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 pt-3 border-t border-line space-y-1 text-[13px] text-muted">
          <Row label="Room" value={formatMoney(outstandingBalance)} />
          <Row
            label="Late checkout"
            value={lateCheckoutCharge === 0 ? "—" : formatMoney(lateCheckoutCharge)}
          />
          <Row
            label="Coffee & pastries"
            value={orderSubtotal === 0 ? "—" : formatMoney(coffeeSubtotal + pastrySubtotal)}
          />
        </div>
        <div className="mt-3 pt-3 border-t border-line flex justify-between items-baseline">
          <span className="text-[12px] uppercase tracking-[0.14em] text-muted">Paid</span>
          <span className="font-serif text-[24px] text-ink tabular-nums">{formatMoney(total)}</span>
        </div>
      </section>

      <div className="mt-5">
        <ReviewCard />
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/demo"
          className="text-[11px] text-muted hover:text-ink underline underline-offset-4"
        >
          Return to demo index
        </Link>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
