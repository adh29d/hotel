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

  // Lock pickup time on mount so it doesn't shift while the page is open.
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
    <main className="px-6 pt-12 pb-16">
      <div className="text-center animate-fadeUp">
        <SuccessTick />
        <h1 className="mt-6 font-serif text-[32px] leading-tight text-ink">
          You&rsquo;re checked out.
        </h1>
        <p className="mt-3 text-[15px] text-muted leading-relaxed max-w-[320px] mx-auto">
          {message}
        </p>
      </div>

      {/* Receipt */}
      <section className="mt-8 rounded-2xl bg-white p-5 shadow-card animate-fadeUp">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-ink">Receipt</h2>
          <span className="text-xs text-muted">
            Room {reservation.roomNumber} · {reservation.guestFirstName}
          </span>
        </div>

        <ul className="mt-3 divide-y divide-line text-[14px]">
          {reservation.charges.length > 0 && !reservation.alreadyPaid && (
            <>
              {reservation.charges.map((c) => (
                <li key={c.label} className="flex justify-between py-2">
                  <span>{c.label}</span>
                  <span className="tabular-nums">{formatMoney(c.amount)}</span>
                </li>
              ))}
            </>
          )}
          {hasLate && (
            <li className="flex justify-between py-2">
              <span>Late checkout · {lateCheckoutLabel(state.checkoutHour)}</span>
              <span className="tabular-nums">{formatMoney(lateCheckoutCharge)}</span>
            </li>
          )}

          {state.coffeeLines.map((line) => {
            const c = coffees.find((x) => x.id === line.coffeeId)!;
            const m = milks.find((x) => x.id === line.milkId)!;
            const lineTotal = (c.price + m.surcharge) * line.qty;
            return (
              <li key={line.id} className="flex justify-between py-2">
                <span>
                  {line.qty}× {c.name}
                  {m.surcharge > 0 ? ` · ${m.name}` : ""}
                </span>
                <span className="tabular-nums">{formatMoney(lineTotal)}</span>
              </li>
            );
          })}

          {state.pastryLines.map((line) => {
            const p = pastries.find((x) => x.id === line.pastryId)!;
            return (
              <li key={line.pastryId} className="flex justify-between py-2">
                <span>
                  {line.qty}× {p.name}
                </span>
                <span className="tabular-nums">{formatMoney(p.price * line.qty)}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 pt-3 border-t border-line space-y-1 text-sm text-muted">
          <Row label="Room" value={formatMoney(outstandingBalance)} />
          <Row
            label="Late checkout"
            value={lateCheckoutCharge === 0 ? "—" : formatMoney(lateCheckoutCharge)}
          />
          <Row
            label="Coffee &amp; pastries"
            value={orderSubtotal === 0 ? "—" : formatMoney(coffeeSubtotal + pastrySubtotal)}
          />
        </div>
        <div className="mt-3 pt-3 border-t border-line flex justify-between items-baseline">
          <span className="text-sm text-muted">Paid</span>
          <span className="font-serif text-2xl text-ink tabular-nums">{formatMoney(total)}</span>
        </div>
      </section>

      {/* Review */}
      <div className="mt-6">
        <ReviewCard />
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/demo"
          className="text-xs text-muted hover:text-ink underline underline-offset-4"
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
      <span dangerouslySetInnerHTML={{ __html: label }} />
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
