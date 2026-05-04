# Sprint v7 — Tasks: Voice Agent Demo Integration

## Status: In Progress

Tasks Phase-3+4 (Tasks 1–4 in spirit) are already shipped on `feat/voice-agent-demo` commit `95319ef`. Sprint v7 captures the remaining work — GCP provisioning (Karun-blocked), security hardening, observability, publish, and the reusable hybrid-demo runbook.

---

## P0 — Must Have

- [x] **Task 1: Open PR for `feat/voice-agent-demo` against `Release-1.0.beta`** (P0)
  - Acceptance: PR is open on `colaberry/colaberry-ai`, CI green, requested reviewers = Karun + Harsh, description links the Basecamp todo `9853341713` + the v7 PRD
  - Files: GitHub PR (no repo files); `gh pr create --base Release-1.0.beta --head feat/voice-agent-demo`
  - Completed: 2026-05-04 — PR #60 open at https://github.com/colaberry/colaberry-ai/pull/60. Reviewer = `karunswaroop`. Note: Harsh's GitHub handle (`harsh-colaberry`) isn't a collaborator on the upstream `colaberry/colaberry-ai` repo, so he can't be added via API — flagged in PR body for manual add via UI. CI quality-and-security check kicked off automatically.

- [ ] **Task 2: Confirm Python agent worker on LiveKit Cloud `p_2jv2uerihhk`** (P0)
  - Acceptance: Either (a) `lk cloud agents list --project p_2jv2uerihhk` shows the worker as `running`, or (b) `lk agent deploy` against `colaberry/VoiceAgent/src/` succeeds and the worker shows `running`
  - Files: none in this repo; LiveKit Cloud only

- [ ] **Task 3: Provision GCP Secret Manager entries — `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`** (P0)
  - Acceptance: `gcloud secrets versions list LIVEKIT_API_SECRET --project=colaberryaiwebsite` shows version 1 enabled; secret content NEVER pasted into repo, commit, Slack, or Basecamp
  - Files: none in repo; GCP Secret Manager only
  - Blocker: Karun must approve + share the LiveKit credential values

- [ ] **Task 4: Create Cloud Build trigger on `colaberry/VoiceAgent` repo + Cloud Run service `voice-agent-demo`** (P0)
  - Acceptance: Push to `colaberry/VoiceAgent:main` triggers a Cloud Build that deploys to `voice-agent-demo` (us-east1, project `colaberryaiwebsite`, min-instances=0, max=3, concurrency=80, mounted secrets `LIVEKIT_URL`/`LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET` via `--update-secrets`); first deploy returns HTTP 200 on the public Cloud Run URL within 5s of cold start
  - Files: in the `colaberry/VoiceAgent` repo — `cloudbuild.yaml`, `Dockerfile` adjustments to override branding (`Colaberry AI` + `https://colaberry.ai/`)
  - Blocker: Task 3 complete; Karun + Harsh approval

- [ ] **Task 5: Rate-limit `/api/connection-details` token-issuer + bot defense** (P0)
  - Acceptance: Endpoint rejects > 5 requests/hour from the same IP (HTTP 429), missing `Origin` / wrong host, missing `Accept`/`Accept-Language`/`User-Agent`, and curl/wget UA — all silently fake-success with a no-op token (anti-enumeration); test plan documented; LiveKit minutes never billed for bot traffic
  - Files: in `colaberry/VoiceAgent` repo — `app/api/connection-details/route.ts` (or equivalent), reuse pattern from colaberry-ai's `src/lib/bot-defense.ts`

---

## P1 — Should Have

- [ ] **Task 6: Wire `_NEXT_PUBLIC_VOICE_AGENT_URL` substitution to the live Cloud Run URL + redeploy frontend** (P1)
  - Acceptance: `colaberry-ai-prod` Cloud Build trigger has `_NEXT_PUBLIC_VOICE_AGENT_URL=https://voice-agent-demo-<hash>-uc.a.run.app` set; redeploy succeeds; `view-source:https://www.colaberry.ai/demo/voice` shows the iframe pointing at the live URL
  - Files: GCP Cloud Build trigger config for `colaberry-ai-prod`

- [ ] **Task 7: Verify hub `/demo` emits `ItemList` JSON-LD including `voice-agent`** (P1)
  - Acceptance: `curl -sL https://www.colaberry.ai/demo | grep -o '"@type":"ItemList"'` returns 1 match AND the JSON-LD `itemListElement` contains an entry with `name: "Voice Agent"`; Schema.org validator passes
  - Files: `src/pages/demo/index.tsx` if missing — verify only, no edit needed if `voice-agent` already auto-included

- [ ] **Task 8: Set up LiveKit minutes budget alarm + Cloud Run usage alarm in GCP Cloud Monitoring** (P1)
  - Acceptance: Email alert at 50% / 80% / 100% of monthly LiveKit-minutes cap (cap defined in `docs/runbooks/external-runtime-demo-pattern.md`); Cloud Run alarm if `voice-agent-demo` request rate > 100/min for 5 minutes; both verified by triggering a synthetic test
  - Files: GCP Monitoring config (no repo files); update runbook with alert thresholds

---

## P2 — Nice to Have

- [ ] **Task 9: Publish — remove `/demo/voice-agent` + `/demo/voice` from `RELEASE_HIDDEN_PATHS`, redeploy** (P2)
  - Acceptance: `https://www.colaberry.ai/demo/voice-agent` is reachable from the hub `/demo` card; nav header surfaces no extra entry (demos hub only); end-to-end voice test recorded showing < 1.2s round-trip
  - Files: `src/components/Layout.tsx` (remove 2 lines from `RELEASE_HIDDEN_PATHS`)
  - Blocker: Tasks 4 + 5 + 6 + 7 all complete; Ram final sign-off

- [ ] **Task 10: Document the hybrid external-runtime demo pattern in `docs/runbooks/external-runtime-demo-pattern.md`** (P2)
  - Acceptance: A second developer can follow the runbook to add a future external-runtime demo (e.g. a different LiveKit-hosted agent, or a Modal/Replicate-hosted demo) end-to-end without asking Sai. Covers: when to choose external runtime vs GCP-only, secret management pattern, rate-limit pattern, JSON-LD requirements, hidden-path workflow, cost guardrails
  - Files: `docs/runbooks/external-runtime-demo-pattern.md` (NEW)

---

## Dependency graph

```
Task 1 (PR) ───────────────────────────────────────────────► review
Task 2 (LiveKit worker) ─────────────────────┐
Task 3 (Secrets) ──► Task 4 (Cloud Run)─────►Task 5 (rate-limit)
                                              │
Task 4 ──► Task 6 (substitution wire-up) ──► Task 7 (JSON-LD verify)
Task 4 ──► Task 8 (monitoring alarms)
                                              │
                          Task 6+7+8 + Ram approval ──► Task 9 (publish)
                                              │
                                              └──► Task 10 (runbook)
```

---

## Definition of Done (sprint level)

- All P0 tasks complete and verified
- At least one full voice round-trip recorded showing < 1.2s end-to-end latency
- Token-issuer rate limit verified by automated test (curl with bot UA + curl with real UA)
- LiveKit budget alarm tested (set a temporary low cap, fire it, restore cap)
- `/demo/voice-agent` reachable from hub once paths removed from `RELEASE_HIDDEN_PATHS`
- Sprint v7 walkthrough posted on Basecamp todo 9853341713
