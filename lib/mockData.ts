// Single source of truth for the demo. Adjust prices and reservations here.

export type Charge = {
  label: string;
  amount: number;
};

export type Reservation = {
  roomNumber: string;
  guestFirstName: string;
  guestLastName: string;
  nights: number;
  checkOutDate: string; // human readable, e.g. "Sat 10 May"
  charges: Charge[];
  alreadyPaid: boolean;
  scenarioNote: string; // shown only on /demo
};

export const reservations: Record<string, Reservation> = {
  "204": {
    roomNumber: "204",
    guestFirstName: "Eleanor",
    guestLastName: "Hayes",
    nights: 2,
    checkOutDate: "Sat 10 May",
    charges: [{ label: "Restaurant", amount: 87 }],
    alreadyPaid: false,
    scenarioNote: "$87 outstanding · standard checkout",
  },
  "312": {
    roomNumber: "312",
    guestFirstName: "Marcus",
    guestLastName: "Bell",
    nights: 1,
    checkOutDate: "Sat 10 May",
    charges: [],
    alreadyPaid: false,
    scenarioNote: "Nothing owing · can still order coffee + late checkout",
  },
  "415": {
    roomNumber: "415",
    guestFirstName: "Priya",
    guestLastName: "Shah",
    nights: 3,
    checkOutDate: "Sat 10 May",
    charges: [
      { label: "Restaurant", amount: 248 },
      { label: "Minibar", amount: 64 },
    ],
    alreadyPaid: false,
    scenarioNote: "$312 outstanding · restaurant + minibar",
  },
  "508": {
    roomNumber: "508",
    guestFirstName: "Tom",
    guestLastName: "Whitaker",
    nights: 2,
    checkOutDate: "Sat 10 May",
    charges: [],
    alreadyPaid: true,
    scenarioNote: "Already paid · coffee + late checkout only",
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

// ---------- Coffee + pastry menu ----------
export type Coffee = { id: string; name: string; price: number };
export type Milk = { id: string; name: string; surcharge: number };
export type Pastry = { id: string; name: string; price: number };

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

export const pastries: Pastry[] = [
  { id: "butter-croissant", name: "Butter croissant", price: 6 },
  { id: "almond-croissant", name: "Almond croissant", price: 7 },
  { id: "blueberry-muffin", name: "Blueberry muffin", price: 6 },
  { id: "banana-bread", name: "Banana bread", price: 6 },
];

export const orderPrepMinutes = 5;

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
