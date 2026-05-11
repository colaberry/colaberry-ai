# AEO Indexability Benchmarks

Weekly snapshots tracking how `www.colaberry.ai` scores against direct competitors on AI-search indexability (a.k.a. **AEO** — Answer Engine Optimization).

## Why this exists

`colaberry.ai` is purpose-built for LLM indexability — the entire site is a structured catalog of AI agents, MCP servers, skills, and architectures, intended to be discoverable by AI answer engines (ChatGPT, Claude, Perplexity, Gemini) and not just by Google.

That investment only pays off if we **stay ahead of competitors**. Once the rest of the AI-catalog category notices what we've done with Schema.org, `/llms.txt`, and explicit bot allowlists, they'll catch up. This benchmark exists to alert us when that happens.

## How it works

1. **Script** — `scripts/aeo-benchmark.mjs` audits 7 sites (`colaberry.ai` + 6 competitors) across 6 dimensions, each weighted by importance to AEO ranking.
2. **Scoring** — out of 10 total points. Detail per dimension is in each weekly file.
3. **Cadence** — every Monday 04:00 UTC, via `.github/workflows/aeo-benchmark.yml`.
4. **Storage** — each run writes `docs/aeo-benchmarks/<ISO-WEEK>.md` (human-readable) + `<ISO-WEEK>.json` (machine-readable for charting).
5. **Alerting** — if `colaberry.ai` is no longer ranked #1, the script exits 1 → workflow fails → repo watchers get a notification.

## The competitor set

| Site | Why |
|---|---|
| `huggingface.co` | Dominant AI model catalog — biggest competitor for "discover AI agents" queries |
| `replicate.com`  | Model deployment platform, similar discovery use case |
| `modal.com`      | Serverless AI compute — closest in DX positioning |
| `together.ai`    | Inference + model catalog |
| `ollama.com`     | Local model registry — strong organic AI-search visibility |
| `langchain.com`  | Agent framework hub |

Update the list in `scripts/aeo-benchmark.mjs` as the category shifts.

## The 6 dimensions

| Dimension | Weight | Why it matters for AEO |
|---|---|---|
| Explicit AI-bot allowlist in robots.txt | 2.0 | Tells crawlers "you're welcome here" — some bots de-prioritize generic `User-agent: *` sites |
| `/llms.txt` | 1.5 | Emerging standard manifest — direct signal to LLM crawlers |
| `/llms-full.txt` | 1.5 | Comprehensive content index — rich citation body |
| Schema.org JSON-LD on homepage | 2.0 | Powers FAQ + Organization + WebSite signals in AI answers |
| Schema.org JSON-LD on a deep page | 1.5 | TechArticle / ItemList signals on catalog + article surfaces |
| Sitemap depth ≥ 100 URLs | 1.5 | Shows the site has discoverable content at scale |

Totals max out at **10**. A perfect score means a site is doing every signal a 2026-era AEO engine can use.

## How to run locally

```bash
node scripts/aeo-benchmark.mjs
```

Writes the current ISO week's report to `docs/aeo-benchmarks/`.

## How to trigger a fresh run on-demand (CI)

GitHub → Actions → **AEO Benchmark** → "Run workflow" button. Useful for after a competitor announcement to see if their numbers moved.

## Charting trends

The `.json` files can be loaded into any tool. Quick CLI plot of `colaberry.ai` score over time:

```bash
ls docs/aeo-benchmarks/*.json | sort | while read f; do
  jq -r '"\(.week)\t\(.results[] | select(.isPrimary) | .total)"' "$f"
done
```

## Adding a new dimension

If a new AEO signal emerges (e.g., AI agents starting to read OpenGraph rich previews), add it to:

1. `WEIGHTS` in `scripts/aeo-benchmark.mjs` (pick a sensible weight)
2. The audit logic in `auditSite()` for both primary + competitor sites
3. The `formatMarkdown()` table headers
4. This README's dimensions table

Run the benchmark once to regenerate the current week's report, then commit.

---

**See also:** `docs/presentations/notebooklm-assets/12-AEO_INDEXABILITY_PROOF.md` for the original 2026-04-29 indexability evidence pack.
