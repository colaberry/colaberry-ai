#!/usr/bin/env node
/**
 * uiux-home-shot.mjs — render-verification for the homepage UI/UX revamp.
 *
 * Captures the homepage full-page in LIGHT and DARK across the four review
 * breakpoints (1280 / 1024 / 768 / 375). Output lands in a label dir so we can
 * diff "before" vs "after".
 *
 *   node scripts/uiux-home-shot.mjs --label=before --base=http://localhost:3000
 *   node scripts/uiux-home-shot.mjs --label=after
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);

const BASE = args.base || "http://localhost:3000";
const LABEL = String(args.label || "shot");
const PATHNAME = args.path || "/";
const OUT = path.join(ROOT, ".uiux-review", LABEL);

const BREAKPOINTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "laptop", width: 1024, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];

async function setMode(page, mode) {
  await page.evaluate((m) => {
    const root = document.documentElement;
    if (m === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try { localStorage.setItem("theme", m); } catch {}
  }, mode);
  await page.waitForTimeout(450);
}

async function settle(page) {
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
}

(async () => {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const saved = [];
  for (const bp of BREAKPOINTS) {
    const context = await browser.newContext({
      viewport: { width: bp.width, height: bp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const url = `${BASE}${PATHNAME}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1200);
    for (const mode of ["light", "dark"]) {
      await setMode(page, mode);
      await settle(page);
      const file = path.join(OUT, `home-${bp.name}-${mode}.png`);
      await page.screenshot({ path: file, type: "png", fullPage: true });
      saved.push(path.relative(ROOT, file));
      console.log(`  ✓ ${path.relative(ROOT, file)}`);
    }
    await context.close();
  }
  await browser.close();
  console.log(`\n✅ ${saved.length} screenshots → ${path.relative(ROOT, OUT)}`);
})();
