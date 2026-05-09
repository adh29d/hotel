"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrder } from "@/lib/OrderContext";
import { formatMoney, lateCheckoutLabel } from "@/lib/mockData";
import AnimatedTotal from "@/components/AnimatedTotal";

type Method = "apple" | "samsung" | "card" | null;

export default function PaymentPage() {
  const params = useParams<{ roomNumber: string }>();
  const router = useRouter();
  const {
    initRoom,
    reservation,
    state,
    outstandingBalance,
    lateCheckoutCharge,
    coffeeSubtotal,
    total,
    markPaid,
  } = useOrder();
  const [processing, setProcessing] = useState<Method>(null);

  useEffect(() => {
    initRoom(params.roomNumber);
  }, [params.roomNumber, initRoom]);

  if (!reservation) return null;

  const pay = (method: Exclude<Method, null>) => {
    if (processing) return;
    setProcessing(method);
    setTimeout(() => {
      markPaid();
      router.push(`/room/${params.roomNumber}`);
    }, 2000);
  };

  return (
    <main className="h-[100dvh] flex flex-col bg-white">
      <header className="px-5 pt-6 pb-2 flex items-center justify-between animate-fadeUp">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={!!processing}
          aria-label="Back"
          className="h-9 w-9 rounded-full bg-surface flex items-center justify-center text-ink transition active:scale-95 disabled:opacity-40"
        >
          <span className="block leading-none -mt-0.5">‹</span>
        </button>
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Payment</div>
        <div className="w-9" />
      </header>

      <section className="px-6 pt-4 animate-fadeUp">
        <h1 className="font-serif text-[30px] leading-tight text-ink">Confirm &amp; pay</h1>
        <p className="mt-1 text-[13px] text-muted">
          Room {reservation.roomNumber} · {reservation.guestFirstName} {reservation.guestLastName}
        </p>
      </section>

      <section className="mx-5 mt-5 rounded-3xl bg-surface p-5 animate-fadeUp">
        <ul className="divide-y divide-line/80 text-[14px]">
          <li className="flex justify-between py-2.5">
            <span className="text-muted">Room balance</span>
            <span className="tabular-nums text-ink">{formatMoney(outstandingBalance)}</span>
          </li>
          <li className="flex justify-between py-2.5">
            <span className="text-muted">
              Late checkout · {lateCheckoutLabel(state.checkoutHour)}
            </span>
            <span className="tabular-nums text-ink">
              {lateCheckoutCharge === 0 ? "Included" : formatMoney(lateCheckoutCharge)}
            </span>
          </li>
          <li className="flex justify-between py-2.5">
            <span className="text-muted">Coffee order</span>
            <span className="tabular-nums text-ink">
              {coffeeSubtotal === 0 ? "—" : formatMoney(coffeeSubtotal)}
            </span>
          </li>
        </ul>
        <div className="mt-3 pt-3 border-t border-line flex items-baseline justify-between">
          <span className="text-[12px] uppercase tracking-[0.14em] text-muted">Total</span>
          <span className="text-[28px] font-medium text-ink tabular-nums tracking-tight">
            <AnimatedTotal value={total} />
          </span>
        </div>
      </section>

      <div className="flex-1" />

      <section className="px-5 pb-8 space-y-2.5 animate-fadeUp">
        <PayButton
          label="Pay"
          onClick={() => pay("apple")}
          state={processing === "apple" ? "loading" : processing ? "disabled" : "idle"}
          variant="dark"
          icon={<AppleIcon />}
        />
        <PayButton
          label="Samsung Pay"
          onClick={() => pay("samsung")}
          state={processing === "samsung" ? "loading" : processing ? "disabled" : "idle"}
          variant="dark"
          icon={<SamsungIcon />}
        />
        <PayButton
          label="Pay with card"
          onClick={() => pay("card")}
          state={processing === "card" ? "loading" : processing ? "disabled" : "idle"}
          variant="outline"
          icon={<CardIcon />}
        />
        <p className="pt-2 text-center text-[11px] text-muted">
          Demo mode · no real payment is processed
        </p>
      </section>
    </main>
  );
}

function PayButton({
  label,
  onClick,
  state,
  variant,
  icon,
}: {
  label: string;
  onClick: () => void;
  state: "idle" | "loading" | "disabled";
  variant: "dark" | "outline";
  icon: React.ReactNode;
}) {
  const base =
    "w-full rounded-2xl py-4 text-[15px] font-medium tracking-tight flex items-center justify-center gap-2 transition active:scale-[0.99]";
  const dark = "bg-ink text-white";
  const outline = "bg-white text-ink border border-line";
  const disabled = state === "disabled" ? "opacity-30 cursor-not-allowed" : "";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state !== "idle"}
      className={`${base} ${variant === "dark" ? dark : outline} ${disabled}`}
    >
      {state === "loading" ? (
        <>
          <Spinner />
          <span>Processing…</span>
        </>
      ) : (
        <>
          {icon}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.4 1.2 0 1.7-.8 3.2-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.3.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.6-1-2.6-3.2zm-2.2-6c.7-.8 1.1-2 1-3.1-.9.1-2.1.6-2.8 1.4-.6.7-1.2 1.9-1 2.9 1.1.1 2.1-.5 2.8-1.2z" />
    </svg>
  );
}

function SamsungIcon() {
  return (
    <span className="text-[12px] font-semibold tracking-wide">SΛMSUNG</span>
  );
}

function CardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
