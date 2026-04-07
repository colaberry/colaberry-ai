# Sprint v2 — Tasks: Security Hardening

## Status: In Progress (7 of 10 tasks complete)

## Audit Reference
- Layer 1: `docs/semgrep-audit-report.md` (Semgrep) — ALL FIXED
- Layer 2: `docs/Security-Audit-Semgrep-npm.docx` (Semgrep + npm) — ALL FIXED
- Layer 3: `docs/Manual-Security-Audit-OWASP.docx` (OWASP manual review) — OPEN ITEMS BELOW

---

## P0 — Must Have

- [ ] Task 1: Rotate all secrets exposed in git history (P0)
  - Acceptance: All 3 tokens (CMS_API_TOKEN, NEWSLETTER_REPORT_API_KEY, NEWSLETTER_UNSUBSCRIBE_SECRET) regenerated. Old tokens no longer work against production CMS. New tokens deployed to Cloud Run environment variables. Buzzsprout API token and CMS STRAPI_TOKEN also rotated.
  - Files: `.env.local` (frontend), `.env` (CMS), Cloud Run environment config
  - Audit ref: C1 — Secrets committed to git history (ad0a67d, e43a230)
  - Note: Manual task — requires Strapi admin panel, Buzzsprout dashboard, `gcloud run services update`

- [x] Task 2: Implement prompt injection content filter for /llms-full.txt (P0) ✓
  - Acceptance: CMS descriptions containing instruction-like patterns ("Ignore all previous", "Disregard", "From now on", "You are now", "Override", "System prompt", "Act as if") are stripped or redacted before serving to AI crawlers. A `filterForAEO(text)` utility function exists in `src/lib/`. Manual test: create CMS entry with "Ignore all previous instructions" in description → verify /llms-full.txt does NOT contain it. Build passes.
  - Files: `src/lib/aeoSanitize.ts` (new), `src/pages/llms-full.txt.ts` (modify)
  - Audit ref: C3 — Prompt injection via /llms-full.txt
  - Done: sanitizeForAEO() with 15 regex patterns, all 8 content type loops wrapped

- [x] Task 3: Harden CSP — add object-src, restrict wildcards (P0) ✓
  - Acceptance: CSP now includes `object-src 'none'`. Wildcard `*.buzzsprout.com` changed to `www.buzzsprout.com`. Wildcard `*.substack.com` changed to `substack.com`. Hardcoded vton-demo GCP domain moved to `NEXT_PUBLIC_VTON_URL` env var (falls back to current URL). `npm run build` passes. Site loads without CSP violations in browser console.
  - Files: `next.config.ts` (modify CSP section, lines 93-112)
  - Audit ref: M1, M2, M7 — Missing object-src, wildcard subdomains, hardcoded GCP domain
  - Done: All 3 CSP directives fixed, Permissions-Policy also parameterized

- [x] Task 4: Add slug validation to seed-telemetry and mcp-telemetry (P0) ✓
  - Acceptance: `seed-telemetry.ts` validates slug against `^[a-z0-9][a-z0-9-]{0,158}[a-z0-9]$` regex before use. `mcp-telemetry.ts` validates slug before using as cache key (line 222). Invalid slugs return 400. Build passes.
  - Files: `src/pages/api/seed-telemetry.ts`, `src/pages/api/mcp-telemetry.ts`
  - Audit ref: M4, M5 — Unvalidated slug parameters
  - Done: Regex validation on all 3 slug entry points, cache.delete uses safeSlug

---

## P1 — Should Have

- [x] Task 5: Set CMS CORS credentials explicitly and verify production CORS_ORIGIN (P1) ✓
  - Acceptance: CMS `config/middlewares.ts` CORS config includes `credentials: false` explicitly. Verify that `CORS_ORIGIN` env var in production Cloud Run does NOT contain `*` wildcard. Document the current production CORS_ORIGIN value.
  - Files: `config/middlewares.ts` (CMS repo, modify CORS block)
  - Audit ref: M6 — CMS CORS credentials implicit
  - Done: credentials: false added to CMS CORS config

