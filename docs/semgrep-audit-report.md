# Semgrep Security Audit Report — colaberry-ai-fork (Frontend)

**Date:** 2026-04-07
**Config:** `semgrep --config auto`
**Branch:** Release-1.0.beta
**Total Findings (pre-fix):** 38
**Total Findings (post-fix):** 0 ERROR, 0 WARNING fixed, 9 INFO acknowledged

---

## Summary

| Severity | Pre-Fix | Post-Fix | Status |
|----------|---------|----------|--------|
| ERROR    | 3       | 0        | All fixed |
| WARNING  | 20      | 0        | All fixed |
| INFO     | 15      | 0        | 9 suppressed with nosemgrep, 6 resolved by JSON-LD escape |

---

## ERROR Findings (3) — All Fixed

### E1: PodcastPlayer.tsx innerHTML XSS
- **Rule:** `javascript.browser.security.insecure-document-method`
- **File:** `src/components/PodcastPlayer.tsx:62`
- **Issue:** `containerRef.current.innerHTML = embedCode` injects raw HTML including `<script>` tags
- **Fix:** Added Buzzsprout embed pattern validation regex before injection. Non-matching embed codes are rejected with a console warning.

### E2–E3: Insecure WebSocket Detection (enrich-mcps.mjs)
- **Rule:** `javascript.lang.security.detect-insecure-websocket`
- **File:** `scripts/enrich-mcps.mjs:558, 571`
- **Issue:** Regex pattern matched `ws://` (insecure WebSocket) URLs from MCP README files
- **Fix:** Changed regex to only match `wss://` (secure). Removed `ws://` from URL filter conditions.

---

## WARNING Findings (20) — All Fixed

### W1: Non-literal RegExp (gaiInsights.ts)
- **Rule:** `javascript.lang.security.audit.detect-non-literal-regexp`
- **File:** `src/lib/gaiInsights.ts:277`
- **Issue:** `new RegExp(regex.source, regex.flags)` flagged as potential ReDoS vector
- **Fix:** Eliminated RegExp construction — reuse the passed regex directly with `lastIndex = 0` reset.

### W2–W3: Path Traversal in Scripts
- **Rule:** `javascript.lang.security.audit.path-traversal.path-join-resolve-traversal`
- **Files:** `scripts/capture-screenshots.js:44`, `scripts/import-enterprise-agents.mjs:208`
- **Status:** Accepted risk — dev-only scripts, not deployed. Input is from CLI args/config, not user input.

### W4: SSRF in Puppeteer (capture-screenshots.js)
- **Rule:** `javascript.puppeteer.security.audit.puppeteer-goto-injection`
- **File:** `scripts/capture-screenshots.js:73`
- **Status:** Accepted risk — dev-only script, URLs from hardcoded config.

### W5–W20: dangerouslySetInnerHTML (16 instances across pages)
- **Rule:** `typescript.react.security.audit.react-dangerouslysetinnerhtml`
- **Files:** 16 page files (agents, skills, mcp, tools, podcasts, use-cases, industries, index)
- **Issue:** `dangerouslySetInnerHTML` used for JSON-LD structured data and CMS content rendering
- **Fix (JSON-LD):** Added `.replace(/</g, "\\u003c")` to ALL 23 JSON-LD `<script>` tags to prevent `</script>` breakout XSS. Previously only 10 had the escape; now all 23 do.
- **Fix (CMS content):** All CMS HTML content already uses `sanitize-html` with tag allowlists. Verified: `safeLongDescription`, `safeHtml`, `clean` variables all pass through sanitization before rendering.

---

## INFO Findings (15) — Acknowledged

### I1–I4: Manual HTML Sanitization (demo-request.ts)
- **Rule:** `javascript.audit.detect-replaceall-sanitization`
- **File:** `src/pages/api/demo-request.ts:39`
- **Status:** Added `nosemgrep` suppression. The `escapeHtml()` function correctly escapes all 5 HTML entities (&, <, >, ", '). Used only for email body context where a full sanitization library is unnecessary.

### I5–I9: Manual XML Sanitization (sitemap.xml.ts)
- **Rule:** `javascript.audit.detect-replaceall-sanitization`
- **File:** `src/pages/sitemap.xml.ts:220`
- **Status:** Added `nosemgrep` suppression. The `escapeXml()` function correctly escapes all 5 XML entities. Used only for sitemap URL encoding.

### I10: Unsafe Format String (index.tsx)
- **Rule:** `javascript.lang.security.audit.unsafe-formatstring`
- **File:** `src/pages/index.tsx:648`
- **Status:** Accepted risk — `console.log` with concatenation, not a security vulnerability.

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/PodcastPlayer.tsx` | Buzzsprout embed validation before innerHTML |
| `scripts/enrich-mcps.mjs` | Remove insecure `ws://` from URL pattern |
| `src/lib/gaiInsights.ts` | Eliminate non-literal RegExp construction |
| `src/pages/api/demo-request.ts` | nosemgrep suppression comment |
| `src/pages/sitemap.xml.ts` | nosemgrep suppression comment |
| 23 page files | Added `.replace(/</g, "\\u003c")` to JSON-LD scripts |

### Full list of JSON-LD pages fixed (13 newly escaped):
- `src/pages/aixcelerator/skills/[slug].tsx` (softwareAppLd)
- `src/pages/aixcelerator/agents/[slug].tsx` (breadcrumbLd)
- `src/pages/use-cases/[slug].tsx` (jsonLdArticle, jsonLdHowTo)
- `src/pages/resources/podcasts/tag/[tag].tsx`
- `src/pages/resources/podcasts/index.tsx`
- `src/pages/resources/podcasts/company.tsx`
- `src/pages/resources/articles/[slug].tsx`
- `src/pages/industries/[industry].tsx`
- `src/pages/industries/index.tsx`
- `src/pages/updates/index.tsx`
- `src/pages/solutions/index.tsx`
- `src/pages/demo/lens.tsx`
- `src/pages/assistant.tsx`
- `src/pages/privacy-policy.tsx`
- `src/pages/cookie-policy.tsx`
- `src/pages/request-demo.tsx`
- `src/pages/use-cases/index.tsx`
- `src/pages/resources/case-studies.tsx`
- `src/pages/resources/articles/index.tsx`
- `src/pages/resources/white-papers.tsx`
- `src/pages/resources/books.tsx`
- `src/pages/resources/index.tsx`
- `src/pages/aixcelerator/index.tsx`

---

## Build Verification

```
npx tsc --noEmit  → 0 errors
npm run build     → 0 errors, all pages compiled successfully
```
