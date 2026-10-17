"use client";

/**
 * Order status badge + colour config shared by the dashboard and orders tab.
 * Brand palette only (no blue/indigo): orange, cyan, amber, lime, emerald, warm-grey.
 */

import { cn } from "@/lib/utils";
import type { OrderStatus } from "./types";

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

interface StatusMeta {
  label: string;
  /** soft pill for badges in tables */
  badge: string;
  /** solid chip for the breakdown list */
  chip: string;
  /** dot colour for charts/legends */
  dot: string;
}

export const statusMeta: Record<OrderStatus, StatusMeta> = {
  new: {
    label: "New",
    badge: "border-orange/40 bg-orange-soft text-orange",
    chip: "bg-orange text-white",
    dot: "#FF7B30",
  },
  confirmed: {
    label: "Confirmed",
    badge: "border-cyan/40 bg-cyan-soft text-cyan",
    chip: "bg-cyan text-ink",
    dot: "#42C7D9",
  },
  preparing: {
    label: "Preparing",
    badge: "border-amber-300 bg-amber-100 text-amber-800",
    chip: "bg-amber-400 text-ink",
    dot: "#fbbf24",
  },
  ready: {
    label: "Ready",
    badge: "border-lime/50 bg-lime-soft text-ink",
    chip: "bg-lime text-ink",
    dot: "#BCE84A",
  },
  completed: {
    label: "Completed",
    badge: "border-emerald-300 bg-emerald-100 text-emerald-700",
    chip: "bg-emerald-500 text-white",
    dot: "#10b981",
  },
  cancelled: {
    label: "Cancelled",
    badge: "border-border-warm bg-muted text-muted-warm",
    chip: "bg-muted-warm text-white",
    dot: "#725e63",
  },
};

export function asStatus(s: string): OrderStatus {
  return (ORDER_STATUSES as string[]).includes(s) ? (s as OrderStatus) : "new";
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const meta = statusMeta[asStatus(status)];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider",
        meta.badge,
        className
      )}
    >
      {meta.label}
    </span>
  );
}
