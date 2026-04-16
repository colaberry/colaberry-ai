#!/usr/bin/env node
/**
 * scripts/generate-demo-walkthrough.mjs
 * ------------------------------------------------------------
 * Automated walkthrough video generator for /demo/[slug] pages.
 *
 * Uses Playwright to record a scripted tour (scroll + pauses on the hero,
 * metrics, features, tech stack, and live-demo launch), then stitches a
 * branded title card + end card with ffmpeg. Output drops into
 * `public/videos/<slug>-walkthrough.mp4` and the accompanying poster frame
 * at `public/videos/<slug>-walkthrough-poster.jpg`.
 *
 * Karun: run `node scripts/generate-demo-walkthrough.mjs --slug goggle-vton`
 * with `npm run dev` already running. Re-run anytime the demo content
 * changes; output is deterministic.
 *
 * Requirements:
 *   - Playwright Chromium installed (`npx playwright install chromium`)
 *   - System `ffmpeg` in PATH (brew install ffmpeg)
 *   - Dev server reachable at http://localhost:3000
 *
 * Usage:
 *   node scripts/generate-demo-walkthrough.mjs                 # goggle-vton
 *   node scripts/generate-demo-walkthrough.mjs --slug <slug>   # any live demo
 *   node scripts/generate-demo-walkthrough.mjs --host http://localhost:3001
 *   node scripts/generate-demo-walkthrough.mjs --no-titles     # raw tour only
 */

import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, execFileSync } from "node:child_process";

import { chromium } from "playwright";

import { demos, getDemoBySlug } from "../src/data/demos.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "..");

// ------------------------------------------------------------ CLI args

const args = process.argv.slice(2);
function flag(name, fallback = null) {
  const idx = args.findIndex((a) => a === name);
  if (idx === -1) return fallback;
  const next = args[idx + 1];
  if (!next || next.startsWith("--")) return true;
  return next;
}

const slug = flag("--slug") || "goggle-vton";
const host = flag("--host") || "http://localhost:3000";
const skipTitles = flag("--no-titles") === true;

const demo = getDemoBySlug(slug);
if (!demo) {
  console.error(
    `[ERR] Unknown demo slug "${slug}". Live demos: ${demos
      .filter((d) => d.status === "live")
      .map((d) => d.slug)
      .join(", ")}`
  );
  process.exit(1);
}

// ------------------------------------------------------------ paths

const OUTPUT_DIR = join(REPO_ROOT, "public", "videos");
const TMP_DIR = join(REPO_ROOT, "tmp", "walkthrough-recorder");
const RAW_VIDEO_DIR = join(TMP_DIR, "raw");
const TITLE_CARD = join(TMP_DIR, "title.mp4");
const END_CARD = join(TMP_DIR, "end.mp4");
const CONCAT_LIST = join(TMP_DIR, "concat.txt");
const FINAL_MP4 = join(OUTPUT_DIR, `${slug}-walkthrough.mp4`);
const POSTER_JPG = join(OUTPUT_DIR, `${slug}-walkthrough-poster.jpg`);

// ------------------------------------------------------------ helpers

function logStep(...msgs) {
  // eslint-disable-next-line no-console
  console.log("•", ...msgs);
}

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, {
    stdio: opts.silent ? ["ignore", "pipe", "pipe"] : "inherit",
    ...opts,
  });
  if (res.status !== 0) {
    const detail = opts.silent
      ? `\nstdout:\n${res.stdout?.toString() || ""}\nstderr:\n${res.stderr?.toString() || ""}`
      : "";
    throw new Error(`Command failed: ${cmd} ${args.join(" ")}${detail}`);
  }
  return res;
}

async function ensureFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
  } catch {
    throw new Error(
      "ffmpeg not found in PATH. Install via `brew install ffmpeg` (macOS)."
    );
  }
}

async function ensureDevServer() {
  try {
    const res = await fetch(`${host}/demo/${slug}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    throw new Error(
      `Dev server not reachable at ${host}/demo/${slug} — start it with \`npm run dev\` first. (${err.message})`
    );
  }
}

// Escape single quotes for ffmpeg drawtext
function ffText(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'");
}

// ------------------------------------------------------------ 1) record tour

async function recordTour() {
  logStep(`Recording page tour for /demo/${slug} at ${host}`);

  await rm(RAW_VIDEO_DIR, { recursive: true, force: true });
  await mkdir(RAW_VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: RAW_VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
    colorScheme: "dark",
  });
  const page = await context.newPage();

  // Suppress cookie banner via cookie (site respects a "cb-consent" cookie)
  // — if that cookie name differs, the banner remains but the recording
  // continues past it; the scripted scroll scrolls beyond it.
  await context.addCookies([
    {
      name: "cb-consent",
      value: "accepted",
      url: host,
    },
  ]);

  await page.goto(`${host}/demo/${slug}`, { waitUntil: "networkidle" });

  // Try to click through any cookie banner that did appear, idempotent.
  const acceptBtn = page.getByRole("button", { name: /accept all cookies/i });
  if (await acceptBtn.count()) {
    await acceptBtn.first().click({ trial: false }).catch(() => {});
    await page.waitForTimeout(400);
  }

  // 1) Hero hold — 2.5s
  await page.waitForTimeout(2500);

  // 2) Slow scroll down to metrics band — ~3s
  await page.evaluate(async () => {
    const target = 680;
    const steps = 60;
    for (let i = 0; i < steps; i++) {
      window.scrollBy(0, target / steps);
      await new Promise((r) => setTimeout(r, 50));
    }
  });
  await page.waitForTimeout(1200);

  // 3) Scroll to "Core capabilities" — 3s
  const featuresHeading = page.getByRole("heading", {
    name: /core capabilities/i,
  });
  if (await featuresHeading.count()) {
    await featuresHeading.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
  }

  // 4) Scroll to "Technology stack" — 3s
  const techHeading = page.getByRole("heading", { name: /technology stack/i });
  if (await techHeading.count()) {
    await techHeading.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(2800);
  }

  // 5) Scroll to Launch CTA — 2.5s
  const launchCta = page.getByRole("heading", {
    name: new RegExp(`launch the live ${demo.title}`, "i"),
  });
  if (await launchCta.count()) {
    await launchCta.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
  }

  // 6) Scroll back to top to end on the hero — 1.5s
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(1800);

  // Close context to flush recording
  await context.close();
  await browser.close();

  // Playwright writes the video as `<page-guid>.webm`. Find it.
  const { readdir } = await import("node:fs/promises");
  const files = await readdir(RAW_VIDEO_DIR);
  const webm = files.find((f) => f.endsWith(".webm"));
  if (!webm) {
    throw new Error("Playwright did not produce a .webm recording");
  }
  const rawWebm = join(RAW_VIDEO_DIR, webm);
  logStep(`Raw recording: ${rawWebm}`);
  return rawWebm;
}

