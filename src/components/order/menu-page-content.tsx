"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { menu as fallbackMenu } from "@/content/menu";
import type { MenuCategory } from "@/content/menu";
import { siteConfig } from "@/content/site";
import { trackEvent } from "@/lib/track";
import { ProductCard } from "@/components/order/product-card";
import { FloatingCartPill } from "@/components/order/floating-cart-pill";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  /** Live menu from the admin panel */
  categories: MenuCategory[];
}

export function MenuPageContent({ categories }: Props) {
  const menu = categories.length > 0 ? categories : fallbackMenu;
  const [active, setActive] = React.useState(menu[0]?.id ?? "");
  const sectionRefs = React.useRef<Record<string, HTMLElement | null>>({});

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-category");
            if (id) setActive(id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-24 sm:px-6 md:pb-24 md:pt-28">
      {/* Heading */}
      <div className="flex flex-col items-start gap-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
            <MapPin className="h-3.5 w-3.5 text-pink" aria-hidden />
            Synced with our Google Maps menu
          </span>
          <a
            href={siteConfig.reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/10 bg-white px-3.5 py-1.5 text-xs font-bold text-ink transition-colors hover:border-ink/40"
          >
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
            {siteConfig.rating.value} on Google, {siteConfig.rating.count} reviews
          </a>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          The <span className="text-pink">menu</span>, front to back.
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-warm sm:text-lg">
          Waffle pops on a stick, shakes and add-ons. Basic Flavours Waffle comes
          straight from the menu card on our Google Maps listing, updated by the shop.
        </p>
      </div>

      {/* Sticky category chips */}
      <nav
        aria-label="Menu categories"
        className="sticky top-16 z-30 -mx-4 mt-8 border-y-2 border-ink/10 bg-cream px-4 py-3 sm:-mx-6 sm:px-6 md:top-[4.5rem]"
      >
        <ul className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {menu.map((cat) => (
            <li key={cat.id}>
              <a
                href={`#${cat.id}`}
                onClick={() => setActive(cat.id)}
                className={cn(
                  "inline-flex min-h-11 whitespace-nowrap rounded-full border-2 px-4 py-2 text-sm font-bold transition-all",
                  active === cat.id
                    ? "border-ink bg-ink text-cream shadow-[2.5px_2.5px_0_0_rgba(32,23,25,0.25)]"
                    : "border-ink/20 bg-white text-ink hover:border-ink"
                )}
              >
                {cat.label}
                <span
                  className={cn(
                    "ml-2 rounded-full px-1.5 text-[0.65rem]",
                    active === cat.id ? "bg-pink text-white" : "bg-ink/10 text-ink/70"
                  )}
                >
                  {cat.items.length}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Categories */}
      <div className="space-y-14 pt-10">
        {menu.map((cat, ci) => (
          <section
            key={cat.id}
            id={cat.id}
            data-category={cat.id}
            ref={(el) => {
              sectionRefs.current[cat.id] = el;
            }}
            aria-labelledby={`${cat.id}-heading`}
            className="scroll-mt-36 md:scroll-mt-44"
          >
            <div className="flex flex-wrap items-end justify-between gap-3 border-b-[3px] border-dashed border-ink/20 pb-4">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-pink">
                  0{ci + 1} / {menu.length}
                </p>
                <h2 id={`${cat.id}-heading`} className="font-display text-2xl font-bold sm:text-3xl">
                  {cat.label}
                </h2>
                <p className="mt-1 text-sm text-muted-warm">{cat.blurb}</p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-warm">
                {cat.items.length} items
              </p>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {cat.items.map((item, i) => (
                <li key={item.id} className="h-full">
                  <ProductCard
                    item={item}
                    category={cat.label}
                    className="h-full"
                    sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 23vw"
                    priority={ci === 0 && i < 4}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Note + CTA */}
      <div className="mt-14 rounded-3xl border-[3px] border-ink bg-white p-6 shadow-[6px_6px_0_0_var(--color-ink)] sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl">Hungry already?</h2>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-warm">
              Build your order online and send it to us on WhatsApp. We box it fresh and
              have it ready for pickup. Menu items and prices may change, so call us to
              confirm anything specific.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
            <Button
              asChild
              className="min-h-12 rounded-full bg-orange px-7 font-semibold text-white shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <Link href="/order" onClick={() => trackEvent("menu_click")}>
                Order Online
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-12 rounded-full border-2 border-ink bg-white px-7 font-semibold text-ink"
            >
              <a href={`tel:${siteConfig.phoneE164}`} onClick={() => trackEvent("phone_click")}>
                Call {siteConfig.phoneDisplay}
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Floating checkout pill (appears when items are in the cart) */}
      <FloatingCartPill />
    </div>
  );
}
