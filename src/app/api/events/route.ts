import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/events
 * Body: { type: "menu_click" | "directions_click" | "phone_click" | "social_click" }
 * Records an anonymous CTA click event (no PII). Called fire-and-forget
 * from the client via `trackEvent()` in `src/lib/track.ts`.
 */

const EVENT_TYPES = [
  "menu_click",
  "directions_click",
  "phone_click",
  "social_click",
] as const;

const eventSchema = z.object({
  type: z.enum(EVENT_TYPES),
});

export async function POST(request: Request) {
  try {
    // Rate limit: max 60 tracked events per minute per IP.
    const ip = getClientIp(request);
    if (!checkRateLimit(`events:${ip}`, { limit: 60, windowMs: 60_000 })) {
      return NextResponse.json({ success: false }, { status: 429 });
    }

    const body: unknown = await request.json().catch(() => null);
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    await db.ctaEvent.create({ data: { type: parsed.data.type } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/events] failed:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
