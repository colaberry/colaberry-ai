import { calculateJwkThumbprint, exportJWK, importPKCS8, importSPKI, type JWK } from "jose";

// jose v6 dropped the `KeyLike` export; infer the concrete key type instead.
type CryptoKeyLike = Awaited<ReturnType<typeof importPKCS8>>;

/**
 * RS256 keypair for the shared Colaberry demo-auth JWT.
 *
 * Asymmetric on purpose: colaberry.ai (the global login / issuer) SIGNS with
 * the private key, and every demo (Voice Agent, VTON, future) + Harsh's MCP
 * gateway VERIFY with the public key fetched from /api/auth/jwks.json — no
 * shared secret ever leaves this app. This is the SAME token format the Voice
 * Agent already verifies (iss=colaberry-auth / aud=colaberry-demos).
 *
 * Env (PEM strings; generate with `node scripts/gen-auth-keys.mjs`):
 *   AUTH_JWT_PRIVATE_KEY  — PKCS8 private key
 *   AUTH_JWT_PUBLIC_KEY   — SPKI public key
 * `\n` escapes are unescaped so the keys survive single-line env vars.
 */

const ALG = "RS256";

function pem(name: string): string | null {
  const v = process.env[name];
  if (!v) return null;
  return v.includes("\\n") ? v.replace(/\\n/g, "\n") : v;
}

export function authConfigured(): boolean {
  return Boolean(pem("AUTH_JWT_PRIVATE_KEY") && pem("AUTH_JWT_PUBLIC_KEY"));
}

let privatePromise: Promise<CryptoKeyLike> | null = null;
let publicPromise: Promise<CryptoKeyLike> | null = null;
let jwkPromise: Promise<JWK & { kid: string }> | null = null;

export function getPrivateKey(): Promise<CryptoKeyLike> {
  const p = pem("AUTH_JWT_PRIVATE_KEY");
  if (!p) throw new Error("AUTH_JWT_PRIVATE_KEY not set");
  if (!privatePromise) privatePromise = importPKCS8(p, ALG);
  return privatePromise;
}

export function getPublicKey(): Promise<CryptoKeyLike> {
  const p = pem("AUTH_JWT_PUBLIC_KEY");
  if (!p) throw new Error("AUTH_JWT_PUBLIC_KEY not set");
  if (!publicPromise) publicPromise = importSPKI(p, ALG);
  return publicPromise;
}

/** Public JWK with a stable RFC-7638 thumbprint `kid`, ready for JWKS. */
export function getPublicJwk(): Promise<JWK & { kid: string }> {
  if (!jwkPromise) {
    jwkPromise = (async () => {
      const jwk = await exportJWK(await getPublicKey());
      const kid = await calculateJwkThumbprint(jwk);
      return { ...jwk, kid, alg: ALG, use: "sig" };
    })();
  }
  return jwkPromise;
}

export { ALG as JWT_ALG };
