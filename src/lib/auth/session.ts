/**
 * Session cookie + single-use magic-link nonce store for the global login.
 *
 * The session is the shared RS256 JWT (see jwt.ts) carried in a first-party,
 * httpOnly cookie on colaberry.ai. Cross-origin demos (the Voice Agent iframe on
 * a different Cloud Run origin) never read this cookie — they receive the JWT via
 * postMessage — so SameSite=Lax is both safe and correct here.
 */

import type { NextApiResponse } from "next";
import { verifySession, type SessionClaims } from "./jwt";

export const SESSION_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "colaberry_session";
const SESSION_MAX_AGE_S = Number(process.env.AUTH_COOKIE_MAX_AGE ?? 60 * 60 * 24 * 30); // 30d
// Set to ".colaberry.ai" to share the session across sub-domains; host-only by default.
const COOKIE_DOMAIN = (process.env.AUTH_COOKIE_DOMAIN ?? "").trim();
const IS_PROD = process.env.NODE_ENV === "production";

function serializeCookie(name: string, value: string, maxAgeSeconds: number): string {
  const parts = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (IS_PROD) parts.push("Secure");
  if (COOKIE_DOMAIN) parts.push(`Domain=${COOKIE_DOMAIN}`);
  return parts.join("; ");
}

export function setSessionCookie(res: NextApiResponse, token: string): void {
  res.setHeader("Set-Cookie", serializeCookie(SESSION_COOKIE_NAME, token, SESSION_MAX_AGE_S));
}

export function clearSessionCookie(res: NextApiResponse): void {
  res.setHeader("Set-Cookie", serializeCookie(SESSION_COOKIE_NAME, "", 0));
}

/** Minimal shape shared by NextApiRequest and getServerSideProps' req. */
export interface HasCookies {
  cookies: Partial<Record<string, string>>;
}

export function readSessionToken(req: HasCookies): string | null {
  return req.cookies?.[SESSION_COOKIE_NAME] ?? null;
}

/** Resolve the current session from the cookie, or null if absent/invalid/expired. */
export async function resolveSession(req: HasCookies): Promise<SessionClaims | null> {
  const token = readSessionToken(req);
  if (!token) return null;
  return verifySession(token);
}

/**
 * Single-use magic-link nonce store. In-memory (per-instance) for v1 — mirrors
 * src/lib/rate-limit.ts. A nonce only has to outlive the 15-min link TTL, so a
 * scale-to-zero flush at worst re-opens a <=15-min replay window on ONE link.
 * Back this with Cloud SQL / a Strapi collection for strict multi-instance prod.
 */
const consumedNonces = new Map<string, number>(); // nonce -> expiry epoch ms

/** Returns true if the nonce was fresh (now burned); false if already consumed. */
export function consumeNonce(nonce: string, ttlMs: number): boolean {
  const now = Date.now();
  if (consumedNonces.size > 5000) {
    for (const [k, exp] of consumedNonces) if (exp <= now) consumedNonces.delete(k);
  }
  const existing = consumedNonces.get(nonce);
  if (existing && existing > now) return false;
  consumedNonces.set(nonce, now + ttlMs);
  return true;
}
