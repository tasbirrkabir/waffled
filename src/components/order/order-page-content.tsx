"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock,
  Loader2,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { menu } from "@/content/menu";
import { siteConfig } from "@/content/site";
import { trackEvent } from "@/lib/track";
import { cartSubtotal, formatTk, useCart, type CartLine } from "@/lib/cart-store";
import { AddToCartButton } from "@/components/order/add-to-cart-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const pickupOptions = [
  "ASAP (about 15-25 min)",
  "In 30 minutes",
  "In 1 hour",
  "Tonight, around 7 PM",
  "Tonight, around 8 PM",
  "Tonight, around 9 PM",
] as const;

interface OrderSuccess {
  orderNumber: string;
  total: number;
  whatsappUrl: string;
}

const phoneRegex = /^(?:\+?880|0)1[3-9]\d{8}$/;

function validatePhone(value: string): boolean {
  return phoneRegex.test(value.replace(/[\s-]/g, ""));
}

export function OrderPageContent() {
  const lines = useCart((s) => s.lines);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const [activeCat, setActiveCat] = React.useState(menu[0].id);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [pickupTime, setPickupTime] = React.useState<string>(pickupOptions[0]);
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState<OrderSuccess | null>(null);
  const [touched, setTouched] = React.useState<{ name?: boolean; phone?: boolean }>({});

  const subtotal = cartSubtotal(lines);
  const nameValid = name.trim().length >= 2;
  const phoneValid = validatePhone(phone);
  const canSubmit = lines.length > 0 && nameValid && phoneValid && !submitting;

  const category = menu.find((c) => c.id === activeCat) ?? menu[0];

  async function placeOrder() {
    setTouched({ name: true, phone: true });
    if (!canSubmit) {
      if (lines.length === 0) toast.error("Add at least one item to your order first.");
      else if (!nameValid) toast.error("Please tell us your name.");
      else if (!phoneValid) toast.error("Please enter a valid Bangladeshi phone number.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          phone: phone.trim(),
          pickupTime,
          notes: notes.trim() || undefined,
          items: lines.map((l) => ({ id: l.id, qty: l.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not place the order.");
      }
      setSuccess({
        orderNumber: data.orderNumber,
        total: data.total,
        whatsappUrl: data.whatsappUrl,
      });
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place the order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ------------------------------ SUCCESS VIEW ----------------------------- */
  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-28 sm:px-6 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border-[3px] border-ink bg-white p-6 text-center shadow-[8px_8px_0_0_var(--color-ink)] sm:p-10"
        >
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-ink bg-lime shadow-[3px_3px_0_0_var(--color-ink)]">
            <Check className="h-8 w-8 text-ink" strokeWidth={3} aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
            Order placed!
          </h1>
          <p className="mt-2 text-muted-warm">
            Your order number is{" "}
            <span className="font-display font-bold text-pink">{success.orderNumber}</span>
            , total {formatTk(success.total)}.
          </p>

          <div className="mt-6 rounded-2xl border-2 border-dashed border-ink/30 bg-cream p-4 text-left">
            <p className="flex items-start gap-2 text-sm font-semibold text-ink">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-orange" aria-hidden />
              One last step: tap the WhatsApp button below so the shop receives your
              order instantly. You can also call us to confirm.
            </p>
          </div>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="min-h-12 rounded-full bg-[#25D366] px-7 text-base font-bold text-white shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <a href={success.whatsappUrl} target="_blank" rel="noopener noreferrer">
                Send order on WhatsApp
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-12 rounded-full border-2 border-ink bg-white px-7 text-base font-semibold text-ink"
            >
              <a href={`tel:${siteConfig.phoneE164}`} onClick={() => trackEvent("phone_click")}>
                <Phone className="mr-1 h-4 w-4" aria-hidden />
                Call the shop
              </a>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setName("");
              setPhone("");
              setNotes("");
              setTouched({});
            }}
            className="mt-6 text-sm font-semibold text-pink underline-offset-4 hover:underline"
          >
            Start a new order
          </button>
        </motion.div>
      </div>
    );
  }

  /* ------------------------------- ORDER VIEW ------------------------------ */
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      {/* Heading */}
      <div className="pt-28 md:pt-32">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Order <span className="text-pink">online</span>, pick up fresh.
        </h1>
        <ol className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-muted-warm">
          {["Pick your treats", "Add your details", "Send on WhatsApp or call"].map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-white font-display text-[0.65rem] font-bold text-ink">
                {i + 1}
              </span>
              {step}
              {i < 2 && <span aria-hidden className="text-ink/30">→</span>}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Menu browser */}
        <section aria-label="Menu items" className="min-w-0">
          <div
            role="tablist"
            aria-label="Menu categories"
            className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {menu.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCat === cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={cn(
                  "whitespace-nowrap rounded-full border-2 px-4 py-2 text-sm font-bold transition-all",
                  activeCat === cat.id
                    ? "border-ink bg-ink text-cream shadow-[2.5px_2.5px_0_0_rgba(32,23,25,0.25)]"
                    : "border-ink/20 bg-white text-ink hover:border-ink"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.ul
              key={category.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-5 grid gap-3 sm:grid-cols-2"
              aria-live="polite"
            >
              {category.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border-2 border-ink/15 bg-white p-4 transition-all hover:border-ink"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold leading-tight">
                        {item.name}
                      </h3>
                      {item.tags?.includes("new") && (
                        <span className="rounded-full bg-orange px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-warm">
                      {item.description}
                    </p>
                    <p className="mt-1.5 font-display text-base font-bold text-pink tabular-nums">
                      ৳{item.price}
                    </p>
                  </div>
                  <AddToCartButton
                    item={item}
                    category={category.label}
                    size="sm"
                    className="shrink-0"
                  />
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </section>

        {/* Cart + checkout */}
        <aside aria-label="Your order" className="lg:sticky lg:top-24 lg:self-start md:top-[4.75rem]">
          <div className="rounded-3xl border-[3px] border-ink bg-white p-5 shadow-[6px_6px_0_0_var(--color-ink)]">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold">
              <ShoppingBag className="h-5 w-5 text-pink" aria-hidden />
              Your order
              {lines.length > 0 && (
                <span className="rounded-full bg-pink px-2.5 py-0.5 text-xs font-bold text-white tabular-nums">
                  {lines.reduce((n, l) => n + l.qty, 0)}
                </span>
              )}
            </h2>

            {lines.length === 0 ? (
              <div className="mt-4 rounded-2xl border-2 border-dashed border-ink/25 p-6 text-center">
                <p className="text-sm font-medium text-muted-warm">
                  Nothing here yet. Pick a waffle or a shake and it will show up right
                  here.
                </p>
              </div>
            ) : (
              <ul className="mt-4 max-h-64 space-y-2.5 overflow-y-auto pr-1">
                {lines.map((line) => (
                  <CartRow key={line.id} line={line} onInc={increment} onDec={decrement} onRemove={remove} />
                ))}
              </ul>
            )}

            {lines.length > 0 && (
              <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-ink/20 pt-3">
                <span className="text-sm font-semibold text-muted-warm">Subtotal</span>
                <span className="font-display text-2xl font-bold tabular-nums">
                  {formatTk(subtotal)}
                </span>
              </div>
            )}

            {/* Checkout form */}
            <div className="mt-5 space-y-3.5">
              <div>
                <Label htmlFor="order-name" className="text-sm font-semibold">
                  Your name
                </Label>
                <Input
                  id="order-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder="e.g. Rahim Ahmed"
                  autoComplete="name"
                  maxLength={60}
                  required
                  aria-invalid={touched.name && !nameValid}
                  className="mt-1.5 border-2 border-ink/25 bg-cream focus-visible:ring-pink"
                />
                {touched.name && !nameValid && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    Please enter your name (at least 2 characters).
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="order-phone" className="text-sm font-semibold">
                  Phone number
                </Label>
                <Input
                  id="order-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  placeholder="01XXXXXXXXX"
                  autoComplete="tel"
                  maxLength={16}
                  required
                  aria-invalid={touched.phone && !phoneValid}
                  className="mt-1.5 border-2 border-ink/25 bg-cream focus-visible:ring-pink"
                />
                {touched.phone && !phoneValid && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    Enter a valid BD number, e.g. 01723399638.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="order-pickup" className="text-sm font-semibold">
                  Pickup time
                </Label>
                <select
                  id="order-pickup"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border-2 border-ink/25 bg-cream px-3 text-sm font-medium text-ink focus:border-pink focus:outline-none"
                >
                  {pickupOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="order-notes" className="text-sm font-semibold">
                  Notes <span className="font-normal text-muted-warm">(optional)</span>
                </Label>
                <Textarea
                  id="order-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Extra Nutella? Tell us here."
                  maxLength={400}
                  className="mt-1.5 min-h-20 border-2 border-ink/25 bg-cream focus-visible:ring-pink"
                />
              </div>

              <Button
                onClick={placeOrder}
                disabled={submitting}
                className="h-13 w-full min-h-12 rounded-2xl bg-orange text-base font-bold text-white shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    Placing order...
                  </>
                ) : (
                  <>
                    Place order, {subtotal > 0 ? formatTk(subtotal) : "start here"}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </>
                )}
              </Button>
              <p className="text-center text-xs leading-relaxed text-muted-warm">
                Pay at the counter when you pick up. After placing, we hand your order to
                the shop over WhatsApp so nothing gets lost.
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-warm">
            Prefer talking? Call{" "}
            <a
              href={`tel:${siteConfig.phoneE164}`}
              onClick={() => trackEvent("phone_click")}
              className="font-bold text-pink underline-offset-2 hover:underline"
            >
              {siteConfig.phoneDisplay}
            </a>{" "}
            to order by phone.
          </p>
        </aside>
      </div>
    </div>
  );
}

function CartRow({
  line,
  onInc,
  onDec,
  onRemove,
}: {
  line: CartLine;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <li className="flex items-center gap-2.5 rounded-xl border-2 border-ink/10 bg-cream p-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">{line.name}</p>
        <p className="text-xs font-medium text-muted-warm tabular-nums">
          {formatTk(line.price)} each
        </p>
      </div>
      <div className="flex items-center overflow-hidden rounded-full border-2 border-ink bg-white">
        <button
          type="button"
          onClick={() => onDec(line.id)}
          className="flex h-8 w-8 items-center justify-center text-ink transition-colors hover:bg-pink hover:text-white"
          aria-label={`Remove one ${line.name}`}
        >
          <Minus className="h-3.5 w-3.5" aria-hidden />
        </button>
        <span className="min-w-7 text-center text-sm font-bold tabular-nums">{line.qty}</span>
        <button
          type="button"
          onClick={() => onInc(line.id)}
          className="flex h-8 w-8 items-center justify-center text-ink transition-colors hover:bg-lime"
          aria-label={`Add one more ${line.name}`}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <p className="w-16 text-right text-sm font-bold tabular-nums">
        {formatTk(line.price * line.qty)}
      </p>
      <button
        type="button"
        onClick={() => onRemove(line.id)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-red-50 hover:text-red-600"
        aria-label={`Remove ${line.name} from order`}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </li>
  );
}
