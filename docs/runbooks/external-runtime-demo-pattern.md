# Runbook — Hybrid External-Runtime Demo Pattern

How to add a new demo to `colaberry.ai/demo/*` when the demo's compute lives **outside** GCP (LiveKit Cloud, Modal, Replicate, Hugging Face Spaces, a partner SaaS, etc.).

This is the second of two demo patterns. Use the table below to pick the right one before writing any code.

| Pattern | Use when | Reference demo |
|---|---|---|
| **GCP-only** | The demo runs in a single Docker container with no real-time streaming, no specialty hardware, and no off-GCP managed runtime requirement | `goggle-vton` → `vton-demo` Cloud Run service |
| **Hybrid external-runtime** (this runbook) | The demo needs **<2s round-trip latency** that requires a streaming SFU, OR specialty hardware (GPU pools, voice models), OR a managed runtime that already exists on a partner platform | `voice-agent` → LiveKit Cloud `p_2jv2uerihhk` + `voice-agent-demo` Cloud Run shell |

**TL;DR for the hybrid pattern:** the external runtime owns the compute + data plane; GCP Cloud Run owns only a thin Next.js shell that mints short-lived access tokens for the browser to connect directly to the runtime. Audio/data never traverses our Cloud Run.

---

## Architecture template

```
www.colaberry.ai/demo/<slug>          (SSG detail page from src/data/demos.ts)
        ↓ Launch Demo
www.colaberry.ai/demo/<short>         (iframe wrapper — src/pages/demo/<short>.tsx)
        ↓ <iframe src=NEXT_PUBLIC_<NAME>_URL>
Cloud Run: <name>-demo                (NEW — colaberryaiwebsite, us-east1)
  Next.js shell + minimal API route   (the *only* GCP component)
  /api/<token-issuer> mints a short-lived signed credential
  reads <PROVIDER>_API_SECRET from GCP Secret Manager
        ↓ POST /api/<token-issuer>      (returns { token, url })
        ↓ direct browser → provider     (WebRTC / WebSocket / HTTP, never via our Cloud Run)
External Runtime (LiveKit / Modal / Replicate / etc.)
  - SFU / GPU pool / managed worker
  - All compute, all data plane
```

---

## Step-by-step: add a new external-runtime demo in one day

The numbered steps map 1:1 to **Sprint v7's task layout** so future PRDs can reuse the structure. Replace `<slug>` (e.g. `voice-agent`), `<short>` (e.g. `voice`), `<name>` (e.g. `voice-agent`), `<NAME>` (e.g. `VOICE_AGENT`), `<provider>` (e.g. `livekit`).

### 0. Decide the slug and route names (5 min, in PRD)

- **Detail-page slug** — kebab-case, descriptive: `voice-agent`, `image-recolor`, `code-explainer`
- **Iframe wrapper route** — short, single-word, distinct from the slug: `voice`, `recolor`, `explain`. Matches the `/demo/lens` precedent. Reserved short routes (`lens`, `voice`, `index`) MUST NOT be reused as slugs.
- Reserve them in `src/data/CLAUDE.md` as a one-line note.

### 1. Marketing-site half (Phase 3+4) — code-only, no infra

Mirrors `feat/voice-agent-demo` commit `95319ef`. Five files:

