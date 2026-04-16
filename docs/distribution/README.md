# Catalog Distribution Module — POC Runbook

**Owner:** Sai (SWE) · **Customer:** Ram (CEO)
**Status:** POC — dry-run only by default. Live posting requires explicit opt-in (see §Live-Posting Flip).

## What it does

Pulls every CMS catalog entry (agents, MCP servers, skills, podcast episodes, LLM architectures) whose `updatedAt` falls inside the lookback window (24 h default), renders a per-platform post, and dispatches through a uniform `PlatformClient` interface to:

- **X / Twitter** — OAuth 1.0a, POST `api.twitter.com/2/tweets` with a 280-char tweet.
- **Moltbook** — Bearer auth, POST `/posts` with native title + body + tags + canonical URL.
- **Hugging Face** — Stubbed; dry-run prints the JSONL row; live commits deferred (see §HF Stub Rationale).

One platform failing never takes down the run. Every path returns a structured `DispatchResult`.

## Module map

```
src/lib/distribution/
├── types.ts                 # Platform, DistributableEntry, PostDraft, DispatchResult
├── source.ts                # fetchRecentEntries — lean Strapi queries, per-kind isolation
├── templates.ts             # buildDrafts — pure per-platform render (X 280, Moltbook, HF JSONL)
├── orchestrator.ts          # runDistribution — source → templates → dispatch → result
└── clients/
    ├── x.ts                 # OAuth 1.0a (HMAC-SHA1) + v2 tweets
    ├── moltbook.ts          # Bearer auth + /posts
    └── huggingface.ts       # Stub — dry-run only

src/pages/api/
├── cron/catalog-distribution.ts       # POST, bearer auth, DRY_RUN default
└── internal/distribution-preview.ts    # Admin-only, always DRY_RUN
```

## Environment variables

| Variable | Purpose | Required |
|---|---|---|
| `CMS_URL` | Strapi base URL (source fetches) | Yes |
| `CMS_API_TOKEN` | Strapi bearer token | Yes |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used in post links (default `https://colaberry.ai`) | Recommended |
| `CATALOG_DISTRIBUTION_SECRET` | Shared secret for the `/api/cron/catalog-distribution` bearer | Yes (for cron) |
| `COLABERRY_ADMIN_KEY` | Admin key for `/api/internal/distribution-preview` | Yes (for preview) |
| `CATALOG_DISTRIBUTION_LIVE` | When `"true"`, cron posts live; otherwise DRY_RUN. `?live=true` query param also flips it. | No — DRY_RUN by default |
| `TWITTER_API_KEY` | OAuth 1.0a consumer key | For live X |
| `TWITTER_API_SECRET` | OAuth 1.0a consumer secret | For live X |
| `TWITTER_ACCESS_TOKEN` | User access token | For live X |
| `TWITTER_ACCESS_TOKEN_SECRET` | User access token secret | For live X |
| `MOLTBOOK_API_TOKEN` | Bearer token for Moltbook REST v1 | For live Moltbook |
| `MOLTBOOK_API_BASE_URL` | Override default `https://api.moltbook.com/v1` | No |
| `HUGGINGFACE_API_TOKEN` | Present = HF stub is `enabled`; not used to write in POC | Optional |

## HTTP endpoints

### `POST /api/cron/catalog-distribution`

Production cron target. Cloud Scheduler calls this once/day.

- **Auth:** `Authorization: Bearer $CATALOG_DISTRIBUTION_SECRET`
- **Mode:** DRY_RUN unless `CATALOG_DISTRIBUTION_LIVE=true` env OR `?live=true` query.
- **Query params:** `windowHours` (1–336).
- **Returns:** `DistributionRunResult` — full dispatch log + per-platform tally.

### `GET|POST /api/internal/distribution-preview`

Admin preview — always DRY_RUN, never posts live regardless of flags.

- **Auth:** `x-colaberry-admin-key: $COLABERRY_ADMIN_KEY` (or `Authorization: Bearer`).
- **Query params:** `windowHours`, repeatable `kind`, repeatable `platform` (comma-separated OK).
- **Returns:** `DistributionRunResult` with all dispatches marked `status: "dry-run"`.

Examples:

```
# Preview the next 24h run across every platform:
curl -H "x-colaberry-admin-key: $KEY" \
  "https://colaberry.ai/api/internal/distribution-preview"

# Preview only podcasts + skills to Moltbook:
curl -H "x-colaberry-admin-key: $KEY" \
  "https://colaberry.ai/api/internal/distribution-preview?kind=podcastEpisode&kind=skill&platform=moltbook"

# DRY_RUN the real cron route:
curl -X POST -H "Authorization: Bearer $CATALOG_DISTRIBUTION_SECRET" \
  "https://colaberry.ai/api/cron/catalog-distribution"

# Live cron run (requires flag):
curl -X POST -H "Authorization: Bearer $CATALOG_DISTRIBUTION_SECRET" \
  "https://colaberry.ai/api/cron/catalog-distribution?live=true"
```

## Live-posting flip (do this carefully)

1. Set credentials in the Cloud Run service for `colaberry-ai-prod`:
   - All four `TWITTER_*` OAuth 1.0a keys.
   - `MOLTBOOK_API_TOKEN` (ask Moltbook team — Sai has the registration follow-up).
2. Preview via the admin route. Verify every entry's copy renders as expected.
3. Enable **one** live run by calling the cron endpoint with `?live=true`. Watch the returned `dispatches` array for per-entry `status` and `remoteId`.
4. Once confirmed, set `CATALOG_DISTRIBUTION_LIVE=true` in Cloud Run env to make daily runs live by default.

## HF stub rationale

Hugging Face Datasets doesn't expose a row-append endpoint. The supported flow is download-shard → append → multipart-commit. Safe cron use of that flow needs file-locking against concurrent runs and a conflict-resolution strategy we haven't chosen yet. The stub preserves the `PlatformClient` contract so:

- The orchestrator iterates every platform uniformly.
- Dry-run prints the exact JSONL row — useful for schema validation.
- Live calls return a structured `skipped` with `errorCode: "not-implemented"` so audit logs explain the gap.

Swap `src/lib/distribution/clients/huggingface.ts` for a real implementation when the sync strategy is agreed; no other module changes are needed.

## Observability gaps (flag for v2)

- **No Strapi `distribution-log` content type yet.** The route returns the full `DistributionRunResult` to Cloud Scheduler's response, but we don't persist it. For v2, add a `distribution-log` content type mirroring `DistributionRunResult` and write each run from the orchestrator. Downstream: per-platform dashboards in Strapi admin.
- **No per-draft dedupe store.** Clients use the `idempotencyKey` (`${platform}:${entryId}:${updatedAt}`) in the Moltbook `Idempotency-Key` header so the server dedupes, but we don't keep a local store. If the cron double-fires for X, we'd double-post (Twitter has no idempotency key). Mitigation: pair with the `distribution-log` content type + pre-flight lookup before dispatch.
- **No rate-limit scheduling across days.** A big CMS bulk edit will blast up to `25 × 3 = 75` drafts. We cap per-kind at 25 in the source layer, but the real protection should be a "posting budget per day per platform."

## Verification checklist

- [x] `npx tsc --noEmit` clean
- [x] `npm run lint` — 0 errors, 0 new warnings from distribution module
- [ ] DRY_RUN preview returns populated `dispatches[]` against staging Strapi (pending env wire-up)
- [ ] Live run posts a single test entry to Moltbook, logs `remoteId` (pending token)
- [ ] Live run posts a single test tweet, logs Twitter `remoteId` (pending OAuth 1.0a keys)
