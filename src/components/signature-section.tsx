"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { signaturePicks } from "@/content/menu";

const tagStyles: Record<string, string> = {
  "Must try": "bg-pink text-white",
  "New arrival": "bg-cyan text-ink",
  "Crowd favourite": "bg-orange text-white",
};

export function SignatureSection() {
  const reduce = useReducedMotion();

  return (
    <section id="signature" aria-labelledby="signature-heading" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
        >
          <p className="mb-3 inline-block rounded-full bg-pink-soft px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-pink">
            Signature picks
          </p>
          <h2 id="signature-heading" className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Meet your next favourite
          </h2>
          <p className="mt-4 text-base text-muted-warm sm:text-lg">
            A few menu favourites to get you started, all served on a stick.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:gap-6 md:grid-cols-3 md:gap-8">
          {signaturePicks.map((item, i) => (
            <motion.article
              key={item.id}
              initial={reduce ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className={`group relative ${
                i === 1 ? "md:translate-y-8" : ""
              }`}
            >
              <div className="relative overflow-hidden rounded-[1.6rem] border-[3px] border-ink bg-white shadow-[6px_6px_0_0_var(--color-ink)] transition-transform duration-300 group-hover:-rotate-1 group-hover:scale-[1.02]">
                <Image
                  src={item.image}
                  alt={item.alt}
                  width={720}
                  height={900}
                  sizes="(max-width: 768px) 90vw, 30vw"
                  className="aspect-[4/5] w-full object-cover"
                />
                <span
                  className={`absolute left-4 top-4 -rotate-3 rounded-full border-2 border-ink px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0_0_var(--color-ink)] ${
                    tagStyles[item.tag] ?? "bg-lime text-ink"
                  }`}
                >
                  {item.tag}
                </span>
              </div>
              <div className="mt-5 flex items-start justify-between gap-4 px-1">
                <div>
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-warm">
                    {item.description}
                  </p>
                </div>
                <p className="shrink-0 rounded-full border-2 border-ink bg-white px-3.5 py-1.5 font-display text-lg font-bold text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
                  ৳{item.price}
                </p>
              </div>
              <a
                href="#menu"
                className="mt-3 inline-flex items-center gap-1.5 px-1 text-sm font-bold text-pink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink"
              >
                Find it on the menu
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
