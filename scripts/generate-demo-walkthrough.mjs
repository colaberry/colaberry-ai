#!/usr/bin/env node
/**
 * scripts/generate-demo-walkthrough.mjs
 * ------------------------------------------------------------
 * Walkthrough video generator for /demo/[slug] pages.
 *
 * Two modes:
 *
 *   --mode=tour       (default) Playwright records a scripted scroll through
 *                     the /demo/[slug] detail page on the local Next dev server.
 *                     Output: public/videos/<slug>-walkthrough.mp4
 *
 *   --mode=explainer  Playwright launches Chromium with a Y4M file as the
 *                     fake webcam input, drives the live VTON app through its
 *                     actual flow (face detection → photo mode → SKU cycle),
 *                     and records the product in action.
 *                     Output: public/videos/<slug>-explainer.mp4
 *                     Requires: tmp/fake-camera.y4m (see `prepare-fake-camera.mjs`)
 *
 * Requirements:
 *   - Playwright Chromium installed (`npx playwright install chromium`)
 *   - System `ffmpeg` in PATH (`brew install ffmpeg` on macOS)
 *   - For --mode=tour:      dev server at http://localhost:3000
 *   - For --mode=explainer: internet access to the Cloud Run VTON app
 *                           AND a prepared tmp/fake-camera.y4m (any face
 *                           video converted via `prepare-fake-camera.mjs`)
 *
 * Usage:
 *   # Tour mode (page scroll-through):
 *   node scripts/generate-demo-walkthrough.mjs
 *   node scripts/generate-demo-walkthrough.mjs --slug goggle-vton
 *
 *   # Explainer mode (real product in action):
 *   node scripts/prepare-fake-camera.mjs --input ~/face-clip.mp4
 *   node scripts/generate-demo-walkthrough.mjs --mode=explainer
 *
 *   # Flags:
 *   --slug <slug>                 which demo (default: goggle-vton)
 *   --mode <tour|explainer>       (default: tour)
 *   --host <url>                  dev server host for tour mode
 *   --vton-url <url>              VTON app URL for explainer mode
 *   --camera-file <path>          Y4M fake camera file for explainer mode
 *   --no-titles                   skip title + end cards (raw recording only)
 *   --headed                      run Chromium with UI (debug only)
 */

import { mkdir, rm, stat, writeFile, access } from "node:fs/promises";
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
  // Accept both "--foo=bar" and "--foo bar"
  const eqIdx = args.findIndex((a) => a.startsWith(`${name}=`));
  if (eqIdx !== -1) {
    return args[eqIdx].slice(name.length + 1);
  }
  const idx = args.findIndex((a) => a === name);
  if (idx === -1) return fallback;
  const next = args[idx + 1];
  if (!next || next.startsWith("--")) return true;
  return next;
}

const slug = flag("--slug") || "goggle-vton";
const mode = flag("--mode") || "tour";
const host = flag("--host") || "http://localhost:3000";
const vtonUrl =
  flag("--vton-url") || "https://vton-demo-956818257204.us-east1.run.app";
const cameraFile =
  flag("--camera-file") || join(REPO_ROOT, "tmp", "fake-camera.y4m");
const skipTitles = flag("--no-titles") === true;
const headed = flag("--headed") === true;

if (!["tour", "explainer"].includes(mode)) {
  console.error(`[ERR] Unknown mode "${mode}". Use --mode=tour or --mode=explainer.`);
  process.exit(1);
}

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

const OUTPUT_BASENAME = mode === "explainer" ? `${slug}-explainer` : `${slug}-walkthrough`;
const FINAL_MP4 = join(OUTPUT_DIR, `${OUTPUT_BASENAME}.mp4`);
const POSTER_JPG = join(OUTPUT_DIR, `${OUTPUT_BASENAME}-poster.jpg`);

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

