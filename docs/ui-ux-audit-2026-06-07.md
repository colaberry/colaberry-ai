# UI/UX Review & Audit — colaberry.ai

**Date:** 2026-06-07
**Auditor:** Lead UX Researcher & UI Auditor (Claude)
**Scope:** Whole-site heuristic sweep — homepage, navigation, AIXcelerator catalog (Skills/Agents/MCP), detail & ontology/graph templates, conversion forms, resources/podcasts/industries/solutions.
**Frameworks applied:** 12 UX Laws · Design Thinking lifecycle · WCAG 2.2 AA · Colaberry locked theming standard · "Design Slop" red flags.

---

## Executive summary

The platform is built on a strong, well-documented design system (zinc + coral, flat enterprise cards, locked page-structure standard) and several surfaces are genuinely exemplary — `/aixcelerator` is a clean reference page, and dialog focus-trapping, the skip-link, and reduced-motion-aware count-ups are done well.

The audit surfaced **three systemic problem classes**:

1. **Theming drift / "Design Slop"** — forbidden palettes (purple, teal, violet, amber, slate, green) have leaked back into high-value surfaces, most damagingly the **catalog card badges** (every card) and the **demo-request conversion page**. This directly violates the project's own locked standard and erodes brand trust on the highest-intent pages.
2. **Interactive-visualization accessibility** — the SVG ontology diagrams and canvas force-graphs are **mouse-only** (no keyboard, no ARIA, no text alternative), failing WCAG 2.1.1 / 1.1.1 at Level A.
3. **Form & feedback gaps** — missing visible focus rings, consent-gated disabled submit, no "clear filters" affordance, missing loading/skeleton states, and mobile-hidden primary actions (hero metrics, podcast play buttons).

**Fixed in this pass** (see "Fixes applied" below): the centralized theming violations + the global input focus ring + the demo-form submit/feedback issues — i.e. the highest-leverage, lowest-risk items. The remaining items are documented with recommendations and severity.

---

## Severity legend

| Severity | Meaning |
|----------|---------|
| **Critical** | Breaks the locked design system on a key surface, blocks a conversion, or fails WCAG Level A. |
| **High** | Significant usability/accessibility harm or WCAG AA failure. |
| **Medium** | Noticeable friction or inconsistency. |
| **Low** | Polish / consistency / best-practice. |

---

## Fixes applied in this pass

| # | File | Issue | Fix | Severity |
|---|------|-------|-----|----------|
| 1 | `src/lib/catalogFormatters.ts` | `beta` badge used forbidden **amber**; `partner` badge used forbidden **violet** — on every catalog card | Mapped `beta` → coral pivot tokens (Von Restorff emphasis), `partner` → neutral zinc tokens | Critical |
| 2 | `src/styles/globals.css` | `.input-premium:focus` had **no visible focus ring** (`box-shadow: none`) — every form field | Added coral focus ring (`0 0 0 3px rgba(220,38,38,.25)` / `F87171` in dark) | High (WCAG 2.4.7) |
| 3 | `src/pages/search.tsx` | Result-type badge used **purple/blue** hex | Swapped to `chip chip-neutral` | Critical |
| 4 | `src/pages/request-demo.tsx` | Whole page chrome used **purple + teal** (kicker, dots, step badges); duplicate off-screen submit button | Replaced palette with zinc/coral; step badges → locked numbered-indicator pattern; duplicate submit → in-page anchor (`#demo-request-form`) | Critical |
| 5 | `src/components/DemoRequestForm.tsx` | Success message rendered in forbidden **green**; submit **disabled until consent** (no explanation = broken-button anti-pattern) | Success → `text-zinc-900 dark:text-zinc-50` (semibold); removed `!consent` from `disabled` (validation already surfaces the inline error on submit) | Critical / High |
| 6 | `src/pages/industries/index.tsx` | All 14 industry/highlight icons stroked in **coral** — dilutes coral's CTA meaning (Von Restorff) | Icons → `currentColor` with `text-zinc-700 dark:text-zinc-300` | Medium |
| 7 | `src/pages/solutions/index.tsx` | Forbidden **slate** hex caption; `card-elevated`/`card-feature` hover-lift cards | Caption → `text-zinc-500 dark:text-zinc-400`; cards → `.catalog-card` | Critical / Medium |

