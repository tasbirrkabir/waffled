import { createHash, timingSafeEqual } from "crypto";

/**
 * Very small cookie-based admin auth.
 *
 * The session token is a deterministic SHA-256 of the admin password, so any
 * password change invalidates all existing sessions. Set ADMIN_PASSWORD in
 * .env to override the default.
 */
export const ADMIN_COOKIE = "waffled_admin";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "waffled-admin-2026";
}

export function adminToken(): string {
  return createHash("sha256")
    .update(`waffled::${adminPassword()}::v1`)
    .digest("hex");
}

/** True when the request carries a valid admin session cookie. */
export function isAdminRequest(request: Request): boolean {
  const cookies = request.headers.get("cookie") ?? "";
  const prefix = `${ADMIN_COOKIE}=`;
  const match = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(prefix));
  if (!match) return false;
  const value = decodeURIComponent(match.slice(prefix.length));
  const expected = adminToken();
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Standard 401 response for unauthenticated admin API calls. */
export function unauthorized() {
  return Response.json(
    { success: false, error: "Admin login required." },
    { status: 401 }
  );
}