async function ensureVtonReachable() {
  try {
    const res = await fetch(vtonUrl, { redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    throw new Error(
      `VTON app not reachable at ${vtonUrl} — check internet access or override via --vton-url. (${err.message})`
    );
  }
}

async function ensureCameraFile() {
  try {
    await access(cameraFile);
  } catch {
    throw new Error(
      [
        `Fake-camera Y4M file not found at ${cameraFile}.`,
        "Generate one first:",
        "  node scripts/prepare-fake-camera.mjs --input <path/to/any-face-video.mp4>",
        "",
        "Any MP4 / MOV / WEBM with a single front-facing face works (smartphone selfie video, stock clip, etc.).",
      ].join("\n")
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

async function findRawWebm() {
  const { readdir } = await import("node:fs/promises");
  const files = await readdir(RAW_VIDEO_DIR);
  const webm = files.find((f) => f.endsWith(".webm"));
  if (!webm) throw new Error("Playwright did not produce a .webm recording");
  return join(RAW_VIDEO_DIR, webm);
}

// ------------------------------------------------------------ tour mode: scroll through detail page

async function recordTour() {
  logStep(`Recording page tour for /demo/${slug} at ${host}`);

  await rm(RAW_VIDEO_DIR, { recursive: true, force: true });
  await mkdir(RAW_VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: !headed });
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

  await context.addCookies([
    { name: "cb-consent", value: "accepted", url: host },
  ]);

  await page.goto(`${host}/demo/${slug}`, { waitUntil: "networkidle" });

  const acceptBtn = page.getByRole("button", { name: /accept all cookies/i });
  if (await acceptBtn.count()) {
    await acceptBtn.first().click({ trial: false }).catch(() => {});
    await page.waitForTimeout(400);
  }

  // Hero hold
  await page.waitForTimeout(2500);

  // Slow scroll down to metrics band
  await page.evaluate(async () => {
    const target = 680;
    const steps = 60;
    for (let i = 0; i < steps; i++) {
      window.scrollBy(0, target / steps);
      await new Promise((r) => setTimeout(r, 50));
    }
  });
  await page.waitForTimeout(1200);

  const featuresHeading = page.getByRole("heading", { name: /core capabilities/i });
  if (await featuresHeading.count()) {
    await featuresHeading.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
  }

  const techHeading = page.getByRole("heading", { name: /technology stack/i });
  if (await techHeading.count()) {
    await techHeading.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(2800);
  }

  const launchCta = page.getByRole("heading", {
    name: new RegExp(`launch the live ${demo.title}`, "i"),
  });
  if (await launchCta.count()) {
    await launchCta.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(1800);

  await context.close();
  await browser.close();

  const rawWebm = await findRawWebm();
  logStep(`Raw tour recording: ${rawWebm}`);
  return rawWebm;
}

// ------------------------------------------------------------ explainer mode: drive VTON with fake camera

async function recordExplainer() {
  logStep(`Recording product explainer against ${vtonUrl}`);
  logStep(`Fake camera source: ${cameraFile}`);

  await rm(RAW_VIDEO_DIR, { recursive: true, force: true });
  await mkdir(RAW_VIDEO_DIR, { recursive: true });

  // Chromium flags enable a fake media device fed by our Y4M file. This is
  // the only way to give the VTON demo (getUserMedia → MediaPipe) real face
  // frames without attaching an actual webcam.
  const browser = await chromium.launch({
    headless: !headed,
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      `--use-file-for-fake-video-capture=${cameraFile}`,
      // Reduce CPU jitter during recording
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
    ],
  });

  const vtonOrigin = new URL(vtonUrl).origin;
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: RAW_VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
    colorScheme: "dark",
    permissions: ["camera"],
    // Grant camera permission to the VTON origin so getUserMedia resolves
    // without a prompt (the --use-fake-ui flag also suppresses the prompt).
  });
  await context.grantPermissions(["camera"], { origin: vtonOrigin });

  const page = await context.newPage();

  await page.goto(vtonUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });

  // The beats below mirror the VTON LangGraph pipeline documented in
  // Goggle_VTON_Architecture.pdf §6.1:
  //   detect → classify → fit → recommend → render
  //
  // 0) Wait for the React SPA to mount, WASM to load, and MediaPipe to receive
  //    its first frame. Cold Cloud Run starts can take a few seconds.
  logStep("Init: waiting for VTON UI + camera");
  await page
    .waitForFunction(() => document.querySelector("canvas, video") !== null, {
      timeout: 45_000,
    })
    .catch(() => {});
  await page.waitForTimeout(6000);

  // 1) DETECT — live 3D overlay, MediaPipe 478-point face mesh at 30-60 FPS.
  logStep("Beat 1: DETECT — live overlay (5s)");
  await page.waitForTimeout(5000);

  // 2) CLASSIFY — capture a photo so the shape classifier runs on a stable frame.
  logStep("Beat 2: CLASSIFY — photo capture");
  const photoModeBtn = page
    .getByRole("button", { name: /photo mode|guided photo capture/i })
    .or(page.getByText(/^photo mode$/i));
  if (await photoModeBtn.count()) {
    await photoModeBtn.first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);

    const captureBtn = page.getByRole("button", { name: /capture( photo)?/i });
    if (await captureBtn.count()) {
      await captureBtn.first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(3000);
    }
  } else {
    logStep("  photo-mode button not found — holding on current view");
    await page.waitForTimeout(5000);
  }

  // 3) FIT — cycle through 3 SKUs so viewers see trimesh width-scoring variety.
  logStep("Beat 3: FIT — SKU cycle (3 frames)");
  const tryAllBtn = page
    .getByRole("button", { name: /try all frames|all frames/i })
    .or(page.getByText(/try all frames/i));
  if (await tryAllBtn.count()) {
    await tryAllBtn.first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);
  }
  for (let i = 0; i < 3; i++) {
    const tryAnotherBtn = page.getByRole("button", { name: /try another/i });
    if ((await tryAnotherBtn.count()) === 0) break;
    await tryAnotherBtn.first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);
  }

  // 4) RECOMMEND — scroll the LangGraph + GPT-4.1 recommendations into view.
  logStep("Beat 4: RECOMMEND — expert-optician picks (5s)");
  const recsHeading = page
    .getByText(/recommended for you|fit recommendations/i)
    .first();
  if (await recsHeading.count()) {
    await recsHeading.scrollIntoViewIfNeeded().catch(() => {});
  }
  await page.waitForTimeout(5000);

  // 5) RENDER — return to live camera for the closing Three.js + R3F overlay.
  logStep("Beat 5: RENDER — back to live (5s)");
  const liveBtn = page
    .getByRole("button", { name: /^live( mode)?$/i })
    .or(page.getByText(/^live( mode)?$/i));
  if (await liveBtn.count()) {
    await liveBtn.first().click({ force: true }).catch(() => {});
  }
  await page.waitForTimeout(5000);

  await context.close();
  await browser.close();

  const rawWebm = await findRawWebm();
  logStep(`Raw explainer recording: ${rawWebm}`);
  return rawWebm;
}

