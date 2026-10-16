/**
 * Client-side CTA tracking helper.
 * Safe to import in client components — fire-and-forget, never throws,
 * never blocks navigation.
 */

export type TrackEventType =
  | "menu_click"
  | "directions_click"
  | "phone_click"
  | "social_click";

export function trackEvent(type: TrackEventType): void {
  try {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    }).catch(() => {});
  } catch {}
}
