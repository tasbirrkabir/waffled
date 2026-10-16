"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star, ArrowUpRight, Facebook, Instagram, Quote } from "lucide-react";
import { siteConfig } from "@/content/site";
import { trackEvent } from "@/lib/track";

const reviews = [
  {
    quote: "Best waffles, also nuggets.",
    name: "Emani",
    source: "Google review",
    detail: "Food · Service · Atmosphere — all 5",
    accent: "bg-pink",
    rotate: "-rotate-1",
  },
  {
    quote: "Food: 5 · Service: 5 · Atmosphere: 5",
    name: "Rafsan Ahammed Rahat",
    source: "Google review",
    detail: "Rated across the board",
    accent: "bg-cyan",
    rotate: "rotate-1",
  },
  {
    quote: "Food: 5 · Service: 5",
    name: "Md. Shourov Ahmed",
    source: "Google review",
    detail: "Two fives, no notes",
    accent: "bg-orange",
    rotate: "-rotate-2",
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
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
        >
          <p className="mb-3 inline-block rounded-full border-2 border-lime/40 bg-lime/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-lime">
            Social proof
          </p>
          <h2 id="reviews-heading" className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Word around Sreemangal
          </h2>
          <p className="mt-4 text-base text-cream/70 sm:text-lg">
            Early visitors are saying nice things. Here&apos;s a taste — the rest
            lives on Google.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {reviews.map((review, i) => (
            <motion.figure
              key={review.name}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
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
                <p className="mt-0.5 text-xs text-cream/60">
                  {review.source} · {review.detail}
                </p>
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
            Read Google reviews
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
