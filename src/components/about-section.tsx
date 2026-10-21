"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, Milk, MapPin, Instagram } from "lucide-react";
import { siteConfig } from "@/content/site";
import { trackEvent } from "@/lib/track";

const features = [
  {
    icon: Flame,
    title: "Pressed fresh to order",
    text: "Every waffle pop hits the iron when you order, never sitting under a lamp.",
    color: "bg-orange-soft text-orange",
  },
  {
    icon: Milk,
    title: "Shakes blended thick",
    text: "Oreo, KitKat, blueberry, Nutella, blended till the straw stands up.",
    color: "bg-cyan-soft text-cyan",
  },
  {
    icon: MapPin,
    title: "Grab-and-go takeaway",
    text: "Boxed and ready to wander with, right in the heart of Demo City.",
    color: "bg-lime-soft text-ink",
  },
];

export function AboutSection() {
  const reduce = useReducedMotion();

  return (
    <section id="story" aria-labelledby="story-heading" className="scroll-mt-24 overflow-hidden py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Photo collage */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <div className="relative overflow-hidden rounded-[1.8rem] border-[3px] border-ink shadow-[8px_8px_0_0_var(--color-ink)]">
              <Image
                src="/images/gallery/interior-counter.webp"
                alt="Demo cafe interior with ordering counter and vibrant decor"
                width={720}
                height={1280}
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <motion.div
              initial={reduce ? false : { opacity: 0, rotate: 10, scale: 0.85 }}
              whileInView={{ opacity: 1, rotate: 5, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="absolute -bottom-10 -right-3 w-36 overflow-hidden rounded-2xl border-[3px] border-ink bg-white p-2 shadow-[5px_5px_0_0_var(--color-ink)] sm:-right-8 sm:w-44"
            >
              <Image
                src="/images/gallery/mural-logo.webp"
                alt="Demo waffle mascot mural and logo"
                width={720}
                height={1280}
                sizes="176px"
                className="aspect-[4/5] w-full rounded-xl object-cover"
              />
            </motion.div>
            {/* sticker */}
            <div className="absolute -top-5 -left-3 rotate-[-8deg] rounded-full border-2 border-ink bg-purple px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[3px_3px_0_0_var(--color-ink)] sm:-left-6">
              Est. Demo Store
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-start gap-6"
          >
            <p className="inline-block rounded-full bg-purple-soft px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-purple">
              Our story
            </p>
            <h2 id="story-heading" className="text-3xl font-bold sm:text-4xl md:text-5xl">
              A little joy, served on a stick.
            </h2>
            <p className="text-base leading-relaxed text-muted-warm sm:text-lg">
              Demo started with a simple idea: bring delicious handcrafted waffle
              pops to everyone. Every waffle is pressed fresh, dipped while
              it&apos;s still warm, and handed over in a box you can wander with.
            </p>
            <p className="text-base leading-relaxed text-muted-warm sm:text-lg">
              Visit our demo store at 123 Demo Street, designed for sweet treats
              and memorable moments.
            </p>

            <ul className="w-full space-y-4">
              {features.map((f, i) => (
                <motion.li
                  key={f.title}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink ${f.color}`}
                  >
                    <f.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold">{f.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-warm">{f.text}</p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href="#gallery"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-white px-6 text-sm font-bold text-ink shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                See the gallery
              </a>
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("social_click")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-tr from-purple via-pink to-orange px-6 text-sm font-bold text-white shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                <Instagram className="h-4 w-4" aria-hidden />
                Follow @demo
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
