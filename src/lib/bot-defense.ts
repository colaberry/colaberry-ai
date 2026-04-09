/**
 * Bot Defense — Multi-layer protection for form submissions.
 *
 * colaberry.ai is AEO-optimized — we *welcome* AI crawlers on GET requests
 * because being indexed and cited by LLMs is the entire point of the site.
 * But on POST requests (form submissions), crawlers should be blocked and
 * only real browsers with real humans behind them should be admitted.
 *
 * Layers (in order of execution on each POST):
 *  1. Known-bot user-agent filter        — blocks curl/wget/headless/GPTBot etc.
 *  2. User-agent sanity check            — minimum length + must look real
 *  3. Required browser headers           — real browsers always send these
 *  4. Origin / Referer origin check      — must come from colaberry.ai
 *  5. Content-Type JSON enforcement      — form POSTs here are always JSON
 *  6. Honeypot field (in route handler)  — catches naive bots
 *  7. Timed HMAC token                   — min fill time, max age, HMAC-signed
 *  8. Email validity + disposable domain — blocks throwaway accounts
 *  9. Rate limit (in route handler)      — per-IP + per-email bucketing
 *
 * Every layer fails closed in production. Developer mode (NODE_ENV !== 'production')
 * bypasses the token layer only so local testing is possible without BOT_TOKEN_SECRET.
 */

import type { NextApiRequest } from "next";
import crypto from "crypto";

const BOT_TOKEN_SECRET = process.env.BOT_TOKEN_SECRET || "";

/** Fail closed: if no secret configured, tokens cannot be validated. */
function hasSecret(): boolean {
  return BOT_TOKEN_SECRET.length > 0;
}

/**
 * Allowed origins for form POSTs. Anything outside this set is rejected.
 * Production canonical host + Cloud Run hosts + localhost for dev.
 */
const ALLOWED_ORIGIN_HOSTS = new Set<string>([
  "colaberry.ai",
  "www.colaberry.ai",
  "colaberry-ai-prod.run.app",
  "localhost",
  "127.0.0.1",
]);

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
 *
 * Stricter defaults than before:
 *  - minAgeMs bumped from 3000ms → 5000ms (most real users take >5s to
 *    read the consent notice, type an email, and click submit)
 *  - maxAgeMs unchanged at 1 hour
 */
export function validateBotToken(
  token: string | undefined | null,
  minAgeMs = 5000,
  maxAgeMs = 3600_000,
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
    return { valid: false, reason: "too_fast" };
  }

  if (age > maxAgeMs) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true };
}

/**
 * Known-bot user-agent patterns. ALLOWED on GET (AEO), BLOCKED on POST.
 *
 * Covers: generic words (bot/crawler/spider/scraper), major AI crawlers,
 * major search crawlers, common HTTP libraries (curl, wget, axios, fetch,
 * python requests, urllib, okhttp, go-http-client, java/*), and headless
 * browser automation tools.
 */
const BOT_UA_PATTERNS: RegExp[] = [
  // Generic bot keywords
  /bot/i, /crawler/i, /spider/i, /scraper/i, /fetcher/i,
  // AI crawlers
  /GPTBot/i, /ClaudeBot/i, /PerplexityBot/i, /Google-Extended/i,
  /Applebot-Extended/i, /Bytespider/i, /CCBot/i, /Meta-ExternalAgent/i,
  // Search crawlers
  /Bingbot/i, /Googlebot/i, /Slurp/i, /DuckDuckBot/i, /YandexBot/i, /Baiduspider/i,
  // HTTP libraries
  /curl\//i, /wget/i, /python-requests/i, /python-urllib/i, /urllib/i,
  /axios/i, /node-fetch/i, /got\//i, /okhttp/i, /go-http-client/i,
  /java\//i, /libwww/i, /lwp-request/i, /ruby/i, /httpx/i, /aiohttp/i,
  // Headless / automation
  /HeadlessChrome/i, /PhantomJS/i, /Selenium/i, /Playwright/i,
  /puppeteer/i, /cypress/i, /webdriver/i, /chrome-lighthouse/i,
  // Scraping frameworks
  /scrapy/i, /colly/i, /apache-httpclient/i, /nutch/i,
];

/**
 * Minimum plausible length for a real browser User-Agent. Modern browsers
 * always emit something like "Mozilla/5.0 (...) AppleWebKit/... (KHTML, ...)
 * ... Safari/..." which is ~80+ chars. Anything under 20 is a bot.
 */
const MIN_UA_LENGTH = 20;

export function isKnownBot(req: NextApiRequest): boolean {
  const ua = (req.headers["user-agent"] || "").toString();
  if (!ua || ua.length < MIN_UA_LENGTH) return true;
  return BOT_UA_PATTERNS.some((pattern) => pattern.test(ua));
}

