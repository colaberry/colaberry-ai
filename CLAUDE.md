# Colaberry AI — Frontend

## Tech Stack
- **Framework:** Next.js 16.2.1 (Pages Router) with React 19.2.3
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 4 + PostCSS, CSS custom properties in `src/styles/globals.css`
- **Fonts:** Inter via `next/font/google` (variable `--font-inter`)
- **CMS:** Strapi v5 headless — fetched via `src/lib/cms.ts` using `NEXT_PUBLIC_CMS_URL`
- **Deployment:** Docker + GCP Cloud Run (prod: `colaberry-ai-prod`, CMS: `colaberry-ai-cms-prod`)
- **Newsletter / Podcast email:** Substack native delivery via the official `/embed` iframe (colaberry.online). All 5 signup touchpoints render `SubstackEmbedSignup` — the "Hybrid" component: indexable wrapper (schema.org `SubscribeAction` + heading + description + consent copy) with Substack's embed iframe inside. Subscribe APIs write to Strapi for internal telemetry only; email delivery is 100% Substack (no Resend / SendGrid on the signup path). Rationale: `docs/email-delivery-test-report-2026-04-09.md`.
- **Podcast Transcripts:** Deepgram API (free Pay-As-You-Go, $200 credit)
- **Default Theme:** Dark mode (enterprise standard)
- **Domain:** colaberry.ai (live, Cloud Run prod)

## Design System — Monochrome + Coral Accent

### Colors
| Token           | Light               | Dark                |
|-----------------|---------------------|---------------------|
| Background      | `#FFFFFF`           | `#09090B` zinc-950  |
| Surface         | `#FAFAFA` zinc-50   | `#18181B` zinc-900  |
| Text primary    | `#18181B` zinc-900  | `#FAFAFA` zinc-50   |
| Text muted      | `#52525B` zinc-600  | `#A1A1AA` zinc-400  |
| Border          | `#E4E4E7` zinc-200  | `#3F3F46` zinc-700  |
| Accent (coral)  | `#DC2626`           | `#F87171`           |

**Rule:** Coral `#DC2626` is used ONLY for CTAs and small accent dots. Everything else uses the zinc scale.

### Typography
- Font: Inter for all text (sans, display, serif all resolve to Inter)
- Scale: `display-2xl` (4.5rem) → `body-xs` (0.75rem) defined in `tailwind.config.ts`

### Dark Mode
- Toggle: `.dark` class on `<html>`, persisted in localStorage
- CSS vars swap between `:root` and `.dark` blocks in `globals.css`
- Components use `dark:` Tailwind variants for additional overrides
- **Safety net conflict:** `globals.css` has `.dark .bg-zinc-900` and `.dark .bg-white` overrides that can clobber `dark:` Tailwind variants with the same specificity. When you need inverted color pairs (e.g., dark bg in light → light bg in dark), use `bg-zinc-950` instead of `bg-zinc-900` — no safety net exists for zinc-950.

### Locked Theming Standard (MUST follow for ALL pages)

**Theming is locked and finalized.** All existing pages follow this standard. All future pages must match.

**Color Rule:** Only zinc scale + coral `#DC2626` accent. The following colors are **FORBIDDEN** in page code:
- `emerald-*`, `green-*` — no green for status/success indicators
- `blue-*` — no blue for headings or accents
- `amber-*` — no amber for badges
- `slate-*` — use zinc equivalents instead

**Exceptions:** `text-red-600` for error states only. Category node fills in SVG diagrams use `config.categoryColors` (these are content-type-specific by design).

**Page Structure Standard (every new page):**
1. `.reveal` wrapper on hero section with `SectionHeader` (`size="xl"`, kicker, title, description)
2. `.surface-panel` for filter/search bars
3. `.stagger-grid` on card grids (never combined with `.reveal` on same element)
4. `.reveal` on each major section
5. `EnterpriseCtaBand` at page bottom
6. Use `ContentTypeIcon` for content type icons — never emoji

