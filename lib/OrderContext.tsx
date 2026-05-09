"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  coffees,
  lateCheckoutConfig,
  lateCheckoutFee,
  milks,
  pastries,
  Reservation,
  reservations,
} from "./mockData";

export type CoffeeLine = {
  id: string; // unique line id
  coffeeId: string;
  milkId: string;
  qty: number;
};

export type PastryLine = {
  pastryId: string;
  qty: number;
};

export type OrderState = {
  roomNumber: string | null;
  checkoutHour: number; // 10..14
  coffeeLines: CoffeeLine[];
  pastryLines: PastryLine[];
  paid: boolean;
};

type OrderContextValue = {
  state: OrderState;
  reservation: Reservation | null;

  initRoom: (roomNumber: string) => void;
  resetOrder: () => void;
  setCheckoutHour: (hour: number) => void;

  addCoffeeLine: () => void;
  updateCoffeeLine: (id: string, patch: Partial<Omit<CoffeeLine, "id">>) => void;
  removeCoffeeLine: (id: string) => void;

  setPastryQty: (pastryId: string, qty: number) => void;

  // computed
  outstandingBalance: number;
  lateCheckoutCharge: number;
  coffeeSubtotal: number;
  pastrySubtotal: number;
  orderSubtotal: number; // coffee + pastry
  total: number;

  markPaid: () => void;
};

const defaultState: OrderState = {
  roomNumber: null,
  checkoutHour: 10,
  coffeeLines: [],
  pastryLines: [],
  paid: false,
};

const OrderContext = createContext<OrderContextValue | null>(null);

let _coffeeCounter = 0;
function newCoffeeId() {
  _coffeeCounter += 1;
  return `c-${Date.now().toString(36)}-${_coffeeCounter}`;
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OrderState>(defaultState);

  const reservation = state.roomNumber ? reservations[state.roomNumber] ?? null : null;

  const initRoom = useCallback((roomNumber: string) => {
    setState((s) => {
      if (s.roomNumber === roomNumber) return s;
      return { ...defaultState, roomNumber };
    });
  }, []);

  const resetOrder = useCallback(() => {
    setState((s) => ({ ...defaultState, roomNumber: s.roomNumber }));
  }, []);

  const setCheckoutHour = useCallback((hour: number) => {
    setState((s) => ({ ...s, checkoutHour: hour }));
  }, []);

  const addCoffeeLine = useCallback(() => {
    setState((s) => ({
      ...s,
      coffeeLines: [
        ...s.coffeeLines,
        { id: newCoffeeId(), coffeeId: coffees[0].id, milkId: milks[0].id, qty: 1 },
      ],
    }));
  }, []);

  const updateCoffeeLine = useCallback(
    (id: string, patch: Partial<Omit<CoffeeLine, "id">>) => {
      setState((s) => ({
        ...s,
        coffeeLines: s.coffeeLines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      }));
    },
    [],
  );

  const removeCoffeeLine = useCallback((id: string) => {
    setState((s) => ({ ...s, coffeeLines: s.coffeeLines.filter((l) => l.id !== id) }));
  }, []);

  const setPastryQty = useCallback((pastryId: string, qty: number) => {
    setState((s) => {
      const existing = s.pastryLines.find((p) => p.pastryId === pastryId);
      if (qty <= 0) {
        return { ...s, pastryLines: s.pastryLines.filter((p) => p.pastryId !== pastryId) };
      }
      if (existing) {
        return {
          ...s,
          pastryLines: s.pastryLines.map((p) =>
            p.pastryId === pastryId ? { ...p, qty } : p,
          ),
        };
      }
      return { ...s, pastryLines: [...s.pastryLines, { pastryId, qty }] };
    });
  }, []);

  const markPaid = useCallback(() => {
    setState((s) => ({ ...s, paid: true }));
  }, []);

  const outstandingBalance = useMemo(() => {
    if (!reservation || reservation.alreadyPaid) return 0;
    return reservation.charges.reduce((sum, c) => sum + c.amount, 0);
  }, [reservation]);

  const lateCheckoutCharge = useMemo(
    () => lateCheckoutFee(state.checkoutHour),
    [state.checkoutHour],
  );

  const coffeeSubtotal = useMemo(() => {
    return state.coffeeLines.reduce((sum, line) => {
      const coffee = coffees.find((c) => c.id === line.coffeeId);
      const milk = milks.find((m) => m.id === line.milkId);
      const unit = (coffee?.price ?? 0) + (milk?.surcharge ?? 0);
      return sum + unit * line.qty;
    }, 0);
  }, [state.coffeeLines]);

  const pastrySubtotal = useMemo(() => {
    return state.pastryLines.reduce((sum, line) => {
      const p = pastries.find((x) => x.id === line.pastryId);
      return sum + (p?.price ?? 0) * line.qty;
    }, 0);
  }, [state.pastryLines]);

  const orderSubtotal = coffeeSubtotal + pastrySubtotal;
  const total = outstandingBalance + lateCheckoutCharge + orderSubtotal;

  const value: OrderContextValue = {
    state,
    reservation,
    initRoom,
    resetOrder,
    setCheckoutHour,
    addCoffeeLine,
    updateCoffeeLine,
    removeCoffeeLine,
    setPastryQty,
    outstandingBalance,
    lateCheckoutCharge,
    coffeeSubtotal,
    pastrySubtotal,
    orderSubtotal,
    total,
    markPaid,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside <OrderProvider>");
  return ctx;
}

export { lateCheckoutConfig };
