import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { ADMIN_COOKIE, ADMIN_SESSION_MAX_AGE, adminPassword, adminToken } from "@/lib/admin-auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  password: z.string().min(1, "Please enter the admin password.").max(200),
});

export async function POST(request: Request) {
  // Rate limit: 5 attempts per minute per IP
  const ip = getClientIp(request);
  if (!checkRateLimit(`admin-login:${ip}`, { limit: 5, windowMs: 60_000 })) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please wait a moment." },
      { status: 429 }
    );
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Please enter the password." },
      { status: 400 }
    );
  }

  if (parsed.data.password !== adminPassword()) {
    return NextResponse.json(
      { success: false, error: "Wrong password. Please try again." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return res;
}
