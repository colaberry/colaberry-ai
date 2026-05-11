#!/usr/bin/env node
/**
 * scripts/aeo-benchmark.mjs
 * ──────────────────────────────────────────────────────────────────────
 * Weekly AEO indexability audit for www.colaberry.ai vs. 6 direct
 * competitors (Hugging Face, Replicate, Modal, Together, Ollama,
 * LangChain). Produces a 7-row scorecard out of 16 points across six
 * weighted dimensions:
 *
 *   1. AI-bot allowlist in robots.txt          (2.0 each)
 *   2. /llms.txt presence                       (1.5)
 *   3. /llms-full.txt presence                  (1.5)
 *   4. Schema.org JSON-LD on homepage           (2.0)
 *   5. TechArticle JSON-LD on a deep page       (1.5)
 *   6. Sitemap depth ≥ 100 URLs                 (1.5)
 *
 * Output: docs/aeo-benchmarks/<ISO-WEEK>.md
 *
 * Run locally:   node scripts/aeo-benchmark.mjs
 * Run via CI:    .github/workflows/aeo-benchmark.yml  (Mondays 04:00 UTC)
 */

import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(REPO_ROOT, "docs/aeo-benchmarks");

// ────────────────────────────────────────────────────────────────────
// Site config — primary site + competitors, with deep-page URLs that
// should carry TechArticle / ItemList JSON-LD when present
// ────────────────────────────────────────────────────────────────────

const SITES = [
  {
    host: "www.colaberry.ai",
    deep: "/aixcelerator/llm-architectures/llama-3-2-3b", // TechArticle test
    label: "colaberry.ai",
    isPrimary: true,
  },
  { host: "huggingface.co", deep: "/models", label: "huggingface.co" },
  { host: "replicate.com",  deep: "/explore", label: "replicate.com" },
  { host: "modal.com",      deep: "/docs",   label: "modal.com" },
  { host: "together.ai",    deep: "/models", label: "together.ai" },
  { host: "ollama.com",     deep: "/library", label: "ollama.com" },
  { host: "langchain.com",  deep: "/products", label: "langchain.com" },
];

const AI_BOTS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"];

const WEIGHTS = {
  robots_ai: 2.0,    // each of the 4 bots in robots.txt = +0.5
  llms_txt: 1.5,
  llms_full: 1.5,
  schema_home: 2.0,
  schema_deep: 1.5,
  sitemap_depth: 1.5,
};
const MAX_TOTAL = Object.values(WEIGHTS).reduce((a, b) => a + b, 0); // 10

// ────────────────────────────────────────────────────────────────────
// Audit one site
// ────────────────────────────────────────────────────────────────────

async function fetchText(url, ua = "Mozilla/5.0 (compatible; AEO-Benchmark/1.0)") {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { headers: { "User-Agent": ua }, signal: ctrl.signal, redirect: "follow" });
    clearTimeout(t);
    return { status: res.status, text: await res.text() };
  } catch {
    return { status: 0, text: "" };
  }
}

async function fetchHead(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { method: "HEAD", signal: ctrl.signal, redirect: "follow" });
    clearTimeout(t);
    return res.status;
  } catch {
    return 0;
  }
}

