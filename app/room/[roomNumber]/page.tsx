"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrder } from "@/lib/OrderContext";
import { formatMoney, lateCheckoutLabel } from "@/lib/mockData";
import LateCheckoutSlider from "@/components/LateCheckoutSlider";
import CoffeeOrder from "@/components/CoffeeOrder";
import AnimatedTotal from "@/components/AnimatedTotal";

export default function RoomLandingPage() {
  const params = useParams<{ roomNumber: string }>();
  const router = useRouter();
  const roomNumber = params.roomNumber;
  const {
    initRoom,
    reservation,
    state,
    setCheckoutHour,
    outstandingBalance,
    lateCheckoutCharge,
    orderSubtotal,
    total,
  } = useOrder();
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    initRoom(roomNumber);
  }, [roomNumber, initRoom]);

  if (!reservation) {
    return (
      <main className="px-6 py-12 animate-fadeIn">
        <h1 className="font-serif text-2xl">Room not found</h1>
        <p className="mt-2 text-muted">
          We couldn&rsquo;t find a reservation for room {roomNumber}.
        </p>
        <Link href="/demo" className="mt-6 inline-block text-accent underline">
          Back to demo
        </Link>
      </main>
    );
  }

  const allPaid = reservation.alreadyPaid;

  return (
    <main className="pb-40">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 animate-fadeUp">
        <div className="text-xs uppercase tracking-[0.18em] text-muted">RMS Pay</div>
        <h1 className="mt-3 font-serif text-[34px] leading-[1.05] text-ink">
          Good morning,
          <br />
          {reservation.guestFirstName}.
        </h1>
        <p className="mt-3 text-sm text-muted">
          Room {reservation.roomNumber} · Check-out{" "}
          <span className="text-ink">{lateCheckoutLabel(state.checkoutHour)}</span> ·{" "}
          {reservation.checkOutDate}
        </p>
      </header>

      <div className="px-6 space-y-4">
        {/* Outstanding balance card */}
        <section className="rounded-2xl bg-white p-5 shadow-card animate-fadeUp">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-xl text-ink">Your balance</h2>
            <span className="text-xs text-muted">
              {reservation.nights} night{reservation.nights === 1 ? "" : "s"}
            </span>
          </div>

          {allPaid ? (
            <div className="mt-4 rounded-xl bg-accent-soft px-4 py-3 text-accent text-sm">
              <div className="font-medium">You&rsquo;re all set.</div>
              <div className="opacity-80 mt-0.5">Your stay is fully paid. Anything below is optional.</div>
            </div>
          ) : reservation.charges.length === 0 ? (
            <div className="mt-4 text-sm text-muted">Nothing outstanding on your room.</div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {reservation.charges.map((c) => (
                <li key={c.label} className="flex items-center justify-between py-2.5">
                  <span className="text-[15px] text-ink">{c.label}</span>
                  <span className="text-[15px] tabular-nums text-ink">{formatMoney(c.amount)}</span>
                </li>
              ))}
              <li className="flex items-center justify-between pt-3">
                <span className="text-sm text-muted">Subtotal</span>
                <span className="text-sm tabular-nums text-muted">
                  {formatMoney(outstandingBalance)}
                </span>
              </li>
            </ul>
          )}

          <button
            type="button"
            onClick={() => setRequested(true)}
            disabled={requested || reservation.charges.length === 0}
            className="mt-4 w-full text-xs text-accent hover:underline disabled:no-underline disabled:text-muted disabled:cursor-default"
          >
            {requested
              ? "Request sent — reception will email it shortly."
              : reservation.charges.length === 0
                ? ""
                : "Request itemised invoice from reception"}
          </button>
        </section>

        {/* Late checkout */}
        <LateCheckoutSlider hour={state.checkoutHour} onHourChange={setCheckoutHour} />

        {/* Coffee */}
        <CoffeeOrder />

        {/* Summary */}
        <section className="rounded-2xl bg-ink text-bone p-5 shadow-card animate-fadeUp">
          <div className="text-[11px] uppercase tracking-[0.18em] text-bone/60">Total</div>
          <div className="mt-1 flex items-end justify-between">
            <div className="font-serif text-[44px] leading-none">
              <AnimatedTotal value={total} />
            </div>
          </div>
          <ul className="mt-4 space-y-1.5 text-sm text-bone/80">
            <li className="flex justify-between">
              <span>Room balance</span>
              <span className="tabular-nums">{formatMoney(outstandingBalance)}</span>
            </li>
            <li className="flex justify-between">
              <span>Late checkout</span>
              <span className="tabular-nums">
                {lateCheckoutCharge === 0 ? "—" : formatMoney(lateCheckoutCharge)}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Coffee &amp; pastries</span>
              <span className="tabular-nums">
                {orderSubtotal === 0 ? "—" : formatMoney(orderSubtotal)}
              </span>
            </li>
          </ul>
        </section>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
        <div className="w-full max-w-[440px] px-6 pb-6 pt-4 bg-gradient-to-t from-bone via-bone/95 to-bone/0 pointer-events-auto">
          <button
            type="button"
            onClick={() => router.push(`/room/${roomNumber}/payment`)}
            disabled={total === 0}
            className="w-full rounded-full bg-accent text-white py-4 text-[15px] font-medium tracking-wide shadow-card transition active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {total === 0 ? "Add something to checkout" : (
              <span className="inline-flex items-baseline gap-2">
                <span>Pay &amp; checkout</span>
                <span className="opacity-80">·</span>
                <AnimatedTotal value={total} className="font-medium" />
              </span>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
