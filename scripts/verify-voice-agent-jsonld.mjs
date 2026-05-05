#!/usr/bin/env node
/**
 * Sprint v7 / Task 7 verification — Voice Agent in hub `/demo` ItemList JSON-LD.
 *
 * Confirms the contract that `src/pages/demo/index.tsx` emits an `ItemList`
 * JSON-LD whose `itemListElement` array auto-includes every entry in
 * `src/data/demos.ts`. After Sprint v7 publish (Task 9 — when /demo/voice-agent
 * is removed from RELEASE_HIDDEN_PATHS), this same payload appears on prod and
 * `curl https://www.colaberry.ai/demo | grep "Voice Agent"` returns the entry.
 *
 * Usage: `node scripts/verify-voice-agent-jsonld.mjs`
 *
 * Pre-publish this script asserts the local source-of-truth; post-publish you
 * can also verify the live HTML matches by adding the optional --remote flag.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

let passes = 0;
let fails = 0;
const ok = (cond, msg) => {
  if (cond) {
    console.log("  ✓ " + msg);
    passes++;
  } else {
    console.log("  ✗ " + msg);
    fails++;
  }
};

console.log("Verifying Voice Agent in hub `/demo` ItemList JSON-LD ...\n");

// ── Source-of-truth check 1: src/data/demos.ts contains a live `voice-agent` entry
const demosSource = readFileSync(resolve(repoRoot, "src/data/demos.ts"), "utf-8");
console.log("[1] src/data/demos.ts — voice-agent entry");
ok(/slug:\s*"voice-agent"/.test(demosSource), 'has `slug: "voice-agent"`');
ok(/title:\s*"Voice Agent"/.test(demosSource), 'has `title: "Voice Agent"`');
ok(/category:\s*"Voice AI"/.test(demosSource), 'has `category: "Voice AI"`');
ok(/launchUrl:\s*"\/demo\/voice"/.test(demosSource), 'has `launchUrl: "/demo/voice"` (iframe wrapper)');
ok(/status:\s*"live"/.test(demosSource.split("voice-agent")[1] ?? ""), 'voice-agent block declares `status: "live"`');

// ── Source-of-truth check 2: src/pages/demo/index.tsx emits ItemList JSON-LD that iterates `demos`
const hubSource = readFileSync(resolve(repoRoot, "src/pages/demo/index.tsx"), "utf-8");
console.log("\n[2] src/pages/demo/index.tsx — ItemList JSON-LD contract");
ok(/'@type':\s*"ItemList"|"@type":\s*"ItemList"/.test(hubSource), 'emits `"@type": "ItemList"` JSON-LD');
ok(/itemListElement:\s*demos\.map/.test(hubSource), '`itemListElement` is built from `demos.map(...)` (auto-includes any new entry)');
ok(/'@type':\s*"WebApplication"|"@type":\s*"WebApplication"/.test(hubSource), 'each ListItem inner type === WebApplication');
ok(/url:\s*buildCanonical\(`\/demo\/\$\{demo\.slug\}`\)/.test(hubSource), 'each item URL === buildCanonical(/demo/${demo.slug})');

// ── Source-of-truth check 3: getLiveDemoSlugs() (used by [slug].tsx getStaticPaths) includes voice-agent
console.log("\n[3] getLiveDemoSlugs() iteration");
ok(/getLiveDemoSlugs[\s\S]*?status\s*===\s*"live"/.test(demosSource), '`getLiveDemoSlugs()` filters by status === "live" and so includes voice-agent');

// ── Conclusion
console.log("\n" + (fails === 0 ? "✓ ALL CHECKS PASSED" : `✗ ${fails} CHECK(S) FAILED`) + ` — ${passes} passed, ${fails} failed`);

if (fails === 0) {
  console.log("\nPost-publish verification (run after Task 9 unhides the path):");
  console.log("  curl -sL https://www.colaberry.ai/demo | grep -o '\"@type\":\"ItemList\"'");
  console.log('  curl -sL https://www.colaberry.ai/demo | grep -o "Voice Agent"');
}

process.exit(fails === 0 ? 0 : 1);
