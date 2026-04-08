import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { buildNewsletterTemplate } from "../../lib/newsletterTemplate";
import { resolveSenderProvider, sendNewsletterEmail, isEmailProviderConfigured } from "../../lib/newsletterSender";
import { createUnsubscribeToken } from "../../lib/newsletterTokens";
import { checkRateLimit, getClientIp } from "../../lib/rate-limit";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL;
const CMS_TOKEN = process.env.CMS_API_TOKEN;
const HASH_SALT = process.env.NEWSLETTER_HASH_SALT || "colaberry-newsletter";
const REQUEST_TIMEOUT_MS = Number(process.env.NEWSLETTER_API_TIMEOUT_MS || 8000);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://colaberry.ai";
const WELCOME_EMAIL_ENABLED = process.env.NEWSLETTER_SEND_WELCOME_ON_SUBSCRIBE !== "false";

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

type DeliveryResult = {
  attempted: boolean;
  sent: boolean;
  provider: "resend" | "sendgrid" | "console";
  error?: string;
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
    ? `${SITE_URL.replace(/\/$/, "")}/unsubscribe?token=${encodeURIComponent(token)}&list=podcast`
    : null;
}

async function sendWelcomeEmail(email: string): Promise<DeliveryResult> {
  const provider = resolveSenderProvider();
  if (!WELCOME_EMAIL_ENABLED) {
    return { attempted: false, sent: false, provider };
  }
  if (!isEmailProviderConfigured()) {
    return { attempted: false, sent: false, provider };
  }

  const siteBase = SITE_URL || "https://colaberry.ai";
  const template = buildNewsletterTemplate({
    recipientEmail: email,
    siteUrl: siteBase,
    subject: "Welcome to the Colaberry AI Podcast",
    preheader: "You will be notified when new podcast episodes drop.",
    heading: "Podcast subscription confirmed",
    intro:
      "You are now subscribed to the Colaberry AI Podcast. We will notify you when new episodes are published — covering AI trends, enterprise deployment insights, and research deep-dives.",
    ctaLabel: "Browse episodes",
    ctaHref: `${siteBase.replace(/\/$/, "")}/resources/podcasts`,
    items: [
      { title: "Latest episodes", label: "Latest episodes", href: `${siteBase.replace(/\/$/, "")}/resources/podcasts` },
      { title: "Platform overview", label: "Platform overview", href: `${siteBase.replace(/\/$/, "")}/platform` },
    ],
  });

  try {
    const result = await sendNewsletterEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    if (!result.ok) {
      return {
        attempted: true,
        sent: false,
        provider,
        error: result.error || "send failed",
      };
    }
    return {
      attempted: true,
      sent: true,
      provider,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "send failed";
    return {
      attempted: true,
      sent: false,
      provider,
      error: message,
    };
  }
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

  // Bot defense: block known bots on form POST
  const { isKnownBot } = await import("../../lib/bot-defense");
  if (isKnownBot(req)) {
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

  if (!EMAIL_PATTERN.test(email) || /[\r\n]/.test(email)) {
    return res.status(400).json({ ok: false, message: "Enter a valid email address." });
  }

  if (!consent) {
    return res.status(400).json({ ok: false, message: "Consent is required to subscribe." });
  }

  const ip = getClientIp(req);
  const ipHash = hashValue(ip);
  const emailHash = hashValue(email);
  const rlIp = checkRateLimit("podcast-subscribe-ip", ip, 12, 10 * 60 * 1000);
  const rlEmail = checkRateLimit("podcast-subscribe-email", email, 6, 10 * 60 * 1000);
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
      `/api/podcast-subscribers?filters[email][$eq]=${encodeURIComponent(email)}&fields[0]=id&fields[1]=status&pagination[pageSize]=1`
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
        return res
          .status(200)
          .json({
            ok: true,
            message: "Podcast subscription confirmed.",
            delivery: {
              attempted: false,
              sent: false,
              provider: resolveSenderProvider(),
            },
          });
      }

      await cmsFetch(`/api/podcast-subscribers/${encodeURIComponent(String(entryId))}`, {
        method: "PUT",
        body: JSON.stringify({
          data: {
            email,
            ...commonData,
          },
        }),
      });

      const delivery = await sendWelcomeEmail(email);
      const unsubscribeUrl = buildUnsubscribeUrl(email);
      if (!delivery.sent && delivery.error) {
        console.warn(`[podcast-subscribe] ${requestId} welcome email skipped: ${delivery.error}`);
      }

      const message = delivery.sent
        ? "Podcast subscription reactivated. Welcome email sent."
        : delivery.attempted
          ? "Podcast subscription reactivated. We could not deliver the welcome email right now."
          : "Podcast subscription reactivated.";
      return res.status(200).json({
        ok: true,
        message,
        unsubscribeUrl,
        delivery: {
          attempted: delivery.attempted,
          sent: delivery.sent,
        },
      });
    }

    await cmsFetch("/api/podcast-subscribers", {
      method: "POST",
      body: JSON.stringify({
        data: {
          email,
          ...commonData,
        },
      }),
    });

    const delivery = await sendWelcomeEmail(email);
    const unsubscribeUrl = buildUnsubscribeUrl(email);
    if (!delivery.sent && delivery.error) {
      console.warn(`[podcast-subscribe] ${requestId} welcome email skipped: ${delivery.error}`);
    }

    const message = delivery.sent
      ? "Podcast subscription confirmed. Welcome email sent."
      : delivery.attempted
        ? "Podcast subscription confirmed. We could not deliver the welcome email right now."
        : "Podcast subscription confirmed.";
    return res.status(200).json({
      ok: true,
      message,
      unsubscribeUrl,
      delivery: {
        attempted: delivery.attempted,
        sent: delivery.sent,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`[podcast-subscribe] ${requestId} ${message}`);
    return res.status(500).json({ ok: false, message: "Unable to subscribe at the moment." });
  }
}
