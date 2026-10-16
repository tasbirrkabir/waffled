"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Phone, MapPin, X } from "lucide-react";
import { siteConfig, isOpenNow } from "@/content/site";
import { trackEvent } from "@/lib/track";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order Online" },
  { href: "/#story", label: "Our Story" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#visit", label: "Visit Us" },
];

function MobileNavButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label="Open navigation menu"
      aria-expanded={open}
      aria-controls="mobile-nav-panel"
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-ink text-cream shadow-[2px_2px_0_0_rgba(32,23,25,0.25)]"
    >
      <Menu className="h-5 w-5" aria-hidden />
    </button>
  );
}

/**
 * Overlay renders as a SIBLING of <header>, never inside it.
 * The header gets `backdrop-blur-md` when scrolled, and any ancestor with
 * backdrop-filter becomes the containing block for its fixed descendants:
 * a fixed drawer inside the header would collapse into the header's 64px box
 * and stop appearing once the page is scrolled. Keeping it outside fixes that.
 */
function MobileNavDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[55] bg-ink/50 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Panel */}
      <div
        id="mobile-nav-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={cn(
          "fixed inset-y-0 right-0 z-[60] flex w-[85vw] max-w-sm transform flex-col border-l-[3px] border-ink bg-cream transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b-2 border-ink/10 p-5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border-2 border-ink bg-white">
              <Image
                src="/images/logo-176.webp"
                alt=""
                fill
                sizes="40px"
                className="object-contain p-0.5"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold">WAFFLED</span>
              <span className="text-[0.55rem] font-semibold uppercase tracking-[0.28em] text-muted-warm">
                Sreemangal
              </span>
            </span>
          </div>
          <button
            ref={closeRef}
            aria-label="Close navigation menu"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-white text-ink transition-colors hover:bg-pink hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex flex-col gap-1 overflow-y-auto p-5">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-xl font-semibold text-ink transition-colors hover:bg-white"
            >
              {link.label}
              <span className="text-xs font-bold text-pink" aria-hidden>
                0{i + 1}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-2.5 border-t-2 border-ink/10 p-5">
          <Button
            asChild
            className="h-12 w-full rounded-2xl bg-orange text-base font-semibold text-white shadow-[3px_3px_0_0_var(--color-ink)]"
          >
            <Link
              href="/order"
              onClick={() => {
                trackEvent("menu_click");
                onClose();
              }}
            >
              Order Online
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 w-full rounded-2xl border-2 border-ink bg-white text-base font-semibold text-ink"
          >
            <a
              href={siteConfig.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("directions_click")}
            >
              <MapPin className="h-5 w-5" aria-hidden />
              Get Directions
            </a>
          </Button>
          <p className="pt-1 text-center text-xs text-muted-warm">
            {siteConfig.address.street}, {siteConfig.address.locality}{" "}
            {siteConfig.address.postalCode}
          </p>
        </div>
      </div>
    </>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [navOpen, setNavOpen] = React.useState(false);
  const [openStatus, setOpenStatus] = React.useState<{
    open: boolean;
    label: string;
  } | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setOpenStatus(isOpenNow());
  }, []);

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-cream/90 shadow-[0_1px_0_0_var(--color-border-warm)] backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-cream"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:h-[4.5rem]">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="Waffled Sreemangal, back to home"
        >
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border-2 border-ink bg-white shadow-[2px_2px_0_0_var(--color-ink)] md:h-11 md:w-11">
            <Image
              src="/images/logo-176.webp"
              alt="Waffled logo, a bold W with a colourful splash pattern"
              fill
              sizes="44px"
              className="object-contain p-0.5"
              priority
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight md:text-xl">
              WAFFLED
            </span>
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-muted-warm">
              Sreemangal
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2.5 lg:flex">
          {openStatus && (
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
                openStatus.open
                  ? "border-lime bg-lime-soft text-ink"
                  : "border-border-warm bg-white text-muted-warm"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  openStatus.open ? "bg-emerald-500" : "bg-muted-warm/50"
                )}
                aria-hidden
              />
              {openStatus.label}
            </span>
          )}
          <a
            href={`tel:${siteConfig.phoneE164}`}
            onClick={() => trackEvent("phone_click")}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-ink transition-colors hover:text-pink"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {siteConfig.phoneDisplay}
          </a>
          <Button
            asChild
            className="min-h-11 rounded-full bg-orange px-5 font-semibold text-white shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            <Link href="/order" onClick={() => trackEvent("menu_click")}>
              Order Online
            </Link>
          </Button>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={`tel:${siteConfig.phoneE164}`}
            onClick={() => trackEvent("phone_click")}
            aria-label={`Call ${siteConfig.phoneDisplay}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-white text-ink shadow-[2px_2px_0_0_var(--color-ink)]"
          >
            <Phone className="h-5 w-5" aria-hidden />
          </a>
          <MobileNavButton open={navOpen} onClick={() => setNavOpen(true)} />
        </div>
      </div>
    </header>
    {/* Drawer overlay lives OUTSIDE <header>: the scrolled header has
        backdrop-blur, which would otherwise trap this fixed panel. */}
    <MobileNavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
