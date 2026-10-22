"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  Phone,
  MapPin,
  X,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Camera,
  HelpCircle,
  UtensilsCrossed,
} from "lucide-react";
import { siteConfig, isOpenNow } from "@/content/site";
import { trackEvent } from "@/lib/track";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const menuCategories = [
  { href: "/menu#classic", label: "Classic Waffles", count: "10", emoji: "🧇" },
  { href: "/menu#premium", label: "Premium Waffles", count: "5", emoji: "✨" },
  { href: "/menu#shakes", label: "Thick Shakes", count: "5", emoji: "🥤" },
  { href: "/menu#drinks", label: "Drinks & Add-ons", count: "7", emoji: "☕" },
];

const discoverLinks = [
  { href: "/#story", label: "Our Story", icon: Sparkles },
  { href: "/#gallery", label: "Gallery", icon: Camera },
  { href: "/#visit", label: "Visit Us", icon: MapPin },
  { href: "/#faq", label: "FAQs", icon: HelpCircle },
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
      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-ink text-cream shadow-[2px_2px_0_0_rgba(32,23,25,0.25)] transition-transform active:scale-95"
    >
      <Menu className="h-5 w-5" aria-hidden />
    </button>
  );
}

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
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border-2 border-ink bg-white shadow-[2px_2px_0_0_var(--color-ink)]">
              <Image
                src="/images/logo-176.webp"
                alt=""
                fill
                sizes="40px"
                className="object-contain p-0.5"
              />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              DEMO <span className="text-pink">WAFFLES</span>
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

        <nav aria-label="Mobile" className="flex flex-col gap-4 overflow-y-auto p-5">
          {/* Menu Categories */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-warm">
              Menu Categories
            </p>
            <div className="space-y-1">
              {menuCategories.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-base font-semibold text-ink transition-colors hover:bg-white"
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </span>
                  <span className="rounded-full bg-cream-soft px-2 py-0.5 text-xs font-bold text-pink">
                    {cat.count}
                  </span>
                </Link>
              ))}
              <Link
                href="/menu"
                onClick={onClose}
                className="flex items-center justify-between rounded-xl bg-orange/10 px-3.5 py-2.5 text-sm font-bold text-orange hover:bg-orange hover:text-white"
              >
                <span>Full Menu</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Discover Section */}
          <div className="border-t border-ink/10 pt-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-warm">
              Discover
            </p>
            <div className="space-y-1">
              {discoverLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-base font-medium text-ink transition-colors hover:bg-white"
                  >
                    <Icon className="h-4 w-4 text-pink" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
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
            ? "bg-cream shadow-[0_1px_0_0_var(--color-border-warm)]"
            : "bg-transparent"
        )}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-cream"
        >
          Skip to content
        </a>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 md:h-[4.5rem]">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            aria-label="Demo Waffles, back to home"
          >
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border-2 border-ink bg-white shadow-[2px_2px_0_0_var(--color-ink)] md:h-11 md:w-11">
              <Image
                src="/images/logo-176.webp"
                alt="Demo Waffles logo"
                fill
                sizes="44px"
                className="object-contain p-0.5"
                priority
              />
            </span>
            <span className="flex items-baseline gap-1 font-display text-lg font-bold tracking-tight text-ink md:text-xl whitespace-nowrap">
              <span>DEMO</span>
              <span className="text-pink">WAFFLES</span>
            </span>
          </Link>

          {/* Desktop / Tablet Nav (Dropdown Type) */}
          <nav aria-label="Primary" className="hidden items-center gap-1.5 md:flex">
            {/* Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold text-ink/90 transition-colors hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink whitespace-nowrap"
                >
                  <UtensilsCrossed className="h-4 w-4 text-orange" />
                  <span>Menu</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-warm transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="w-56 rounded-2xl border-2 border-ink bg-cream p-1.5 shadow-[4px_4px_0_0_var(--color-ink)]"
              >
                <DropdownMenuLabel className="px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-muted-warm">
                  Categories
                </DropdownMenuLabel>
                {menuCategories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.href}
                    asChild
                    className="rounded-xl px-2.5 py-2 text-sm font-medium hover:bg-white focus:bg-white cursor-pointer"
                  >
                    <Link href={cat.href} className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </span>
                      <span className="text-xs font-bold text-pink">{cat.count}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="my-1 bg-ink/10" />
                <DropdownMenuItem
                  asChild
                  className="rounded-xl bg-orange/10 px-2.5 py-2 text-sm font-semibold text-orange hover:bg-orange hover:text-white focus:bg-orange focus:text-white cursor-pointer"
                >
                  <Link href="/menu" className="flex items-center justify-between w-full">
                    <span>View Full Menu</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Discover Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold text-ink/90 transition-colors hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink whitespace-nowrap"
                >
                  <Sparkles className="h-4 w-4 text-pink" />
                  <span>Discover</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-warm transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="w-48 rounded-2xl border-2 border-ink bg-cream p-1.5 shadow-[4px_4px_0_0_var(--color-ink)]"
              >
                {discoverLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <DropdownMenuItem
                      key={link.href}
                      asChild
                      className="rounded-xl px-2.5 py-2 text-sm font-medium hover:bg-white focus:bg-white cursor-pointer"
                    >
                      <Link href={link.href} className="flex items-center gap-2 w-full">
                        <Icon className="h-4 w-4 text-pink" />
                        <span>{link.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Direct Order Online Link */}
            <Link
              href="/order"
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink/80 transition-colors hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink whitespace-nowrap"
            >
              Order Online
            </Link>
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2.5 md:flex">
            {openStatus && (
              <span
                className={cn(
                  "hidden xl:flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
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
              className="hidden xl:flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-ink transition-colors hover:text-pink whitespace-nowrap"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {siteConfig.phoneDisplay}
            </a>
            <Button
              asChild
              className="min-h-11 rounded-full bg-orange px-5 font-semibold text-white shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none whitespace-nowrap shrink-0"
            >
              <Link href="/order" onClick={() => trackEvent("menu_click")}>
                Order Online
              </Link>
            </Button>
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
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
      {/* Drawer overlay */}
      <MobileNavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
