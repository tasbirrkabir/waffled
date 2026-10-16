"use client";

import * as React from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import type { MenuItem } from "@/content/menu";
import { cn } from "@/lib/utils";

interface Props {
  item: Pick<MenuItem, "id" | "name" | "price">;
  category: string;
  size?: "sm" | "md";
  className?: string;
}

export function AddToCartButton({ item, category, size = "md", className }: Props) {
  const lines = useCart((s) => s.lines);
  const add = useCart((s) => s.add);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const line = lines.find((l) => l.id === item.id);

  const baseBtn =
    "inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-ink font-display font-bold transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink";
  // Height classes shared by the "Add" button and the quantity pill so the
  // card never shifts/resizes when an item is added (prevents overlap glitch).
  const sizeCls =
    size === "sm"
      ? "h-9 min-h-9 px-3.5 text-xs"
      : "h-11 min-h-11 px-5 text-sm";

  if (!line) {
    return (
      <button
        type="button"
        onClick={() => {
          add({ id: item.id, name: item.name, price: item.price, category });
          toast.success(`${item.name} added to your order`);
        }}
        className={cn(
          baseBtn,
          sizeCls,
          "bg-white text-ink mb-[3px] shadow-[2.5px_2.5px_0_0_var(--color-ink)] hover:bg-lime hover:shadow-none hover:translate-x-[2.5px] hover:translate-y-[2.5px]",
          className
        )}
        aria-label={`Add ${item.name} to your order, ৳${item.price}`}
      >
        <ShoppingBag className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
        Add
      </button>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full border-2 border-ink bg-white",
        // Same height as the "Add" button + 2.5px reserved for the hard
        // shadow so the pill never pokes past the card's bottom edge.
        sizeCls,
        "mb-[3px] shadow-[2.5px_2.5px_0_0_var(--color-ink)]",
        className
      )}
      role="group"
      aria-label={`${item.name} quantity, ${line.qty} in order`}
    >
      <button
        type="button"
        onClick={() => decrement(item.id)}
        className="flex h-full min-h-0 items-center px-3 text-ink transition-colors hover:bg-pink hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-pink"
        aria-label={`Remove one ${item.name} from your order`}
      >
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span
        className="min-w-8 text-center font-display text-sm font-bold text-ink tabular-nums"
        aria-live="polite"
      >
        {line.qty}
      </span>
      <button
        type="button"
        onClick={() => increment(item.id)}
        className="flex h-full min-h-0 items-center px-3 text-ink transition-colors hover:bg-lime focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-pink"
        aria-label={`Add one more ${item.name} to your order`}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}
