/**
 * Simple fixed-window, in-memory rate limiter.
 *
 * Good enough for a single-instance deployment (SQLite + Next.js dev/prod
 * server). The bucket map is attached to `globalThis` so the state survives
 * module re-instantiation during dev hot reloads, mirroring the Prisma
 * singleton pattern in `src/lib/db.ts`.
 */

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  /** Max requests allowed inside the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
};

const globalForRateLimit = globalThis as unknown as {
  __demoRateLimitBuckets?: Map<string, Bucket>;
};

const buckets: Map<string, Bucket> =
  globalForRateLimit.__demoRateLimitBuckets ?? new Map<string, Bucket>();
globalForRateLimit.__demoRateLimitBuckets = buckets;

/**
 * Best-effort client IP extraction from proxy headers.
 * Falls back to "unknown" when no headers are present (e.g. direct local access).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Consume one request slot for `key`.
 * Returns `true` when the request is allowed, `false` when the limit is hit.
 */
export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): boolean {
  const now = Date.now();

  // Opportunistic cleanup so the map cannot grow unbounded.
  if (buckets.size > 10_000) {
    for (const [k, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(k);
    }
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count < limit) {
    existing.count += 1;
    return true;
  }

  return false;
}
