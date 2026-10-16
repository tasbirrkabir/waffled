"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/content/menu";
import { siteConfig } from "@/content/site";

export function FaqSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-24 border-t-[3px] border-ink bg-white/60 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <p className="mb-3 inline-block rounded-full bg-purple-soft px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-purple">
              FAQ
            </p>
            <h2 id="faq-heading" className="text-3xl font-bold sm:text-4xl md:text-5xl">
              Good to know
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-warm sm:text-lg">
              The questions we hear most at the counter, answered before you ask.
            </p>
            <p className="mt-6 text-sm text-muted-warm">
              Still curious?{" "}
              <a
                href={`tel:${siteConfig.phoneE164}`}
                className="font-bold text-pink underline-offset-4 hover:underline"
              >
                Give us a ring
              </a>{" "}
              , we pick up.
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="space-y-3.5">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={faq.q}
                  value={`faq-${i}`}
                  className="rounded-2xl border-2 border-border-warm bg-surface px-5 transition-colors data-[state=open]:border-ink data-[state=open]:shadow-[4px_4px_0_0_var(--color-ink)]"
                >
                  <AccordionTrigger className="gap-4 py-4 text-left font-display text-base font-bold hover:no-underline sm:text-lg [&>svg]:shrink-0">
                    <span className="flex items-center gap-3">
                      <span className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink-soft font-display text-xs font-bold text-pink sm:flex">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {faq.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-warm sm:pl-10 sm:text-base">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