/**
 * Disposable / throwaway email domains — the common ones. Not exhaustive
 * (no list is) but catches the biggest offenders that bots tend to use.
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set<string>([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org",
  "throwaway.email", "yopmail.com", "dispostable.com", "mintemail.com",
  "mailnesia.com", "trashmail.com", "trashmail.net", "spambox.us",
  "fakeinbox.com", "mohmal.com", "sharklasers.com", "getnada.com",
  "maildrop.cc", "mailcatch.com", "incognitomail.com", "harakirimail.com",
  "spamgourmet.com", "anonbox.net", "emailondeck.com", "mytrashmail.com",
]);

/**
 * Strict email validator:
 *  - Max 254 total length (RFC 5321)
 *  - Local part max 64 chars
 *  - Exactly one @
 *  - No consecutive dots
 *  - At most one "+" in local part
 *  - Domain must have a TLD of at least 2 chars
 *  - Blocks CRLF injection
 *  - Rejects disposable domains
 */
export function validateEmail(raw: string): { valid: boolean; reason?: string } {
  if (typeof raw !== "string" || !raw) return { valid: false, reason: "missing" };
  const email = raw.trim();
  if (email.length > 254) return { valid: false, reason: "too_long" };
  if (/[\r\n\t]/.test(email)) return { valid: false, reason: "crlf_injection" };

  const atCount = (email.match(/@/g) || []).length;
  if (atCount !== 1) return { valid: false, reason: "bad_at_count" };

  const [local, domain] = email.split("@");
  if (!local || !domain) return { valid: false, reason: "empty_parts" };
  if (local.length > 64) return { valid: false, reason: "local_too_long" };
  if (local.includes("..") || domain.includes("..")) return { valid: false, reason: "consecutive_dots" };
  if ((local.match(/\+/g) || []).length > 1) return { valid: false, reason: "multiple_plus" };

  // Domain must have at least one dot and TLD of length >=2
  const domainParts = domain.split(".");
  if (domainParts.length < 2) return { valid: false, reason: "no_tld" };
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-z]+$/i.test(tld)) return { valid: false, reason: "bad_tld" };

  // Character set check (permissive but safe)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, reason: "regex_fail" };

  const normalizedDomain = domain.toLowerCase();
  if (DISPOSABLE_EMAIL_DOMAINS.has(normalizedDomain)) {
    return { valid: false, reason: "disposable_domain" };
  }

  return { valid: true };
}

/**
 * Return the host part (no port) of a URL, or null on failure.
 */
function hostFromUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Origin / Referer check. Real browser form POSTs from our frontend always
 * have an Origin (or at least a Referer) whose host matches one of our
 * allowed hosts. Cross-site POSTs from other domains will have a different
 * origin, and scripted bots usually send neither.
 */
export function isAllowedOrigin(req: NextApiRequest): boolean {
  const originHost = hostFromUrl(
    (req.headers.origin as string | undefined) || null,
  );
  const refererHost = hostFromUrl(
    (req.headers.referer as string | undefined) || null,
  );

  // In development, be lenient: if both are missing, allow (curl-less local testing)
  if (process.env.NODE_ENV !== "production" && !originHost && !refererHost) {
    return true;
  }

  const candidate = originHost || refererHost;
  if (!candidate) return false;
  return ALLOWED_ORIGIN_HOSTS.has(candidate);
}

/**
 * Check that the minimum set of headers a real browser would send is present.
 * Real browsers always send Accept, Accept-Language, and User-Agent.
 */
export function hasRealBrowserHeaders(req: NextApiRequest): boolean {
  const accept = (req.headers["accept"] as string | undefined) || "";
  const acceptLang = (req.headers["accept-language"] as string | undefined) || "";
  const ua = (req.headers["user-agent"] as string | undefined) || "";
  return accept.length > 0 && acceptLang.length > 0 && ua.length >= MIN_UA_LENGTH;
}

/**
 * Enforce JSON content type. Our signup endpoints only accept JSON bodies.
 */
export function hasJsonContentType(req: NextApiRequest): boolean {
  const ct = (req.headers["content-type"] as string | undefined) || "";
  return ct.toLowerCase().includes("application/json");
}

/**
 * Combined bot defense check for API route handlers.
 * Returns null if request is legitimate, or a user-safe error string if blocked.
 *
 * The returned string is safe to surface to end users — it never leaks which
 * specific layer caught the request. Callers that want richer reason codes
 * can call the underlying functions (isKnownBot, validateBotToken, etc.) directly.
 */
export function checkBotDefense(
  req: NextApiRequest,
  options: {
    requireToken?: boolean;
    minAgeMs?: number;
    requireJson?: boolean;
    requireOrigin?: boolean;
  } = {}
): string | null {
  const {
    requireToken = false,
    minAgeMs = 5000,
    requireJson = true,
    requireOrigin = true,
  } = options;

  // Layer 1: Block known bot user-agents / missing UA on POST
  if (isKnownBot(req)) {
    return "Automated submissions are not allowed.";
  }

  // Layer 2: Real-browser header sanity check
  if (!hasRealBrowserHeaders(req)) {
    return "Automated submissions are not allowed.";
  }

  // Layer 3: Origin / Referer must match an allowed host
  if (requireOrigin && !isAllowedOrigin(req)) {
    return "Request origin is not allowed.";
  }

  // Layer 4: Content-Type enforcement
  if (requireJson && !hasJsonContentType(req)) {
    return "Invalid request format.";
  }

  // Layer 5: Signed timed HMAC token (opt-in per route)
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

  return null;
}