---

## Outstanding findings (recommended, not yet applied)

### Critical — Interactive visualization accessibility

- **SVG ontology nodes are not keyboard operable.** `OntologyPageTemplate.tsx` (category/item/collection `<g onClick>`) and `aixcelerator/ontology.tsx` use bare `<g onClick onMouseEnter>` with no `tabIndex`/`role`/`onKeyDown`/focus style. *Fix:* render nodes as focusable (`tabIndex={0}`, `role="link"`, `aria-label`, Enter/Space handler, visible focus ring). The **mobile card fallbacks already use real `<button>`s** — porting that pattern to desktop resolves this. *(WCAG 2.1.1 A)*
- **Diagram SVGs have no accessible name/role.** Add `role="img"` + `<title>`/`<desc>` describing the Taxonomy → Relation Graph → Collections structure. *(WCAG 1.1.1 / 1.3.1 A)*
- **Force-graph canvas (`GraphPageTemplate`, `CollectionGraph`) is entirely inaccessible** — no keyboard path, no text alternative; node activation is pointer-only. *Fix:* provide an adjacent keyboard-navigable node/link list as the canonical path and mark the canvas `aria-hidden` / `role="img"` with a summary. *(WCAG 2.1.1 / 1.1.1 A)*

### High

- **No reduced-motion guard** on force-graph particle animation / layout settle (`GraphPageTemplate`, `CollectionGraph`). Gate `linkDirectionalParticles`/`cooldownTicks` on `prefers-reduced-motion`. *(WCAG 2.3.3)*
- **No loading/skeleton state** on (a) graph dynamic-import + settle, and (b) catalog **filter changes** (`skills/index.tsx`, `mcp.tsx` fetch on filter change with no busy indicator). *(Doherty Threshold)*
- **No "Clear all filters" affordance** on any catalog page despite 5–6 stackable filters; empty-state copy says "try clearing filters" but offers no button. Add a reset control + wire it into the empty `StatePanel` action. *(Tesler's Law / error recovery)*
- **Mobile: hero metrics feed hidden** (`index.tsx` `hidden lg:flex`) — the big number + 4 category shortcuts vanish on mobile. Render a compact mobile version. *(Mobile / Von Restorff / Fitts)*
- **Mobile: podcast list-card play buttons hidden** (`resources/podcasts/index.tsx` `hidden sm:flex`) — primary action unavailable on the dominant podcast context. *(Fitts / Jakob)*
- **Custom audio slider thumb/focus invisible to keyboard** (`AudioPlayerUI.tsx` `opacity-0 group-hover:opacity-100`); add `focus-within`/`focus-visible` reveal + ring. *(WCAG 2.4.7)*
- **Audio transcripts**: no `<track>`/synchronized alternative; static-text fallback not labeled as the audio alternative. *(WCAG 1.2.1/1.2.2)*
- **Infinite scroll has no manual/keyboard "Load more" fallback** and status text isn't an `aria-live` region (`podcasts/index.tsx`, and inconsistent pagination across the 3 catalog pages). *(WCAG 4.1.3 / Jakob)*
- **Substack signup shows false "success"** if the popup is blocked (`SubstackEmbedSignup.tsx`) — reframe as "pending confirmation" and detect `window.open` failure. *(Visibility of true status)*
- **Latent nav release-gating bug** (`Layout.tsx`): `RELEASE_HIDDEN_PATHS` filtering lives in an unused `_mergeGlobalNavigation`; gating isn't applied at render. Any future header link could leak a hidden route. Apply `isReleasePath` filtering at render.

### Medium

- **Tap targets < 24px** on sort/visibility chips across catalog pages (`py-1 text-xs`); bump to meet WCAG 2.5.8.
- **Incomplete ARIA tab patterns** (homepage `SignalDashboard`/`PlatformTabs`, podcast detail Notes/Transcript): `role="tab"` without `tabpanel`/`aria-controls`/roving-tabindex/arrow keys. Either complete the pattern or drop the roles.
- **Search-icon hidden until hover** (`opacity-0 group-hover`) on catalog search inputs — invisible on touch. Show at `opacity-60` default.
- **Graph navigation uses `window.location.href`** (full reload) instead of `router.push` — slow, breaks SPA. Several templates + skill detail mini-graph.
- **Hover-only graph tooltips** unavailable on touch/keyboard; node metadata never shown before navigating away.
- **Status badges rely on zinc-lightness alone** (no green/amber allowed) — add a non-color cue (dot/icon) so live vs. planned/draft is perceivable. *(Von Restorff / 1.4.1)*
- **Placeholder "Planned" surfaces** (`resources/books.tsx`, `solutions/index.tsx`) present dead tiles — replace with honest empty-state + subscribe CTA, or hide via `RELEASE_HIDDEN_PATHS`.
- **Warm-beige palette** on podcast surfaces (`#F5F3EE`/`#E8E5DE`/…) deviates from locked zinc — either formally document as a sanctioned exception or migrate to zinc.
- **Heading hierarchy gaps** on catalog & detail pages (h1→h3 jumps; sidebar `<h3>` with no parent `<h2>`). *(WCAG 1.3.1 / 2.4.10)*
- **Homepage `<h1>` word-rotator** exposes a concatenated 4-word accessible name; give a single `aria-label` + `aria-hidden` rotating spans.
- **`EnterpriseCtaBand` contrast** depends entirely on an external CSS class for its dark background; add an explicit `bg-zinc-950` fallback so white text is never white-on-white.

### Low (selected)

- Rainbow per-type accent colors on homepage signal/catalog data (`index.tsx`) — route through sanctioned `categoryColors` or drop to coral+zinc.
- `card-glass`/`gradient-border` glassmorphism on homepage QuickLink/metric cards — replace with `.surface-panel`/`.catalog-card`.
- Pluralization ("1 results") and silent per-type result caps on `search.tsx`.
- `.chip-muted` vs documented `.chip-neutral` inconsistency on filter chips.
- ToolCard arrow missing `card-arrow` micro-interaction class.
- Ontology diagram renders raw `col.slug` instead of `col.name`.
- Legal pages: add anchored TOC; `cookie-policy.tsx` `bg-white/95` → `bg-zinc-50/95` (dark-mode safety-net).
- Lens demo iframe: add a load timeout → error fallback to avoid an infinite spinner.

---

## What's working well (keep)

- `/aixcelerator` overview — clean zinc-only reference, `ContentTypeIcon` throughout, `gap-px` border grids, proper icon-link `aria-label`s.
- Dialog focus-trap + `inert` + scroll-lock (search/mobile/workspace), skip-link, reduced-motion-aware count-ups.
- Mobile **card fallbacks** for SVG diagrams use real `<button>`s — more accessible than the desktop SVG path (port this to desktop).
- Demo form is otherwise strong on a11y: explicit labels, `aria-invalid`/`aria-describedby`, `role="alert"`, autocomplete, honeypot, inline validation.

---

## Suggested next sprint (priority order)

1. **Make all interactive viz keyboard- + SR-accessible** (port the mobile `<button>` pattern to desktop SVG; add node-list fallback for canvas graphs). *Critical, Level A.*
2. **Catalog UX:** clear-filters affordance + filter-change loading state + actionable empty states.
3. **Mobile parity:** unhide hero metrics and podcast play buttons; audio slider focus visibility.
4. **Reduced-motion + graph loading skeletons.**
5. **Sweep remaining theming drift** (homepage rainbow accents, glassmorphism, warm-beige decision).
