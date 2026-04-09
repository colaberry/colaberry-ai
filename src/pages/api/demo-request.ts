import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { resolveSenderProvider, sendNewsletterEmail } from "../../lib/newsletterSender";
import { checkRateLimit, getClientIp } from "../../lib/rate-limit";
import {
  createDemoRequest,
  isDemoRequestStoreConfigured,
  updateDemoRequestDelivery,
  CmsWriteError,
  type CreateDemoRequestInput,
} from "../../lib/demoRequestStore";

type DemoRequestPayload = {
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  teamSize?: string;
  timeline?: string;
  message?: string;
  sourcePage?: string;
  sourcePath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  website?: string;
};

const TO_EMAIL = process.env.DEMO_REQUEST_TO_EMAIL || process.env.NEWSLETTER_REPLY_TO_EMAIL || "info@colaberry.com";
const REQUEST_TIMEOUT_MS = Number(process.env.DEMO_REQUEST_TIMEOUT_MS || 8000);
const MAX_MESSAGE_LENGTH = Number(process.env.DEMO_REQUEST_MAX_MESSAGE || 4000);
const HASH_SALT = process.env.DEMO_REQUEST_HASH_SALT || process.env.NEWSLETTER_HASH_SALT || "colaberry-demo-request";

function hashValue(value: string) {
  return crypto
    .createHash("sha256")
    .update(`${HASH_SALT}:${value}`)
    .digest("hex")
    .slice(0, 24);
}

function normalizeText(value: string | undefined, max = 240) {
  if (!value) return "";
  return String(value).trim().slice(0, max);
}

function normalizeEmail(value: string | undefined) {
  if (!value) return "";
  return String(value).trim().toLowerCase();
}