// ------------------------------------------------------------ ffmpeg: title + end cards

function renderCard(outPath, { kicker, title, subtitle, duration }) {
  const kickerY = 380;
  const titleY = 430;
  const subtitleY = 560;
  const dotX = 660;
  const dotY = 402;

  const filter = [
    `drawbox=x=${dotX}:y=${dotY}:w=14:h=14:color=0xDC2626@1:t=fill`,
    `drawtext=text='${ffText(kicker)}':fontcolor=0xA1A1AA:fontsize=22:x=(w-text_w)/2:y=${kickerY}`,
    `drawtext=text='${ffText(title)}':fontcolor=0xFAFAFA:fontsize=68:x=(w-text_w)/2:y=${titleY}`,
    `drawtext=text='${ffText(subtitle)}':fontcolor=0xA1A1AA:fontsize=26:x=(w-text_w)/2:y=${subtitleY}`,
  ].join(",");

  run("ffmpeg", [
    "-y",
    "-f", "lavfi",
    "-i", `color=c=0x09090B:s=1440x900:d=${duration}:r=30`,
    "-vf", filter,
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-preset", "veryfast",
    "-profile:v", "high",
    "-crf", "20",
    outPath,
  ]);
}

// ------------------------------------------------------------ ffmpeg: normalise raw webm → 1440x900 mp4

