"use client";

import * as React from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { menu, type MenuTag } from "@/content/menu";
import { siteConfig } from "@/content/site";
import { trackEvent } from "@/lib/track";
import { cn } from "@/lib/utils";

const tagStyle: Record<MenuTag, string> = {
  popular: "bg-pink text-white",
  new: "bg-cyan text-ink",
  "must-try": "bg-lime text-ink",
};

export function MenuSection() {
  const [active, setActive] = React.useState(menu[0].id);
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
            Waffle pops, shakes and add-ons — here&apos;s what&apos;s on the board right now.
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
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="group flex flex-col rounded-2xl border-2 border-border-warm bg-surface p-5 transition-all hover:-translate-y-1 hover:border-ink hover:shadow-[4px_4px_0_0_var(--color-ink)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-bold leading-snug">
                      {item.name}
                    </h3>
                    <p className="shrink-0 font-display text-lg font-bold text-orange">
                      ৳{item.price}
                    </p>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-warm">
                    {item.description}
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider",
                            tagStyle[tag]
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        {/* Note */}
        <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-pink/50 bg-pink-soft/60 p-5 text-center sm:flex-row sm:text-left">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white">
            <Phone className="h-5 w-5 text-pink" aria-hidden />
          </span>
          <p className="flex-1 text-sm leading-relaxed text-ink/80">
            Menu items and prices may change — call us to confirm today&apos;s
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