| File | What goes in |
|---|---|
| `src/pages/demo/<short>.tsx` (NEW) | Iframe wrapper. Copy `src/pages/demo/voice.tsx` verbatim, change `VOICE_AGENT_URL` → `<NAME>_URL`, change the `seoMeta` / JSON-LD strings, change `allow="microphone; autoplay"` to whatever permissions the demo actually needs (camera? mic? clipboard? none?). Keep the loading + error fallback unchanged — both states are part of the contract. |
| `src/data/demos.ts` | New entry: `slug`, `category`, `tagline`, `summary`, `launchUrl: "/demo/<short>"`, `metrics`, `features`, `techStack`. Copy any voice-agent or goggle-vton entry as a template. **Do not** set `videoEmbedUrl` until you have a real walkthrough video. |
| `src/components/Layout.tsx` | Append `"/demo/<slug>"` and `"/demo/<short>"` to `RELEASE_HIDDEN_PATHS`. The demo stays hidden until both reviewers approve and the Cloud Run service is live. |
| `Dockerfile` | Add `ARG NEXT_PUBLIC_<NAME>_URL=https://<name>-demo-placeholder.invalid` and the matching `ENV` line. The placeholder default is intentionally non-functional — if the substitution isn't wired, the iframe shows the existing "Demo temporarily unavailable" state, not a broken connection to a stale URL. |
| `cloudbuild.yaml` | Add `--build-arg NEXT_PUBLIC_<NAME>_URL=${_NEXT_PUBLIC_<NAME>_URL}` to the docker build args, and a substitution `_NEXT_PUBLIC_<NAME>_URL: ""` (empty default — flipped at trigger level once the Cloud Run service is live). |

Verification: `npx tsc --noEmit`, `npm run lint`, `npm run build`.

Open the PR against `Release-1.0.beta` with both reviewers (Karun + Harsh). The PR body must enumerate **what the PR does NOT do** (everything in steps 2–8 below) so the reviewer doesn't approve in expectation of a one-shot publish.

### 2. Provider account + worker deploy (Phase 1)

For LiveKit-style providers:

```bash
# Confirm or deploy the worker
lk cloud login
lk cloud agents list --project <PROJECT_ID>
# If not there:
lk agent deploy --project <PROJECT_ID> ./path/to/worker
```

For Modal/Replicate/HF Spaces: follow each provider's deploy pattern. Confirm the worker is reachable + healthy from the public internet before continuing.

**Get from the provider:**
- The base URL the browser will connect to (`wss://...` for LiveKit, `https://...` for HTTP-based)
- An API key + API secret (the secret will be used by the token-issuer to mint short-lived browser credentials)

### 3. GCP Secret Manager — never put secrets in repo or env-vars page

```bash
# Run for each secret
echo -n "<value>" | gcloud secrets create <PROVIDER>_<NAME> \
  --project=colaberryaiwebsite \
  --replication-policy=automatic \
  --data-file=-

# Grant the Cloud Run service account access to each secret
gcloud secrets add-iam-policy-binding <PROVIDER>_<NAME> \
  --project=colaberryaiwebsite \
  --member=serviceAccount:<SERVICE_ACCOUNT>@colaberryaiwebsite.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

**Hard rules:**
- Secret values NEVER appear in: git history, repo .env files, Slack, Basecamp, CI logs, Cloud Run "Environment variables" page in the GCP console, build-time Docker layers (`ARG` only for non-secret config; secrets are injected at runtime via `--update-secrets`)
- `gcloud secrets versions access` is the ONLY read path for the value after creation
- Document which secret backs which env var in this runbook below — the next person on call can rotate without DM-ing you

### 4. Cloud Build trigger + Cloud Run service (Phase 2)

Mirror the `vton-demo` setup:

```bash
# Cloud Build trigger on the runtime repo (one-time)
gcloud builds triggers create github \
  --repo-name=<RUNTIME_REPO_NAME> \
  --repo-owner=colaberry \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml \
  --name=<name>-main-autodeploy \
  --project=colaberryaiwebsite
```

The runtime repo's `cloudbuild.yaml` does:
1. Docker build with branding overrides (`Karun Swaroop` → `Colaberry AI`, `https://example.com` → `https://colaberry.ai/`, etc.)
2. Push to Artifact Registry (`us-east1-docker.pkg.dev/colaberryaiwebsite/cloud-run-source-deploy/<name>-demo`)
3. Deploy to Cloud Run with secrets mounted at runtime:

