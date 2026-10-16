"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Phone, MapPin, Mail, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/content/site";
import { trackEvent } from "@/lib/track";
import { Input } from "@/components/ui/input";

const quickLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order online" },
  { href: "/#signature", label: "Signature picks" },
  { href: "/#story", label: "Our story" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#visit", label: "Visit us" },
  { href: "/#faq", label: "FAQ" },
];

function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message ?? "You're on the list!");
        setEmail("");
      } else {
        toast.error(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network hiccup, please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2.5 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address for new flavour alerts
      </label>
      <Input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="min-h-12 flex-1 rounded-full border-2 border-cream/25 bg-cream/10 px-5 text-sm text-cream placeholder:text-cream/40 focus-visible:ring-pink focus-visible:border-pink"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pink px-6 text-sm font-bold text-white shadow-[3px_3px_0_0_rgba(255,247,236,0.3)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Send className="h-4 w-4" aria-hidden />
        )}
        Notify me
      </button>
    </form>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink pb-24 text-cream md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1.2fr] lg:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border-2 border-cream/80 bg-cream">
                <Image
                  src="/images/logo-176.webp"
                  alt="Waffled logo"
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              </span>
              <div className="leading-none">
                <p className="font-display text-xl font-bold">WAFFLED</p>
                <p className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-cream/50">
                  Sreemangal
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">
              {siteConfig.tagline}. Find us on Radhanagar Road, Sreemangal.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={siteConfig.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("social_click")}
                aria-label="Waffled on Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-cream/20 text-cream transition-colors hover:border-pink hover:bg-pink"
              >
                <Facebook className="h-5 w-5" aria-hidden />
              </a>
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("social_click")}
                aria-label="Waffled on Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-cream/20 text-cream transition-colors hover:border-pink hover:bg-pink"
              >
                <Instagram className="h-5 w-5" aria-hidden />
              </a>
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Footer">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-cream/50">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/75 transition-colors hover:text-pink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Visit */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-cream/50">
              Visit
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-cream/75">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden />
                <span>
                  {siteConfig.address.street}, {siteConfig.address.locality}{" "}
                  {siteConfig.address.postalCode}, {siteConfig.address.region}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden />
                <a
                  href={`tel:${siteConfig.phoneE164}`}
                  onClick={() => trackEvent("phone_click")}
                  className="transition-colors hover:text-pink"
                >
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="break-all transition-colors hover:text-pink"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="text-xs text-cream/50">
                Open daily 12:00 PM to 11:00 PM, Mon till 11:30 PM
              </li>
              <li className="text-xs text-cream/50">
                Google plus code: {siteConfig.plusCode}
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-cream/50">
              New flavour alerts
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-cream/75">
              Oreo Crunch and Biscoff Bliss were just the start. Drop your email
              and be first to know when something new hits the iron.
            </p>
            <NewsletterForm />
            <p className="mt-3 text-xs text-cream/40">
              No spam, just waffles. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-cream/15 pt-6 text-xs text-cream/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. All rights
            reserved.
          </p>
          <p className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-sm bg-lime"
            />
            Pressed fresh in Sreemangal, Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
