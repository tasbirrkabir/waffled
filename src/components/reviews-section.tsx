"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star, ArrowUpRight, Facebook, Instagram, Quote } from "lucide-react";
import { siteConfig } from "@/content/site";
import { trackEvent } from "@/lib/track";

const shortReviews = [
  {
    quote: "Best waffles, also nuggets.",
    name: "Emani",
    detail: "Google review",
    accent: "bg-pink",
    rotate: "-rotate-1",
  },
  {
    quote: "Food 5, Service 5, Atmosphere 5.",
    name: "Rafsan Ahammed Rahat",
    detail: "Google review, rated across the board",
    accent: "bg-cyan",
    rotate: "rotate-1",
  },
];

export function ReviewsSection() {
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="reviews-heading" className="relative overflow-hidden bg-ink py-20 text-cream md:py-28">
      {/* decorative blobs on dark */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-purple/25 blur-3xl" />
        <div className="absolute -right-24 bottom-16 h-72 w-72 rounded-full bg-pink/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-10 max-w-2xl text-center md:mb-14"
        >
          <p className="mb-3 inline-block rounded-full border-2 border-lime/40 bg-lime/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-lime">
            Straight from Google Maps
          </p>
          <h2 id="reviews-heading" className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Word around Sreemangal
          </h2>

          {/* Google rating summary */}
          <a
            href={siteConfig.reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("social_click")}
            className="group mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-3xl border-2 border-cream/15 bg-cream/[0.06] px-6 py-4 backdrop-blur-sm transition-colors hover:border-cream/40"
            aria-label={`Waffled Sreemangal is rated ${siteConfig.rating.value} out of 5 from ${siteConfig.rating.count} Google reviews. Read them on Google Maps.`}
          >
            <span className="font-display text-5xl font-bold leading-none text-cream">
              {siteConfig.rating.value}
            </span>
            <span className="flex flex-col items-start gap-1">
              <span className="flex gap-0.5" aria-hidden>
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} className="h-5 w-5 fill-orange text-orange" />
                ))}
              </span>
              <span className="text-sm font-medium text-cream/70">
                {siteConfig.rating.count} reviews on Google
              </span>
            </span>
            <ArrowUpRight
              className="h-5 w-5 text-cream/50 transition-colors group-hover:text-cream"
              aria-hidden
            />
          </a>
        </motion.div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {/* Featured full review */}
          <motion.figure
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl border-2 border-lime/30 bg-lime/[0.07] p-6 backdrop-blur-sm transition-transform hover:-translate-y-1.5 md:col-span-1 md:row-span-1"
          >
            <Quote
              className="absolute -top-3.5 left-6 h-8 w-8 rounded-full border-2 border-ink p-1.5 text-ink bg-lime"
              aria-hidden
            />
            <div className="flex gap-1 pt-2" aria-label="Rated 5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-4 w-4 fill-orange text-orange" aria-hidden />
              ))}
            </div>
            <blockquote className="mt-4 text-sm leading-relaxed text-cream/90">
              “Visited this place while on holiday, and was pleasantly surprised. The
              staff there are really friendly and happy to accommodate as needed. My 5
              year old twins enjoyed their Nutella Waffles and my nieces enjoyed the
              KitKat Waffles. Prices are reasonable too. The Oreo shake is lovely too.”
            </blockquote>
            <figcaption className="mt-5 border-t border-cream/15 pt-4">
              <p className="text-sm font-bold">Tawfiq Rahman</p>
              <p className="mt-0.5 text-xs text-cream/60">
                Local Guide on Google, Food 5 / Service 5 / Atmosphere 4
              </p>
            </figcaption>
          </motion.figure>

          {shortReviews.map((review, i) => (
            <motion.figure
              key={review.name}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i + 1) * 0.12 }}
              className={`relative rounded-3xl border-2 border-cream/15 bg-cream/[0.06] p-6 backdrop-blur-sm transition-transform hover:-translate-y-1.5 ${review.rotate}`}
            >
              <Quote
                className={`absolute -top-3.5 left-6 h-8 w-8 rounded-full border-2 border-ink p-1.5 text-ink ${review.accent}`}
                aria-hidden
              />
              <div className="flex gap-1 pt-2" aria-label="Rated 5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-orange text-orange" aria-hidden />
                ))}
              </div>
              <blockquote className="mt-4 font-display text-lg font-semibold leading-snug">
                “{review.quote}”
              </blockquote>
              <figcaption className="mt-5 border-t border-cream/15 pt-4">
                <p className="text-sm font-bold">{review.name}</p>
                <p className="mt-0.5 text-xs text-cream/60">{review.detail}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3.5"
        >
          <a
            href={siteConfig.reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("social_click")}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange px-7 text-sm font-bold text-white shadow-[4px_4px_0_0_rgba(255,247,236,0.35)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            Read all Google reviews
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
          <a
            href={siteConfig.socials.facebook}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("social_click")}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-cream/25 px-6 text-sm font-bold text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
          >
            <Facebook className="h-4 w-4" aria-hidden />
            Facebook
          </a>
          <a
            href={siteConfig.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("social_click")}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-cream/25 px-6 text-sm font-bold text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink"
          >
            <Instagram className="h-4 w-4" aria-hidden />
            Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
