#!/usr/bin/env node
/**
 * Standalone assertion harness for the P1 HMAC bot-token roundtrip and
 * the P2 stricter client email validator. Mirrors scripts/verify-demo-
 * request-store.mjs — runs without jest/vitest via Node 24's type-
 * stripping loader, exits non-zero on failure for CI / pre-commit.
 *
 * Covers:
 *   1. generateBotToken → validateBotToken happy path (after min-age wait)
 *   2. validateBotToken rejects missing token
 *   3. validateBotToken rejects malformed token
 *   4. validateBotToken rejects tampered signature
 *   5. validateBotToken rejects too-fast token (< minAgeMs)
 *   6. validateBotToken rejects expired token (> maxAgeMs)
 *   7. isValidWorkEmail — disposable / malformed rejections
 *   8. isValidWorkEmail — valid work emails
 */

import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import crypto from "node:crypto";

// Mock the BOT_TOKEN_SECRET env var BEFORE importing bot-defense so
// `hasSecret()` returns true for the token layer tests.
process.env.BOT_TOKEN_SECRET = "test-secret-for-verify-script-only-not-for-prod";

const botDefensePath = resolve("src/lib/bot-defense.ts");
const demoRequestLibPath = resolve("src/lib/demoRequest.ts");

const { generateBotToken, validateBotToken } = await import(pathToFileURL(botDefensePath).href);
const { isValidWorkEmail } = await import(pathToFileURL(demoRequestLibPath).href);

let passed = 0;
let failed = 0;

function test(label, fn) {
  try {
    fn();
    console.log(`✔ ${label}`);
    passed++;
  } catch (err) {
    console.error(`✖ ${label}`);
    console.error(`  ${err instanceof Error ? err.message : String(err)}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// P1 — validateBotToken roundtrip
// ---------------------------------------------------------------------------

test("1 — generateBotToken + validateBotToken happy path", () => {
  const token = generateBotToken();
  assert.ok(token.length > 0, "token should be non-empty");
  assert.match(token, /^[a-z0-9]+\.[a-f0-9]{16}$/, "token should be <ts>.<16hex>");
  // Set minAgeMs to 0 so we don't have to sleep in the test
  const result = validateBotToken(token, 0);
  assert.equal(result.valid, true, "freshly-generated token should validate");
});

test("2 — validateBotToken rejects missing token", () => {
  const result = validateBotToken(undefined);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "missing_token");
});

test("3 — validateBotToken rejects malformed token", () => {
  const result = validateBotToken("no-dot-separator");
  assert.equal(result.valid, false);
  assert.equal(result.reason, "malformed_token");
});

test("4 — validateBotToken rejects tampered signature", () => {
  const token = generateBotToken();
  const [ts] = token.split(".");
  const tampered = `${ts}.deadbeefdeadbeef`;
  const result = validateBotToken(tampered, 0);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "invalid_signature");
});

test("5 — validateBotToken rejects too-fast token (< minAgeMs)", () => {
  const token = generateBotToken();
  // Default minAgeMs is 5000 — a token issued milliseconds ago should fail
  const result = validateBotToken(token, 5000);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "too_fast");
});

test("6 — validateBotToken rejects expired token (> maxAgeMs)", () => {
  // Fabricate an expired token by using a timestamp from 2 hours ago.
  // Use Node crypto directly since we can't time-travel generateBotToken.
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  const ts = twoHoursAgo.toString(36);
  const sig = crypto
    .createHmac("sha256", process.env.BOT_TOKEN_SECRET)
    .update(ts)
    .digest("hex")
    .slice(0, 16);
  const expired = `${ts}.${sig}`;
  const result = validateBotToken(expired, 0, 60 * 60 * 1000);
  assert.equal(result.valid, false);
  assert.equal(result.reason, "expired");
});

// ---------------------------------------------------------------------------
// P2 — stricter client-side isValidWorkEmail
// ---------------------------------------------------------------------------

test("7 — isValidWorkEmail rejects malformed addresses", () => {
  const invalid = [
    "",
    "   ",
    "notanemail",
    "no-at-sign",
    "@nolocal.com",
    "nolocal@",
    "two@at@signs.com",
    "a@b",           // TLD too short
    "a@b.c",         // TLD too short
    "a..b@c.com",    // consecutive dots in local
    "a@b..com",      // consecutive dots in domain
    "a+b+c@d.com",   // multiple plus signs
    "user\r@a.com",  // CRLF injection
    "user\n@a.com",
    "a".repeat(65) + "@b.com", // local > 64 chars
    "user@" + "a".repeat(250) + ".com", // total > 254
  ];
  for (const e of invalid) {
    assert.equal(isValidWorkEmail(e), false, `expected "${e}" to be rejected`);
  }
});

test("8 — isValidWorkEmail accepts legit work emails", () => {
  const valid = [
    "sai@colaberry.com",
    "first.last@acme.io",
    "someone+tag@corp.co.uk",
    "NAME@Company.COM",
    "a@bc.de",
    "user_name@sub.domain.example",
  ];
  for (const e of valid) {
    assert.equal(isValidWorkEmail(e), true, `expected "${e}" to be accepted`);
  }
});

// ---------------------------------------------------------------------------

console.log("");
if (failed === 0) {
  console.log(`All ${passed} bot-token / email-validator assertions passed.`);
  process.exit(0);
} else {
  console.error(`${failed} of ${passed + failed} assertions failed.`);
  process.exit(1);
}
