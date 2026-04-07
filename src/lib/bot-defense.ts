/**
 * Bot Defense — Multi-layer protection for form submissions.
 *
 * Since colaberry.ai is AEO-optimized (welcomes AI crawlers for content indexing),
 * we need strong bot protection on forms to prevent automated submissions.
 *
 * Layers:
 * 1. Honeypot field (existing) — catches basic bots that fill all fields
 * 2. Time-based check — rejects submissions faster than human speed
 * 3. JS-generated token — proves JavaScript executed (blocks curl/wget)
 * 4. User-agent filtering — blocks known bot user-agents on form POST
 * 5. Cloudflare Turnstile (future) — invisible CAPTCHA when configured
 */

import type { NextApiRequest } from "next";
import crypto from "crypto";

const BOT_TOKEN_SECRET = process.env.BOT_TOKEN_SECRET || "";

/** Fail closed: if no secret configured, tokens cannot be validated. */
function hasSecret(): boolean {
  return BOT_TOKEN_SECRET.length > 0;
}

/**
 * Generate a time-stamped bot defense token for the client.
 * Embed this in a hidden field. Server validates it on submission.
 * Token encodes the timestamp so we can check minimum form fill time.
 */
export function generateBotToken(): string {
  if (!hasSecret()) return "";
  const timestamp = Date.now().toString(36);
  const signature = crypto
    .createHmac("sha256", BOT_TOKEN_SECRET)
    .update(timestamp)
    .digest("hex")
    .slice(0, 16);
  return `${timestamp}.${signature}`;
}

/**
 * Validate a bot defense token from form submission.
 * Returns { valid, reason } — reason explains why it failed.
 */
export function validateBotToken(
  token: string | undefined | null,
  minAgeMs = 3000, // Minimum 3 seconds to fill form (human speed)
  maxAgeMs = 3600_000, // Maximum 1 hour (form not stale)
): { valid: boolean; reason?: string } {
  // Fail closed: if no secret configured, reject the request
  if (!hasSecret()) {
    if (process.env.NODE_ENV !== "production") {
      // In development, warn but allow through for local testing
      console.warn("[bot-defense] BOT_TOKEN_SECRET not set — skipping token validation in dev mode");
      return { valid: true, reason: "no_secret_dev_bypass" };
    }
    console.error("[bot-defense] BOT_TOKEN_SECRET not set in production — rejecting request");
    return { valid: false, reason: "no_secret_configured" };
  }

  if (!token || typeof token !== "string") {
    return { valid: false, reason: "missing_token" };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, reason: "malformed_token" };
  }

  const [timestamp, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", BOT_TOKEN_SECRET)
    .update(timestamp)
    .digest("hex")
    .slice(0, 16);

  // Timing-safe comparison to prevent signature guessing
  const sigBuf = Buffer.from(signature, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false, reason: "invalid_signature" };
  }

  const tokenTime = parseInt(timestamp, 36);
  const now = Date.now();
  const age = now - tokenTime;

  if (age < minAgeMs) {
    return { valid: false, reason: "too_fast" }; // Bot submitted faster than human
  }

  if (age > maxAgeMs) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true };
}

/**
 * Check if the request User-Agent looks like a known bot.
 * We ALLOW AI crawlers on GET requests (for AEO), but BLOCK them on POST (form submissions).
 */
const BOT_UA_PATTERNS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i,
  /GPTBot/i, /ClaudeBot/i, /PerplexityBot/i, /Google-Extended/i,
  /Bingbot/i, /Googlebot/i, /Slurp/i, /DuckDuckBot/i,
  /curl/i, /wget/i, /python-requests/i, /axios/i, /node-fetch/i,
  /HeadlessChrome/i, /PhantomJS/i, /Selenium/i,
];

export function isKnownBot(req: NextApiRequest): boolean {
  const ua = req.headers["user-agent"] || "";
  return BOT_UA_PATTERNS.some((pattern) => pattern.test(ua));
}

/**
 * Combined bot defense check for API route handlers.
 * Returns null if request is legitimate, or an error message if blocked.
 */
export function checkBotDefense(
  req: NextApiRequest,
  options: { requireToken?: boolean; minAgeMs?: number } = {}
): string | null {
  const { requireToken = false, minAgeMs = 3000 } = options;

  // Layer 1: Block known bot user-agents on POST
  if (isKnownBot(req)) {
    return "Automated submissions are not allowed.";
  }

  // Layer 2: Validate bot defense token if required
  if (requireToken) {
    const body = req.body as Record<string, unknown> | undefined;
    const token = body?._bt as string | undefined;
    const result = validateBotToken(token, minAgeMs);
    if (!result.valid) {
      return result.reason === "too_fast"
        ? "Please take a moment before submitting."
        : "Form session expired. Please refresh and try again.";
    }
  }

  return null; // Request is legitimate
}
