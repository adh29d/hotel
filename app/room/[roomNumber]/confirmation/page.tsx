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
  pickupLocation,
} from "@/lib/mockData";
import SuccessTick from "@/components/SuccessTick";
import ReviewCard from "@/components/ReviewCard";

export default function ConfirmationPage() {
  const params = useParams<{ roomNumber: string }>();
  const {
    initRoom,
    reservation,
    state,
    coffeeSubtotal,
    lateCheckoutCharge,
    total,
  } = useOrder();
  const [pickupTime, setPickupTime] = useState<string>("");
  const [checkedOut, setCheckedOut] = useState(false);

  useEffect(() => {
    initRoom(params.roomNumber);
  }, [params.roomNumber, initRoom]);

  useEffect(() => {
    setPickupTime(formatTime(addMinutes(new Date(), orderPrepMinutes)));
  }, []);

  const hasOrder = state.coffeeLines.length > 0;
  const hasLate = state.checkoutHour > 10;

  const checkedOutMessage = useMemo(() => {
    const parts: string[] = [];
    if (hasLate) {
      parts.push(`Checkout extended to ${lateCheckoutLabel(state.checkoutHour)}.`);
    }
    if (hasOrder && pickupTime) {
      parts.push(
        `Your coffee will be ready at ${pickupLocation} by ${pickupTime}.`,
      );
    }
    return parts.join(" ");
  }, [hasLate, hasOrder, pickupTime, state.checkoutHour]);

  const keyMessage = hasOrder
    ? `Drop your keys with the team at ${pickupLocation} when you grab your coffee, or in the express checkout box next to reception.`
    : "Drop your keys in the express checkout box next to reception.";

  if (!reservation) return null;

  // ---------- Stage 2: actually checked out ----------
  if (checkedOut) {
    return (
      <main className="px-5 pt-12 pb-12">
        <div className="text-center animate-fadeUp">
          <SuccessTick />
          <h1 className="mt-6 font-serif text-[30px] leading-tight text-ink">
            You&rsquo;re checked out.
          </h1>
          {checkedOutMessage && (
            <p className="mt-2.5 text-[14px] text-muted leading-relaxed max-w-[320px] mx-auto">
              {checkedOutMessage}
            </p>
          )}
          <p className="mt-3 text-[14px] text-ink leading-relaxed max-w-[320px] mx-auto">
            {keyMessage}
          </p>
        </div>

        <div className="mt-8">
          <ReviewCard />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-[11px] text-muted hover:text-ink underline underline-offset-4"
          >
            Restart demo
          </Link>
        </div>
      </main>
    );
  }

  // ---------- Stage 1: paid, awaiting tap-to-check-out ----------
  return (
    <main className="px-5 pt-14 pb-10 flex flex-col min-h-[100dvh]">
      <div className="text-center animate-fadeUp">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft text-accent px-3 py-1.5 text-[11px] font-medium tracking-tight">
          <CheckIcon /> Payment received
        </span>
        <h1 className="mt-5 font-serif text-[26px] leading-tight text-ink">
          One last tap, {reservation.guestFirstName}.
        </h1>
        <p className="mt-1.5 text-[13px] text-muted">
          Confirm your check-out below.
        </p>
      </div>

      {/* Compact receipt — only items actually ordered */}
      <section className="mt-6 rounded-2xl bg-surface p-4 animate-fadeUp text-[13px]">
        <div className="flex items-baseline justify-between mb-2.5">
          <span className="font-serif text-[15px] text-ink">Receipt</span>
          <span className="text-[10px] text-muted uppercase tracking-[0.14em] tabular-nums">
            Room {reservation.roomNumber}
          </span>
        </div>

        <ul className="divide-y divide-line/70">
          {!reservation.alreadyPaid &&
            reservation.charges.map((c) => (
              <li key={c.label} className="flex justify-between py-1.5">
                <span className="text-muted">{c.label}</span>
                <span className="tabular-nums text-ink">{formatMoney(c.amount)}</span>
              </li>
            ))}

          {hasLate && (
            <li className="flex justify-between py-1.5">
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
              <li key={line.id} className="flex justify-between py-1.5">
                <span className="text-muted">
                  {line.qty}× {c.name}
                  {m.surcharge > 0 ? ` · ${m.name}` : ""}
                </span>
                <span className="tabular-nums text-ink">{formatMoney(lineTotal)}</span>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-between pt-2.5 mt-2 border-t border-line">
          <span className="text-muted text-[10px] uppercase tracking-[0.14em]">Paid</span>
          <span className="font-medium text-ink tabular-nums">{formatMoney(total)}</span>
        </div>
      </section>

      <div className="flex-1" />

      <button
        type="button"
        onClick={() => setCheckedOut(true)}
        className="mt-8 w-full rounded-2xl bg-ink text-white py-4 text-[15px] font-medium tracking-tight transition active:scale-[0.99]"
      >
        Tap to check out
      </button>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
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