**Locked Component Classes:**
- `.catalog-card` — listing cards (1px border, no hover lift)
- `.surface-panel` — filter/search panels
- `.chip-brand` — active filter (coral accent)
- `.chip-neutral` — default filter (zinc scale)
- `.detail-section` — content sections on detail pages

**3-Layer Ontology Pattern (standard for all content types):**
The 3-layer ontology approach (Taxonomy → Relation Graph → Collections) is Colaberry's unique knowledge graph method. All 5 content types use generic templates (`OntologyPageTemplate`, `GraphPageTemplate`, `CollectionsPageTemplate`, `CollectionDetailTemplate`) with `ContentOntologyConfig`.

**Hidden Routes (RELEASE_HIDDEN_PATHS in Layout.tsx):**
These routes exist but are hidden from navigation until approved:
- `/aixcelerator/tools` — Tools content type
- `/use-cases` — Use Cases listing
- `/solutions` — Solutions page
- `/resources/articles` — Articles listing
- `/resources/case-studies` — Case Studies listing

## Project Structure
```
src/
├── components/     # 38 React components (see src/components/CLAUDE.md)
├── pages/          # 53+ pages (see src/pages/CLAUDE.md)
├── styles/         # globals.css (design tokens + component classes)
├── lib/            # 16 utility modules (see src/lib/CLAUDE.md)
├── data/           # Static data files (see src/data/CLAUDE.md)
└── hooks/          # Custom React hooks
```

## Key Files
- `src/styles/globals.css` — ALL CSS custom properties and component classes
- `tailwind.config.ts` — Zinc color scale, Inter fonts, animation keyframes
- `src/pages/_app.tsx` — Font loading (Inter), global layout wrapper
- `src/lib/cms.ts` — CMS fetch functions, TypeScript types, per-type helpers
- `src/lib/demoRequestStore.ts` — Strapi-write layer for `DemoRequest` leads (create + delivery-status update, bearer auth, abort-controller timeout). Handler calls this BEFORE `sendNewsletterEmail` so leads are durable even if email bounces.
- `src/lib/ontologyTypes.ts` — Shared type system: ContentOntologyConfig, ContentCollection, SolutionStack
- `src/lib/ontologyRegistry.ts` — Central registry + cross-type relation definitions
- `src/lib/graphUtils.ts` — Generic graph utilities: `buildGraphData()`, colors, topology
- `src/components/Layout.tsx` — Header + footer + nav (1,800 lines)
- `src/components/ContentTypeIcon.tsx` — Premium SVG icons for 5 content types
- `src/components/LLMArchitectureDeepDive.tsx` — Sprint v4 renderer for the `deepDive` Strapi Dynamic Zone. Dispatches per `__component` to render heading / paragraph / callout / code-block / table / list / image / references blocks as semantic HTML inside `.prose`.
- `src/lib/deepDiveToPlaintext.ts` — Sprint v4 AEO helper. Exports `deepDiveToPlaintext()`, `deepDiveToCitations()`, and `deepDiveWordCount()` — used by `[slug].tsx` to emit `TechArticle` JSON-LD with `articleBody`, `wordCount`, and structured `citation` array for AI answer engines.
- `scripts/deep-dives/*.mjs` — File-sourced authoring pipeline for flagship LLM architecture deep dives (Sprint v4). Each module exports `{ slug, blocks }` where `blocks` is the Strapi Dynamic Zone payload. Currently ships 5 flagships: `llama-3-2-3b`, `deepseek-v3`, `kimi-linear-48b-a3b`, `qwen3-next-80b-a3b`, `glm-5-744b`.
- `scripts/author-llm-deep-dive.mjs` — CLI that loads deep-dive modules and PUTs them to Strapi. Flags: `--slug <slug>`, `--all`, `--dry-run`, `--url`, `--token`. **Critical:** appends `?status=published` to writes so Strapi v5's draft/publish system lands content on the published version (otherwise PUTs default to draft and SSR never sees them).