async function auditSite(site) {
  const base = `https://${site.host}`;
  const out = { ...site };

  // 1. robots.txt — count AI bots explicitly allowlisted
  const robots = await fetchText(`${base}/robots.txt`);
  out.bots_listed = AI_BOTS.filter((b) =>
    new RegExp(`User-agent:\\s*${b}\\b`, "i").test(robots.text)
  );
  out.score_robots = (out.bots_listed.length / AI_BOTS.length) * WEIGHTS.robots_ai;

  // 2. /llms.txt
  const llms = await fetchHead(`${base}/llms.txt`);
  out.has_llms_txt = llms === 200;
  out.score_llms = out.has_llms_txt ? WEIGHTS.llms_txt : 0;

  // 3. /llms-full.txt
  const llmsFull = await fetchHead(`${base}/llms-full.txt`);
  out.has_llms_full = llmsFull === 200;
  out.score_llms_full = out.has_llms_full ? WEIGHTS.llms_full : 0;

  // 4. Homepage Schema.org JSON-LD
  const home = await fetchText(`${base}/`);
  const homeTypes = [...new Set([...home.text.matchAll(/"@type"\s*:\s*"([A-Za-z]+)"/g)].map((m) => m[1]))];
  out.schema_home_types = homeTypes;
  out.score_schema_home = homeTypes.length > 0 ? WEIGHTS.schema_home : 0;

  // 5. Deep page (TechArticle / ItemList / etc.)
  const deep = await fetchText(`${base}${site.deep}`);
  const deepTypes = [...new Set([...deep.text.matchAll(/"@type"\s*:\s*"([A-Za-z]+)"/g)].map((m) => m[1]))];
  out.schema_deep_types = deepTypes;
  out.score_schema_deep = deepTypes.length > 0 ? WEIGHTS.schema_deep : 0;

  // 6. Sitemap URL count
  const sitemap = await fetchText(`${base}/sitemap.xml`);
  out.sitemap_urls = (sitemap.text.match(/<loc>[^<]+<\/loc>/g) || []).length;
  out.score_sitemap = out.sitemap_urls >= 100 ? WEIGHTS.sitemap_depth : 0;

  // Total
  out.total = +(
    out.score_robots +
    out.score_llms +
    out.score_llms_full +
    out.score_schema_home +
    out.score_schema_deep +
    out.score_sitemap
  ).toFixed(2);

  return out;
}

// ────────────────────────────────────────────────────────────────────
// Format result as Markdown
// ────────────────────────────────────────────────────────────────────

