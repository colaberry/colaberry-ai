import crypto from "crypto";
import type { NextApiRequest } from "next";

const HASH_SALT = process.env.RATE_LIMIT_SALT || "colaberry-rl";
const MAX_BUCKETS = 10_000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function cleanup() {
  if (buckets.size < MAX_BUCKETS) return;
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(`${HASH_SALT}:${ip}`).digest("hex").slice(0, 24);
}

/**
 * Get client IP from request.
 * Uses platform-specific headers first (CF-Connecting-IP for Cloudflare,
 * x-real-ip for Vercel), then falls back to the LAST value in
 * x-forwarded-for (the one added by the trusted proxy, not client-supplied).
 */
export function getClientIp(req: NextApiRequest): string {
  // The ONLY trustworthy client IP is the one the platform's own front end
  // appends. On Cloud Run (direct *.run.app or behind a Google LB) that is the
  // LAST hop of x-forwarded-for — client-supplied XFF entries can only be
  // PREFIXED, never appended past the platform. `cf-connecting-ip` / `x-real-ip`
  // are NOT set by Cloud Run, so trusting them (as this used to, first) let a
  // client send `X-Real-IP: <random>` per request and evade the per-IP limits.
  // Only consult a proxy header when explicitly opted in for that topology.
  const trusted = (process.env.TRUSTED_IP_HEADER || "xff-last").toLowerCase();
  if (trusted === "cf-connecting-ip") {
    const cfIp = req.headers["cf-connecting-ip"];
    if (cfIp) return (Array.isArray(cfIp) ? cfIp[0] : cfIp).trim();
  } else if (trusted === "x-real-ip") {
    const realIp = req.headers["x-real-ip"];
    if (realIp) return (Array.isArray(realIp) ? realIp[0] : realIp).trim();
  }

  // Default (Cloud Run): x-forwarded-for LAST hop — platform-appended, not
  // client-spoofable.
  const forwarded = req.headers["x-forwarded-for"];
  const fromHeader = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (fromHeader) {
    const ips = fromHeader.split(",").map((s) => s.trim()).filter(Boolean);
    return ips[ips.length - 1] || "unknown";
  }
  return req.socket.remoteAddress || "unknown";
}

export type RateLimitInfo = {
  limited: boolean;
  limit: number;
  remaining: number;
  retryAfterSec: number;
};

/**
 * Check if a request is rate limited.
 * @param prefix - Namespace prefix (e.g., "mcps", "demo-request")
 * @param ip - Client IP address
 * @param limit - Max requests per window
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limited
 */
export function isRateLimited(
  prefix: string,
  ip: string,
  limit: number,
  windowMs: number
): boolean {
  return checkRateLimit(prefix, ip, limit, windowMs).limited;
}

/**
 * Check rate limit and return metadata for response headers.
 */
export function checkRateLimit(
  prefix: string,
  ip: string,
  limit: number,
  windowMs: number
): RateLimitInfo {
  cleanup();
  const key = `${prefix}:${hashIp(ip)}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, limit, remaining: limit - 1, retryAfterSec: 0 };
  }

  if (current.count >= limit) {
    const retryAfterSec = Math.ceil((current.resetAt - now) / 1000);
    // A09: Log rate limit events for security monitoring
    console.warn(`[rate-limit] ${prefix} limit=${limit} ip=${hashIp(ip)} retryAfter=${retryAfterSec}s`);
    return { limited: true, limit, remaining: 0, retryAfterSec };
  }

  current.count++;
  return { limited: false, limit, remaining: limit - current.count, retryAfterSec: 0 };
}