## Build & Validation
```bash
npm run build        # Full production build — must pass with 0 errors
npm run lint         # ESLint check
npx tsc --noEmit     # TypeScript type check (no emit)
npm run dev          # Local dev server
```

## Deployment — Known Pitfalls

### API Route Auth Bug Pattern (fixed 2026-04-10)
**Rule:** Never use raw `fetch()` to call Strapi from API routes. Always use `fetchCMSJson` or `fetchCatalogCounts` from `src/lib/cms.ts` — they send the `CMS_API_TOKEN` bearer header.

`src/pages/api/skills.ts` had a local `fetchTotalCount()` that issued unauthenticated `fetch()` to Strapi → returned 401 in prod → `catalogTotal` silently fell back to 500 (the `MAX_CACHED_SKILLS` cap). SSR was correct (uses `fetchCMSJson`) but client hydration overwrote it with the broken API value. Fix: delegate to `fetchCatalogCounts()`.

### Dockerfile + Cloud Build
- `NEXT_PUBLIC_CMS_URL` has a default in the Dockerfile `ARG`. `CMS_API_TOKEN` does **not** — must be passed via `--build-arg` for build-time `getStaticProps` to fetch real data. If missing, SSG pages bake in `totalCount: 0` and wait for ISR runtime regeneration (600s).
- `cloudbuild.yaml` passes `_CMS_API_TOKEN` substitution as `--build-arg CMS_API_TOKEN`. For trigger-based builds, configure `_CMS_API_TOKEN` in the Cloud Build trigger substitution variables. For manual deploys: `gcloud builds submit --config=cloudbuild.yaml --substitutions=SHORT_SHA=<sha>,_CMS_API_TOKEN=<token>`.
- Cloud Build trigger `release-1-0-colaberry-ai-prod` fires on push to `colaberry/colaberry-ai` (upstream), NOT `saitejesh-cyber/colaberry-ai-fork`. For fork deploys, use `gcloud builds submit --config=cloudbuild.yaml --substitutions=SHORT_SHA=<sha>,_CMS_API_TOKEN=<token>`.
- AR repo name is `cloud-run-source-deploy` (set as default `_REPO` in `cloudbuild.yaml`).

## AEO (Answer Engine Optimization)
colaberry.ai is built for AEO — optimized for AI answer engines (ChatGPT, Claude, Perplexity), not just Google.

| Feature | File | Purpose |
|---------|------|---------|
| `/llms.txt` | `src/pages/llms.txt.ts` | Dynamic AI crawler manifest with live CMS stats |
| `/llms-full.txt` | `src/pages/llms-full.txt.ts` | Complete content index with summaries |
| `robots.txt` | `src/pages/robots.txt.ts` | Explicitly welcomes GPTBot, ClaudeBot, PerplexityBot |
| FAQ Schema | `src/pages/index.tsx` | FAQPage JSON-LD for direct AI citation |
| Quick Answer blocks | `src/components/AeoQuickAnswer.tsx` | Answer-optimized paragraphs on catalog pages |
| Bot Defense | `src/lib/bot-defense.ts` | 9-layer form protection (AEO-safe): UA filter (blocks curl/wget/headless/scrapy/okhttp/java — allows crawlers on GET), min UA length, required browser headers (accept, accept-language, user-agent), origin/referer host allowlist, `application/json` content-type enforcement, honeypot, 5s-min HMAC timing token, strict email validator w/ disposable-domain blocklist, per-IP + per-email rate limits. All failures silently fake-succeed with 200 (anti-enumeration). |
| Category metadata | `src/pages/index.tsx` | Homepage signal cards show category for structured AI parsing |
| Industries | `src/pages/industries/` | 8 domain-specific workspaces with agent/use-case counts |

## Security Agents
Ten specialized agents in `.claude/agents/` for continuous auditing:

