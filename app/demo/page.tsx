import Link from "next/link";
import { reservations } from "@/lib/mockData";

export default function DemoIndexPage() {
  const rooms = Object.values(reservations);
  return (
    <main className="px-5 pt-12 pb-12 animate-fadeIn">
      <div className="text-[11px] uppercase tracking-[0.2em] text-muted">RMS Pay · Demo</div>
      <h1 className="mt-3 font-serif text-[30px] leading-tight text-ink">Pick a scenario</h1>
      <p className="mt-2 text-[13px] text-muted leading-relaxed">
        Each room represents a different state. Tap one to walk through the guest flow.
      </p>

      <div className="mt-7 space-y-2.5">
        {rooms.map((r) => (
          <Link
            key={r.roomNumber}
            href={`/room/${r.roomNumber}`}
            className="block rounded-3xl bg-surface p-5 transition active:scale-[0.99] hover:bg-[#EDEDEF]"
          >
            <div className="flex items-baseline justify-between">
              <div className="font-serif text-[22px] text-ink">Room {r.roomNumber}</div>
              <div className="text-[11px] text-muted">
                {r.guestFirstName} {r.guestLastName}
              </div>
            </div>
            <div className="mt-1.5 text-[13px] text-muted leading-relaxed">{r.scenarioNote}</div>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-center text-[11px] text-muted">
        In production, guests reach this app via QR codes on the back of their room doors.
      </p>
    </main>
  );
}
