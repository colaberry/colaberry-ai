import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { createUnsubscribeToken } from "../../lib/newsletterTokens";
import { checkRateLimit, getClientIp } from "../../lib/rate-limit";
import {
  isKnownBot,
  hasRealBrowserHeaders,
  isAllowedOrigin,
  hasJsonContentType,
  validateEmail,
} from "../../lib/bot-defense";

/**
 * Newsletter subscribe API
 *
 * CMS-write + telemetry only. Email delivery is handled by Substack's
 * native broadcast to every subscriber when a new post/podcast ships.
 * See `docs/email-delivery-test-report-2026-04-09.md` for full rationale.
 */

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;
const CMS_TOKEN = process.env.CMS_API_TOKEN;
const HASH_SALT = process.env.NEWSLETTER_HASH_SALT || "colaberry-newsletter";
const REQUEST_TIMEOUT_MS = Number(process.env.NEWSLETTER_API_TIMEOUT_MS || 8000);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://colaberry.ai";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

type SubscribePayload = {
  email?: unknown;
  sourcePath?: unknown;
  sourcePage?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmTerm?: unknown;
  utmContent?: unknown;
  referrer?: unknown;
  consent?: unknown;
  website?: unknown;
};

type CMSCollectionResponse = {
  data?: Array<{
    id?: number | string;
    documentId?: string;
    attributes?: {
      email?: string | null;
      status?: string | null;
    };
    email?: string | null;
    status?: string | null;
  }>;
};

function normalizeText(value: unknown, maxLength = 200) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function hashValue(value: string) {
  return crypto
    .createHash("sha256")
    .update(`${HASH_SALT}:${value}`)
    .digest("hex")
    .slice(0, 24);
}

function parsePayload(req: NextApiRequest): SubscribePayload | null {
  if (!req.body) return {};
  if (typeof req.body === "object") {
    return req.body as SubscribePayload;
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body) as SubscribePayload;
    } catch {
      return null;
    }
  }
  return null;
}

function buildUnsubscribeUrl(email: string) {
  const token = createUnsubscribeToken(email);
  return token && SITE_URL
    ? `${SITE_URL.replace(/\/$/, "")}/unsubscribe?token=${encodeURIComponent(token)}`
    : null;
}

async function cmsFetch<T>(path: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${CMS_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CMS_TOKEN}`,
        ...(init.headers || {}),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`CMS ${response.status}: ${text || "request failed"}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed." });
  }

  if (!CMS_URL || !CMS_TOKEN) {
    return res
      .status(503)
      .json({ ok: false, message: "Subscription service is temporarily unavailable." });
  }

  // Bot defense: every layer that fails silently fake-succeeds with a 200 —
  // this is deliberate (OWASP A01: never leak which layer caught the bot).
  //  Layer 1  — known-bot UA / too-short UA
  //  Layer 2  — missing real-browser headers (accept, accept-language, user-agent)
  //  Layer 3  — origin/referer must be one of our hosts
  //  Layer 4  — content-type must be application/json
  if (
    isKnownBot(req) ||
    !hasRealBrowserHeaders(req) ||
    !isAllowedOrigin(req) ||
    !hasJsonContentType(req)
  ) {
    return res.status(200).json({ ok: true, message: "Subscribed." });
  }

  const requestId = crypto.randomUUID();
  const payload = parsePayload(req);
  if (payload === null) {
    return res.status(400).json({ ok: false, message: "Invalid request payload." });
  }

  const email = normalizeText(payload.email, 180).toLowerCase();
  const sourcePath = normalizeText(payload.sourcePath, 220) || null;
  const sourcePage = normalizeText(payload.sourcePage, 80) || "unknown";
  const utmSource = normalizeText(payload.utmSource, 120) || null;
  const utmMedium = normalizeText(payload.utmMedium, 120) || null;
  const utmCampaign = normalizeText(payload.utmCampaign, 160) || null;
  const utmTerm = normalizeText(payload.utmTerm, 120) || null;
  const utmContent = normalizeText(payload.utmContent, 120) || null;
  const honeypot = normalizeText(payload.website, 80);
  const consent = payload.consent === true || payload.consent === "true";

  if (honeypot) {
    return res.status(200).json({ ok: true, message: "Subscribed." });
  }

  // Strict email validation: length, CRLF, consecutive dots, disposable domains
  const emailResult = validateEmail(email);
  if (!emailResult.valid || !EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ ok: false, message: "Enter a valid email address." });
  }

  if (!consent) {
    return res.status(400).json({ ok: false, message: "Consent is required to subscribe." });
  }

  const ip = getClientIp(req);
  const ipHash = hashValue(ip);
  const emailHash = hashValue(email);
  const rlIp = checkRateLimit("newsletter-subscribe-ip", ip, 12, 10 * 60 * 1000);
  const rlEmail = checkRateLimit("newsletter-subscribe-email", email, 6, 10 * 60 * 1000);
  if (rlIp.limited || rlEmail.limited) {
    const rl = rlIp.limited ? rlIp : rlEmail;
    res.setHeader("Retry-After", String(rl.retryAfterSec));
    res.setHeader("X-RateLimit-Limit", String(rl.limit));
    res.setHeader("X-RateLimit-Remaining", "0");
    return res.status(429).json({ ok: false, message: "Too many attempts. Please try again shortly." });
  }

  const userAgent = normalizeText(req.headers["user-agent"], 500) || null;
  const referrer = normalizeText(payload.referrer, 500) || normalizeText(req.headers.referer, 500) || null;
  const nowIso = new Date().toISOString();

  try {
    const existing = await cmsFetch<CMSCollectionResponse>(
      `/api/newsletter-subscribers?filters[email][$eq]=${encodeURIComponent(email)}&fields[0]=id&fields[1]=status&pagination[pageSize]=1`
    );

    const entry = existing?.data?.[0] ?? null;
    const entryAttributes = entry?.attributes ?? entry;
    const entryId = entry?.documentId || entry?.id;
    const status = String(entryAttributes?.status || "").toLowerCase();

    const commonData = {
      sourcePath,
      sourcePage,
      status: "subscribed",
      subscribedAt: nowIso,
      metadata: {
        requestId,
        ipHash,
        emailHash,
        referrer,
        userAgent,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
      },
    };

    if (entryId) {
      if (status === "subscribed") {
        // SECURITY: Return same message as new subscription to prevent email enumeration (OWASP A01)
        // Unsubscribe URL sent only via email, never in API response
        return res.status(200).json({
          ok: true,
          message: "Subscription confirmed.",
        });
      }

      await cmsFetch(`/api/newsletter-subscribers/${encodeURIComponent(String(entryId))}`, {
        method: "PUT",
        body: JSON.stringify({
          data: {
            email,
            ...commonData,
          },
        }),
      });

      const unsubscribeUrl = buildUnsubscribeUrl(email);
      return res.status(200).json({
        ok: true,
        message: "Subscription reactivated.",
        unsubscribeUrl,
      });
    }

    await cmsFetch("/api/newsletter-subscribers", {
      method: "POST",
      body: JSON.stringify({
        data: {
          email,
          ...commonData,
        },
      }),
    });

    const unsubscribeUrl = buildUnsubscribeUrl(email);
    return res.status(200).json({
      ok: true,
      message: "Subscription confirmed.",
      unsubscribeUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`[newsletter-subscribe] ${requestId} ${message}`);
    return res.status(500).json({ ok: false, message: "Unable to subscribe at the moment." });
  }
}
