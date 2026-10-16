import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * POST /api/subscribe
 * Body: { email: string }
 * Adds an email to the "new flavour alerts" subscriber list.
 */

const EMAIL_ERROR = "Please enter a valid email address.";

// Trim + lowercase, cap length, then validate the email format.
const subscribeSchema = z.object({
  email: z
    .string(EMAIL_ERROR)
    .trim()
    .toLowerCase()
    .max(254, EMAIL_ERROR)
    .pipe(z.email(EMAIL_ERROR)),
});

export async function POST(request: Request) {
  try {
    // Rate limit: max 5 subscribe attempts per minute per IP.
    const ip = getClientIp(request);
    if (!checkRateLimit(`subscribe:${ip}`, { limit: 5, windowMs: 60_000 })) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }

    const body: unknown = await request.json().catch(() => null);
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: EMAIL_ERROR },
        { status: 400 },
      );
    }

    await db.subscriber.create({ data: { email: parsed.data.email } });

    return NextResponse.json({
      success: true,
      message: "You're on the list — we'll ping you when new flavours drop.",
    });
  } catch (error) {
    // Duplicate email — the subscriber is already signed up, so treat it
    // as a friendly success rather than an error.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({
        success: true,
        message: "You're already on the list!",
      });
    }

    console.error("[api/subscribe] failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