// ------------------------------------------------------------ 2) title + end cards

function renderCard(outPath, { kicker, title, subtitle, duration }) {
  // 1440x900 H.264 card, zinc-950 background, coral dot, Inter-ish stack.
  // We use ffmpeg lavfi color source + drawtext — fonts resolve to system
  // fallback (Helvetica / Arial). No font file shipped = zero friction.
  const kickerY = 380;
  const titleY = 430;
  const subtitleY = 560;
  const dotX = 660;
  const dotY = 402;

  const filter = [
    // coral accent dot
    `drawbox=x=${dotX}:y=${dotY}:w=14:h=14:color=0xDC2626@1:t=fill`,
    `drawtext=text='${ffText(kicker)}':fontcolor=0xA1A1AA:fontsize=22:x=(w-text_w)/2:y=${kickerY}`,
    `drawtext=text='${ffText(title)}':fontcolor=0xFAFAFA:fontsize=68:x=(w-text_w)/2:y=${titleY}`,
    `drawtext=text='${ffText(subtitle)}':fontcolor=0xA1A1AA:fontsize=26:x=(w-text_w)/2:y=${subtitleY}`,
  ].join(",");

  run("ffmpeg", [
    "-y",
    "-f",
    "lavfi",
    "-i",
    `color=c=0x09090B:s=1440x900:d=${duration}:r=30`,
    "-vf",
    filter,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "veryfast",
    "-profile:v",
    "high",
    "-crf",
    "20",
    outPath,
  ]);
}

// ------------------------------------------------------------ 3) normalise tour

async function normaliseTour(rawWebm) {
  const normalised = join(TMP_DIR, "tour.mp4");
  run("ffmpeg", [
    "-y",
    "-i",
    rawWebm,
    "-vf",
    "scale=1440:900:force_original_aspect_ratio=decrease,pad=1440:900:(ow-iw)/2:(oh-ih)/2:color=0x09090B,fps=30",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "veryfast",
    "-profile:v",
    "high",
    "-crf",
    "20",
    "-an",
    normalised,
  ]);
  return normalised;
}

// ------------------------------------------------------------ 4) concat

async function concat(parts) {
  const body = parts.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
  await writeFile(CONCAT_LIST, body, "utf8");
  run("ffmpeg", [
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    CONCAT_LIST,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "veryfast",
    "-profile:v",
    "high",
    "-crf",
    "20",
    "-movflags",
    "+faststart",
    "-an",
    FINAL_MP4,
  ]);
}

// ------------------------------------------------------------ 5) poster

async function extractPoster() {
  run("ffmpeg", [
    "-y",
    "-ss",
    "0.5",
    "-i",
    FINAL_MP4,
    "-frames:v",
    "1",
    "-q:v",
    "3",
    POSTER_JPG,
  ]);
}

// ------------------------------------------------------------ main

async function main() {
  await ensureFfmpeg();
  await ensureDevServer();
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(TMP_DIR, { recursive: true });

  const rawWebm = await recordTour();
  const tourMp4 = await normaliseTour(rawWebm);

  let parts;
  if (skipTitles) {
    parts = [tourMp4];
  } else {
    logStep("Rendering title + end cards");
    renderCard(TITLE_CARD, {
      kicker: demo.category.toUpperCase(),
      title: demo.title,
      subtitle: "A guided walkthrough · Colaberry AI",
      duration: 2.2,
    });
    renderCard(END_CARD, {
      kicker: "TRY IT LIVE",
      title: "colaberry.ai",
      subtitle: `/demo/${slug}  ·  Launch the live demo now`,
      duration: 2.5,
    });
    parts = [TITLE_CARD, tourMp4, END_CARD];
  }

  logStep("Concatenating final MP4");
  await concat(parts);

  logStep("Extracting poster frame");
  await extractPoster();

  // File size
  const st = await stat(FINAL_MP4);
  const mb = (st.size / (1024 * 1024)).toFixed(2);

  // eslint-disable-next-line no-console
  console.log(
    [
      "",
      "Done.",
      `  Video  : ${FINAL_MP4}  (${mb} MB)`,
      `  Poster : ${POSTER_JPG}`,
      "",
      "Next: set in src/data/demos.ts:",
      `  videoEmbedUrl: "/videos/${slug}-walkthrough.mp4",`,
      `  videoPoster:   "/videos/${slug}-walkthrough-poster.jpg",`,
      "",
    ].join("\n")
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("\n[ERR]", err.message);
  process.exit(1);
});