async function normaliseRaw(rawWebm) {
  const normalised = join(TMP_DIR, `${OUTPUT_BASENAME}-body.mp4`);
  run("ffmpeg", [
    "-y",
    "-i", rawWebm,
    "-vf",
    "scale=1440:900:force_original_aspect_ratio=decrease,pad=1440:900:(ow-iw)/2:(oh-ih)/2:color=0x09090B,fps=30",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-preset", "veryfast",
    "-profile:v", "high",
    "-crf", "20",
    "-an",
    normalised,
  ]);
  return normalised;
}

// ------------------------------------------------------------ ffmpeg: concat + poster

async function concat(parts) {
  const body = parts.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
  await writeFile(CONCAT_LIST, body, "utf8");
  run("ffmpeg", [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", CONCAT_LIST,
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-preset", "veryfast",
    "-profile:v", "high",
    "-crf", "20",
    "-movflags", "+faststart",
    "-an",
    FINAL_MP4,
  ]);
}

async function extractPoster() {
  run("ffmpeg", [
    "-y",
    "-ss", "0.5",
    "-i", FINAL_MP4,
    "-frames:v", "1",
    "-q:v", "3",
    POSTER_JPG,
  ]);
}

// ------------------------------------------------------------ main

async function main() {
  await ensureFfmpeg();

  if (mode === "tour") {
    await ensureDevServer();
  } else {
    await ensureVtonReachable();
    await ensureCameraFile();
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(TMP_DIR, { recursive: true });

  const rawWebm =
    mode === "explainer" ? await recordExplainer() : await recordTour();
  const body = await normaliseRaw(rawWebm);

  let parts;
  if (skipTitles) {
    parts = [body];
  } else {
    logStep("Rendering title + end cards");
    // Explainer subtitle names the LangGraph pipeline stages so a viewer who
    // drops in mid-clip can map what they see to the architecture doc:
    //   Goggle_VTON_Architecture.pdf section 6.1 — detect -> classify -> fit
    //   -> recommend -> render.
    // ASCII-only separators so ffmpeg's default font always renders them —
    // unicode arrows silently drop glyphs on systems without a wide-coverage
    // fallback font.
    // Tour subtitle just describes what the video is (a page walkthrough).
    const titleSubtitle =
      mode === "explainer"
        ? "Detect > Classify > Fit > Recommend > Render"
        : "A guided walkthrough";
    const endKicker = mode === "explainer" ? "TRY IT YOURSELF" : "TRY IT LIVE";

    renderCard(TITLE_CARD, {
      kicker: demo.category.toUpperCase(),
      title: demo.title,
      subtitle: titleSubtitle,
      duration: 2.6,
    });
    renderCard(END_CARD, {
      kicker: endKicker,
      title: "colaberry.ai",
      subtitle: `/demo/${slug}  //  Launch the live demo now`,
      duration: 2.5,
    });
    parts = [TITLE_CARD, body, END_CARD];
  }

  logStep("Concatenating final MP4");
  await concat(parts);

  logStep("Extracting poster frame");
  await extractPoster();

  const st = await stat(FINAL_MP4);
  const mb = (st.size / (1024 * 1024)).toFixed(2);

  // eslint-disable-next-line no-console
  console.log(
    [
      "",
      "Done.",
      `  Mode   : ${mode}`,
      `  Video  : ${FINAL_MP4}  (${mb} MB)`,
      `  Poster : ${POSTER_JPG}`,
      "",
      "Next: set in src/data/demos.ts:",
      `  videoEmbedUrl: "/videos/${OUTPUT_BASENAME}.mp4",`,
      `  videoPoster:   "/videos/${OUTPUT_BASENAME}-poster.jpg",`,
      "",
    ].join("\n")
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("\n[ERR]", err.message);
  process.exit(1);
});
