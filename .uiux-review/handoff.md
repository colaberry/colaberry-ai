# Developer Handoff — Homepage UI/UX Revamp (`/`)

**Surface:** `src/pages/index.tsx` (+ `src/styles/globals.css`)
**Direction:** enforce the repo's locked monochrome + coral / Inter system (no Atlas migration).
**Status:** implemented · `tsc` 0 errors · `eslint` 0 errors · `npm run build` exit 0 (90/90 pages).
**Evidence:** `.uiux-review/before/` vs `.uiux-review/after/` (light + dark · 1280/1024/768/375),
plus `.uiux-review/after/hero-reduced-motion.png`.

---

## What changed & why (each cites the fix from the critique)

### 1. Hero → one focal point  *(P1: Von Restorff / hierarchy, P1: Miller's / duplicate data)*
- **Removed** the entire right-hand metric panel: the giant gradient "2.4k+" number **and** the
  four category bars (Podcasts/Agents/MCP/Skills). Those bars duplicated the stat band directly
  below — the same counts were shown twice in one viewport.
- Hero is now a **single centered focal column** (kicker → headline → subhead → CTAs). The
  headline is the sole dominant element; the stat band beneath is the single home for counts.
- **Removed** the mouse-parallax handlers/refs (`heroRef`, `parallaxGlowRef`, `parallaxMetricRef`,
  `rafId`, `handleHeroMouse`, `handleHeroLeave`) — they only drove the deleted panel.
- Hero background (gradient mesh, orbs, vignette, noise) is **kept** — locked-system exception.

### 2. Rotating-word headline → accessible  *(P2: WCAG / Jakob's)*
- Added a visually-hidden canonical word: `<span className="sr-only">AI agents</span>`.
- Marked the visual rotator `aria-hidden="true"`. Accessible name is now
  **"Discover, govern, and scale AI agents"** instead of all four words concatenated.
- Reordered the rotator so its first (reduced-motion-frozen) word is "AI agents", matching the
  accessible name.

### 3. Catalog cards → flat, coral-only  *(P1: brand — off-system colors, P1: locked card spec)*
- `CatalogCard` rebuilt onto the locked **`.catalog-card`** class: 1px border, no shadow, no
  hover-lift, no glow, no particles, no orbit ring.
- Icons now render in **coral only** (`#DC2626` / dark `#F87171`) in a tinted tile. The previous
  per-card palette (`#a78bfa` purple, `#3b82f6` blue, `#f59e0b` amber, `#22d3ee` cyan, `#ef4444`)
  is gone — those violated CLAUDE.md (`blue-*`/`amber-*` forbidden; off-system colors banned).
- Meta is a `.chip-neutral` pill; affordance is an "Explore →" row using the `.card-arrow` nudge.
- **Removed** the dead `gradient` / `accentColor` fields from the `CatalogItem` type and all six
  data entries.

### 4. Stat band → no literal "0" in SSR  *(P2: visibility of system status / AEO / CLS)*
- `AnimatedMetric` and `PodcastPromoCard` now fall back to the **real value** server-side
  (`: value` / `` : `${episodeCount}+` ``) instead of `"0"`. Count-up still animates once in view.
- Verified: SSR HTML contains `160+ / 246+ / 1.5k+ / 500+ / 8+` and **zero** `>0<` placeholders.

### 5. Decorative motion → reducible  *(P1: WCAG 2.3.3)*
- Extended the `@media (prefers-reduced-motion: reduce)` block in `globals.css` to freeze the
  **word-rotator** (`.hero-word-track`), the **hero entrance staggers** (`.hero-stagger-1..4`),
  and the **top-border light sweep** (`section[style*="gradient-hero"]::before`). Hero orbs were
  already covered.

---

## Tokens used (all pre-existing — nothing hardcoded that a token didn't already express)
| Role | Light | Dark | Source |
|---|---|---|---|
| Accent / CTA | `#DC2626` | `#F87171` | `.btn-cta`, coral icon tiles |
| Card surface | `var(--surface-strong)` | `var(--surface-strong)` | `.catalog-card` |
| Card border | `var(--neutral-stroke)` | `var(--neutral-stroke)` | `.catalog-card` |
| Meta chip | zinc-100/200/600 | zinc-800/300 | `.chip-neutral` |
| Headline | `#fff` | `#fff` | `text-white` on hero |
| Type scale | `display-md → display-xl`, `body-lg` | — | `tailwind.config.ts` |

## States covered
- **CatalogCard:** default · hover (border + `card-arrow` nudge, no lift) · focus-visible (global
  `a:focus-visible` ring) · both modes. No loading/empty (static config data).
- **Stat band:** pre-animation (real value) · in-view count-up · reduced-motion (jumps to value).
- **Hero:** entrance stagger · reduced-motion (frozen) · responsive 1280/1024/768/375 (single
  column at all widths).

## Responsive (verified on rendered screenshots)
- Hero centered single column at every breakpoint; CTAs wrap on mobile.
- Catalog grid: 3-col (≥lg) → 2-col (sm) → 1-col (mobile), unchanged grid classes.
- Stat band: 5-col (lg) → 2-col (sm) → 1-col.

## Accessibility notes
- Hero accessible name is a single phrase; rotator is `aria-hidden`.
- Removed the sub-4.5:1 hero microcopy (`rgba(255,255,255,0.45/0.50)`) — it lived in the deleted
  panel, so that contrast risk is resolved by removal.
- All decorative motion now honors `prefers-reduced-motion`.
- Catalog cards remain real `<Link>`s with `aria-label`.

## Out of scope / follow-ups (not done here)
- **P2:** two tabbed sections back-to-back (SignalDashboard + PlatformTabsSection) still read as
  similar switchers — consider differentiating or folding signals into a lighter strip.
- **P3:** consider solid coral (vs `text-gradient`) on the large stat numbers for max legibility.
- Unused hero CSS (`.hero-metric-hero`, `.hero-breakdown`, `.hero-bar-*`, `.hero-grid-dots`,
  `.hero-metrics-feed`) left in `globals.css` — safe to prune in a later cleanup pass.
- Nav/footer and other surfaces were not in scope.

## Reusable tooling added
- `scripts/uiux-home-shot.mjs` — Playwright full-page screenshots, light+dark × 4 breakpoints,
  `--label=before|after`. Playwright added as a devDependency.
