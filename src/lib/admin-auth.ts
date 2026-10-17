import { createHash, timingSafeEqual } from "crypto";

/**
 * Very small admin auth: session cookie OR bearer-style header.
 *
 * The session token is a deterministic SHA-256 of the admin password, so any
 * password change invalidates all existing sessions. Set ADMIN_PASSWORD in
 * .env to override the default.
 *
 * The token is accepted from BOTH the waffled_admin cookie (normal tabs) and
 * the x-admin-token header — browsers block SameSite cookies inside
 * cross-site iframes (e.g. the chat preview panel), so the client also keeps
 * the token in localStorage after login and replays it on every request.
 */
export const ADMIN_COOKIE = "waffled_admin";
export const ADMIN_TOKEN_HEADER = "x-admin-token";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "waffled-admin-2026";
}

export function adminToken(): string {
  return createHash("sha256")
    .update(`waffled::${adminPassword()}::v1`)
    .digest("hex");
}

function isValidToken(value: string | null | undefined): boolean {
  if (!value) return false;
  const expected = adminToken();
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** True when the request carries a valid admin session (cookie or header). */
export function isAdminRequest(request: Request): boolean {
  // 1) Session cookie — normal first-party tabs.
  const cookies = request.headers.get("cookie") ?? "";
  const prefix = `${ADMIN_COOKIE}=`;
  const match = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(prefix));
  if (match && isValidToken(decodeURIComponent(match.slice(prefix.length)))) {
    return true;
  }
  // 2) x-admin-token header — iframe contexts where cookies are blocked.
  return isValidToken(request.headers.get(ADMIN_TOKEN_HEADER));
}

/** Standard 401 response for unauthenticated admin API calls. */
export function unauthorized() {
  return Response.json(
    { success: false, error: "Admin login required." },
    { status: 401 }
  );
}