| Agent | File | Purpose |
|-------|------|---------|
| Secrets Scanner | `security-secrets.md` | Find leaked API keys, tokens, committed `.env` files |
| Input Sanitization | `security-input.md` | Audit XSS, email injection, CSP headers |
| Rate Limiting | `security-ratelimit.md` | Check API routes for rate limits, brute force protection |
| Auth Architecture | `security-auth.md` | Audit admin route auth, timing-safe comparisons |
| API Security | `security-api.md` | CORS config, security headers, error leakage |
| File Uploads | `security-uploads.md` | Upload validation, path traversal, MIME type checks |
| Dependencies | `security-deps.md` | `npm audit`, Dockerfile hardening, supply chain risks |
| Pentest | `pentest.md` | OWASP Top 10 penetration testing |
| WCAG 2.2 | `accessibility-wcag.md` | Accessibility Level AA audit |
| Core Web Vitals | `performance-core-web-vitals.md` | LCP, INP, CLS, PageSpeed optimization |
| API Performance | `api-performance.md` | Response time, Postman collection, best practices |

## Logo Design Multi-Agent Pipeline
Eight specialized agents + 1 skill for multi-agent logo design:

| Agent | File | Purpose |
|-------|------|---------|
| Logo Design Director | `logo-design-director.md` | Orchestrator — coordinates all design agents |
| Brand Strategist | `brand-strategist.md` | Brand brief, personality, visual identity principles |
| Canvas Designer | `canvas-designer.md` | Generate 5+ logo concepts with SVG specs |
| Figma Designer | `figma-designer.md` | Polish vectors in Figma, create all variants |
| SVG Engineer | `svg-engineer.md` | Production React component + standalone SVGs |
| Lovable Prototyper | `lovable-prototyper.md` | Live preview mockups at `/brand-preview` |
| Logo QA | `logo-qa.md` | Quality assurance — 50+ checks, pass/fail report |
| Competitive Analysis | `competitive-analysis.md` | Competitor logo research, trend analysis |

**Skill:** `/design-logo` — Runs the full 6-phase pipeline (Strategy → Concepts → Figma → Code → Preview → QA)

## Spec-Driven Development (SDD)

Every non-trivial feature follows a 4-phase workflow: **Specify → Plan → Tasks → Implement**.

- **`Constitution.md`** — Immutable architectural principles. No spec can override.
- **`specs/`** — One directory per feature containing spec.md, plan.md, tasks.md.
- **SDD Agents:** `@spec-writer` (Specify), `@spec-planner` (Plan), `@spec-tasks` (Tasks), `@spec-reviewer` (Review)

See `specs/README.md` for the full workflow guide.

## Claude Code Skills

Reusable workflows in `.claude/skills/`:

| Skill | Purpose |
|-------|---------|
| `/code-review` | Structured review: design system, TypeScript, security, build |
| `/refactor` | Safe refactoring: read → plan → approve → edit → verify |
| `/release` | Pre-deployment checklist: tsc, lint, build, security |
| `/security-audit` | Orchestrate all 7 security agents |
| `/new-page` | Scaffold a new page following all standards |
| `/design-logo` | Multi-agent logo design pipeline (6 phases, 8 agents) |
| `/prd` | Brainstorm requirements, create sprint PRDs with atomic tasks |
| `/dev` | Pick highest-priority sprint task, implement with TDD + E2E |
| `/walkthrough` | Generate sprint review report: architecture, code walkthrough, data flow |

## Git
- **Branch:** `dev` (main development), `Release-1.0` (production release)
- **Remote:** https://github.com/saitejesh-cyber/colaberry-ai-fork

## See Also
- `docs/architecture.md` — System architecture, route map, module map
- `docs/decisions/` — Architecture Decision Records (ADRs)
- `docs/runbooks/` — Deployment, security audit, CMS sync procedures
- `src/{components,pages,lib,data}/CLAUDE.md` — Directory-specific conventions
- `.claude/skills/` — Reusable workflows
- `.claude/agents/` — 16 specialized agents
- `Constitution.md` — Immutable architectural principles
- `tools/prompts/` — Reusable prompt templates
