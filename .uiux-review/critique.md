# Critique — Homepage (`/`)

Reviewed against the repo's **locked** monochrome + coral / Inter system (CLAUDE.md), the
UX-laws + critique-rubric references, and WCAG 2.1 AA — verified on rendered screenshots
(`.uiux-review/before/`, light + dark, 1280 / 1024 / 768 / 375).

> Note: the WoT/Atlas "no gradients / no red CTA / Geist" rules are treated as **N/A** per the
> chosen direction (keep the locked system). Findings below are violations of the repo's *own*
> standard or of UX/a11y — not of Atlas.

## Dimension scores
Hierarchy: **major**  ·  Brand: **major**  ·  Composition: minor  ·  Typography: minor  ·  A11y: **major**  ·  Content/IA: minor

---

## Prioritized fixes

### P1 — Critical (breaks usability, a11y, or brand; fix before shipping)

- **Off-system colors in catalog cards.** `catalogs[]` sets `accentColor` to `#a78bfa` (purple),
  `#3b82f6` (blue), `#f59e0b` (amber), `#22d3ee` (cyan), `#ef4444`/`#f87171` (red) used as icon
  fills, glows and orbit rings. · Dimension: Brand · Law: Similarity / Aesthetic-Usability ·
  CLAUDE.md forbids `blue-*`, `amber-*` and "off-system colors"; category colors are allowed
  **only** for SVG ontology diagram fills, not card chrome. · **Fix:** render all six icons in
  coral `#DC2626` (dark `#F87171`) or zinc; drop the per-card rainbow.

- **Two competing focal points in the hero.** The headline ("Discover, govern, and scale …") and
  the giant gradient **"2.4k+"** number are both maximal-weight elements side by side; the eye
  scatters and neither wins. · Dimension: Hierarchy · Law: Von Restorff / "one idea per view" ·
  **Fix:** demote the metric showcase to a quiet supporting panel (smaller number, no gradient
  shimmer) so the headline is the single entry point.

- **The same numbers are shown twice within one viewport.** The hero's right-rail bar chart
  (Podcasts / Agents / MCP / Skills counts) and the 5-cell stat band immediately below render the
  **identical** counts. · Dimension: Hierarchy / Composition · Law: Miller's / Cognitive Load ·
  **Fix:** keep one. Recommended: keep a single chunked stat band, remove the duplicate counts
  from the hero rail (or vice-versa) — don't pay for the same evidence twice.

- **Catalog cards violate the locked card spec.** `CatalogCard` uses `shadow-sm`,
  `hover:shadow-lg hover:-translate-y-0.5`, blurred glows and floating particles. components/
  CLAUDE.md mandates `.catalog-card` = 1px border, **no hover lift, no glassmorphism**. ·
  Dimension: Brand / Consistency · Law: Jakob's / Aesthetic-Usability · **Fix:** flatten to a
  bordered card; remove shadow, translate, glow, particles, orbit ring.

- **Decorative motion ignores `prefers-reduced-motion`.** Hero orbs/aurora, border-sweep,
  word-rotator, pulse-travel dot, grid fade, and bar shimmer are pure CSS with no reduced-motion
  guard (only the JS count-up respects it). · Dimension: A11y (WCAG 2.3.3) · **Fix:** add a global
  `@media (prefers-reduced-motion: reduce)` block freezing the decorative animations.

### P2 — Important (degrades experience or inconsistency; this sprint)

- **Stat numbers are literally "0" in the no-JS / SSR output.** `AnimatedMetric` / `PodcastPromoCard`
  render `"0"` until the client count-up starts. The page is **AEO-optimized**, so crawlers and the
  initial paint see "0+ agents". · Dimension: Content / A11y (status) · Law: Visibility of system
  status · **Fix:** render the real final value as the static base and only *animate* toward it;
  never ship a literal 0. (Also removes a CLS hit.)

- **Rotating-word headline reads wrong to assistive tech.** The `<h1>` stacks all four words, so
  a screen reader announces "AI podcasts AI agents MCP servers AI skills". · Dimension: A11y /
  Content · Law: Jakob's · **Fix:** keep one canonical word in the accessible name (visually-
  hidden), mark the rotator `aria-hidden`, and freeze it under reduced-motion.

- **Low-contrast hero microcopy.** The hero metric label (`rgba(255,255,255,0.45)`) and bar-row
  labels (`0.50`) sit near/below 4.5:1 on `#0A0A0F`. · Dimension: A11y (WCAG 1.4.3) · **Fix:**
  raise to ≥ `rgba(255,255,255,0.62)` (verify on rendered pixels).

- **Two tabbed sections back-to-back.** "Platform signals" (SignalDashboard) and "Platform
  capabilities" (PlatformTabsSection) are adjacent tab UIs with similar weight, so the page asks
  the user to learn two switchers in a row. · Dimension: Content / IA · Law: Hick's / Cognitive
  Load · **Fix:** differentiate them visually, or fold signals into a lighter "latest" strip.

### P3 — Polish (when capacity allows)

- Catalog card title/description zone is cramped under a tall 12-unit gradient header; the
  decision text (`text-zinc-500`) is the smallest, faintest thing on a discovery card. · Hierarchy
  / Typography · **Fix:** shrink the media header, lift title weight/contrast.
- `text-gradient` on big stat numbers slightly lowers legibility vs a solid coral. · A11y/Type ·
  consider solid `#DC2626` for the headline number.
- Long single-column scroll on desktop; rhythm is consistent but the page is ~7 stacked
  full-width sections. · Composition · consider tightening to the highest-value 4–5.

---

## Overall assessment
The homepage is **polished and internally animated, but over-decorated and hierarchically flat**:
its strongest dimension is composition/rhythm (consistent spacing, clean grid, solid dark-mode
parity), and its weakest are **hierarchy and brand-consistency** — the hero has two co-equal focal
points, the same counts appear twice, and the catalog cards reintroduce the exact rainbow palette
and shadow/lift treatment the project's own design system bans. The single highest-leverage change
is to **resolve the hero into one focal point and delete the duplicated stat data**, then flatten
the catalog cards back onto `.catalog-card`. None of this requires leaving the locked monochrome +
coral system — it requires *enforcing* it.
