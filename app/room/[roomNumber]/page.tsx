"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrder } from "@/lib/OrderContext";
import { formatMoney, lateCheckoutLabel } from "@/lib/mockData";
import LateCheckoutSlider from "@/components/LateCheckoutSlider";
import CoffeeOrder from "@/components/CoffeeOrder";
import AnimatedTotal from "@/components/AnimatedTotal";
import BottomSheet from "@/components/BottomSheet";

const HERO_SRC =
  "https://beachcomberhotelandresort.com.au/wp-content/uploads/2022/09/Pelicans-Breakfast-417b.jpg";

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
  const [coffeeOpen, setCoffeeOpen] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    initRoom(roomNumber);
  }, [roomNumber, initRoom]);

  const itemCount = useMemo(
    () =>
      state.coffeeLines.reduce((s, l) => s + l.qty, 0) +
      state.pastryLines.reduce((s, l) => s + l.qty, 0),
    [state.coffeeLines, state.pastryLines],
  );

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
    <main className="relative h-[100dvh] flex flex-col">
      {/* Hero image with fade-down to white */}
      <div className="absolute inset-x-0 top-0 h-[44%] -z-0 overflow-hidden">
        <Image
          src={HERO_SRC}
          alt=""
          fill
          priority
          sizes="440px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-white/0 to-white" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-8 pb-2 animate-fadeUp">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/90 drop-shadow-sm">
            RMS Pay
          </div>
          <div className="text-[11px] tracking-[0.12em] text-white/90 drop-shadow-sm tabular-nums">
            ROOM {reservation.roomNumber}
          </div>
        </div>
      </header>

      {/* Spacer to push content below hero */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-5 pb-3">
        {/* Greeting card */}
        <section className="px-1 pb-4 animate-fadeUp">
          <h1 className="font-serif text-[30px] leading-[1.05] text-ink">
            Good morning, {reservation.guestFirstName}.
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {reservation.checkOutDate} · checkout{" "}
            <span className="text-ink">{lateCheckoutLabel(state.checkoutHour)}</span>
          </p>
        </section>

        {/* Single combined card: balance + late checkout + add-on */}
        <section className="rounded-3xl bg-surface p-5 animate-fadeUp">
          {/* Balance row */}
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted">
                {allPaid ? "Stay paid" : "Outstanding"}
              </div>
              <div className="mt-1 font-serif text-[32px] leading-none text-ink tabular-nums">
                {allPaid ? "$0" : formatMoney(outstandingBalance)}
              </div>
            </div>
            <div className="text-right text-[12px] text-muted">
              {allPaid ? (
                <span>You&rsquo;re all set.</span>
              ) : reservation.charges.length > 0 ? (
                <ul className="space-y-0.5 tabular-nums">
                  {reservation.charges.map((c) => (
                    <li key={c.label}>
                      {c.label} · {formatMoney(c.amount)}
                    </li>
                  ))}
                </ul>
              ) : (
                <span>Nothing owing</span>
              )}
            </div>
          </div>

          {!allPaid && reservation.charges.length > 0 && (
            <button
              type="button"
              onClick={() => setRequested(true)}
              disabled={requested}
              className="mt-2 text-[11px] text-accent hover:underline disabled:no-underline disabled:text-muted"
            >
              {requested
                ? "Itemised invoice request sent."
                : "Request itemised invoice from reception"}
            </button>
          )}

          <div className="my-4 h-px bg-line" />

          {/* Late checkout slider */}
          <LateCheckoutSlider
            hour={state.checkoutHour}
            onHourChange={setCheckoutHour}
          />

          <div className="my-4 h-px bg-line" />

          {/* Coffee + pastries entry row */}
          <button
            type="button"
            onClick={() => setCoffeeOpen(true)}
            className="w-full flex items-center justify-between text-left transition active:scale-[0.99]"
          >
            <div>
              <div className="text-[15px] text-ink font-medium">
                Grab something on the way out
              </div>
              <div className="text-[12px] text-muted mt-0.5">
                {itemCount === 0
                  ? "Coffee, pastries — ready in 5 min"
                  : `${itemCount} item${itemCount === 1 ? "" : "s"} · ready in 5 min`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {orderSubtotal > 0 && (
                <span className="text-[13px] tabular-nums text-ink">
                  {formatMoney(orderSubtotal)}
                </span>
              )}
              <span className="text-muted text-lg leading-none">›</span>
            </div>
          </button>
        </section>
      </div>

      {/* Sticky pay bar (Apple Pay style) */}
      <div className="relative z-10 px-5 pb-6 pt-3 bg-white animate-fadeUp">
        <div className="flex items-baseline justify-between mb-3 px-1">
          <span className="text-[12px] uppercase tracking-[0.14em] text-muted">Total</span>
          <span className="font-serif text-[26px] text-ink tabular-nums">
            <AnimatedTotal value={total} />
          </span>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/room/${roomNumber}/payment`)}
          disabled={total === 0}
          className="w-full rounded-2xl bg-ink text-white py-4 text-[15px] font-medium tracking-tight transition active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {total === 0 ? "Add something to checkout" : "Pay & checkout"}
        </button>
      </div>

      {/* Coffee bottom sheet */}
      <BottomSheet
        open={coffeeOpen}
        onClose={() => setCoffeeOpen(false)}
        title="Grab something on the way out?"
        footer={
          <button
            type="button"
            onClick={() => setCoffeeOpen(false)}
            className="w-full rounded-2xl bg-ink text-white py-4 text-[15px] font-medium tracking-tight transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Done</span>
            {orderSubtotal > 0 && (
              <span className="opacity-70 tabular-nums">· {formatMoney(orderSubtotal)}</span>
            )}
          </button>
        }
      >
        <CoffeeOrder />
      </BottomSheet>
    </main>
  );
}
