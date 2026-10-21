"use client";

/** Sticky admin header bar: wordmark, view-site link, logout. */

import Image from "next/image";
import { ExternalLink, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminHeader({
  onLogout,
  loggingOut,
}: {
  onLogout: () => void;
  loggingOut: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink/10 bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-ink bg-white shadow-[2px_2px_0_0_var(--color-ink)]">
            <Image
              src="/images/logo-176.webp"
              alt="Demo logo"
              width={36}
              height={36}
              className="h-full w-full object-contain p-0.5"
            />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="font-display text-base font-bold tracking-tight">
              DEMO <span className="text-pink">Admin</span>
            </span>
            <span className="hidden text-[0.55rem] font-semibold uppercase tracking-[0.28em] text-muted-warm sm:block">
              Demo Store · control room
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            asChild
            variant="ghost"
            className="h-9 rounded-xl px-2.5 text-xs font-bold text-ink hover:bg-white sm:px-3 sm:text-sm"
          >
            <a href="/" target="_blank" rel="noopener noreferrer">
              View site
              <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            </a>
          </Button>
          <Button
            variant="outline"
            onClick={onLogout}
            disabled={loggingOut}
            className="h-9 rounded-xl border-2 border-ink bg-white px-2.5 text-xs font-bold text-ink hover:bg-pink hover:text-white sm:px-3 sm:text-sm"
          >
            {loggingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" aria-hidden />
            ) : (
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            )}
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
