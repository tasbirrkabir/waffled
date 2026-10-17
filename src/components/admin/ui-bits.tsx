"use client";

/**
 * Small shared UI pieces for the admin tabs: toolbar, empty/error states,
 * list skeletons. Styled utilitarian-cream (white cards, ink borders) with
 * the Waffled brand accents.
 */

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Header row used at the top of each tab: title + description + actions. */
export function TabToolbar({
  title,
  sub,
  count,
  onRefresh,
  refreshing,
  children,
}: {
  title: string;
  sub?: string;
  count?: number | string;
  onRefresh?: () => void;
  refreshing?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-xl font-bold leading-tight sm:text-2xl">
          {title}
          {count !== undefined && (
            <span className="ml-2 align-middle text-sm font-semibold text-muted-warm">
              ({count})
            </span>
          )}
        </h2>
        {sub && <p className="mt-0.5 text-sm text-muted-warm">{sub}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {children}
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label={`Refresh ${title.toLowerCase()}`}
            className="h-9 w-9 rounded-xl border-2 border-ink/15 bg-surface"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}

/** Friendly dashed empty state. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  hint,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 bg-cream/60 px-6 py-10 text-center",
        className
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink/10 bg-surface text-muted-warm">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <p className="font-display text-base font-bold">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted-warm">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Load failure with a retry button. */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border-2 border-[#e5484d]/40 bg-[#e5484d]/5 px-6 py-10 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#e5484d]/30 bg-surface text-[#e5484d]">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </span>
      <div>
        <p className="font-display text-base font-bold text-[#e5484d]">
          Couldn&apos;t load this section
        </p>
        <p className="mt-1 max-w-sm text-sm text-muted-warm">{message}</p>
      </div>
      <Button
        variant="outline"
        onClick={onRetry}
        className="rounded-xl border-2 border-ink/15 bg-surface font-semibold"
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
        Try again
      </Button>
    </div>
  );
}

/** Skeleton block for card grids / lists. */
export function SkeletonCards({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6",
        className
      )}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-2xl border-2 border-ink/10 bg-surface p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
      ))}
    </div>
  );
}
