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
    coffeeSubtotal,
    total,
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

  // Live clock so the entry-row pickup time stays accurate.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const pickupAt = useMemo(
    () => resolvePickupTime(state.pickup, now),
    [state.pickup, now],
  );

  // Live Toukley weather (Open-Meteo, no auth). Falls back to a static
  // sunny default if the request fails or hasn't returned yet.
  const [weather, setWeather] = useState<LiveWeather>(fallbackWeather);
  useEffect(() => {
    let cancelled = false;
    fetchToukleyWeather()
      .then((w) => {
        if (!cancelled) setWeather(w);
      })
      .catch(() => {
        /* keep fallback */
      });
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

  const subtitle = isCheckoutDay
    ? `Room ${reservation.roomNumber} · Checking out today`
    : `Room ${reservation.roomNumber} · Checking out ${reservation.checkOutDate}`;

  const ctaLabel = total === 0 ? "Nothing to pay" : "Pay balance";

  return (
    <main className="relative h-[100dvh] flex flex-col overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[58%] -z-0 overflow-hidden">
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

      <header className="relative z-10 px-6 pt-14 pb-4 animate-fadeUp">
        <h1
          className="font-serif text-[36px] leading-[1.05] text-white"
          style={{
            textShadow:
              "0 1px 2px rgba(0,0,0,0.5), 0 2px 16px rgba(0,0,0,0.4)",
          }}
        >
          {greetingPrefix(now)},
          <br />
          {reservation.guestFirstName}.
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

      <div className="flex-1" />

      <div className="relative z-10 px-5 animate-fadeUp">
        <section className="rounded-3xl bg-surface p-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted">
              {allPaid ? "Stay paid" : "Your current balance"}
            </div>
            <div className="mt-1 text-[36px] font-medium leading-none text-ink tabular-nums tracking-tight">
              {allPaid ? "$0" : formatMoney(outstandingBalance)}
            </div>
            {!allPaid && reservation.charges.length > 0 && (
              <button
                type="button"
                onClick={() => setInvoiceOpen(true)}
                disabled={invoiceSent}
                className="mt-2 text-[11px] text-accent hover:underline disabled:no-underline disabled:text-muted"
              >
                {invoiceSent
                  ? "Itemised invoice request sent."
                  : "Request itemised invoice from reception"}
              </button>
            )}
          </div>

          {isCheckoutDay && (
            <>
              <div className="my-4 h-px bg-line" />
              <LateCheckoutSlider
                hour={state.checkoutHour}
                onHourChange={setCheckoutHour}
              />
            </>
          )}

          <div className="my-4 h-px bg-line" />

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
                  : `${itemCount} coffee${itemCount === 1 ? "" : "s"} · by ${formatTime(pickupAt)}`}
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

      <div className="relative z-10 px-5 pb-6 pt-3 bg-white animate-fadeUp">
        <div className="flex items-baseline justify-between mb-3 px-1">
          <span className="text-[12px] uppercase tracking-[0.14em] text-muted">Total</span>
          <span className="text-[26px] font-medium text-ink tabular-nums tracking-tight">
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
