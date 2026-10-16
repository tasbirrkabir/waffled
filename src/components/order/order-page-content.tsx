"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Loader2,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { menu } from "@/content/menu";
import { siteConfig } from "@/content/site";
import { trackEvent } from "@/lib/track";
import { cartSubtotal, formatTk, useCart, type CartLine } from "@/lib/cart-store";
import { ProductCard } from "@/components/order/product-card";
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
  lines: CartLine[];
  name: string;
}

const phoneRegex = /^(?:\+?880|0)1[3-9]\d{8}$/;

function validatePhone(value: string): boolean {
  return phoneRegex.test(value.replace(/[\s-]/g, ""));
}

type Step = 1 | 2;

/* ------------------------------- Step header ------------------------------ */

function CheckoutSteps({ step, done = false }: { step: Step; done?: boolean }) {
  const steps = [
    { n: 1, label: "Your items" },
    { n: 2, label: "Checkout" },
    { n: 3, label: "Confirmed" },
  ];
  const current = done ? 3 : step;
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-medium" aria-label="Checkout progress">
      {steps.map((s, i) => {
        const isDone = current > s.n;
        const isCurrent = current === s.n;
        return (
          <li key={s.n} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 font-display text-xs font-bold",
                isDone
                  ? "border-lime bg-lime text-ink"
                  : isCurrent
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/25 bg-white text-muted-warm"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} aria-hidden /> : s.n}
            </span>
            <span className={cn(isCurrent ? "text-ink" : "text-muted-warm")}>{s.label}</span>
            {i < steps.length - 1 && (
              <span aria-hidden className="ml-1 text-ink/25">
                →
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------- Cart lines ------------------------------- */

function CartLineRow({
  line,
  onInc,
  onDec,
  onRemove,
  compact = false,
}: {
  line: CartLine;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
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
      <p className={cn("font-bold tabular-nums", compact ? "w-14 text-right text-sm" : "w-16 text-right text-sm")}>
        {formatTk(line.price * line.qty)}
      </p>
      <button
        type="button"
        onClick={() => onRemove(line.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-red-50 hover:text-red-600"
        aria-label={`Remove ${line.name} from order`}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </li>
  );
}

/* ------------------------------ Main component ---------------------------- */

export function OrderPageContent() {
  const lines = useCart((s) => s.lines);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const [step, setStep] = React.useState<Step>(1);
  const [activeCat, setActiveCat] = React.useState(menu[0].id);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [pickupTime, setPickupTime] = React.useState<string>(pickupOptions[0]);
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState<OrderSuccess | null>(null);
  const [touched, setTouched] = React.useState<{ name?: boolean; phone?: boolean }>({});

  const subtotal = cartSubtotal(lines);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const nameValid = name.trim().length >= 2;
  const phoneValid = validatePhone(phone);
  const canSubmit = lines.length > 0 && nameValid && phoneValid && !submitting;

  const category = menu.find((c) => c.id === activeCat) ?? menu[0];

  function goToStep(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
        lines,
        name: name.trim(),
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
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-24 sm:px-6 md:pt-28">
        <div className="mb-6">
          <CheckoutSteps step={2} done />
        </div>
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
            Thanks {success.name.split(" ")[0]}. Your order number is{" "}
            <span className="font-display font-bold text-pink">{success.orderNumber}</span>,
            total {formatTk(success.total)}.
          </p>

          {/* Item recap */}
          <ul className="mt-6 space-y-2 rounded-2xl border-2 border-dashed border-ink/25 bg-cream p-4 text-left">
            {success.lines.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-ink">
                  {l.qty} × {l.name}
                </span>
                <span className="font-bold tabular-nums text-ink/80">{formatTk(l.price * l.qty)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between border-t-2 border-dashed border-ink/20 pt-2 text-sm">
              <span className="font-bold text-ink">Total (pay at pickup)</span>
              <span className="font-display font-bold tabular-nums text-pink">
                {formatTk(success.total)}
              </span>
            </li>
          </ul>

          <div className="mt-5 rounded-2xl border-2 border-dashed border-ink/30 bg-cream p-4 text-left">
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
              setStep(1);
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

  /* ------------------------------- STEP 2: CHECKOUT ------------------------ */
  if (step === 2) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-32 pt-24 sm:px-6 md:pb-24 md:pt-28">
        {/* Compact header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="mb-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted-warm transition-colors hover:bg-white hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to items
            </button>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Checkout
            </h1>
          </div>
          <CheckoutSteps step={2} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
          {/* Details form */}
          <div className="space-y-6">
            <section
              aria-labelledby="details-heading"
              className="rounded-3xl border-2 border-ink/15 bg-white p-5 sm:p-6"
            >
              <h2 id="details-heading" className="flex items-center gap-2 font-display text-lg font-bold">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink font-display text-xs font-bold text-white">
                  1
                </span>
                Your details
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="order-name" className="text-sm font-semibold">
                    Name
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
                    className="mt-1.5 h-12 border-2 border-ink/25 bg-cream focus-visible:ring-pink"
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
                    className="mt-1.5 h-12 border-2 border-ink/25 bg-cream focus-visible:ring-pink"
                  />
                  {touched.phone && !phoneValid && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      Enter a valid BD number, e.g. 01723399638.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section
              aria-labelledby="pickup-heading"
              className="rounded-3xl border-2 border-ink/15 bg-white p-5 sm:p-6"
            >
              <h2 id="pickup-heading" className="flex items-center gap-2 font-display text-lg font-bold">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan font-display text-xs font-bold text-ink">
                  2
                </span>
                Pickup
              </h2>
              <div className="mt-4 grid gap-4">
                <div>
                  <Label htmlFor="order-pickup" className="text-sm font-semibold">
                    Pickup time
                  </Label>
                  <select
                    id="order-pickup"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="mt-1.5 h-12 w-full rounded-xl border-2 border-ink/25 bg-cream px-3 text-sm font-medium text-ink focus:border-pink focus:outline-none"
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
                    placeholder="Extra Nutella? Less sweet? Tell us here."
                    maxLength={400}
                    className="mt-1.5 min-h-20 border-2 border-ink/25 bg-cream focus-visible:ring-pink"
                  />
                </div>
              </div>
            </section>

            <section
              aria-label="How pickup works"
              className="grid gap-3 rounded-3xl border-2 border-dashed border-ink/25 bg-white/60 p-5 sm:grid-cols-2 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-lime-soft">
                  <Store className="h-5 w-5 text-ink" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold">Pickup only</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-warm">
                    {siteConfig.address.street}, {siteConfig.address.locality}{" "}
                    {siteConfig.address.postalCode}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-orange-soft">
                  <Wallet className="h-5 w-5 text-ink" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold">Pay at the counter</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-warm">
                    No advance payment. Cash or mobile wallet when you collect.
                  </p>
                </div>
              </div>
            </section>

            {/* Order summary (mobile / tablet) */}
            <section
              aria-labelledby="summary-heading-mobile"
              className="rounded-3xl border-[3px] border-ink bg-white p-5 shadow-[6px_6px_0_0_var(--color-ink)] lg:hidden"
            >
              <h2 id="summary-heading-mobile" className="flex items-center gap-2 font-display text-lg font-bold">
                <ShoppingBag className="h-5 w-5 text-pink" aria-hidden />
                Order summary
                {itemCount > 0 && (
                  <span className="rounded-full bg-pink px-2.5 py-0.5 text-xs font-bold text-white tabular-nums">
                    {itemCount}
                  </span>
                )}
              </h2>
              {lines.length === 0 ? (
                <div className="mt-4 rounded-2xl border-2 border-dashed border-ink/25 p-6 text-center">
                  <p className="text-sm font-medium text-muted-warm">
                    Your order is empty.{" "}
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="font-bold text-pink underline-offset-2 hover:underline"
                    >
                      Add some treats
                    </button>
                  </p>
                </div>
              ) : (
                <>
                  <ul className="mt-4 max-h-80 space-y-2.5 overflow-y-auto pr-1 nice-scrollbar">
                    {lines.map((line) => (
                      <CartLineRow
                        key={line.id}
                        line={line}
                        onInc={increment}
                        onDec={decrement}
                        onRemove={remove}
                        compact
                      />
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-ink/20 pt-3">
                    <span className="text-sm font-semibold text-muted-warm">Total</span>
                    <span className="font-display text-2xl font-bold tabular-nums">
                      {formatTk(subtotal)}
                    </span>
                  </div>
                  <Button
                    onClick={placeOrder}
                    disabled={submitting || lines.length === 0}
                    className="mt-4 h-14 w-full rounded-2xl bg-orange text-base font-bold text-white shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                        Placing order...
                      </>
                    ) : (
                      <>
                        Place order
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                      </>
                    )}
                  </Button>
                </>
              )}
            </section>
          </div>

          {/* Order summary (desktop) */}
          <aside aria-label="Order summary" className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border-[3px] border-ink bg-white p-5 shadow-[6px_6px_0_0_var(--color-ink)]">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <ShoppingBag className="h-5 w-5 text-pink" aria-hidden />
                Order summary
                {itemCount > 0 && (
                  <span className="rounded-full bg-pink px-2.5 py-0.5 text-xs font-bold text-white tabular-nums">
                    {itemCount}
                  </span>
                )}
              </h2>
              {lines.length === 0 ? (
                <div className="mt-4 rounded-2xl border-2 border-dashed border-ink/25 p-6 text-center">
                  <p className="text-sm font-medium text-muted-warm">
                    Your order is empty.{" "}
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="font-bold text-pink underline-offset-2 hover:underline"
                    >
                      Add some treats
                    </button>
                  </p>
                </div>
              ) : (
                <>
                  <ul className="mt-4 max-h-96 space-y-2.5 overflow-y-auto pr-1 nice-scrollbar">
                    {lines.map((line) => (
                      <CartLineRow
                        key={line.id}
                        line={line}
                        onInc={increment}
                        onDec={decrement}
                        onRemove={remove}
                      />
                    ))}
                  </ul>
                  <div className="mt-4 space-y-1.5 border-t-2 border-dashed border-ink/20 pt-3 text-sm">
                    <div className="flex items-center justify-between text-muted-warm">
                      <span>Items</span>
                      <span className="tabular-nums">{itemCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total (pay at pickup)</span>
                      <span className="font-display text-2xl font-bold tabular-nums">
                        {formatTk(subtotal)}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={placeOrder}
                    disabled={submitting || lines.length === 0}
                    className="mt-4 h-14 w-full rounded-2xl bg-orange text-base font-bold text-white shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                        Placing order...
                      </>
                    ) : (
                      <>
                        Place order
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                      </>
                    )}
                  </Button>
                  <p className="mt-3 text-center text-xs leading-relaxed text-muted-warm">
                    After placing, we hand your order to the shop over WhatsApp so
                    nothing gets lost.
                  </p>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  /* ------------------------------- STEP 1: BROWSE -------------------------- */
  return (
    <div className="mx-auto max-w-6xl px-4 pb-36 pt-24 sm:px-6 md:pb-28 md:pt-28 lg:pb-20">
      {/* Compact header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Build your order
          </h1>
          <p className="mt-1.5 text-sm text-muted-warm sm:text-base">
            Pick your treats, then checkout. Pay at pickup, ready in 15-25 min.
          </p>
        </div>
        <CheckoutSteps step={1} />
      </div>

      {/* Trust strip */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        {[
          { icon: Clock, label: "Ready in 15-25 min" },
          { icon: Wallet, label: "Pay at pickup" },
          { icon: MapPin, label: "Pickup from Radhanagar Road" },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/10 bg-white px-3.5 py-1.5 text-xs font-bold text-ink"
          >
            <Icon className="h-3.5 w-3.5 text-pink" aria-hidden />
            {label}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
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
                  "min-h-11 whitespace-nowrap rounded-full border-2 px-4 text-sm font-bold transition-all",
                  activeCat === cat.id
                    ? "border-ink bg-ink text-cream shadow-[2.5px_2.5px_0_0_rgba(32,23,25,0.25)]"
                    : "border-ink/20 bg-white text-ink hover:border-ink"
                )}
              >
                {cat.label}
                <span className="ml-2 rounded-full bg-ink/10 px-1.5 py-0.5 text-[0.65rem] tabular-nums">
                  {cat.items.length}
                </span>
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
              className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3"
              aria-live="polite"
            >
              {category.items.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3) }}
                >
                  <ProductCard
                    item={item}
                    category={category.label}
                    className="h-full"
                    sizes="(max-width: 640px) 46vw, (max-width: 1024px) 46vw, 30vw"
                    priority={i < 4}
                  />
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </section>

        {/* Cart (desktop) */}
        <aside aria-label="Your order" className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border-[3px] border-ink bg-white p-5 shadow-[6px_6px_0_0_var(--color-ink)]">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <ShoppingBag className="h-5 w-5 text-pink" aria-hidden />
              Your order
              {itemCount > 0 && (
                <span className="rounded-full bg-pink px-2.5 py-0.5 text-xs font-bold text-white tabular-nums">
                  {itemCount}
                </span>
              )}
            </h2>

            {lines.length === 0 ? (
              <div className="mt-4 rounded-2xl border-2 border-dashed border-ink/25 p-6 text-center">
                <p className="text-sm font-medium text-muted-warm">
                  Nothing here yet. Tap Add on anything that looks tasty.
                </p>
              </div>
            ) : (
              <>
                <ul className="mt-4 max-h-96 space-y-2.5 overflow-y-auto pr-1 nice-scrollbar">
                  {lines.map((line) => (
                    <CartLineRow
                      key={line.id}
                      line={line}
                      onInc={increment}
                      onDec={decrement}
                      onRemove={remove}
                    />
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-ink/20 pt-3">
                  <span className="text-sm font-semibold text-muted-warm">Subtotal</span>
                  <span className="font-display text-2xl font-bold tabular-nums">
                    {formatTk(subtotal)}
                  </span>
                </div>
              </>
            )}

            <Button
              onClick={() => {
                if (lines.length === 0) {
                  toast.error("Add at least one item to your order first.");
                  return;
                }
                goToStep(2);
              }}
              className="mt-4 h-13 min-h-12 w-full rounded-2xl bg-orange text-base font-bold text-white shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              Go to checkout
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
            <p className="mt-3 text-center text-xs leading-relaxed text-muted-warm">
              Prefer talking? Call{" "}
              <a
                href={`tel:${siteConfig.phoneE164}`}
                onClick={() => trackEvent("phone_click")}
                className="font-bold text-pink underline-offset-2 hover:underline"
              >
                {siteConfig.phoneDisplay}
              </a>
            </p>
          </div>
        </aside>
      </div>

      {/* Sticky cart bar (mobile + tablet, sits above the site action bar) */}
      <AnimatePresence>
        {lines.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-[calc(3.75rem_+_env(safe-area-inset-bottom))] z-40 px-4 md:bottom-[env(safe-area-inset-bottom)] lg:hidden"
          >
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-2xl border-[3px] border-ink bg-ink px-5 py-3.5 text-cream shadow-[4px_4px_0_0_rgba(32,23,25,0.3)] transition-transform active:scale-[0.98]"
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
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
