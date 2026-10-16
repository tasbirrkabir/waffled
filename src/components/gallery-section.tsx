"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
}

const images: GalleryImage[] = [
  {
    src: "/images/gmaps/waffle-pops.webp",
    alt: "Three chocolate-glazed waffle pops on sticks in purple boxes with marshmallows and drizzle",
    caption: "Waffle pops, fresh from our Google listing",
  },
  {
    src: "/images/gmaps/cherry-waffles.webp",
    alt: "Two chocolate waffles topped with cherries and sauce in open Waffled takeout boxes",
    caption: "Chocolate waffle with cherries, boxed up",
  },
  {
    src: "/images/gmaps/exterior-night.webp",
    alt: "Waffled Sreemangal shop exterior glowing at night",
    caption: "The shop at night, from Google Maps",
  },
  {
    src: "/images/gallery/mural-logo.webp",
    alt: "Colourful pop-art mural with the WAFFLED logo and waffle mascot on the shop wall",
    caption: "Our wall, WAFFLED love in full colour",
  },
  {
    src: "/images/gmaps/choco-waffle-box.webp",
    alt: "Chocolate waffle topped with whipped cream, chocolate chips and drizzle in a pink box",
    caption: "Chocolate waffle, boxed and ready",
  },
  {
    src: "/images/gallery/interior-counter.webp",
    alt: "Waffled shop interior with black counter, gold slat detailing and neon-bright murals",
    caption: "The counter, black, gold and lots of colour",
  },
  {
    src: "/images/gmaps/sign.webp",
    alt: "Close-up of the circular WAFFLED sign",
    caption: "The sign, from Google Maps",
  },
  {
    src: "/images/gallery/waffle-spread.webp",
    alt: "Assorted waffle pop boxes held up showing different flavours",
    caption: "The spread, pick your flavour",
  },
  {
    src: "/images/gmaps/exterior-wide.webp",
    alt: "Wide view of the colourful open-air Waffled shop with its sign",
    caption: "The shop on Radhanagar Road, from Google Maps",
  },
  {
    src: "/images/gmaps/exterior-busy.webp",
    alt: "Waffled shop busy at night with customers lined up under the glowing WAFFLE'D neon sign",
    caption: "A busy night on Radhanagar Road",
  },
  {
    src: "/images/gmaps/drink.webp",
    alt: "Frothy shake or coffee in a paper cup on the counter",
    caption: "Something sippable, from Google Maps",
  },
  {
    src: "/images/gallery/counter-order.webp",
    alt: "Customer ordering at the Waffled counter beneath the menu board",
    caption: "Order up at the counter",
  },
  {
    src: "/images/gallery/menu-card.webp",
    alt: "Printed Waffled menu card with waffle pop flavours and prices in taka",
    caption: "The menu card, flavours and prices",
  },
  {
    src: "/images/gallery/ordering-experience.webp",
    alt: "Inside Waffled Sreemangal with a customer at the ordering counter",
    caption: "Radhanagar Road, Sreemangal",
  },
];

export function GallerySection() {
  const [selected, setSelected] = React.useState<GalleryImage | null>(null);
  const reduce = useReducedMotion();

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="scroll-mt-24 border-y-[3px] border-ink bg-white/60 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
        >
          <p className="mb-3 inline-block rounded-full bg-cyan-soft px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-cyan">
            Gallery
          </p>
          <h2 id="gallery-heading" className="text-3xl font-bold sm:text-4xl md:text-5xl">
            A closer look
          </h2>
          <p className="mt-4 text-base text-muted-warm sm:text-lg">
            Real waffles, real shop. Photos straight from our Google Maps listing and
            Radhanagar Road.
          </p>
        </motion.div>

        <div className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4 [&>*]:mb-3 sm:[&>*]:mb-4">
          {images.map((img, i) => (
            <motion.button
              key={img.src}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: (i % 4) * 0.08 }}
              onClick={() => setSelected(img)}
              className="group relative block w-full overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-[3px_3px_0_0_var(--color-ink)] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink"
              aria-label={`Open photo: ${img.caption}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={720}
                height={1280}
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-3 pt-8 text-left opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-xs font-semibold text-cream">{img.caption}</span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent
          className="max-w-3xl overflow-hidden border-2 border-ink bg-cream p-3 shadow-[8px_8px_0_0_var(--color-ink)] sm:p-4"
          aria-describedby={selected ? "gallery-caption" : undefined}
        >
          <div className="relative overflow-hidden rounded-xl border-2 border-ink">
            {selected && (
              <Image
                src={selected.src}
                alt={selected.alt}
                width={720}
                height={1280}
                sizes="90vw"
                className="max-h-[70svh] w-full object-contain bg-ink"
              />
            )}
          </div>
          {selected && (
            <div className="flex items-start justify-between gap-4 px-1 pt-3">
              <div>
                <DialogTitle className="font-display text-base font-bold">
                  {selected.caption}
                </DialogTitle>
                <DialogDescription id="gallery-caption" className="mt-0.5 text-sm">
                  Waffled Sreemangal, Radhanagar Road
                </DialogDescription>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-ink transition-colors hover:bg-pink hover:text-white"
                aria-label="Close photo"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