```bash
gcloud run deploy <name>-demo \
  --image=<image> \
  --region=us-east1 \
  --project=colaberryaiwebsite \
  --platform=managed \
  --port=3000 \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3 \
  --concurrency=80 \
  --timeout=300 \
  --allow-unauthenticated \
  --update-secrets=<NAME>_API_SECRET=<PROVIDER>_<NAME>:latest,<NAME>_API_KEY=<PROVIDER>_<NAME>_KEY:latest,<NAME>_URL=<PROVIDER>_<NAME>_URL:latest
```

`min-instances=0` is non-negotiable for demos — idle cost must be **≈ $0**.

### 5. Rate-limit + bot defense on the token-issuer (CRITICAL)

The token-issuer is the abuse vector. Without a rate limit, a single scraping bot can mint thousands of provider connections and run up your bill. Reuse the colaberry-ai 9-layer pattern (`src/lib/bot-defense.ts`):

1. UA filter — block `curl|wget|headless|scrapy|okhttp|java`
2. Min UA length (≥ 16 chars)
3. Required browser headers — `Accept`, `Accept-Language`, `User-Agent` all present
4. `Origin` / `Referer` host allowlist — only `https://www.colaberry.ai` and the Cloud Run service URL
5. `Content-Type: application/json` enforcement on POST
6. Honeypot field
7. HMAC timing token (5-second minimum elapsed since page load)
8. Per-IP rate limit — **5 requests/hour** is the colaberry default for high-cost endpoints
9. Per-room or per-session rate limit — same IP can't spam fresh sessions

All failures **silently fake-succeed with a no-op token** (anti-enumeration). The frontend's iframe handles the no-op gracefully via the existing "Demo temporarily unavailable" state.

### 6. Wire the substitution + redeploy frontend (Phase 4)

Once the Cloud Run service is live, copy its public URL (e.g. `https://<name>-demo-<hash>-uc.a.run.app`) and set the substitution on the **frontend trigger** (not the runtime trigger):

```bash
gcloud builds triggers update <FRONTEND_TRIGGER_ID> \
  --project=colaberryaiwebsite \
  --update-substitutions=_NEXT_PUBLIC_<NAME>_URL=https://<name>-demo-<hash>-uc.a.run.app
```

Or via the GCP console: Cloud Build → Triggers → `release-1-0-colaberry-ai-prod` → Edit → Substitution variables.

Push any commit (or click "Run" on the trigger) to redeploy `colaberry-ai-prod`. Verify with:

```bash
curl -sL https://www.colaberry.ai/demo/<short> \
  | grep -o "https://<name>-demo-<hash>-uc.a.run.app"
```

### 7. Verify hub `ItemList` JSON-LD

```bash
curl -sL https://www.colaberry.ai/demo \
  | grep -oE '"@type":"ItemList"[^}]*' \
  | head -1

# Should also contain the new demo's name
curl -sL https://www.colaberry.ai/demo \
  | grep -oE "name\":\"<demo title>"
```

If the entry is missing: confirm the `src/data/demos.ts` record has `status: "live"` (only live demos get pre-rendered) and that the prod build actually picked up the new file.

### 8. Cost guardrails

Two alarms in **GCP Cloud Monitoring**:

