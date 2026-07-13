#!/usr/bin/env node
/**
 * Generate an RS256 keypair for the shared Colaberry demo-auth JWT.
 *
 * colaberry.ai (the global login) SIGNS session + magic-link tokens with the
 * private key; every demo + the MCP gateway VERIFY with the public key served
 * at /api/auth/jwks.json. Prints both keys as single-line env values (newlines
 * escaped to \n) ready to paste into .env.local (dev) or Secret Manager (prod).
 *
 *   node scripts/gen-auth-keys.mjs >> .env.local
 */
import { generateKeyPairSync } from "node:crypto";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const esc = (pem) => pem.trim().replace(/\n/g, "\\n");
console.log(`AUTH_JWT_PRIVATE_KEY="${esc(privateKey)}"`);
console.log(`AUTH_JWT_PUBLIC_KEY="${esc(publicKey)}"`);
