"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartLine {
  id: string;
  name: string;
  price: number;
  category: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const MAX_QTY_PER_ITEM = 20;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.id === line.id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.id === line.id
                  ? { ...l, qty: Math.min(l.qty + qty, MAX_QTY_PER_ITEM) }
                  : l
              ),
            };
          }
          return { lines: [...state.lines, { ...line, qty: Math.min(qty, MAX_QTY_PER_ITEM) }] };
        }),
      increment: (id) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.id === id ? { ...l, qty: Math.min(l.qty + 1, MAX_QTY_PER_ITEM) } : l
          ),
        })),
      decrement: (id) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l))
            .filter((l) => l.qty > 0),
        })),
      remove: (id) => set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "waffled-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty * l.price, 0);
}

export function formatTk(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")}`;
}
