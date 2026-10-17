"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { menu as fallbackMenu } from "@/content/menu";
import type { MenuCategory } from "@/content/menu";
import { siteConfig } from "@/content/site";
import { trackEvent } from "@/lib/track";
import { ProductCard } from "@/components/order/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  /** Live menu from the admin panel */
  categories: MenuCategory[];
}

export function MenuSection({ categories }: Props) {
  const menu = categories.length > 0 ? categories : fallbackMenu;
  const [active, setActive] = React.useState(menu[0]?.id ?? "");
  const reduce = useReducedMotion();
  const category = menu.find((c) => c.id === active) ?? menu[0];

  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      className="scroll-mt-24 border-y-[3px] border-ink bg-white/60 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <p className="mb-3 inline-block rounded-full bg-orange-soft px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-orange">
            The menu
          </p>
          <h2 id="menu-heading" className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Something sweet, something you
          </h2>
          <p className="mt-4 text-base text-muted-warm sm:text-lg">
            Waffle pops, shakes and add-ons. Tap Add on anything you fancy, or browse
            the full menu on its own page.
          </p>
        </motion.div>

        {/* Category tabs */}
        <div
          role="tablist"
          aria-label="Menu categories"
          className="mb-10 flex gap-2.5 overflow-x-auto pb-2 nice-scrollbar sm:flex-wrap sm:justify-center sm:overflow-visible"
        >
          {menu.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={active === cat.id}
              onClick={() => setActive(cat.id)}
              className={cn(
                "min-h-11 shrink-0 rounded-full border-2 border-ink px-5 text-sm font-bold transition-all",
                active === cat.id
                  ? "bg-ink text-cream shadow-[3px_3px_0_0_var(--color-pink)]"
                  : "bg-white text-ink hover:bg-cream shadow-[2px_2px_0_0_rgba(32,23,25,0.12)]"
              )}
            >
              {cat.label}
              <span
                className={cn(
                  "ml-2 rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold",
                  active === cat.id ? "bg-cream/20 text-cream" : "bg-cream text-muted-warm"
                )}
              >
                {cat.items.length}
              </span>
            </button>
          ))}
        </div>

        {/* Items */}
        <AnimatePresence mode="wait">
          <motion.div
            key={category.id}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            role="tabpanel"
            aria-label={`${category.label} items`}
          >
            <p className="mb-7 text-center text-sm font-medium text-muted-warm">
              {category.blurb}
            </p>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {category.items.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="h-full"
                >
                  <ProductCard
                    item={item}
                    category={category.label}
                    className="h-full"
                    sizes="(max-width: 640px) 46vw, (max-width: 1024px) 46vw, 30vw"
                  />
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        {/* Links to full menu + order */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3.5">
          <Button
            asChild
            className="min-h-12 rounded-full bg-ink px-7 font-semibold text-cream shadow-[4px_4px_0_0_var(--color-pink)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Link href="/menu" onClick={() => trackEvent("menu_click")}>
              See the full menu
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            className="min-h-12 rounded-full bg-orange px-7 font-semibold text-white shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Link href="/order" onClick={() => trackEvent("menu_click")}>
              Order online
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>

        {/* Note */}
        <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-pink/50 bg-pink-soft/60 p-5 text-center sm:flex-row sm:text-left">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white">
            <Phone className="h-5 w-5 text-pink" aria-hidden />
          </span>
          <p className="flex-1 text-sm leading-relaxed text-ink/80">
            Menu items and prices may change. Call us to confirm today&apos;s
            options before you come through.
          </p>
          <a
            href={`tel:${siteConfig.phoneE164}`}
            onClick={() => trackEvent("phone_click")}
            className="shrink-0 font-display text-sm font-bold text-pink underline-offset-4 hover:underline"
          >
            {siteConfig.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}
