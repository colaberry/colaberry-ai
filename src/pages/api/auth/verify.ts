import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { checkRateLimit, getClientIp } from "../../../lib/rate-limit";
import { hasJsonContentType, isAllowedOrigin } from "../../../lib/bot-defense";
import { authConfigured } from "../../../lib/auth/keys";
import { signSession, verifyMagicLink } from "../../../lib/auth/jwt";
import { consumeNonce, setSessionCookie } from "../../../lib/auth/session";
import { captureLead } from "../../../lib/auth/leadStore";

/**
 * POST /api/auth/verify — finish the magic-link login.
 *
 * Body: { token }. Verifies the magic-link JWT, burns its nonce (single-use),
 * issues the 30-day shared session cookie, and captures the verified email as a
 * lead in Strapi. This is a POST (not GET) on purpose: email-client link
 * prefetchers issue GETs, which would burn a single-use link before the human
 * clicks — the /auth/verify page POSTs the token on user action instead.
 *
 * Lead capture is the #1 goal, so the Strapi write is AWAITED (not fire-and-
 * forget) — a serverless freeze after the response must not drop the lead. It
 * still never blocks sign-in: captureLead never throws and self-times-out.
 */

const NONCE_TTL_MS = 15 * 60_000;
const LEAD_HASH_SALT =
  process.env.AUTH_LEAD_HASH_SALT || process.env.NEWSLETTER_HASH_SALT || "colaberry-auth-lead";

function hashValue(v: string): string {
  return crypto.createHash("sha256").update(`${LEAD_HASH_SALT}:${v}`).digest("hex").slice(0, 24);
}

// Require a parsed JSON object. The content-type guard below rejects anything
// that isn't application/json, so Next has already parsed a valid body into an
// object by the time we get here — a raw string body is only reachable via the
// cross-site form path the guard blocks, so there's no string fallback to keep.
function parseBody(req: NextApiRequest): { token?: string } | null {
  if (req.body && typeof req.body === "object") return req.body as { token?: string };
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed." });
  }
  res.setHeader("Cache-Control", "no-store");

  // CSRF / session-fixation defense. This endpoint mints the session cookie from
  // the posted token, so a cross-site request must never reach it — otherwise an
  // attacker auto-submits a hidden form carrying THEIR magic-link token and fixes
  // their identity onto the victim's browser. A cross-site HTML form can only send
  // a url-encoded body and a foreign Origin; requiring application/json forces a
  // CORS preflight the attacker's origin can't pass, and the Origin/Referer host
  // must be ours. The real /auth/verify fetch (same-origin, JSON) sails through.
  if (!hasJsonContentType(req) || !isAllowedOrigin(req)) {
    return res.status(400).json({ ok: false, message: "Invalid request." });
  }

  if (!authConfigured()) {
    return res.status(503).json({ ok: false, message: "Login is not available right now." });
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit("auth-verify-ip", ip, 20, 10 * 60_000);
  if (rl.limited) {
    res.setHeader("Retry-After", String(rl.retryAfterSec));
    return res.status(429).json({ ok: false, message: "Too many attempts. Please try again shortly." });
  }

  const body = parseBody(req);
  const token = (body?.token || "").trim();
  if (!token) {
    return res.status(400).json({ ok: false, message: "Missing sign-in token." });
  }

  const parsed = await verifyMagicLink(token);
  if (!parsed) {
    return res.status(400).json({ ok: false, message: "This sign-in link is invalid or has expired." });
  }

  // Single-use: burn the nonce. A forwarded/prefetched/replayed link is rejected.
  if (!consumeNonce(parsed.nonce, NONCE_TTL_MS)) {
    return res.status(400).json({ ok: false, message: "This sign-in link has already been used." });
  }

  const email = parsed.email;
  const sessionToken = await signSession({ sub: email, email });
  setSessionCookie(res, sessionToken);

  // Lead capture — the whole point of the login. Awaited so a post-response
  // serverless freeze can't drop it; best-effort (never throws / self-times-out).
  const ua = String(req.headers["user-agent"] || "").slice(0, 500);
  const lead = await captureLead({
    email,
    source: "global-login",
    ipHash: hashValue(ip),
    userAgent: ua,
  });
  if (!lead.ok) {
    console.warn(`[auth:verify] lead not persisted for ${email}: ${lead.error ?? "unknown"}`);
  }

  return res.status(200).json({ ok: true, email });
}
