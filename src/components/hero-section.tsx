"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Star } from "lucide-react";
import { siteConfig } from "@/content/site";
import { trackEvent } from "@/lib/track";
import { Button } from "@/components/ui/button";

const marqueeItems = [
  "WAFFLE POPS ON A STICK",
  "NUTELLA LOVE",
  "THICK SHAKES",
  "NEW: OREO CRUNCH",
  "RADHANAGAR ROAD, SREEMANGAL",
  "PRESSED FRESH",
];

interface Props {
  /** Hero image managed from the admin panel (Content tab) */
  heroImage: { src: string; alt: string };
}

export function HeroSection({ heroImage }: Props) {
  const reduce = useReducedMotion();

  return (
    <section id="top" aria-labelledby="hero-heading" className="relative overflow-hidden">
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-16 h-96 w-96 rounded-full bg-pink/15 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-cyan/15 blur-3xl" />
        <div className="absolute bottom-24 left-1/3 h-72 w-72 rounded-full bg-orange/10 blur-3xl" />
        {/* sprinkle dots */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.35]" aria-hidden>
          <defs>
            <pattern id="sprinkles" width="140" height="140" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="30" r="3" fill="#F24C8B" opacity="0.35" />
              <rect x="70" y="12" width="9" height="3.5" rx="1.75" fill="#FF7B30" opacity="0.4" transform="rotate(24 74 14)" />
              <circle cx="120" cy="66" r="2.6" fill="#42C7D9" opacity="0.4" />
              <rect x="34" y="96" width="9" height="3.5" rx="1.75" fill="#BCE84A" opacity="0.5" transform="rotate(-30 38 98)" />
              <circle cx="92" cy="122" r="2.4" fill="#7B4FF3" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sprinkles)" />
        </svg>
      </div>

      <div className="relative mx-auto grid min-h-[92svh] max-w-6xl items-center gap-10 px-4 pb-16 pt-28 sm:px-6 md:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-24">
        {/* Copy */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col items-start gap-6"
        >
          <h1
            id="hero-heading"
            className="font-display text-[2.6rem] font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.2rem]"
          >
            Your next{" "}
            <span className="marker-underline text-pink">
              waffle&nbsp;moment
              <svg viewBox="0 0 220 14" fill="none" aria-hidden preserveAspectRatio="none">
                <path
                  d="M3 10.5C40 4 90 3 128 6.5c30 2.8 60 2.5 89-2"
                  stroke="#FF7B30"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity="0.55"
                />
              </svg>
            </span>{" "}
            starts here.
          </h1>

          <p className="max-w-md text-base leading-relaxed text-muted-warm sm:text-lg">
            Waffle pops on a stick, thick shakes and little moments worth sharing, from
            our counter on Radhanagar Road to your hands.
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            <Button
              asChild
              className="min-h-12 rounded-full bg-orange px-7 text-base font-semibold text-white shadow-[4px_4px_0_0_var(--color-ink)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <Link href="/order" onClick={() => trackEvent("menu_click")}>
                Order Online
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-12 rounded-full border-2 border-ink bg-white px-7 text-base font-semibold text-ink shadow-[4px_4px_0_0_rgba(32,23,25,0.15)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <Link href="/menu" onClick={() => trackEvent("menu_click")}>
                Explore the Menu
              </Link>
            </Button>
          </div>

          {/* Google rating */}
          <a
            href={siteConfig.reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-2xl border-2 border-ink/10 bg-white/70 px-4 py-2.5 transition-colors hover:border-ink/30"
            aria-label={`Waffled Sreemangal is rated ${siteConfig.rating.value} out of 5 on Google Maps from ${siteConfig.rating.count} reviews. Open our Google Maps listing.`}
          >
            <span className="flex items-center gap-0.5" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" strokeWidth={1.5} />
              ))}
            </span>
            <span className="text-sm font-bold text-ink">
              {siteConfig.rating.value}
              <span className="font-medium text-muted-warm"> on Google</span>
            </span>
            <span className="rounded-full bg-lime px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink">
              {siteConfig.rating.count} reviews
            </span>
          </a>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm font-medium text-ink/75">
            {["Takeaway friendly", "Open daily 12 PM to 11 PM", "Waffles from ৳159"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-pink" strokeWidth={3} aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 32, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 0.65, delay: 0.12, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="relative overflow-hidden rounded-[2rem] border-[3px] border-ink bg-white shadow-[8px_8px_0_0_var(--color-ink)]">
            <Image
              src={heroImage.src}
              alt={heroImage.alt}
              width={900}
              height={1125}
              priority
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="aspect-[4/5] w-full object-cover"
            />
            {/* price sticker */}
            <div className="absolute bottom-4 left-4 -rotate-3 rounded-2xl border-2 border-ink bg-lime px-4 py-2 shadow-[3px_3px_0_0_var(--color-ink)]">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-ink/70">
                Waffle pops from
              </p>
              <p className="font-display text-2xl font-bold leading-none text-ink">৳159</p>
            </div>
          </div>

          {/* Rotating badge */}
          <div
            className="absolute -right-3 -top-5 flex h-24 w-24 items-center justify-center rounded-full border-2 border-ink bg-pink text-cream shadow-[3px_3px_0_0_var(--color-ink)] sm:-right-8 sm:-top-6 sm:h-28 sm:w-28"
            aria-hidden
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
              <defs>
                <path id="badge-circle" d="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" />
              </defs>
              <text className="fill-cream font-display text-[10.5px] font-bold uppercase tracking-[0.24em]">
                <textPath href="#badge-circle">waffle love ✦ waffle love ✦</textPath>
              </text>
            </svg>
            <Star className="h-6 w-6 fill-cream sm:h-7 sm:w-7" aria-hidden />
          </div>

          {/* small polaroid card (desktop only: overlaps the hero image on small screens) */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute -bottom-8 -left-4 hidden w-28 rotate-6 overflow-hidden rounded-xl border-2 border-ink bg-white p-1.5 shadow-[4px_4px_0_0_var(--color-ink)] lg:block xl:-left-10 xl:w-36"
            aria-hidden
          >
            <Image
              src="/images/gmaps/sign.webp"
              alt=""
              width={560}
              height={560}
              sizes="144px"
              className="aspect-square w-full rounded-lg object-cover"
            />
            <p className="py-1 text-center font-display text-[0.6rem] font-bold uppercase tracking-widest text-ink">
              The shop
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="relative border-y-[3px] border-ink bg-ink py-3.5" aria-hidden>
        <div className="flex w-max animate-marquee gap-0">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {marqueeItems.map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="flex items-center gap-6 pr-6 font-display text-sm font-bold uppercase tracking-[0.22em] text-cream"
                >
                  {item}
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                    <path
                      d="M1 1h4v4H1zM9 9h4v4H9zM9 1h4v4H9zM1 9h4v4H1z"
                      fill="var(--color-lime)"
                    />
                  </svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
