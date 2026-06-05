# Multi-surface UI/UX revamp — consolidated handoff

Scope: one representative per surface type (~12), critiqued via a verified workflow audit
(`audit-summary.md`), then implemented in **leverage order** against the **locked monochrome +
coral / Inter** system. `tsc` 0 errors · `eslint` 0 errors · `npm run build` exit 0 (90/90 pages).
Evidence: `.uiux-review/after-multi/` (desktop light+dark) + homepage `.uiux-review/after/`.

> Direction (unchanged from the homepage pass): **enforce the existing system** — purge
> off-palette colors, flatten decorative cards, fix global a11y tokens. No Atlas migration,
> no font change, coral CTAs kept.

---

## IMPLEMENTED & verified

### Theme D — global a11y tokens (helps every page/form)
- `globals.css` `--stroke-focus` light `rgba(24,24,27,0.3)` → `0.55` — the site-wide focus ring
  was ~1.9:1, now clears 3:1 (WCAG 2.4.11). *(CHR-03)*
- `globals.css` `.input-premium:focus` (both blocks) + `.dark .input-premium:focus` — added a
  visible coral ring (`0 0 0 3px rgba(220,38,38,.28)` / dark `rgba(248,113,113,.30)`). The default
  field focus previously had **no visible change** (same border color). Fixes every form. *(request-demo P1, collections P2)*

### Theme A — forbidden colors in shared layer (helps all 5 content types)
- `lib/catalogFormatters.ts` — status tones `active/live` (green `--trusted-*`) and `beta` (amber)
  and source `partner` (violet) → neutral zinc `NEUTRAL_TONE`. State now read from the label, not
  color. *(catalog P1 amber + green)*
- `AgentCard/MCPCard/SkillCard/ToolCard` — hardcoded `bg-[#DC2626]` type-dot → `bg-[var(--pivot-fill)]`
  (dark-aware); verified badge `--trusted-*` (green) → `--neutral-*`; added `sr-only "Status:"`
  prefix so the pill isn't color-only. *(catalog P1/P2)*
- `CollectionGraph.tsx` legend — DOM swatches painted with `RELATIONSHIP_TYPE_COLORS`
  (emerald/amber/blue/violet/orange) → monochrome `.chip-neutral` count pills. **Canvas edge
  colors kept** (sanctioned in-canvas exception). Fixes graph + collection-detail. *(collection-detail P1)*

### Theme B/C — per-page brand hexes + flat cards
- **request-demo** — removed purple/teal kicker (`#4F2AA3/#008EA8/…`) → standard `SectionHeader`
  `kicker`; removed the **duplicate** hero "Submit" button (one primary now lives in the form,
  Von Restorff); bullet/step accents → coral token; step cards `card-elevated` → flat `.section-card`
  with zinc number badge. *(3 P1 + 1 P2)*
