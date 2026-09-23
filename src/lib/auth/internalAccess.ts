/**
 * Who may see internal (staff-only) demos.
 *
 * Colaberry staff only, by email domain on the verified session. The email is
 * trustworthy because it comes from `resolveSession()` — a signed session JWT
 * minted only after the user clicked a magic link sent to that address — so it
 * cannot be set by the client.
 *
 * Override the allowlist with INTERNAL_DEMO_EMAIL_DOMAINS (comma-separated).
 */
const DEFAULT_DOMAINS = ["colaberry.com"];

export function internalDemoDomains(): string[] {
  const raw = (process.env.INTERNAL_DEMO_EMAIL_DOMAINS ?? "").trim();
  if (!raw) return DEFAULT_DOMAINS;
  const parsed = raw
    .split(",")
    .map((d) => d.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_DOMAINS;
}

/**
 * Compare the domain exactly, after the LAST "@". Matching on a suffix instead
 * would let notcolaberry.com through, and splitting on the first "@" would let
 * "a@evil.com@colaberry.com"-shaped input through.
 */
export function isInternalDemoViewer(email: string | null | undefined): boolean {
  if (!email) return false;
  const at = email.lastIndexOf("@");
  if (at < 0 || at === email.length - 1) return false;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return internalDemoDomains().includes(domain);
}
