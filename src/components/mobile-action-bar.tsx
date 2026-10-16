"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingBag, UtensilsCrossed, Phone } from "lucide-react";
import { siteConfig } from "@/content/site";
import { trackEvent } from "@/lib/track";

export function MobileActionBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-ink bg-cream md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-3">
        <Link
          href="/menu"
          onClick={() => trackEvent("menu_click")}
          className="flex min-h-[3.5rem] flex-col items-center justify-center gap-1 py-2 text-ink transition-colors active:bg-pink active:text-white"
        >
          <UtensilsCrossed className="h-5 w-5" aria-hidden />
          <span className="text-[0.65rem] font-bold uppercase tracking-wider">Menu</span>
        </Link>
        <Link
          href="/order"
          onClick={() => trackEvent("menu_click")}
          className="flex min-h-[3.5rem] flex-col items-center justify-center gap-1 border-x-2 border-ink/10 py-2 text-ink transition-colors active:bg-orange active:text-white"
        >
          <ShoppingBag className="h-5 w-5" aria-hidden />
          <span className="text-[0.65rem] font-bold uppercase tracking-wider">
            Order
          </span>
        </Link>
        <a
          href={`tel:${siteConfig.phoneE164}`}
          onClick={() => trackEvent("phone_click")}
          className="flex min-h-[3.5rem] flex-col items-center justify-center gap-1 py-2 text-ink transition-colors active:bg-pink active:text-white"
        >
          <Phone className="h-5 w-5" aria-hidden />
          <span className="text-[0.65rem] font-bold uppercase tracking-wider">Call</span>
        </a>
      </div>
    </div>
  );
}