- **industries** — icons `stroke="#DC2626"` → `currentColor` + `text-[#DC2626] dark:text-[#F87171]`
  (correct dark-aware coral; SVG `var()` attrs don't resolve); repointed 3 links from the hidden
  `/resources/case-studies` → live `/resources/books`; section headers `md` → `lg`; dropped the
  redundant "Industry" meta badge. *(2 P1 + 2 P2)*
- **search** — purple result badge → `.chip-neutral`; result rows `card-elevated` → flat `.catalog-card`;
  group labels `<div>` → semantic `<h2>` with `aria-labelledby`. *(3 P1)*
- **podcasts** — warm-beige hero/sidebar/separator/chips/text-hexes (`#F5F3EE/#E8E5DE/#D4D1CA/…`,
  reused footer-surface colors off-label) → zinc tokens; list rows `card-elevated` → flat
  `.catalog-card flex-row`; date/duration/source meta `text-zinc-400` → `text-zinc-500 dark:text-zinc-400`
  (light-mode AA fix). *(2 P1 + 2 P2)*
- **catalog listing (agents)** — removed the `reveal stagger-grid` co-class (documented anti-nest). *(P1)*
- **collections listing** — search input `type=search` + `aria-label` + placeholder contrast;
  filter pills → `.chip-brand`/`.chip-neutral` + `aria-pressed`; result count `aria-live`; dropped
  `reveal` from the stagger grid. *(P1 + P2s)*
- **collection-detail** — section headings promoted from 11px uppercase kickers to real `<h2>`;
  items grid moved to a top-level `.stagger-grid`. *(2 P1)*
- **detail-profile ([slug])** — Related Agents: removed the `.card-elevated` wrapper (double-border +
  hover-lift) → bare `<AgentCard>`. *(P2)*

---

## NOT YET IMPLEMENTED — specs ready (each needs its own verified pass)

These are the larger / higher-blast-radius items. Specs and exact line refs are in
`audit-summary.md`; ordered by leverage.

1. **Ontology + Graph SVG/canvas keyboard a11y (Theme E — biggest).** `OntologyPageTemplate.tsx`
   clickable `<g>` and the `react-force-graph` canvas are **mouse-only**, unlabeled, and below the
   contrast/target-size floors. Spec: make nodes real controls (`role=button`, `tabIndex=0`,
   `aria-label`, `onKeyDown` Enter/Space → `router.push`), focus-driven tint, SVG focus ring,
   `role=img` on `<svg>`; for graph add a focusable node directory + `aria-label` on the canvas;
   raise muted SVG text ramps to AA; mobile targets to 44px. **Shared by all 5 content types** —
   verify each in both modes. (Skills ontology is a separate custom diagram — own pass.)
2. **GraphPageTemplate DOM rainbow chips** — edge-filter dot / tooltip dot / legend dots & lines
   (`graphUtils` forbidden hexes) rendered as DOM chips → zinc (canvas-internal colors kept).
   Plus icon-button `aria-label`s + 44px controls + search `aria-label`.
3. **platform-overview hierarchy** — promote the live-metrics band to the visual peak
   (`text-xl` → `text-3xl/4xl tabular-nums`), establish a 3-tier emphasis across the six monotone
   `gap-px` grids, fold the hand-rolled hero kicker into `SectionHeader`. *(Note: contradicts the
   "unified gap-px grid" note in `src/pages/CLAUDE.md` — needs a doc update / sign-off.)*
4. **StickyTabBar a11y (detail pages, shared)** — `aria-current` on active tab, non-color cue
   (font-weight), move focus to the target section after scroll. Grep consumers before editing.
5. **catalog-listing IA P2s** — Clear-all filters + wire the empty-state action; route the ad-hoc
   `focus:ring-zinc-900/10` inputs to the standard ring; `role=radiogroup`/`aria-pressed` on the
   sort/visibility chip groups.

---

## DECISION NEEDED (not a bug — your call)
- **Footer warm-beige surface** (`.footer-surface` `#E8E5DE`/`#2A2824` + separators) is off the
  locked zinc palette, BUT it's applied **consistently site-wide** and labelled "warm premium
  footer surface" — i.e. it reads as an *intentional* cohesive treatment, unlike the podcasts page
  that merely *reused* those tokens (now fixed). I left the footer as-is rather than recolor every
  page's footer. If you want strict zinc-only, the swap is: `.footer-surface` → `var(--surface-soft)`
  light / zinc-900 dark; separators → `var(--stroke)`. One global change, regression-check all pages.

## Notes for implementers
- `catalogFormatters.ts`, `CollectionGraph.tsx`, `CollectionsPageTemplate.tsx`, `OntologyPageTemplate.tsx`,
  `GraphPageTemplate.tsx`, `StickyTabBar.tsx`, `globals.css` are **shared** — every edit ships to all
  consumers. Re-verify mcp/skills/tools/podcasts variants in both modes at 1280/1024/768/375.
- Never touch the global `--trusted-*` / `--pivot-*` CSS vars (power `.badge-*` site-wide); fix color
  at the formatter-string / per-component level (as done).
- `.catalog-card` forces `flex-direction:column`; when using it for a horizontal row add `flex-row`
  (done for podcasts list rows).