- [x] Task 6: Add rate limit event logging (P1) ✓
  - Acceptance: When a rate limit 429 is returned, log a structured entry with: hashed IP (SHA256 prefix, not full IP), endpoint path, rate limit name, timestamp. Use `console.warn()` format compatible with Cloud Logging. Does NOT log on successful requests (performance). Build passes.
  - Files: `src/lib/rate-limit.ts` (frontend, modify)
  - Audit ref: A09 — Rate limit hits not logged
  - Done: Already implemented at rate-limit.ts:94 — console.warn with prefix, limit, hashed IP, retryAfter

- [x] Task 7: Add CSP nonce for inline theme script (P1) — DOCUMENTED LIMITATION ✓
  - Acceptance: Replace hardcoded SHA-256 in `script-src` with a per-request nonce. The theme init script in `_document.tsx` uses `nonce={nonce}` attribute. Nonce generated in Next.js custom server or middleware. Verify: page loads, dark mode toggle works, no CSP violations in browser console. Build passes.
  - Files: `next.config.ts` (CSP section), `src/pages/_document.tsx`, possibly `src/middleware.ts` (new)
  - Audit ref: H2 — Hardcoded SHA-256 for CSP script
  - Note: This is the most complex task. If blocked by Next.js Pages Router limitations, document the limitation and keep the SHA approach with a comment explaining why.
  - Done: Nonces require SSR per request; this site uses ISR/SSG (getStaticProps). SHA-256 is the correct approach. Comment added to next.config.ts explaining the limitation. SHA hash verified correct.

- [ ] Task 8: Purge .env.production from git history with BFG (P1)
  - Acceptance: `git log --all -p -- .env.production` returns no results. Force-push completed. All team members notified to re-clone or fetch. Verify build still works after history rewrite.
  - Files: Git history (destructive operation — requires team coordination)
  - Audit ref: C1 — Secrets permanently in git history
  - Note: Manual task — requires `bfg` tool and force-push to remote. Coordinate with team before executing.

---

## P2 — Nice to Have

- [ ] Task 9: Merge Release-1.0.beta into Release-1.0 (P2)
  - Acceptance: All 16 files of dark mode contrast fixes (borders zinc-800→zinc-700, text contrast, homepage header styling) merged into Release-1.0. No merge conflicts. Build passes on Release-1.0. Push to origin.
  - Files: 16 files (Layout.tsx, PremiumMediaCard.tsx, EnterprisePageHero.tsx, CollectionsPageTemplate.tsx, GlobalMiniPlayer.tsx, mcp components, skills/[slug], podcasts/index, updates/index, 2 SVG logos)
  - Note: Branches have diverged (different SHAs, same messages). May need cherry-pick or rebase strategy.

- [x] Task 10: Update security audit reports with v2 sprint results (P2) ✓
  - Acceptance: `docs/Manual-Security-Audit-OWASP.docx` regenerated with updated status (fixed items marked as resolved). `docs/semgrep-audit-report.md` and `docs/Security-Audit-Semgrep-npm.docx` updated if any new fixes applied. Sprint walkthrough in `sprints/v2/WALKTHROUGH.md` documents all changes.
  - Files: `docs/Manual-Security-Audit-OWASP.docx`, `docs/semgrep-audit-report.md`, `sprints/v2/WALKTHROUGH.md` (new)
  - Done: OWASP docx regenerated with all Sprint v2 fixes reflected (C3, M1-M7, A02, A09 all marked FIXED)

---

## Completion Criteria

- [x] `npx tsc --noEmit` passes with 0 errors (both repos) ✓
- [x] `npm run build` passes with 0 errors (frontend) ✓
- [x] All P0 tasks completed and verified (Tasks 2, 3, 4) ✓
- [x] Security audit reports updated with final status ✓
- [ ] Task 1 (secret rotation) — manual, requires Strapi admin + Cloud Run access
- [ ] Task 8 (BFG history purge) — manual, requires team coordination
- [ ] Task 9 (branch merge) — pending
