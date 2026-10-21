"use client";

/**
 * Tiny fetch wrapper for the admin API.
 *
 * - Always uses RELATIVE urls ("/api/admin/...").
 * - Sends the stored admin session token via the x-admin-token header.
 *   Browsers block session cookies inside cross-site iframes (chat preview
 *   panel), so the token in localStorage is what actually authenticates
 *   there; in normal tabs the cookie works too — both are accepted.
 * - Any 401 fires the registered unauthorized handler (the /admin page flips
 *   back to the login screen with a "Session expired" toast) and throws
 *   UnauthorizedError so callers can silently stop.
 * - Non-2xx responses throw an Error with the server-provided message.
 */

import { toast } from "sonner";

export class UnauthorizedError extends Error {
  constructor() {
    super("Session expired");
    this.name = "UnauthorizedError";
  }
}

// --- localStorage session (iframe-safe) -------------------------------------

const SESSION_KEY = "demo_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // mirrors the cookie's 12h max-age

interface StoredSession {
  token: string;
  expiresAt: number;
}

/** Persist the admin session token after a successful login. */
export function saveAdminSession(token: string) {
  try {
    const session: StoredSession = { token, expiresAt: Date.now() + SESSION_TTL_MS };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // storage unavailable (private mode etc.) — the cookie still carries the session
  }
}

/** Drop the stored session (logout or stale token after a 401). */
export function clearAdminSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

/** Valid, unexpired stored token — or null (auto-cleaned when expired). */
function storedSessionToken(): string | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Partial<StoredSession>;
    if (
      typeof session.token !== "string" ||
      typeof session.expiresAt !== "number" ||
      session.expiresAt <= Date.now()
    ) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session.token;
  } catch {
    return null;
  }
}

/** Auth headers for admin requests (token header works inside iframes). */
function authHeaders(json: boolean): Record<string, string> {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  const token = storedSessionToken();
  if (token) headers["x-admin-token"] = token;
  return headers;
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/** Register the callback fired whenever an admin API call returns 401. */
export function registerUnauthorizedHandler(fn: UnauthorizedHandler | null) {
  unauthorizedHandler = fn;
}

export function isUnauthorizedError(err: unknown): boolean {
  return err instanceof UnauthorizedError;
}

/** Friendly message from a thrown error. */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  json?: unknown;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    unauthorizedHandler?.();
    throw new UnauthorizedError();
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  const rec = (body ?? {}) as { success?: boolean; error?: string };
  if (!res.ok || rec.success === false) {
    throw new Error(rec.error || `Request failed (${res.status}).`);
  }
  return body as T;
}

/** Fetch an admin endpoint. Throws UnauthorizedError on 401, Error otherwise. */
export async function api<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const hasJson = opts.json !== undefined;
  const init: RequestInit = {
    method: opts.method ?? "GET",
    headers: authHeaders(hasJson),
  };
  if (hasJson) {
    init.body = JSON.stringify(opts.json);
  }
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }
  return handleResponse<T>(res);
}

/**
 * Upload an image to /api/admin/upload. Returns the served url
 * (e.g. "/uploads/product/abc.webp").
 */
export async function uploadImage(file: File, type: "product" | "site"): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("type", type);
  let res: Response;
  try {
    res = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
      headers: authHeaders(false),
    });
  } catch {
    throw new Error("Upload failed — check your connection and try again.");
  }
  const body = await handleResponse<{ url?: string }>(res);
  if (!body.url) throw new Error("Upload succeeded but no url was returned.");
  return body.url;
}

/** Show an error toast, staying quiet about 401s (handled globally). */
export function toastApiError(err: unknown, fallback?: string) {
  if (isUnauthorizedError(err)) return;
  toast.error(errorMessage(err, fallback));
}
