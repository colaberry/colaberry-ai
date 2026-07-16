import type { NextApiRequest, NextApiResponse } from "next";
import {
  hasJsonContentType,
  hasRealBrowserHeaders,
  isAllowedOrigin,
  isKnownBot,
  validateEmail,
} from "../../../lib/bot-defense";
import { checkRateLimit, getClientIp } from "../../../lib/rate-limit";
import { authConfigured } from "../../../lib/auth/keys";
import { signMagicLink } from "../../../lib/auth/jwt";
import { sendMagicLinkEmail } from "../../../lib/auth/emailSend";

/**
 * POST /api/auth/request-link — start the email magic-link login.
 *
 * Body: { email }. Signs a 15-min single-use magic-link JWT, emails the link
 * (Resend, or console in dev), and ALWAYS returns a generic 200 so a caller
 * can't tell whether the send actually happened. There is no user database to
 * enumerate (every email is registerable — the email IS the lead), so a bad
 * *format* still gets a corrective 400 for UX; everything else is generic-OK.
 *
 * Abuse control = per-IP + per-email rate limits (magic-link email flooding is
 * the only real vector) + the shared bot-defense layers.
 */

const GENERIC_OK = {
  ok: true as const,
  message: "If that email is valid, a sign-in link is on its way. Check your inbox.",
};

function appOrigin(req: NextApiRequest): string {
  const env = (process.env.AUTH_APP_ORIGIN || "").trim().replace(/\/$/, "");
  if (env) return env;
  const origin = (req.headers.origin as string | undefined) || "";
  if (origin) return origin.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] as string | undefined) || "https";
  const host = (req.headers.host as string | undefined) || "localhost:3000";
  return `${proto}://${host}`;
}

function parseBody(req: NextApiRequest): { email?: string; redirect?: string } | null {
  if (!req.body) return null;
  if (typeof req.body === "object") return req.body as { email?: string; redirect?: string };
  try {
    return JSON.parse(req.body) as { email?: string; redirect?: string };
  } catch {
    return null;
  }
}

/**
 * Same-site relative paths only. Blocks open-redirect via protocol-relative
 * `//host`, backslash tricks (`/\host` and `/%5Chost` normalize cross-origin
 * per the WHATWG URL spec), and control chars — then confirms the RESOLVED
 * origin is same-site as a belt-and-suspenders check. This is the gate that
 * decides what redirect gets baked into the emailed magic link.
 */
function safeRedirect(raw?: unknown): string | null {
  if (typeof raw !== "string" || !raw || raw.length > 512) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return null;
  if (/[\x00-\x1f\\]/.test(raw)) return null;
  try {
    if (new URL(raw, "https://colaberry.ai").origin !== "https://colaberry.ai") return null;
  } catch {
    return null;
  }
  return raw;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed." });
  }

  if (!authConfigured()) {
    console.error("[auth:request-link] AUTH_JWT keys not configured");
    return res.status(503).json({ ok: false, message: "Login is not available right now." });
  }

  // Per-IP flood guard first — abusers get throttled even without valid JSON.
  const ip = getClientIp(req);
  const rlIp = checkRateLimit("auth-request-ip", ip, 8, 10 * 60_000);
  if (rlIp.limited) {
    res.setHeader("Retry-After", String(rlIp.retryAfterSec));
    return res.status(429).json({ ok: false, message: "Too many requests. Please try again shortly." });
  }

  // Bot-defense layers 1-4 — generic-OK on any block (no enumeration).
  if (
    isKnownBot(req) ||
    !hasRealBrowserHeaders(req) ||
    !isAllowedOrigin(req) ||
    !hasJsonContentType(req)
  ) {
    return res.status(200).json(GENERIC_OK);
  }

  const body = parseBody(req);
  const email = (body?.email || "").trim().toLowerCase();
  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) {
    return res.status(400).json({ ok: false, message: "Please enter a valid email address." });
  }

  // Per-email rate limit — cap magic-link emails sent to one address.
  const rlEmail = checkRateLimit("auth-request-email", email, 4, 10 * 60_000);
  if (rlEmail.limited) {
    res.setHeader("Retry-After", String(rlEmail.retryAfterSec));
    return res.status(429).json({ ok: false, message: "Too many requests. Please try again shortly." });
  }

  const redirect = safeRedirect(body?.redirect);
  try {
    const { token } = await signMagicLink(email);
    const link = `${appOrigin(req)}/auth/verify?token=${encodeURIComponent(token)}${
      redirect ? `&redirect=${encodeURIComponent(redirect)}` : ""
    }`;
    const sent = await sendMagicLinkEmail(email, link);
    if (!sent.ok) {
      console.error(`[auth:request-link] send failed for ${email}: ${sent.error ?? "unknown"}`);
    }
  } catch (e) {
    console.error(`[auth:request-link] error: ${e instanceof Error ? e.message : "unknown"}`);
  }

  // Always generic-OK — the caller cannot distinguish sent from not-sent.
  return res.status(200).json(GENERIC_OK);
}
