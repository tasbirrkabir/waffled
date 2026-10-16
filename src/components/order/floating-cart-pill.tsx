"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { trackEvent } from "@/lib/track";
import { cartCount, cartSubtotal, formatTk, useCart } from "@/lib/cart-store";

/**
 * Floating "checkout popup" bar. Appears at the bottom of the screen as soon
 * as the cart has at least one item, so customers ordering from any page
 * (home, menu, ...) always get a one-tap path to checkout.
 *
 * - Mobile: floats above the site mobile action bar (3.75rem tall).
 * - md and up: floats near the bottom edge of the viewport.
 */
export function FloatingCartPill() {
  const lines = useCart((s) => s.lines);
  // Avoid hydration mismatch: render only after mount, once localStorage
  // has rehydrated the persisted cart.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const itemCount = cartCount(lines);
  const subtotal = cartSubtotal(lines);
  const visible = mounted && itemCount > 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-0 bottom-[calc(3.75rem_+_env(safe-area-inset-bottom))] z-40 px-4 pb-1 md:bottom-6 md:pb-0"
        >
          <Link
            href="/order"
            onClick={() => trackEvent("menu_click")}
            aria-label={`Review your order, ${itemCount} item${itemCount === 1 ? "" : "s"}, ${formatTk(subtotal)}. Go to checkout.`}
            className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-2xl border-[3px] border-ink bg-ink px-5 py-3.5 text-cream shadow-[4px_4px_0_0_rgba(32,23,25,0.3)] transition-transform active:scale-[0.98] md:max-w-md"
          >
            <span className="flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-pink text-white">
                <ShoppingBag className="h-4.5 w-4.5" aria-hidden />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-ink bg-lime px-1 text-[0.6rem] font-bold text-ink tabular-nums">
                  {itemCount}
                </span>
              </span>
              <span className="text-left">
                <span className="block text-xs font-medium text-cream/70">Your order</span>
                <span className="block font-display text-base font-bold tabular-nums">
                  {formatTk(subtotal)}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-1.5 font-display text-sm font-bold text-lime">
              Checkout
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
