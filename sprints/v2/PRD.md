# Sprint v2 — PRD: Security Hardening

## Overview

Implement all remaining remediation items from the Layer 1–3 security audit (Semgrep, npm audit, manual OWASP Top 10 + prompt injection review). Layer 1–2 code fixes are complete; this sprint focuses on the operational, infrastructure, and defense-in-depth items that remain open.

## Goals

- Rotate all secrets exposed in git history and purge the committed `.env.production` file
- Implement prompt injection content filter for `/llms-full.txt` (AI crawler surface)
- Harden Content Security Policy: add missing directives, restrict wildcards, add nonce-based script-src
- Add input validation to the two API routes flagged as MEDIUM
- Explicitly set CMS CORS credentials and add rate limit security logging
- Merge `Release-1.0.beta` dark mode fixes into `Release-1.0` production branch

## User Stories

- **As a security engineer**, I want all git-exposed secrets rotated, so that leaked tokens can no longer be used to access the CMS or newsletter system.
- **As a platform operator**, I want CSP hardened with `object-src 'none'` and restricted subdomains, so that the attack surface for plugin/subdomain hijacking is eliminated.
- **As an AI answer engine**, I want `/llms-full.txt` content filtered for injection patterns, so that compromised CMS entries cannot manipulate my responses about Colaberry.
- **As a site visitor**, I want the dark mode contrast fixes deployed to production, so that borders and text are readable in dark mode.
- **As a DevOps engineer**, I want rate limit events logged, so that I can detect and alert on brute-force or abuse patterns.

## Technical Architecture

- **Frontend:** Next.js 16 (Pages Router), Tailwind CSS 4, deployed on GCP Cloud Run
- **CMS:** Strapi v5, PostgreSQL, deployed on GCP Cloud Run
- **Security layer:** `src/lib/api-auth.ts` (timing-safe), `src/lib/bot-defense.ts` (HMAC), `src/lib/rate-limit.ts` (sliding-window)
- **AEO surface:** `/llms.txt`, `/llms-full.txt`, `/robots.txt`, JSON-LD structured data on 23+ pages
- **Git:** `Release-1.0.beta` (current dev) → `Release-1.0` (production)

```
                           ┌──────────────────────────┐
                           │   AI Crawlers (GPTBot,    │
                           │   ClaudeBot, Perplexity)  │
                           └─────────┬────────────────┘
                                     │ GET /llms-full.txt
                                     ▼
┌─────────────┐  CSP headers   ┌────────────────────────┐
│  Browsers   │ ◄────────────► │   Next.js Frontend     │
│  (visitors) │                │   (Cloud Run prod)     │
└─────────────┘                │                        │
                               │  ┌──────────────────┐  │
                               │  │ Content filter    │  │ ← NEW (Task 2)
                               │  │ (prompt injection)│  │
                               │  └──────────────────┘  │
                               │  ┌──────────────────┐  │
                               │  │ CSP middleware    │  │ ← HARDENED (Task 3)
                               │  │ (nonce + object)  │  │
                               │  └──────────────────┘  │
                               │  ┌──────────────────┐  │
                               │  │ Rate limit logger │  │ ← NEW (Task 6)
                               │  └──────────────────┘  │
                               └───────────┬────────────┘
                                           │ Bearer token
                                           ▼
                               ┌────────────────────────┐
                               │   Strapi CMS           │
                               │   (Cloud Run prod)     │
                               │   CORS: explicit creds │ ← FIXED (Task 5)
                               └────────────────────────┘
```

## Out of Scope (v3+)

- CSP `style-src` nonce migration (requires Tailwind CSS architecture changes)
- Redis-backed distributed rate limiting (single-instance is sufficient for current scale)
- Google Secret Manager migration (requires GCP IAM changes)
- CI/CD secret scanning pipeline (GitHub Actions workflow)
- Strapi core dependency patches (lodash, handlebars — waiting on upstream)
- Import job webhook HMAC signing
- Structured logging migration to pino/winston

## Dependencies

- **Completed (Layer 1):** Semgrep fixes — PodcastPlayer validation, JSON-LD XSS escape (23 pages), WebSocket regex, ReDoS fix, nosemgrep suppressions
- **Completed (Layer 2):** npm audit fix — frontend 0 vulns, CMS 12 Strapi-core (no fix available)
- **Completed (Layer 3):** CMS Public role locked down (90→0 permissions), SSRF DNS rebinding protection, CSV 5MB size limits, SSO whitelist enabled, Auth0 hardcoded domain removed
- **Required:** Access to rotate tokens in Strapi admin, Buzzsprout dashboard, Auth0 dashboard
- **Required:** BFG Repo-Cleaner installed (`brew install bfg`) or access to run it