function formatMarkdown(results, dateStr, isoWeek) {
  // Sort by total desc, with primary site emphasis preserved
  const sorted = [...results].sort((a, b) => b.total - a.total);
  const primary = sorted.find((r) => r.isPrimary);
  const primaryRank = sorted.findIndex((r) => r.isPrimary) + 1;
  const maxTotal = MAX_TOTAL;

  const lines = [];
  lines.push(`# AEO Indexability Benchmark — ${isoWeek}`);
  lines.push("");
  lines.push(`**Run:** ${dateStr} · **Window:** weekly · **Source:** \`scripts/aeo-benchmark.mjs\``);
  lines.push("");
  lines.push(`## Summary`);
  lines.push("");
  lines.push(`- **${primary.label}** ranked **#${primaryRank} of ${sorted.length}** with score **${primary.total} / ${maxTotal}**`);
  lines.push(`- Best competitor: **${sorted.find((r) => !r.isPrimary)?.label}** at **${sorted.find((r) => !r.isPrimary)?.total} / ${maxTotal}**`);
  const lead = primary.total - (sorted.find((r) => !r.isPrimary)?.total ?? 0);
  lines.push(`- Lead margin: **${lead.toFixed(2)} points** ahead of the closest competitor`);
  lines.push("");
  lines.push(`## Scorecard`);
  lines.push("");
  lines.push(`| Rank | Site | AI bots | /llms | /llms-full | Schema (home) | TechArt (deep) | Sitemap | **Total** |`);
  lines.push(`|---|---|---|---|---|---|---|---|---|`);
  sorted.forEach((r, i) => {
    const star = r.isPrimary ? "**" : "";
    lines.push(
      `| ${i + 1} | ${star}${r.label}${star} | ${r.score_robots.toFixed(1)} | ${r.score_llms.toFixed(1)} | ${r.score_llms_full.toFixed(1)} | ${r.score_schema_home.toFixed(1)} | ${r.score_schema_deep.toFixed(1)} | ${r.score_sitemap.toFixed(1)} | ${star}${r.total.toFixed(1)} / ${maxTotal}${star} |`
    );
  });
  lines.push("");
  lines.push(`## Per-site detail`);
  lines.push("");
  sorted.forEach((r) => {
    lines.push(`### ${r.label}${r.isPrimary ? " (primary)" : ""}`);
    lines.push(`- AI bots allowlisted: ${r.bots_listed.length}/${AI_BOTS.length} ${r.bots_listed.length ? `(${r.bots_listed.join(", ")})` : "(none)"}`);
    lines.push(`- \`/llms.txt\`: ${r.has_llms_txt ? "✓" : "✗"}, \`/llms-full.txt\`: ${r.has_llms_full ? "✓" : "✗"}`);
    lines.push(`- Homepage schema.org types: ${r.schema_home_types.length ? r.schema_home_types.join(", ") : "_none_"}`);
    lines.push(`- Deep-page (\`${r.deep}\`) schema.org types: ${r.schema_deep_types.length ? r.schema_deep_types.join(", ") : "_none_"}`);
    lines.push(`- Sitemap URLs: ${r.sitemap_urls}`);
    lines.push("");
  });
  lines.push(`## Method`);
  lines.push(``);
  lines.push(`Six dimensions, each weighted. Run \`node scripts/aeo-benchmark.mjs\` to reproduce.`);
  lines.push(``);
  lines.push(`| Dimension | Max | Pass criteria |`);
  lines.push(`|---|---|---|`);
  lines.push(`| AI bot allowlist | ${WEIGHTS.robots_ai} | GPTBot + ClaudeBot + PerplexityBot + Google-Extended named in robots.txt (0.5 each) |`);
  lines.push(`| /llms.txt | ${WEIGHTS.llms_txt} | HTTP 200 |`);
  lines.push(`| /llms-full.txt | ${WEIGHTS.llms_full} | HTTP 200 |`);
  lines.push(`| Homepage Schema.org | ${WEIGHTS.schema_home} | Any \`"@type"\` JSON-LD object detected |`);
  lines.push(`| Deep-page Schema.org | ${WEIGHTS.schema_deep} | Same, on a canonical deep URL per site |`);
  lines.push(`| Sitemap depth | ${WEIGHTS.sitemap_depth} | ≥ 100 \`<loc>\` entries |`);
  lines.push("");
  lines.push(`---`);
  lines.push(``);
  lines.push(`_Generated by \`scripts/aeo-benchmark.mjs\`. Next run scheduled by \`.github/workflows/aeo-benchmark.yml\`._`);
  return lines.join("\n");
}

// ────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

async function main() {
  const now = new Date();
  const dateStr = now.toISOString().replace("T", " ").slice(0, 16) + " UTC";
  const week = isoWeek(now);

  console.log(`AEO benchmark · ${week} · ${dateStr}`);
  console.log(`Auditing ${SITES.length} sites...`);

  const results = [];
  for (const site of SITES) {
    process.stdout.write(`  ${site.label} ... `);
    const r = await auditSite(site);
    console.log(`${r.total} / ${MAX_TOTAL}`);
    results.push(r);
  }

  const md = formatMarkdown(results, dateStr, week);
  await mkdir(OUT_DIR, { recursive: true });
  const outPath = resolve(OUT_DIR, `${week}.md`);
  await writeFile(outPath, md, "utf-8");
  console.log(`\n✓ Wrote ${outPath}`);

  // Also dump a machine-readable JSON snapshot for charting later
  const jsonPath = resolve(OUT_DIR, `${week}.json`);
  await writeFile(jsonPath, JSON.stringify({ week, dateStr, results }, null, 2));
  console.log(`✓ Wrote ${jsonPath}`);

  // Exit 1 if primary site no longer leads — alerts CI
  const sorted = [...results].sort((a, b) => b.total - a.total);
  const primary = sorted.find((r) => r.isPrimary);
  if (sorted[0]?.isPrimary !== true) {
    console.error(`\n⚠ ALERT: ${primary.label} dropped from #1 — now at score ${primary.total}, leader is ${sorted[0].label} at ${sorted[0].total}`);
    process.exit(1);
  }
  console.log(`✓ ${primary.label} retains #1 (${primary.total} / ${MAX_TOTAL})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
