"use client";

/** Small formatting helpers shared by the admin components. */

import { format, formatDistanceToNow } from "date-fns";

/** "12 Jan 2026, 4:35 PM" — full stamp for expanded views. */
export function formatDateTime(iso: string): string {
  try {
    return format(new Date(iso), "d MMM yyyy, h:mm a");
  } catch {
    return iso;
  }
}

/** "12 Jan, 4:35 PM" — compact stamp for list rows. */
export function formatShortDateTime(iso: string): string {
  try {
    return format(new Date(iso), "d MMM, h:mm a");
  } catch {
    return iso;
  }
}

/** "3 minutes ago" — for dashboard recents. */
export function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

/** tel: href with anything but digits/plus stripped. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function paymentLabel(method: string): string {
  if (method === "bkash") return "bKash";
  if (method === "nagad") return "Nagad";
  return "Cash";
}

export function fulfillmentLabel(f: string): string {
  return f === "delivery" ? "Delivery" : "Pickup";
}

/** Compact axis-friendly taka, e.g. ৳1.2k / ৳950. */
export function compactTk(v: number): string {
  if (v >= 1000) {
    const k = v / 1000;
    return `৳${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `৳${v}`;
}
