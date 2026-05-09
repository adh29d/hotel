"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrder } from "@/lib/OrderContext";
import {
  coffees,
  formatMoney,
  formatTime,
  lateCheckoutLabel,
  milks,
  pickupLocation,
  resolvePickupTime,
  sweeteners,
  syrups,
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

  // Lock pickup time on mount so it doesn't shift while the page is open.
  useEffect(() => {
    setPickupTime(formatTime(resolvePickupTime(state.pickup, new Date())));
    // We intentionally only resolve once (on mount of the confirmation page).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!reservation) return null;

  const isCheckoutDay = reservation.isCheckoutToday;
  const hasOrder = state.coffeeLines.length > 0;
  const hasLate = state.checkoutHour > 10;

  // ---------- Stage 2: actually checked out ----------
  if (checkedOut) {
    const messageParts: string[] = [];
    if (hasLate) {
      messageParts.push(`Checkout extended to ${lateCheckoutLabel(state.checkoutHour)}.`);
    }
    if (hasOrder && pickupTime) {
      messageParts.push(`Your coffee will be ready at ${pickupLocation} by ${pickupTime}.`);
    }
    const keyMessage = hasOrder
      ? `Drop your keys with the team at ${pickupLocation} when you grab your coffee, or in the express checkout box next to reception.`
      : "Drop your keys in the express checkout box next to reception.";

    return (
      <main className="px-5 pt-12 pb-12">
        <div className="text-center animate-fadeUp">
          <SuccessTick />
          <h1 className="mt-6 font-serif text-[30px] leading-tight text-ink">
            You&rsquo;re checked out.
          </h1>
          {messageParts.length > 0 && (
            <p className="mt-2.5 text-[14px] text-muted leading-relaxed max-w-[320px] mx-auto">
              {messageParts.join(" ")}
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

  // ---------- Stage 1: paid ----------
  // Mid-stay: this is the final screen — receipt + "Done".
  // Checkout day: this leads into "Tap to check out".
  const headline = isCheckoutDay
    ? `One last tap, ${reservation.guestFirstName}.`
    : `All settled, ${reservation.guestFirstName}.`;
  const subline = isCheckoutDay
    ? "Confirm your check-out below."
    : hasOrder
      ? `Your coffee will be ready at ${pickupLocation} by ${pickupTime}.`
      : "Your balance is clear. Have a wonderful stay.";

  return (
    <main className="px-5 pt-14 pb-10 flex flex-col min-h-[100dvh]">
      <div className="text-center animate-fadeUp">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft text-accent px-3 py-1.5 text-[11px] font-medium tracking-tight">
          <CheckIcon /> Payment received
        </span>
        <h1 className="mt-5 font-serif text-[26px] leading-tight text-ink">
          {headline}
        </h1>
        <p className="mt-1.5 text-[13px] text-muted max-w-[320px] mx-auto leading-relaxed">
          {subline}
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
            const sy = syrups.find((x) => x.id === line.syrupId)!;
            const sw = sweeteners.find((x) => x.id === line.sweetenerId)!;
            const lineTotal =
              (c.price + m.surcharge + sy.surcharge + sw.surcharge) * line.qty;
            const extras = [
              m.surcharge > 0 ? m.name : null,
              sy.id !== "none" ? sy.name : null,
              sw.id !== "none" ? sw.name : null,
            ].filter(Boolean);
            return (
              <li key={line.id} className="flex justify-between py-1.5">
                <span className="text-muted">
                  {line.qty}× {c.name}
                  {extras.length > 0 ? ` · ${extras.join(" · ")}` : ""}
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

      {isCheckoutDay ? (
        <button
          type="button"
          onClick={() => setCheckedOut(true)}
          className="mt-8 w-full rounded-2xl bg-ink text-white py-4 text-[15px] font-medium tracking-tight transition active:scale-[0.99]"
        >
          Tap to check out
        </button>
      ) : (
        <Link
          href="/"
          className="mt-8 w-full rounded-2xl bg-ink text-white py-4 text-[15px] font-medium tracking-tight transition active:scale-[0.99] flex items-center justify-center"
        >
          Done
        </Link>
      )}
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
