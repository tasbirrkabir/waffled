"use client";

import Image from "next/image";
import type { MenuItem, MenuTag } from "@/content/menu";
import { AddToCartButton } from "@/components/order/add-to-cart-button";
import { cn } from "@/lib/utils";

const tagStyle: Record<MenuTag, string> = {
  popular: "bg-pink text-white",
  new: "bg-orange text-white",
  "must-try": "bg-cyan text-ink",
};

const tagLabel: Record<MenuTag, string> = {
  popular: "Popular",
  new: "New",
  "must-try": "Must try",
};

interface Props {
  item: MenuItem;
  category: string;
  className?: string;
  /** Show the short description under the name (default true) */
  showDescription?: boolean;
  sizes?: string;
  priority?: boolean;
}

export function ProductCard({
  item,
  category,
  className,
  showDescription = true,
  sizes = "(max-width: 640px) 46vw, (max-width: 1024px) 32vw, 24vw",
  priority = false,
}: Props) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border-2 border-ink/15 bg-surface transition-all hover:-translate-y-0.5 hover:border-ink hover:shadow-[4px_4px_0_0_var(--color-ink)]",
        className
      )}
    >
      <div className="relative overflow-hidden border-b-2 border-ink/10 bg-cream">
        <Image
          src={item.image}
          alt={item.imageAlt}
          width={800}
          height={800}
          sizes={sizes}
          priority={priority}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        {item.tags && item.tags.length > 0 && (
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider shadow-sm",
                  tagStyle[tag]
                )}
              >
                {tagLabel[tag]}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-2.5">
          <h3 className="font-display text-base font-bold leading-tight sm:text-lg">
            {item.name}
          </h3>
          <p className="shrink-0 font-display text-base font-bold text-orange tabular-nums sm:text-lg">
            ৳{item.price}
          </p>
        </div>
        {showDescription && (
          <p className="mt-1 line-clamp-2 flex-1 text-[0.8rem] leading-relaxed text-muted-warm sm:text-sm">
            {item.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-warm/70">
            {category}
          </span>
          <AddToCartButton item={item} category={category} size="sm" className="shrink-0" />
        </div>
      </div>
    </article>
  );
}