| Alarm | Threshold | Why |
|---|---|---|
| External-runtime usage budget | 50% / 80% / 100% of monthly cap (set per provider — for LiveKit it's minutes-of-audio; for Modal it's GPU-hours; for Replicate it's predictions) | Catches runaway bot abuse before the bill arrives |
| Cloud Run request rate | `<name>-demo` > 100 req/min for 5 minutes | Catches token-issuer abuse even when the rate limit is doing its job (30 IPs × 5 req/hour each = 150 req/hour spread, ≈ 2.5 req/min — anything over 100/min is bot-driven) |

Both should email a distribution list, not a single person. Document the threshold values inline below per demo so the next person on call can verify.

### 9. Publish (Phase 5)

```bash
# Remove from RELEASE_HIDDEN_PATHS in src/components/Layout.tsx
# Open small PR with the diff
# Merge after Ram approves
```

The merge auto-deploys via `release-1-0-colaberry-ai-prod` Cloud Build trigger. Confirm the path is reachable + the launch button works end-to-end. Record a 30-second screen capture showing the round-trip latency for the sprint walkthrough.

---

## Active demos using this pattern

| Demo | External runtime | GCP Cloud Run | Provider project | Secret prefix in Secret Manager | Cost cap |
|---|---|---|---|---|---|
| Voice Agent | LiveKit Cloud | `voice-agent-demo` | `p_2jv2uerihhk` | `LIVEKIT_*` (URL, API_KEY, API_SECRET) | TBD — set during Sprint v7 Task 8 |

When you add a new demo, append a row here with the same shape so the next person can find your secrets + cap without spelunking through Secret Manager listings.

---

## Failure modes + rollback

| Failure | Symptom | Mitigation | Rollback |
|---|---|---|---|
| External runtime down | Iframe shows "Demo temporarily unavailable" with `/request-demo` CTA | Already coded in the iframe wrapper. No action needed. | None — graceful degradation |
| Token-issuer abused | Provider bill spikes; rate-limit alarm fires; budget alarm fires | Tighten per-IP rate limit; increase HMAC timing token minimum; in extreme case set Cloud Run `min-instances=0` AND lower `max-instances=0` to take the demo offline | Roll back the rate-limit weakening commit |
| `<NAME>_API_SECRET` leaks | Provider sends a security alert; secret appears in a public log | Rotate the secret in the provider console → write the new value to Secret Manager → `gcloud run services update <name>-demo --update-secrets=<NAME>_API_SECRET=<PROVIDER>_<NAME>:latest` (no redeploy needed; Cloud Run pulls the new version on next instance start) | None |
| Cloud Run service deploy fails | Cloud Build red; iframe still serves old image (last good build cached) | Read the failed build logs; fix in a new commit; the runtime repo's CI gate catches type errors before deploy | Cloud Run keeps serving the previous image — no impact on live demo |
| `_NEXT_PUBLIC_<NAME>_URL` substitution misconfigured | Iframe shows placeholder URL or "demo unavailable" state | Re-set the substitution on the frontend trigger; re-run the build | Iframe falls back to placeholder.invalid (which gracefully degrades) |

---

## Why this pattern (and not the alternatives)

**Why not run the entire demo on GCP?**
Some demo runtimes have hard latency requirements (sub-2s round-trip for voice, video) that need a regional SFU. Some need specialty hardware (GPU pools for speech models, image generation) that is cheaper on Modal/Replicate than on a self-managed Cloud Run + Cloud GPU build. Some are owned by partners and we don't have the source.

**Why not direct-link from `/demo/<slug>` to the provider's hosted URL?**
Three reasons:
1. **Branding** — the provider's URL shows their domain in the address bar, breaks the colaberry.ai story
2. **Token-issuer** — secrets must live server-side; the browser can never see the API secret. A direct link forces the secret into the browser.
3. **AEO** — the iframe wrapper route gives us schema.org `WebApplication` JSON-LD on a colaberry.ai URL, which is what AI answer engines pick up

**Why not Modal/Replicate functions called from `/api/...` instead of WebRTC/WebSockets?**
You can. If the demo doesn't need streaming (e.g. a static prompt → response demo), use the GCP-only pattern with the function call as a backend dependency — that's `goggle-vton`'s LangGraph-via-OpenAI-API pattern. Hybrid is for streaming.

---

## See also

- `Constitution.md` — Article on environment-environment isolation and secret hygiene
- `docs/runbooks/deploy.md` — Cloud Run deployment runbook (GCP-only pattern)
- `docs/runbooks/security-audit.md` — How to run all 8 security agents on the new endpoint before publishing
- `src/lib/bot-defense.ts` — The 9-layer pattern referenced in step 5
- `src/pages/demo/voice.tsx` — Reference iframe wrapper implementation
- `src/pages/demo/lens.tsx` — Reference iframe wrapper for the GCP-only pattern (also useful as a template)