// nosemgrep: javascript.audit.detect-replaceall-sanitization — complete 5-entity HTML escape, safe for email body context
function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function parsePayload(req: NextApiRequest): DemoRequestPayload | null {
  if (!req.body) return null;
  if (typeof req.body === "object") return req.body as DemoRequestPayload;
  try {
    return JSON.parse(req.body) as DemoRequestPayload;
  } catch {
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return promise;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "Method not allowed." });
  }

  const rl = checkRateLimit("demo-request", getClientIp(req), 10, 60_000);
  if (rl.limited) {
    res.setHeader("Retry-After", String(rl.retryAfterSec));
    res.setHeader("X-RateLimit-Limit", String(rl.limit));
    res.setHeader("X-RateLimit-Remaining", "0");
    return res.status(429).json({ ok: false, message: "Too many requests. Please try again shortly." });
  }

  // Bot defense: block known bots + validate timing token
  const { checkBotDefense } = await import("../../lib/bot-defense");
  const botBlock = checkBotDefense(req);
  if (botBlock) {
    return res.status(403).json({ ok: false, message: botBlock });
  }

  const payload = parsePayload(req);
  if (!payload) {
    return res.status(400).json({ ok: false, message: "Invalid request payload." });
  }

  const email = normalizeEmail(payload.email);
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ ok: false, message: "A valid email is required." });
  }

  // Prevent email header injection
  if (/[\r\n]/.test(email) || /[\r\n]/.test(payload.name || "")) {
    return res.status(400).json({ ok: false, message: "Invalid input." });
  }

  if (payload.website && String(payload.website).trim().length > 0) {
    return res.status(200).json({ ok: true, message: "Thanks! We will be in touch." });
  }

  const name = normalizeText(payload.name, 120);
  const company = normalizeText(payload.company, 160);
  const role = normalizeText(payload.role, 120);
  const teamSize = normalizeText(payload.teamSize, 120);
  const timeline = normalizeText(payload.timeline, 120);
  const message = normalizeText(payload.message, MAX_MESSAGE_LENGTH);
  const sourcePage = normalizeText(payload.sourcePage, 120) || "request-demo";
  const sourcePath = normalizeText(payload.sourcePath, 240);
  const utmSource = normalizeText(payload.utmSource, 140);
  const utmMedium = normalizeText(payload.utmMedium, 140);
  const utmCampaign = normalizeText(payload.utmCampaign, 180);
  const utmTerm = normalizeText(payload.utmTerm, 160);
  const utmContent = normalizeText(payload.utmContent, 160);
  const referrer = normalizeText(payload.referrer, 360);

  const subject = `Demo request${company ? ` — ${company}` : ""}`;
  const htmlName = escapeHtml(name || "Not provided");
  const htmlEmail = escapeHtml(email);
  const htmlCompany = escapeHtml(company || "Not provided");
  const htmlRole = escapeHtml(role || "Not provided");
  const htmlTeamSize = escapeHtml(teamSize || "Not provided");
  const htmlTimeline = escapeHtml(timeline || "Not provided");
  const htmlSourcePage = escapeHtml(sourcePage);
  const htmlSourcePath = escapeHtml(sourcePath || "Unknown");
  const htmlUtmSource = escapeHtml(utmSource || "Not provided");
  const htmlUtmMedium = escapeHtml(utmMedium || "Not provided");
  const htmlUtmCampaign = escapeHtml(utmCampaign || "Not provided");
  const htmlUtmTerm = escapeHtml(utmTerm || "Not provided");
  const htmlUtmContent = escapeHtml(utmContent || "Not provided");
  const htmlReferrer = escapeHtml(referrer || "Not provided");
  const htmlMessage = escapeHtml(message || "No additional notes provided.");
  const detailLines = [
    `Name: ${name || "Not provided"}`,
    `Email: ${email}`,
    `Company: ${company || "Not provided"}`,
    `Role: ${role || "Not provided"}`,
    `Team size: ${teamSize || "Not provided"}`,
    `Timeline: ${timeline || "Not provided"}`,
    `Source page: ${sourcePage}`,
    `Source path: ${sourcePath || "Unknown"}`,
    `UTM source: ${utmSource || "Not provided"}`,
    `UTM medium: ${utmMedium || "Not provided"}`,
    `UTM campaign: ${utmCampaign || "Not provided"}`,
    `UTM term: ${utmTerm || "Not provided"}`,
    `UTM content: ${utmContent || "Not provided"}`,
    `Referrer: ${referrer || "Not provided"}`,
    "",
    "Message:",
    message || "No additional notes provided.",
  ];

  const text = detailLines.join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;">
      <h2 style="margin:0 0 12px;">New demo request</h2>
      <table style="border-collapse:collapse;font-size:14px;line-height:1.5;">
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Name</td><td>${htmlName}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Email</td><td>${htmlEmail}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Company</td><td>${htmlCompany}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Role</td><td>${htmlRole}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Team size</td><td>${htmlTeamSize}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Timeline</td><td>${htmlTimeline}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Source page</td><td>${htmlSourcePage}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Source path</td><td>${htmlSourcePath}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">UTM source</td><td>${htmlUtmSource}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">UTM medium</td><td>${htmlUtmMedium}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">UTM campaign</td><td>${htmlUtmCampaign}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">UTM term</td><td>${htmlUtmTerm}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">UTM content</td><td>${htmlUtmContent}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Referrer</td><td>${htmlReferrer}</td></tr>
      </table>
      <p style="margin:16px 0 4px;font-weight:600;">Message</p>
      <p style="margin:0;">${htmlMessage}</p>
    </div>
  `;

  // Step 1 — persist the lead to Strapi BEFORE attempting email delivery.
  // This makes the lead durable even if the email provider drops the
  // message. If Strapi is unreachable we still continue to the email
  // step (degraded — logged — but user still gets a response).
  const requestId = crypto.randomUUID();
  const ip = getClientIp(req);
  const userAgentHeader = String(req.headers["user-agent"] || "").slice(0, 500);
  const createInput: CreateDemoRequestInput = {
    name,
    email,
    company,
    role,
    teamSize,
    timeline,
    message,
    sourcePage,
    sourcePath,
    requestId,
    ipHash: hashValue(ip),
    userAgentHash: hashValue(userAgentHeader || "unknown"),
    metadata: {
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      referrer,
      userAgent: userAgentHeader,
    },
  };

  let documentId: string | null = null;
  if (isDemoRequestStoreConfigured()) {
    try {
      const record = await createDemoRequest(createInput);
      documentId = record.documentId;
    } catch (error) {
      const message = error instanceof CmsWriteError ? error.message : "unknown CMS error";
      console.error(`[demo-request] ${requestId} CMS write failed: ${message}`);
      // Deliberately swallow — the email path is still attempted so
      // we never fail a user submission because of a CMS outage.
    }
  } else {
    console.warn(`[demo-request] ${requestId} CMS not configured — lead will only be emailed`);
  }

  // Step 2 — attempt email delivery.
  let emailOk = false;
  let emailError: string | null = null;
  const provider = resolveSenderProvider();

  try {
    const delivery = await withTimeout(
      sendNewsletterEmail({
        to: TO_EMAIL,
        subject,
        text,
        html,
        replyTo: email,
      }),
      REQUEST_TIMEOUT_MS
    );

    emailOk = delivery.ok;
    if (!delivery.ok) {
      emailError = delivery.error ?? "unknown delivery error";
      console.error(`[demo-request] ${requestId} send failed: ${emailError}`);
    }
  } catch (error) {
    emailError = error instanceof Error ? error.message : "unknown error";
    console.error(`[demo-request] ${requestId} send threw: ${emailError}`);
  }

  // Step 3 — annotate the CMS record with the delivery outcome so
  // sales-ops can see which leads delivered and which need manual
  // follow-up. Fire-and-forget: never fails the user response.
  if (documentId) {
    try {
      await updateDemoRequestDelivery(documentId, {
        emailDelivered: emailOk,
        emailProvider: provider,
        emailError,
        deliveryAttemptedAt: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof CmsWriteError ? error.message : "unknown CMS error";
      console.error(`[demo-request] ${requestId} delivery-update failed: ${message}`);
    }
  }

  // Always return 200 to the user — the lead is either in Strapi or
  // has been logged. Never leak CMS/email internal state to the client.
  return res.status(200).json({
    ok: true,
    message: emailOk
      ? "Thanks! We will reach out shortly to schedule a demo."
      : "Thanks! Your request was received. We will follow up shortly.",
    delivery: {
      attempted: true,
      sent: emailOk,
      provider,
    },
  });
}
