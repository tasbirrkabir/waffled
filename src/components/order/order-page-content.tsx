"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  Clock,
  Loader2,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Smartphone,
  Store,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { menu as fallbackMenu } from "@/content/menu";
import type { MenuCategory } from "@/content/menu";
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
  fulfillment: "pickup" | "delivery";
  address?: string;
  paymentMethod: "cash" | "bkash" | "nagad";
  trxId?: string;
}

type Fulfillment = "pickup" | "delivery";
type PaymentMethod = "cash" | "bkash" | "nagad";

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
    <ol
      className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-xs font-medium sm:gap-x-2 sm:text-sm"
      aria-label="Checkout progress"
    >
      {steps.map((s, i) => {
        const isDone = current > s.n;
        const isCurrent = current === s.n;
        return (
          <li key={s.n} className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border-2 font-display text-[0.65rem] font-bold sm:h-7 sm:w-7 sm:text-xs",
                isDone
                  ? "border-lime bg-lime text-ink"
                  : isCurrent
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/25 bg-white text-muted-warm"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {isDone ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={3.5} aria-hidden /> : s.n}
            </span>
            <span className={cn(isCurrent ? "text-ink" : "text-muted-warm")}>{s.label}</span>
            {i < steps.length - 1 && (
              <span aria-hidden className="ml-0.5 text-ink/25">
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

export function OrderPageContent({ categories }: { categories: MenuCategory[] }) {
  const menu = categories.length > 0 ? categories : fallbackMenu;
  const lines = useCart((s) => s.lines);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const [step, setStep] = React.useState<Step>(1);
  const [activeCat, setActiveCat] = React.useState(menu[0]?.id ?? "");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [fulfillment, setFulfillment] = React.useState<Fulfillment>("pickup");
  const [address, setAddress] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("cash");
  const [trxId, setTrxId] = React.useState("");
  const [pickupTime, setPickupTime] = React.useState<string>(pickupOptions[0]);
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState<OrderSuccess | null>(null);
  const [touched, setTouched] = React.useState<{
    name?: boolean;
    phone?: boolean;
    address?: boolean;
    trxId?: boolean;
  }>({});

  const subtotal = cartSubtotal(lines);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const nameValid = name.trim().length >= 2;
  const phoneValid = validatePhone(phone);
  const addressValid = address.trim().length >= 10;
  const needsAddress = fulfillment === "delivery";
  const normalizedTrx = trxId.trim().toUpperCase();
  const trxIdValid = /^[A-Z0-9]{6,15}$/.test(normalizedTrx);
  const needsTrx = paymentMethod !== "cash";
  const canSubmit =
    lines.length > 0 &&
    nameValid &&
    phoneValid &&
    (!needsAddress || addressValid) &&
    (!needsTrx || trxIdValid) &&
    !submitting;

  const category = menu.find((c) => c.id === activeCat) ?? menu[0];
  function goToStep(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function placeOrder() {
    setTouched({ name: true, phone: true, address: true, trxId: true });
    if (!canSubmit) {
      if (lines.length === 0) toast.error("Add at least one item to your order first.");
      else if (!nameValid) toast.error("Please tell us your name.");
      else if (!phoneValid) toast.error("Please enter a valid Bangladeshi phone number.");
      else if (needsAddress && !addressValid)
        toast.error("Please enter your full delivery address (house, road, area).");
      else if (needsTrx && !trxIdValid)
        toast.error("Please enter the TrxID from your bKash/Nagad transaction.");
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
          fulfillment,
          address: needsAddress ? address.trim() : undefined,
          pickupTime,
          paymentMethod,
          trxId: needsTrx ? normalizedTrx : undefined,
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
        fulfillment,
        address: needsAddress ? address.trim() : undefined,
        paymentMethod,
        trxId: needsTrx ? normalizedTrx : undefined,
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
            {success.fulfillment === "delivery" && success.address && (
              <li className="flex items-start justify-between gap-3 border-t-2 border-dashed border-ink/20 pt-2 text-sm">
                <span className="shrink-0 font-semibold text-ink">Deliver to</span>
                <span className="max-w-[70%] text-right text-ink/80">{success.address}</span>
              </li>
            )}
            <li className="flex items-start justify-between gap-3 border-t-2 border-dashed border-ink/20 pt-2 text-sm">
              <span className="shrink-0 font-semibold text-ink">Payment</span>
              <span className="max-w-[70%] text-right text-ink/80">
                {success.paymentMethod === "cash"
                  ? success.fulfillment === "delivery"
                    ? "Cash on delivery"
                    : "Cash at counter"
                  : success.paymentMethod === "bkash"
                    ? `bKash · TrxID ${success.trxId} (we verify it before starting your order)`
                    : `Nagad · TrxID ${success.trxId} (we verify it before starting your order)`}
              </span>
            </li>
            <li className="flex items-center justify-between border-t-2 border-dashed border-ink/20 pt-2 text-sm">
              <span className="font-bold text-ink">
                Total{" "}
                {success.paymentMethod === "cash"
                  ? `(pay on ${success.fulfillment === "delivery" ? "delivery" : "pickup"})`
                  : `(paid via ${success.paymentMethod === "bkash" ? "bKash" : "Nagad"})`}
              </span>
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
              setFulfillment("pickup");
              setAddress("");
              setPaymentMethod("cash");
              setTrxId("");
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
        {/* Compact header — stacks into one left-aligned column on mobile */}
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
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
              aria-labelledby="fulfillment-heading"
              className="rounded-3xl border-2 border-ink/15 bg-white p-5 sm:p-6"
            >
              <h2 id="fulfillment-heading" className="flex items-center gap-2 font-display text-lg font-bold">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan font-display text-xs font-bold text-ink">
                  2
                </span>
                Pickup or delivery
              </h2>

              {/* Fulfillment toggle */}
              <div className="mt-4 grid grid-cols-2 gap-3" role="group" aria-label="How do you want your order">
                {(
                  [
                    {
                      value: "pickup" as const,
                      icon: Store,
                      title: "Pickup",
                      sub: "Collect from the shop",
                    },
                    {
                      value: "delivery" as const,
                      icon: Bike,
                      title: "Delivery",
                      sub: "We bring it to you",
                    },
                  ] as const
                ).map(({ value, icon: Icon, title, sub }) => {
                  const active = fulfillment === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFulfillment(value)}
                      className={cn(
                        "flex min-h-11 flex-col items-start gap-1 rounded-2xl border-2 p-3.5 text-left transition-all",
                        active
                          ? "border-ink bg-ink text-cream shadow-[3px_3px_0_0_rgba(32,23,25,0.25)]"
                          : "border-ink/20 bg-cream text-ink hover:border-ink"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", active ? "text-lime" : "text-pink")} aria-hidden />
                      <span className="text-sm font-bold leading-tight">{title}</span>
                      <span className={cn("text-xs leading-tight", active ? "text-cream/70" : "text-muted-warm")}>
                        {sub}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Delivery address */}
              {fulfillment === "delivery" && (
                <div className="mt-4">
                  <Label htmlFor="order-address" className="text-sm font-semibold">
                    Delivery address <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="order-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, address: true }))}
                    placeholder="House / flat, road, area, landmark. e.g. 12/3 College Road, opposite the bank, Sreemangal"
                    maxLength={200}
                    required
                    aria-invalid={touched.address && !addressValid}
                    className="mt-1.5 min-h-20 border-2 border-ink/25 bg-cream focus-visible:ring-pink"
                  />
                  {touched.address && !addressValid ? (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      Please enter your full address (house, road, area) so the rider can find you.
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-warm">
                      Our rider calls this number on the way. Delivery area and any charge are confirmed on call.
                    </p>
                  )}
                </div>
              )}

              {/* Time */}
              <div className="mt-4">
                <Label htmlFor="order-time" className="text-sm font-semibold">
                  {fulfillment === "delivery" ? "Preferred time" : "Pickup time"}
                </Label>
                <select
                  id="order-time"
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
                {fulfillment === "delivery" && (
                  <p className="mt-1 text-xs text-muted-warm">
                    Preferred time for delivery. We call to confirm the exact window.
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="mt-4">
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
            </section>

            {/* Payment */}
            <section
              aria-labelledby="payment-heading"
              className="rounded-3xl border-2 border-ink/15 bg-white p-5 sm:p-6"
            >
              <h2 id="payment-heading" className="flex items-center gap-2 font-display text-lg font-bold">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple text-white font-display text-xs font-bold">
                  3
                </span>
                Payment
              </h2>

              <div className="mt-4 grid gap-3" role="group" aria-label="Payment method">
                {(
                  [
                    {
                      value: "cash" as const,
                      icon: Wallet,
                      title: "Cash",
                      sub:
                        fulfillment === "delivery"
                          ? "Pay the rider on delivery"
                          : "Pay at the counter",
                    },
                    {
                      value: "bkash" as const,
                      icon: Smartphone,
                      title: "bKash",
                      sub: "Send money, then enter TrxID",
                    },
                    {
                      value: "nagad" as const,
                      icon: Smartphone,
                      title: "Nagad",
                      sub: "Send money, then enter TrxID",
                    },
                  ] as const
                ).map(({ value, icon: Icon, title, sub }) => {
                  const active = paymentMethod === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setPaymentMethod(value)}
                      className={cn(
                        "flex min-h-11 items-center gap-3.5 rounded-2xl border-2 p-3.5 text-left transition-all",
                        active
                          ? "border-ink bg-ink text-cream shadow-[3px_3px_0_0_rgba(32,23,25,0.25)]"
                          : "border-ink/20 bg-cream text-ink hover:border-ink"
                      )}
                    >
                      <Icon className={cn("h-5 w-5 shrink-0", active ? "text-lime" : "text-pink")} aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-sm font-bold leading-tight">{title}</span>
                        <span className={cn("block text-xs leading-tight", active ? "text-cream/70" : "text-muted-warm")}>
                          {sub}
                        </span>
                      </span>
                      {active && <Check className="ml-auto h-5 w-5 shrink-0 text-lime" strokeWidth={3} aria-hidden />}
                    </button>
                  );
                })}
              </div>

              {/* Mobile money instructions + TrxID */}
              {paymentMethod !== "cash" && (
                <div className="mt-4 rounded-2xl border-2 border-dashed border-ink/25 bg-cream p-4">
                  <p className="text-sm leading-relaxed text-ink">
                    Send{" "}
                    <strong className="font-display text-pink tabular-nums">{formatTk(subtotal)}</strong> to{" "}
                    <strong className="font-display">
                      {paymentMethod === "bkash"
                        ? siteConfig.payments.bkashNumber
                        : siteConfig.payments.nagadNumber}
                    </strong>{" "}
                    ({paymentMethod === "bkash" ? "bKash" : "Nagad"} app, Send Money), then enter the
                    TrxID below. We verify it before making your order.
                  </p>
                  <div className="mt-3">
                    <Label htmlFor="order-trxid" className="text-sm font-semibold">
                      Transaction ID (TrxID) <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="order-trxid"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, trxId: true }))}
                      placeholder="e.g. 8A5KD2XRQ9"
                      maxLength={15}
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      required
                      aria-invalid={touched.trxId && !trxIdValid}
                      className="mt-1.5 h-12 border-2 border-ink/25 bg-white font-display tracking-wider uppercase focus-visible:ring-pink"
                    />
                    {touched.trxId && !trxIdValid ? (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        Enter the TrxID (6-15 letters/numbers) from your {paymentMethod === "bkash" ? "bKash" : "Nagad"} transaction history.
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-muted-warm">
                        Find it in your {paymentMethod === "bkash" ? "bKash" : "Nagad"} app under recent transactions.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Live recap of the two choices */}
            <section
              aria-label="Your choices"
              className="grid gap-3 rounded-3xl border-2 border-dashed border-ink/25 bg-white/60 p-5 sm:grid-cols-2 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-lime-soft">
                  {fulfillment === "pickup" ? (
                    <Store className="h-5 w-5 text-ink" aria-hidden />
                  ) : (
                    <Bike className="h-5 w-5 text-ink" aria-hidden />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold">
                    {fulfillment === "pickup" ? "Pickup from the shop" : "Delivery to you"}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-warm">
                    {fulfillment === "pickup"
                      ? `${siteConfig.address.street}, ${siteConfig.address.locality} ${siteConfig.address.postalCode}`
                      : address.trim()
                        ? address.trim()
                        : "Add your address above"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-orange-soft">
                  {paymentMethod === "cash" ? (
                    <Wallet className="h-5 w-5 text-ink" aria-hidden />
                  ) : (
                    <Smartphone className="h-5 w-5 text-ink" aria-hidden />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold">
                    {paymentMethod === "cash"
                      ? fulfillment === "delivery"
                        ? "Cash on delivery"
                        : "Pay at the counter"
                      : paymentMethod === "bkash"
                        ? "bKash · TrxID sent for verification"
                        : "Nagad · TrxID sent for verification"}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-warm">
                    {paymentMethod === "cash"
                      ? "No advance payment needed."
                      : "We verify your TrxID before starting the order."}
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
                      <span className="font-semibold">Total</span>
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
      {/* Compact header — stacks into one left-aligned column on mobile */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Build your order
          </h1>
          <p className="mt-1.5 text-sm text-muted-warm sm:text-base">
            Pick your treats, then checkout. Pickup or delivery, ready in 15-25 min.
          </p>
        </div>
        <CheckoutSteps step={1} />
      </div>

      {/* Trust strip */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        {[ 
          { icon: Clock, label: "Ready in 15-25 min" },
          { icon: Wallet, label: "Cash, bKash or Nagad" },
          { icon: MapPin, label: "Pickup or delivery" },
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
