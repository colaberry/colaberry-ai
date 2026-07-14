/**
 * Lead capture — writes a verified email to the Strapi `Lead` collection on
 * every magic-link verify. Lead capture is the whole point of the login, so a
 * failed write is logged (never silently dropped) but does NOT block sign-in:
 * the user proved the email by clicking the link, so we don't punish them for a
 * transient CMS hiccup.
 *
 * Reuses the same `CMS_API_TOKEN` bearer pattern as demoRequestStore.ts.
 * The Strapi `Lead` content type (create it in colaberry-ai-cms):
 *   email (string, required) · source (string) · ipHash (string) · userAgent (string)
 */

const CMS_URL = (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || "")
  .trim()
  .replace(/\/$/, "");
const CMS_API_TOKEN = (process.env.CMS_API_TOKEN || "").trim();
const CMS_TIMEOUT_MS = Number(process.env.LEAD_CMS_TIMEOUT_MS || 6000);

export interface LeadInput {
  readonly email: string;
  readonly source: string; // e.g. "voice-agent" | "global-login"
  readonly ipHash: string; // SHA-256-truncated, never raw IP
  readonly userAgent: string;
}

export interface LeadResult {
  readonly ok: boolean;
  readonly documentId?: string;
  readonly error?: string;
}

function isConfigured(): boolean {
  return (
    CMS_URL.length > 0 && /^https?:\/\//i.test(CMS_URL) && CMS_API_TOKEN.length > 0
  );
}

interface StrapiLeadResponse {
  readonly data?: { readonly documentId?: string };
}

/**
 * Best-effort persist of a verified email lead. Never throws — returns
 * { ok:false } and logs on any failure so the caller can still complete login.
 */
export async function captureLead(input: LeadInput): Promise<LeadResult> {
  if (!isConfigured()) {
    // eslint-disable-next-line no-console
    console.info(`[auth:lead] CMS not configured — lead ${input.email} not persisted`);
    return { ok: false, error: "cms_not_configured" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CMS_TIMEOUT_MS);
  try {
    const res = await fetch(`${CMS_URL}/api/leads`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CMS_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          email: input.email,
          source: input.source || "global-login",
          ipHash: input.ipHash || null,
          userAgent: input.userAgent || null,
        },
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.warn(`[auth:lead] Strapi ${res.status}: ${detail.slice(0, 200)}`);
      return { ok: false, error: `strapi_${res.status}` };
    }
    const body = (await res.json().catch(() => ({}))) as StrapiLeadResponse;
    return { ok: true, documentId: body.data?.documentId };
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    // eslint-disable-next-line no-console
    console.warn(`[auth:lead] write failed: ${message}`);
    return { ok: false, error: message };
  } finally {
    clearTimeout(timer);
  }
}
