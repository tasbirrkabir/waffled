"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Navigation, Check } from "lucide-react";
import { siteConfig, isOpenNow } from "@/content/site";
import { trackEvent } from "@/lib/track";
import { cn } from "@/lib/utils";

export function VisitSection() {
  const reduce = useReducedMotion();
  const [status, setStatus] = React.useState<{ open: boolean; label: string } | null>(null);
  const [todayIdx, setTodayIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    setStatus(isOpenNow());
    setTodayIdx(new Date().getDay());
  }, []);

  return (
    <section id="visit" aria-labelledby="visit-heading" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
        >
          <p className="mb-3 inline-block rounded-full bg-lime-soft px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-ink">
            Visit us
          </p>
          <h2 id="visit-heading" className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Come find us
          </h2>
          <p className="mt-4 text-base text-muted-warm sm:text-lg">
            Planning a visit? Here&apos;s everything you need in one place.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-8">
          {/* Info card */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            className="flex flex-col gap-6 rounded-[1.8rem] border-[3px] border-ink bg-surface p-6 shadow-[6px_6px_0_0_var(--color-ink)] sm:p-8"
          >
            {/* Address */}
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-pink-soft text-pink">
                <MapPin className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-base font-bold">Address</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-warm">
                  {siteConfig.address.street}, {siteConfig.address.locality}{" "}
                  {siteConfig.address.postalCode}, {siteConfig.address.region}
                </p>
                <p className="mt-1.5 text-xs italic text-muted-warm/80">
                  {siteConfig.address.landmark}
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-cyan-soft text-cyan">
                <Clock className="h-5 w-5" aria-hidden />
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-display text-base font-bold">Opening hours</h3>
                  {status && (
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider",
                        status.open
                          ? "border-emerald-600/30 bg-emerald-50 text-emerald-700"
                          : "border-border-warm bg-cream text-muted-warm"
                      )}
                    >
                      {status.label}
                    </span>
                  )}
                </div>
                <table className="mt-2.5 w-full text-sm">
                  <caption className="sr-only">Weekly opening hours</caption>
                  <tbody>
                    {siteConfig.hours.days.map((d, i) => {
                      const isToday = todayIdx === i;
                      return (
                        <tr
                          key={d.day}
                          className={cn(
                            "border-b border-border-warm/60 last:border-0",
                            isToday && "font-bold text-ink"
                          )}
                        >
                          <td className="py-1.5 pl-1 pr-2">
                            <span className="flex items-center gap-2">
                              {d.day}
                              {isToday && (
                                <span className="rounded-full bg-pink px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white">
                                  Today
                                </span>
                              )}
                            </span>
                          </td>
                          <td
                            className={cn(
                              "py-1.5 text-right tabular-nums",
                              isToday ? "text-ink" : "text-muted-warm"
                            )}
                          >
                            {d.label}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="mt-2 text-xs italic text-muted-warm/80">
                  {siteConfig.hours.note}
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-orange-soft text-orange">
                <Phone className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-base font-bold">Contact</h3>
                <a
                  href={`tel:${siteConfig.phoneE164}`}
                  onClick={() => trackEvent("phone_click")}
                  className="mt-1 block text-sm font-semibold text-ink underline-offset-4 hover:text-pink hover:underline"
                >
                  {siteConfig.phoneDisplay}
                </a>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-warm hover:text-pink"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                  {siteConfig.email}
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row">
              <a
                href={`tel:${siteConfig.phoneE164}`}
                onClick={() => trackEvent("phone_click")}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-orange px-6 text-sm font-bold text-white shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                <Phone className="h-4 w-4" aria-hidden />
                Call the Shop
              </a>
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("directions_click")}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-ink bg-ink px-6 text-sm font-bold text-cream shadow-[3px_3px_0_0_rgba(32,23,25,0.25)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              >
                <Navigation className="h-4 w-4" aria-hidden />
                Get Directions
              </a>
            </div>
          </motion.div>

          {/* Map card */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative overflow-hidden rounded-[1.8rem] border-[3px] border-ink bg-surface shadow-[6px_6px_0_0_var(--color-ink)]"
          >
            <iframe
              title="Map showing the location of Demo Waffles"
              src={siteConfig.mapsEmbedUrl}
              className="h-[320px] w-full sm:h-[420px] lg:h-full lg:min-h-[480px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-cream/95 px-4 py-3 backdrop-blur-sm sm:inset-x-5 sm:bottom-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime text-ink">
                  <Check className="h-5 w-5" strokeWidth={3} aria-hidden />
                </span>
                <p className="text-xs font-semibold leading-tight text-ink sm:text-sm">
                  {siteConfig.address.landmark}
                </p>
              </div>
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("directions_click")}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-2 border-ink bg-white px-4 text-xs font-bold text-ink transition-colors hover:bg-pink hover:text-white sm:text-sm"
              >
                <MapPin className="h-4 w-4" aria-hidden />
                Open in Google Maps
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
