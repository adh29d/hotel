// Single source of truth for the demo. Adjust prices and the reservation here.

export type Charge = {
  label: string;
  amount: number;
};

export type Reservation = {
  roomNumber: string;
  guestFirstName: string;
  guestLastName: string;
  email: string;
  nights: number;
  checkOutDate: string; // human readable, e.g. "Sat 10 May"
  charges: Charge[];
  alreadyPaid: boolean;
  // Drives whether the late checkout slider + tap-to-check-out flow appear.
  // Flip to false to demo the mid-stay "just settle incidentals" path.
  isCheckoutToday: boolean;
};

export const DEMO_ROOM = "204";

export const reservations: Record<string, Reservation> = {
  "204": {
    roomNumber: "204",
    guestFirstName: "Mel",
    guestLastName: "Robinson",
    email: "melaine.robinson@email.com",
    nights: 2,
    checkOutDate: "Sat 10 May",
    charges: [{ label: "Restaurant", amount: 87 }],
    alreadyPaid: false,
    isCheckoutToday: true,
  },
};

// ---------- Late checkout pricing ----------
export const lateCheckoutConfig = {
  baseHour: 10, // 10am, free
  maxHour: 14, // 2pm
  hourlyRate: 25, // $25 per extra hour
};

export function lateCheckoutLabel(hour: number): string {
  const period = hour >= 12 ? "pm" : "am";
  const h = hour > 12 ? hour - 12 : hour;
  return `${h}${period}`;
}

export function lateCheckoutFee(hour: number): number {
  const extras = Math.max(0, hour - lateCheckoutConfig.baseHour);
  return extras * lateCheckoutConfig.hourlyRate;
}

// ---------- Coffee menu ----------
export type Coffee = { id: string; name: string; price: number };
export type Milk = { id: string; name: string; surcharge: number };
export type Syrup = { id: string; name: string; surcharge: number };
export type Sweetener = { id: string; name: string; surcharge: number };

export const coffees: Coffee[] = [
  { id: "flat-white", name: "Flat white", price: 5 },
  { id: "latte", name: "Latte", price: 5 },
  { id: "cappuccino", name: "Cappuccino", price: 5 },
  { id: "long-black", name: "Long black", price: 5 },
  { id: "mocha", name: "Mocha", price: 5 },
];

export const milks: Milk[] = [
  { id: "regular", name: "Regular", surcharge: 0 },
  { id: "oat", name: "Oat", surcharge: 0.8 },
  { id: "almond", name: "Almond", surcharge: 0.8 },
  { id: "soy", name: "Soy", surcharge: 0.8 },
];

export const syrups: Syrup[] = [
  { id: "none", name: "None", surcharge: 0 },
  { id: "vanilla", name: "Vanilla", surcharge: 0.5 },
  { id: "caramel", name: "Caramel", surcharge: 0.5 },
  { id: "hazelnut", name: "Hazelnut", surcharge: 0.5 },
];

export const sweeteners: Sweetener[] = [
  { id: "none", name: "None", surcharge: 0 },
  { id: "sugar", name: "Sugar", surcharge: 0 },
  { id: "brown", name: "Brown sugar", surcharge: 0 },
  { id: "stevia", name: "Stevia", surcharge: 0 },
];

// ---------- Pickup ----------
export const pickupLocation = "Pelicans Breakfast Restaurant";

export const pickupPresetMinutes = [10, 15, 20, 30] as const;
export type PickupPreset = (typeof pickupPresetMinutes)[number];

export const kitchenHours = {
  open: "06:30",
  close: "14:00",
};

export type PickupSelection =
  | { kind: "preset"; minutes: number }
  | { kind: "custom"; time: string }; // "HH:MM" 24h

export function presetLabel(min: number): string {
  if (min < 60) return `In ${min} min`;
  const hours = min / 60;
  return `In ${hours} hr`;
}

export function resolvePickupTime(pickup: PickupSelection, now: Date = new Date()): Date {
  if (pickup.kind === "preset") {
    return new Date(now.getTime() + pickup.minutes * 60_000);
  }
  const [h, m] = pickup.time.split(":").map(Number);
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d;
}

export function defaultCustomPickupTime(now: Date = new Date()): string {
  const ms = now.getTime() + 30 * 60_000;
  const slot = 15 * 60_000;
  const rounded = Math.ceil(ms / slot) * slot;
  const d = new Date(rounded);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatMoney(amount: number): string {
  if (amount === 0) return "$0";
  if (Number.isInteger(amount)) return `$${amount}`;
  return `$${amount.toFixed(2)}`;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function formatTime(date: Date): string {
  let h = date.getHours();
  const m = date.getMinutes();
  const period = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, "0")}${period}`;
}
