import { randomUUID } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { JWT_ALG, getPrivateKey, getPublicJwk, getPublicKey } from "./keys";

/**
 * Shared "Colaberry demo" tokens, RS256, issued by colaberry.ai (the global
 * login) and verified by every demo via /api/auth/jwks.json.
 *
 * Two token purposes, one keypair:
 *   - `session`     — 30-day login token. `sub` = the user's email (the lead
 *                     identity). This is what the Voice Agent + gateway verify.
 *   - `magic_link`  — 15-min single-use email token. Carries a `nonce` the
 *                     /verify endpoint burns so a forwarded/leaked link is
 *                     one-shot.
 *
 * iss/aud are stable so the token is identical to what the Voice Agent already
 * accepts (we only swapped the subject from a phone id to the email).
 */

export const JWT_ISSUER = process.env.AUTH_JWT_ISSUER ?? "colaberry-auth";
export const JWT_AUDIENCE = process.env.AUTH_JWT_AUDIENCE ?? "colaberry-demos";
const SESSION_TTL = process.env.AUTH_JWT_TTL ?? "30d";
const MAGIC_LINK_TTL = process.env.AUTH_MAGIC_LINK_TTL ?? "15m";
const HANDOFF_TTL = process.env.AUTH_HANDOFF_TTL ?? "120s";

const PURPOSE_SESSION = "session";
const PURPOSE_MAGIC = "magic_link";

export interface SessionClaims {
  sub: string; // stable id — the lowercased email
  email: string;
}

/** Long-lived shared session token. Every demo verifies this via JWKS. */
export async function signSession(claims: SessionClaims): Promise<string> {
  const { kid } = await getPublicJwk();
  return new SignJWT({ email: claims.email, purpose: PURPOSE_SESSION })
    .setProtectedHeader({ alg: JWT_ALG, kid })
    .setSubject(claims.sub)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(await getPrivateKey());
}

/**
 * Short-lived session token minted only for the cross-origin iframe handoff on
 * /demo/voice. Same purpose + audience the demos already verify, so no enforcer
 * change is needed — but it lives ~2 min instead of 30 days. The demo ingests it
 * within seconds and mints its own session cookie, so a copy scraped from the
 * page (e.g. the __NEXT_DATA__ JSON) is near-worthless. The long-lived session
 * JWT stays in the httpOnly cookie and never reaches page JS.
 */
export async function signHandoff(claims: SessionClaims): Promise<string> {
  const { kid } = await getPublicJwk();
  return new SignJWT({ email: claims.email, purpose: PURPOSE_SESSION })
    .setProtectedHeader({ alg: JWT_ALG, kid })
    .setSubject(claims.sub)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(HANDOFF_TTL)
    .sign(await getPrivateKey());
}

export async function verifySession(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, await getPublicKey(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: [JWT_ALG],
      requiredClaims: ["exp"],
    });
    if (payload.purpose !== PURPOSE_SESSION || !payload.sub) return null;
    return { sub: String(payload.sub), email: String(payload.email ?? "") };
  } catch {
    return null;
  }
}

export interface MagicLinkToken {
  token: string;
  nonce: string;
}

/** Short-TTL, single-use email magic-link token (nonce burned at /verify). */
export async function signMagicLink(email: string): Promise<MagicLinkToken> {
  const nonce = randomUUID().replace(/-/g, "");
  const { kid } = await getPublicJwk();
  const token = await new SignJWT({ email, nonce, purpose: PURPOSE_MAGIC })
    .setProtectedHeader({ alg: JWT_ALG, kid })
    .setSubject(email)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(MAGIC_LINK_TTL)
    .sign(await getPrivateKey());
  return { token, nonce };
}

export async function verifyMagicLink(
  token: string,
): Promise<{ email: string; nonce: string } | null> {
  try {
    const { payload } = await jwtVerify(token, await getPublicKey(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: [JWT_ALG],
      requiredClaims: ["exp"],
    });
    if (payload.purpose !== PURPOSE_MAGIC) return null;
    const email = String(payload.email ?? "").trim().toLowerCase();
    const nonce = String(payload.nonce ?? "");
    if (!email || !nonce) return null;
    return { email, nonce };
  } catch {
    return null;
  }
}
