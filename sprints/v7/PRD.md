# Sprint v7 — PRD: Voice Agent Demo Integration

## Overview

Bring the Voice Agent project (https://github.com/colaberry/VoiceAgent) into `https://www.colaberry.ai/demo/voice-agent` following the same pattern as `goggle-vton`, with the architectural twist that audio + agent compute live on **LiveKit Cloud** (project `p_2jv2uerihhk`) — not on our GCP Cloud Run — because the 1.2-second round-trip latency budget from the *Building Intelligent Voice Agents* architecture book is achievable only via LiveKit's WebRTC SFU. GCP Cloud Run hosts only the Next.js front-end shell + a minimal token-issuer endpoint.

This sprint also locks the **hybrid demo pattern** (LiveKit-style external compute + GCP front-end shell) as a documented template so future external-runtime demos slot in mechanically, the same way `goggle-vton` codified the GCP-only pattern.

## Goals

- `voice-agent-demo` Cloud Run service deployed in `colaberryaiwebsite` (us-east1), serving the Next.js front-end + `/api/connection-details` token-issuer
- LiveKit Python agent worker confirmed running on LiveKit Cloud project `p_2jv2uerihhk` (deployed via `lk agent deploy` if not already live)
- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` stored in **GCP Secret Manager** (never in repo, never in Cloud Run env-vars page)
- `colaberry.ai/demo/voice-agent` detail page + `/demo/voice` iframe published — paths removed from `RELEASE_HIDDEN_PATHS` after Karun + Harsh approval
- Token-issuer endpoint rate-limited via the same 9-layer bot-defense pattern used by `/api/demo-request`
- Cost guardrails: budget alarm on LiveKit Cloud minutes-of-audio + Cloud Run `min-instances=0` to keep idle cost ≈ $0
- Hybrid demo pattern documented in `docs/runbooks/external-runtime-demo-pattern.md` so the next demo with off-GCP compute is a one-day slot-in

## User Stories

- **As Karun**, I want to see the Voice Agent live on `colaberry.ai/demo/voice-agent` so I can share a public link with prospective enterprise clients
- **As a prospective enterprise client**, I want to talk to the Voice Agent in my browser without installing anything, so I can evaluate the experience in under two minutes
- **As Sai (developer)**, I want a documented pattern for "external-runtime demos" (where audio/compute lives off-GCP) so I can add the next one in a single day
- **As Ram**, I want guarantees that the Voice Agent demo can't run up an unbounded LiveKit bill from a scraping bot, so I trust the public link
- **As an AI search engine**, I want structured `WebApplication` JSON-LD on the detail page and the demo entry surfaced in the hub's `ItemList` JSON-LD, so Voice Agent is discoverable in answer-engine results

## Technical Architecture

### Component diagram (ASCII)

```
                www.colaberry.ai/demo/voice-agent      (SSG detail page)
                            │
                            │  Launch Demo button
                            ▼
                www.colaberry.ai/demo/voice            (iframe wrapper)
                            │
                            │  <iframe src=NEXT_PUBLIC_VOICE_AGENT_URL>
                            ▼
        ┌─────────────────────────────────────────────────────────┐
        │  Cloud Run: voice-agent-demo                            │
        │  (project: colaberryaiwebsite, region: us-east1)        │
        │                                                         │
        │  Next.js 15 + LiveKit React SDK                         │
        │  - Voice UI (mic visualizer, transcript, mute toggle)  │
        │  - POST /api/connection-details                         │
        │      reads LIVEKIT_API_KEY + LIVEKIT_API_SECRET from   │
        │      GCP Secret Manager → mints AccessToken → returns  │
        │      { token, url } to the browser                      │
        │  - Rate-limited (per-IP + per-room) via bot-defense.ts │
        └─────────────────────────────────────────────────────────┘
                            │
                            │  WebRTC (audio bidirectional)
                            ▼
        ┌─────────────────────────────────────────────────────────┐
        │  LiveKit Cloud (project p_2jv2uerihhk)                  │
        │                                                         │
        │  - SFU (audio transport)                                │
        │  - Python agent worker (auto-joins each room):         │
        │      LangGraph state machine                            │
        │      FastMCP tool exposure                              │
        │      Sarvam (Indian-language STT/TTS)                   │
        │      Groq (English STT, sub-200ms first-token)          │
        │      OpenAI (intent + tool-arg synthesis)               │
        │      Postgres (cross-call memory)                       │
        │      Redis (live in-session state)                      │
        └─────────────────────────────────────────────────────────┘
```

### Data flow (one turn)

1. Browser opens `/demo/voice-agent` → SSG detail page with `WebApplication` JSON-LD
2. User clicks **Launch Demo** → `/demo/voice` mounts the iframe pointing at `NEXT_PUBLIC_VOICE_AGENT_URL`
3. Voice Agent UI loads → POST `/api/connection-details` → server reads LiveKit creds from Secret Manager → mints a short-lived `AccessToken` → returns `{ token, url }`
4. Browser opens WebRTC connection to LiveKit Cloud SFU using the token → joins a fresh room
5. LiveKit's Python agent worker auto-joins the same room → starts listening
6. User speaks → audio → SFU → agent worker → STT (Sarvam/Groq) → LangGraph state node → tool call (FastMCP) if needed → OpenAI completion → TTS → audio back through SFU → user hears agent
7. Total round-trip end-of-utterance to first agent audio byte: **target < 1.2s**, max silence gap ever 1.1s (filler-phrase handler kicks in if model is slow)

### Tech stack

- **LiveKit Cloud** — Agents SDK + SFU (audio transport + Python worker host)
- **LangGraph** — stateful conversation DAG (greet → gather → confirm → fulfill → recover)
- **FastMCP** — tool exposure surface (lookups, bookings, escalations) callable mid-turn
- **Sarvam** — Indian-language STT + TTS (Hindi, Telugu, Tamil)
- **Groq** — English STT, sub-200ms first-token
- **OpenAI** — intent extraction + tool-argument synthesis
- **PostgreSQL** — persistent cross-call memory (preferences, history, audit)
- **Redis** — live in-session state (current turn, pending tool calls, partial transcripts)
- **Next.js 15 + LiveKit React SDK** — front-end UI + server-side token issuer
- **GCP Cloud Run** (`colaberryaiwebsite`, us-east1) — hosts the Next.js shell only
- **GCP Secret Manager** — stores `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- **GCP Cloud Build** — auto-deploy trigger on push to `colaberry/VoiceAgent` `main`
- **GCP Cloud Monitoring** — LiveKit minutes budget alarm + Cloud Run usage alarm

### What's already done (commit 95319ef on `feat/voice-agent-demo`)

- `src/pages/demo/voice.tsx` — iframe wrapper mirroring `lens.tsx` (theme-aware, `WebApplication` JSON-LD, mic permission, preconnect hints)
- `src/data/demos.ts` — `voice-agent` entry (8 features, 9-row tech stack, 4 metrics including `<1.2s` round-trip)
- `src/components/Layout.tsx` — `/demo/voice-agent` + `/demo/voice` in `RELEASE_HIDDEN_PATHS`
- `Dockerfile` — `ARG`/`ENV NEXT_PUBLIC_VOICE_AGENT_URL`
- `cloudbuild.yaml` — `--build-arg` + `_NEXT_PUBLIC_VOICE_AGENT_URL` substitution

## Out of Scope (deferred to v7.1 / v8)

- **Telephony** (PSTN dial-in) — adds Twilio/Telnyx dependency, separate sprint
- **Custom Voice Agent UI design** — sprint uses VoiceAgent's existing front-end as-is; redesign to match colaberry.ai zinc-monochrome design system is a follow-up
- **Multi-tenant rooms / saved sessions** — every demo session is fresh, no login
- **Live transcript export** — stretch feature for v8
- **A/B testing different agent personas** — v8
- **Migration of agent worker to GKE** — staying on LiveKit Cloud's managed worker for now (no infra ownership)
- **Inbound webhook integrations** (calendar booking, CRM push) — v8

## Dependencies

### People

- **Karun (AI Director)** approval for the GCP changes (Cloud Run service creation, Cloud Build trigger linking, Secret Manager writes) — **Phase 2 blocker**
- **Harsh** review on architecture + observability setup
- **Ram** final sign-off before flipping the path out of `RELEASE_HIDDEN_PATHS`

### Existing infra / artifacts

- LiveKit Cloud project `p_2jv2uerihhk` (already exists, credentials needed)
- Python agent worker source at `colaberry/VoiceAgent` (must be reachable + buildable)
- GCP project `colaberryaiwebsite` (already hosts `vton-demo`, `colaberry-ai-prod`, `colaberry-ai-cms-prod`)
- `feat/voice-agent-demo` branch on `saitejesh-cyber/colaberry-ai-fork` at commit `95319ef` (frontend wiring, awaiting merge)

### Secrets to be provisioned

- `LIVEKIT_URL` (e.g. `wss://p_2jv2uerihhk.livekit.cloud`)
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET` — must never appear in repo or Cloud Run env-vars page; only in GCP Secret Manager + injected at runtime via `--update-secrets`

### Architectural decisions already locked

- GCP project = `colaberryaiwebsite` (NOT `ai-voice-agent-484516` from VoiceAgent's own `cloudbuild-demo.yaml`)
- Region = `us-east1`
- Detail-page slug = `voice-agent`; iframe wrapper route = `/demo/voice` (matches `/demo/lens` precedent)
- Cloud Run min-instances = `0`, max = `3`, concurrency = `80` (mirrors `vton-demo`)
- Branding override during build: `Karun Swaroop` → `Colaberry AI`, `https://example.com` → `https://colaberry.ai/`

## Risk + Rollback

| Risk | Likelihood | Mitigation | Rollback |
|---|---|---|---|
| LiveKit Cloud outage | Low | Iframe shows existing "Demo temporarily unavailable" state with `/request-demo` CTA fallback (already coded in `voice.tsx`) | None needed — graceful degradation |
| Token-issuer abused by a scraping bot, runs up LiveKit bill | Medium | Per-IP rate limit on `/api/connection-details` (5 reqs/hour matches `/classify/demo` precedent on WoT) + LiveKit minutes budget alarm at 50%/80%/100% of monthly cap | Rate-limit threshold tightening; in extreme case set Cloud Run min-instances back to 0 to take the demo offline |
| Voice Agent build breaks on Cloud Build | Low | Mirror the `vton-demo` Cloud Build YAML structure; build runs on PR-to-main against `colaberry/VoiceAgent` so failures surface before deploy | Roll back the `colaberry/VoiceAgent` PR; Cloud Run keeps serving the previous image |
| `LIVEKIT_API_SECRET` leaks via misconfiguration | Low | Secret Manager only; service account has `secretmanager.secretAccessor` on the specific secrets; CI/build never sees the value (build-time secrets never used) | Rotate the LiveKit API secret; redeploy Cloud Run pulls the new value automatically |

## Success Metrics

- Cloud Run `voice-agent-demo` deploy succeeds, returns HTTP 200 within 5s of cold start
- POST `/api/connection-details` mints a valid token and the browser successfully connects to LiveKit (verified via WebRTC inspector showing audio tracks)
- End-to-end voice round-trip ≤ 1.2s on a clean Wi-Fi connection (manual test, recorded)
- Hub page `/demo` `ItemList` JSON-LD includes `voice-agent` entry (verified via `view-source:` + Schema validator)
- LiveKit minutes budget alarm fires correctly when threshold crossed (test with a low temporary cap)
- Documentation: `docs/runbooks/external-runtime-demo-pattern.md` exists and the next dev can follow it without DM-ing Sai

---

## Companion file

See `sprints/v7/TASKS.md` for the atomic 10-task breakdown (P0/P1/P2).
