"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrder } from "@/lib/OrderContext";
import {
  formatMoney,
  formatTime,
  pickupLocation,
  resolvePickupTime,
} from "@/lib/mockData";
import {
  fallbackWeather,
  fetchToukleyWeather,
  LiveWeather,
  WeatherCondition,
} from "@/lib/weather";
import LateCheckoutSlider from "@/components/LateCheckoutSlider";
import CoffeeOrder from "@/components/CoffeeOrder";
import AnimatedTotal from "@/components/AnimatedTotal";
import BottomSheet from "@/components/BottomSheet";
import InvoiceRequestModal from "@/components/InvoiceRequestModal";
import ReviewCard from "@/components/ReviewCard";
import Confetti from "@/components/Confetti";

const HERO_SRC =
  "https://beachcomberhotelandresort.com.au/wp-content/uploads/2022/09/Pelicans-Breakfast-417b.jpg";

const KEY_DROP_NOTE =
  "Drop your keys in the express checkout box next to reception.";

export default function RoomLandingPage() {
  const params = useParams<{ roomNumber: string }>();
  const router = useRouter();
  const roomNumber = params.roomNumber;
  const {
    initRoom,
    resetOrder,
    reservation,
    state,
    setCheckoutHour,
    outstandingBalance,
    coffeeSubtotal,
    total,
    markCheckedOut,
  } = useOrder();
  const [coffeeOpen, setCoffeeOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceSent, setInvoiceSent] = useState(false);

  useEffect(() => {
    initRoom(roomNumber);
  }, [roomNumber, initRoom]);

  const itemCount = useMemo(
    () => state.coffeeLines.reduce((s, l) => s + l.qty, 0),
    [state.coffeeLines],
  );

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const pickupAt = useMemo(
    () => resolvePickupTime(state.pickup, now),
    [state.pickup, now],
  );

  const [weather, setWeather] = useState<LiveWeather>(fallbackWeather);
  useEffect(() => {
    let cancelled = false;
    fetchToukleyWeather()
      .then((w) => {
        if (!cancelled) setWeather(w);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!reservation) {
    return (
      <main className="px-6 py-12 animate-fadeIn">
        <h1 className="font-serif text-2xl">Room not found</h1>
        <p className="mt-2 text-muted">
          We couldn&rsquo;t find a reservation for room {roomNumber}.
        </p>
        <Link href="/" className="mt-6 inline-block text-accent underline">
          Back home
        </Link>
      </main>
    );
  }

  const allPaid = reservation.alreadyPaid;
  const isCheckoutDay = reservation.isCheckoutToday;
  const hasOrder = state.coffeeLines.length > 0;

  const subtitle = isCheckoutDay
    ? `Room ${reservation.roomNumber} · Checking out today`
    : `Room ${reservation.roomNumber} · Checking out ${reservation.checkOutDate}`;

  const restart = () => {
    resetOrder();
    router.push("/");
  };

  // ---------- Hero (shared across paid + unpaid) ----------
  // Sized in svh so it doesn't grow with scrollable content; clamped with
  // pixel min/max so the proportion looks right from iPhone SE up to large phones.
  const Hero = (heroHeight: string) => (
    <>
      <div
        className={`absolute inset-x-0 top-0 ${heroHeight} -z-0 overflow-hidden`}
      >
        <Image
          src={HERO_SRC}
          alt=""
          fill
          priority
          sizes="440px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-white" />
      </div>

      <header
        className="relative z-10 px-6 pb-4 animate-fadeUp"
        style={{ paddingTop: "max(3rem, env(safe-area-inset-top))" }}
      >
        <h1
          className="font-serif text-[clamp(28px,8.6vw,36px)] leading-[1.05] text-white"
          style={{
            textShadow:
              "0 1px 2px rgba(0,0,0,0.5), 0 2px 16px rgba(0,0,0,0.4)",
          }}
        >
          {state.paid ? (
            <>
              {reservation.guestFirstName}, we&rsquo;ve loved
              <br />
              having you stay!
            </>
          ) : (
            <>
              {greetingPrefix(now)},
              <br />
              {reservation.guestFirstName}!
            </>
          )}
        </h1>
        <p
          className="mt-3 text-[13px] text-white tracking-tight"
          style={{
            textShadow:
              "0 1px 2px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.4)",
          }}
        >
          {subtitle}
        </p>
        <p
          className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] text-white/90 tracking-tight"
          style={{
            textShadow:
              "0 1px 2px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.4)",
          }}
        >
          <WeatherIcon condition={weather.condition} />
          <span className="tabular-nums">
            {weather.tempC}° · {weather.label} in Toukley
          </span>
        </p>
      </header>
    </>
  );

  // ============ Paid state ============
  if (state.paid) {
    return (
      <main className="relative min-h-[100svh] flex flex-col">
        {Hero("h-[36svh] min-h-[220px] max-h-[360px]")}

        <div
          className="relative z-10 px-5 space-y-3 animate-fadeUp"
          style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
        >
          {/* Payment received — pill + balance only */}
          <section className="rounded-3xl bg-surface p-5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft text-accent px-3 py-1 text-[11px] font-medium tracking-tight">
              <CheckIcon /> Payment received
            </span>
            <span className="text-[20px] font-medium text-ink tabular-nums tracking-tight">
              {formatMoney(total)}
            </span>
          </section>

          {(hasOrder || isCheckoutDay) && (
            <section className="rounded-3xl bg-surface p-5">
              {isCheckoutDay && (
                <div className="text-[11px] uppercase tracking-[0.14em] text-muted">
                  Before you go
                </div>
              )}
              <ul
                className={`${isCheckoutDay ? "mt-2" : ""} space-y-1.5 text-[14px] text-ink leading-relaxed`}
              >
                {hasOrder && (
                  <li>
                    Your coffee will be ready at {pickupLocation} at{" "}
                    <span className="font-medium tabular-nums">
                      {formatTime(pickupAt)}
                    </span>
                    .
                  </li>
                )}
                {isCheckoutDay && <li>{KEY_DROP_NOTE}</li>}
              </ul>
            </section>
          )}

          {isCheckoutDay ? (
            <>
              <ReviewCard />

              {state.checkedOut ? (
                <>
                  <Confetti />
                  <div className="w-full rounded-2xl bg-accent-soft text-accent py-4 px-4 text-[14px] font-medium tracking-tight flex items-center justify-center gap-2 text-center animate-fadeUp">
                    <CheckIcon /> All checked out! We hope to see you again.
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={markCheckedOut}
                  className="w-full rounded-2xl bg-ink text-white py-4 text-[15px] font-medium tracking-tight transition active:scale-[0.99]"
                >
                  Tap to check out
                </button>
              )}
            </>
          ) : (
            <section className="rounded-3xl bg-surface p-5">
              <div className="font-serif text-[20px] text-ink">
                All settled, {reservation.guestFirstName}.
              </div>
              <p className="mt-1.5 text-[13px] text-muted leading-relaxed">
                Your balance is clear. Have a wonderful stay.
              </p>
            </section>
          )}

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={restart}
              className="text-[11px] text-muted hover:text-ink underline underline-offset-4"
            >
              Restart demo
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ============ Unpaid state ============
  const ctaLabel = total === 0 ? "Nothing to pay" : "Pay balance";

  return (
    <main className="relative min-h-[100svh] flex flex-col">
      {Hero("h-[40svh] min-h-[230px] max-h-[360px]")}

      <div className="flex-1" />

      <div className="relative z-10 px-5 animate-fadeUp">
        <section className="rounded-3xl bg-surface p-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted">
              {allPaid ? "Stay paid" : "Your current balance"}
            </div>
            <div className="mt-1 text-[clamp(28px,9vw,36px)] font-medium leading-none text-ink tabular-nums tracking-tight">
              {allPaid ? "$0" : formatMoney(outstandingBalance)}
            </div>
            {!allPaid && reservation.charges.length > 0 && (
              <button
                type="button"
                onClick={() => setInvoiceOpen(true)}
                disabled={invoiceSent}
                className="mt-2 inline-flex items-center gap-1 text-[11px] text-accent hover:underline disabled:no-underline disabled:text-muted"
              >
                <span>
                  {invoiceSent
                    ? "Itemised invoice request sent."
                    : "Request itemised invoice from reception"}
                </span>
                {!invoiceSent && <InvoiceArrow />}
              </button>
            )}
          </div>

          {isCheckoutDay && (
            <>
              <div className="my-3.5 h-px bg-line" />
              <LateCheckoutSlider
                hour={state.checkoutHour}
                onHourChange={setCheckoutHour}
              />
            </>
          )}

          <div className="my-3.5 h-px bg-line" />

          <button
            type="button"
            onClick={() => setCoffeeOpen(true)}
            className="w-full flex items-center justify-between text-left transition active:scale-[0.99]"
          >
            <div>
              <div className="text-[15px] text-ink font-medium">
                {isCheckoutDay
                  ? "Feel like a coffee on the way out?"
                  : "Feel like a coffee?"}
              </div>
              <div className="text-[12px] text-muted mt-0.5">
                {itemCount === 0
                  ? `${pickupLocation} · pick a time`
                  : `${itemCount} coffee${itemCount === 1 ? "" : "s"} · at ${formatTime(pickupAt)}`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {coffeeSubtotal > 0 && (
                <span className="text-[13px] tabular-nums text-ink">
                  {formatMoney(coffeeSubtotal)}
                </span>
              )}
              <span className="text-muted text-lg leading-none">›</span>
            </div>
          </button>
        </section>
      </div>

      <div
        className="relative z-10 px-5 pt-4 bg-white animate-fadeUp"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-baseline justify-between mb-2.5 px-1">
          <span className="text-[12px] uppercase tracking-[0.14em] text-muted">Total</span>
          <span className="text-[clamp(22px,6.6vw,26px)] font-medium text-ink tabular-nums tracking-tight">
            <AnimatedTotal value={total} />
          </span>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/room/${roomNumber}/payment`)}
          disabled={total === 0}
          className="w-full rounded-2xl bg-ink text-white py-4 text-[15px] font-medium tracking-tight transition active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {ctaLabel}
        </button>
      </div>

      <BottomSheet
        open={coffeeOpen}
        onClose={() => setCoffeeOpen(false)}
        title={
          isCheckoutDay
            ? "Feel like a coffee on the way out?"
            : "Feel like a coffee?"
        }
        footer={
          <button
            type="button"
            onClick={() => setCoffeeOpen(false)}
            className="w-full rounded-2xl bg-ink text-white py-4 text-[15px] font-medium tracking-tight transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Done</span>
            {coffeeSubtotal > 0 && (
              <span className="opacity-70 tabular-nums">· {formatMoney(coffeeSubtotal)}</span>
            )}
          </button>
        }
      >
        <CoffeeOrder />
      </BottomSheet>

      <InvoiceRequestModal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        defaultEmail={reservation.email}
        onSent={() => setInvoiceSent(true)}
      />
    </main>
  );
}

function greetingPrefix(now: Date): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
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

function InvoiceArrow() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WeatherIcon({ condition }: { condition: WeatherCondition }) {
  const stroke = "currentColor";
  if (condition === "cloudy") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.1 11.1 4 4 0 0 0 7 18Z"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (condition === "rain") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M7 14h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.1 7.1 4 4 0 0 0 7 14Z"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9 18l-1 3M13 18l-1 3M17 18l-1 3"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (condition === "night") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"
          stroke={stroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3.6" fill={stroke} />
      <g stroke={stroke} strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 3v2" />
        <path d="M12 19v2" />
        <path d="M3 12h2" />
        <path d="M19 12h2" />
        <path d="M5.4 5.4 6.8 6.8" />
        <path d="M17.2 17.2 18.6 18.6" />
        <path d="M5.4 18.6 6.8 17.2" />
        <path d="M17.2 6.8 18.6 5.4" />
      </g>
    </svg>
  );
}
