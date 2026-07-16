/**
 * Magic-link email delivery for the global login.
 *
 * Reuses the org's Resend setup (`RESEND_API_KEY`, same provider as
 * newsletterSender.ts). Falls back to `console` in dev — the link is printed to
 * the server log so the whole flow is testable with zero external deps (mirrors
 * the Voice Agent's console OTP provider). The token only ever rides the
 * delivery call; it is never stored.
 */

const RESEND_API_KEY = (process.env.RESEND_API_KEY || "").trim();
const FROM = process.env.AUTH_EMAIL_FROM || "Colaberry AI <login@colaberry.ai>";
const PROVIDER = (
  process.env.AUTH_EMAIL_PROVIDER || (RESEND_API_KEY ? "resend" : "console")
).toLowerCase();

export interface EmailSendResult {
  ok: boolean;
  provider: string;
  error?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtml(link: string): string {
  const safeLink = escapeHtml(link);
  return `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="440" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e4e4e7;border-radius:14px;padding:32px">
        <tr><td style="font-size:18px;font-weight:700;color:#18181b;padding-bottom:8px">Sign in to Colaberry AI</td></tr>
        <tr><td style="font-size:14px;color:#52525b;line-height:1.55;padding-bottom:22px">Click the button below to sign in. This link expires in 15 minutes and can be used once.</td></tr>
        <tr><td><a href="${safeLink}" style="display:inline-block;background:#DC2626;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:9px">Sign in →</a></td></tr>
        <tr><td style="font-size:12px;color:#a1a1aa;line-height:1.5;padding-top:22px">If the button doesn't work, paste this link into your browser:<br><span style="color:#71717a;word-break:break-all">${safeLink}</span></td></tr>
        <tr><td style="font-size:12px;color:#a1a1aa;padding-top:18px">If you didn't request this, you can safely ignore this email.</td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

function renderText(link: string): string {
  return `Sign in to Colaberry AI:\n\n${link}\n\nThis link expires in 15 minutes and can be used once. If you didn't request it, ignore this email.`;
}

export async function sendMagicLinkEmail(email: string, link: string): Promise<EmailSendResult> {
  // Console provider is DEV-ONLY. Never print the live magic-link token to logs
  // in production: Cloud Run stdout is broadly readable, and a logged token can
  // be replayed to /api/auth/verify within its 15-min TTL to mint a session.
  if (PROVIDER === "console") {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[auth:email] AUTH_EMAIL_PROVIDER=console in production — refusing to log the magic-link token. Set RESEND_API_KEY.",
      );
      return { ok: false, provider: "console", error: "console_provider_in_prod" };
    }
    console.info(`[auth:console] magic link for ${email} -> ${link} (dev only)`);
    return { ok: true, provider: "console" };
  }
  // Resend selected but the key is missing → fail loud rather than fall back to
  // logging the token (the old `|| !RESEND_API_KEY` path did exactly that).
  if (!RESEND_API_KEY) {
    console.error("[auth:email] RESEND_API_KEY not set — cannot send magic-link email.");
    return { ok: false, provider: "none", error: "email_not_configured" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: "Your Colaberry AI sign-in link",
        html: renderHtml(link),
        text: renderText(link),
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, provider: "resend", error: `resend ${res.status}: ${detail.slice(0, 200)}` };
    }
    return { ok: true, provider: "resend" };
  } catch (e) {
    return { ok: false, provider: "resend", error: e instanceof Error ? e.message : "send failed" };
  }
}
