# Component Playbook — colaberry.ai surfaces

Load this in Phase 3 to rebuild a specific surface. Each entry gives the surface's primary job,
the laws that govern it, structure, required states, responsive behavior, and a11y. Build with
the existing Next.js/React/Tailwind v4/shadcn stack; compose tokens (see `brand-tokens.md`);
verify by rendered screenshot (see SKILL.md Phase 4).

**Required states for every interactive component:** default · hover · focus-visible · active ·
disabled · loading/skeleton · empty · error — in **both** color modes.

**Responsive breakpoints:** ≥1280 (desktop) · 1024 (laptop) · 768 (tablet) · 375 (mobile).

---

## Global navigation + color-mode toggle
- **Job:** wayfinding across a broad IA; surface the one primary action.
- **Laws:** Hick's (7-child Platform menu is overload), Serial Position (first/last items),
  Jakob's (conventional placement), Fitts's (toggle + CTA targets).
- **Structure:** group Platform's children into 2–3 labeled clusters (e.g., *Catalogs*:
  Agents/MCP/Skills · *Structure*: LLM Architectures/Ontology/Ecosystem · *Stacks*: Solution
  Stacks) inside a mega-menu. Keep one accent CTA ("Book a demo") isolated at the bar's end.
  Color-mode toggle is conventional, icon-labeled, with accessible name.
- **States:** menu open/closed, item hover/focus, current-route indicator (not color alone —
  add weight/underline), sticky-on-scroll shadow-free separation (border, per brand).
- **Mobile:** collapses to a drawer; clusters become accordions; CTA pinned and reachable.
- **A11y:** `nav` landmark, keyboard-operable menu (arrow keys, Esc to close), focus trap inside
  open drawer, visible focus, toggle announces state.

## Hero (home `/`)
- **Job:** state the value and drive ONE action.
- **Laws:** Von Restorff (one accent CTA), Hick's (don't stack three equal CTAs), hierarchy
  (single dominant headline), readable-measure (subhead ≤75ch).
- **Structure:** headline (the rotating "Discover, govern, and scale … podcasts/agents/MCP/
  skills" can stay, but as supporting motion, not as a second focal point); one-line value prop;
  one primary CTA ("Book a demo") + one quiet secondary ("Explore platform") as a text/ghost
  link, not a second filled button; the six catalog links demoted to a tidy chip row below.
- **States:** rotating word respects `prefers-reduced-motion` (freeze to a sensible default).
- **A11y:** rotating text must not be the only way to read the message; motion reduced on request.

## Stat band ("19k+ resources", podcasts/agents/MCP/skills counts)
- **Job:** establish credibility with evidence, scannably.
- **Laws:** Miller's (chunk, don't pile), Similarity (uniform stat blocks), typography (tabular
  numerals, aligned baselines).
- **Structure:** one headline number leads (e.g., 19k+ cataloged); 3–4 supporting stats grouped
  with consistent label/number/caption order; equal-width cells on a shared baseline. Avoid the
  "0" placeholder values rendering before count-up — show a skeleton, not a literal 0.
- **States:** loading skeleton (never flash "0"); count-up animation reduced on request.
- **A11y:** numbers + labels both readable; not conveyed by size alone.

## Catalog / directory grid (Agents, MCP, Skills)
- **Job:** discover, filter, and compare large sets (1.6k MCPs, 16.9k skills).
- **Laws:** Tesler's (absorb complexity into search/defaults), Jakob's (conventional facets +
  sort + card/table toggle), Common Region + Proximity (card grouping), Doherty (<400ms feel),
  Hick's (progressive-disclose advanced filters).
- **Structure:** persistent search; a small set of high-value facets visible, the rest behind a
  "More filters" disclosure; sort control; card⇄table toggle for power users; result count for
  system-status visibility. Card = name → category → status pill → one action; identical
  structure across all cards (Similarity).
- **States:** loading = skeleton cards; empty = helpful zero-result with cleared-filter action;
  error = retry; filter applied = visible removable chips (recognition over recall);
  pagination/infinite-scroll with a clear end.
- **Responsive:** 4-col → 3 → 2 → 1; filters move to a bottom-sheet/drawer on mobile.
- **A11y:** cards are real links/buttons with accessible names; filter controls labeled; status
  pills not color-only (icon or text too); keyboard-navigable grid.

## Detail / profile page (one agent / MCP / skill)
- **Job:** let a user evaluate and decide to deploy/integrate.
- **Laws:** hierarchy (decision-relevant info first: what it is, status, ownership), Peak-End
  (this is a peak moment — make it confident), Proximity (group metadata).
- **Structure:** title + category + status; primary action (deploy/connect/request); structured
  sections (overview, integration/runbook, ownership, related items via the knowledge graph).
  Related-items end state pulls users onward (Serial Position / Peak-End).
- **States:** loading skeleton per section; missing-data graceful (no empty headers).
- **A11y:** heading order, landmarks, descriptive link text for related items.

## Knowledge graph / ontology / ecosystem viz (D3 / Cytoscape)
- **Job:** make structured relationships explorable — the product's "aha".
- **Laws:** Doherty (responsive interaction), Cognitive Load (don't render the whole graph at
  once), Peak-End (invest here).
- **Structure:** entry view scoped/seeded, not the full 19k-node hairball; zoom/pan; focus +
  context (highlight neighborhood on select); legend; search-to-locate. Progressive expansion.
- **States:** loading, empty-selection, isolated-node, dense-cluster handling; reduced-motion
  for layout animation.
- **A11y:** provide a non-graph alternative (list/table of the same relationships) for keyboard
  and screen-reader users; don't rely on color alone for node/edge type; keyboard focus on nodes.
- **Brand:** flat node styling, brand-mapped categorical colors re-tuned for dark mode.

## Content cards (Podcasts, Books & Research) + Latest/Trending tabs
- **Job:** browse and consume; resurface fresh + popular.
- **Laws:** Similarity (uniform episode cards), Uniform Connectedness (tab group reads as one
  control), Serial Position, readable-measure (transcripts/notes ≤75ch).
- **Structure:** tabbed switcher (Podcasts/Agents/Skills/MCP; Latest/Trending) as a connected
  segmented control; episode card = title → date · duration → source → action; consistent meta.
- **States:** active tab clearly indicated (weight + underline, not color-only); loading skeleton;
  empty per tab.
- **A11y:** tabs use proper `tablist`/`tab`/`tabpanel` semantics, arrow-key navigation; player
  controls labeled.

## Conversion form (`/request-demo`)
- **Job:** capture a qualified lead with minimal friction.
- **Laws:** Postel's (forgiving input), Goal-Gradient + Zeigarnik (visible progress), Fitts's
  (large submit), Peak-End (confident confirmation).
- **Structure:** shortest viable field set; logical grouping (Proximity); inline validation;
  one primary submit (accent, never red). If multi-step, show "step X of Y".
- **States:** field default/focus/error/success; submit default/loading/disabled; success screen
  that confirms next steps (the "end" that shapes the whole judgment).
- **A11y:** every input has a tied `<label>`; errors announced and linked to fields; submit
  reachable by keyboard; no validation that punishes formatting.

## Footer
- **Job:** secondary wayfinding + trust.
- **Laws:** Common Region (grouped link columns), Serial Position.
- **Structure:** grouped, labeled columns; brand mark with light/dark SVG parity; legal; no
  decoration tax. Flat, bordered separation per brand.
- **A11y:** `contentinfo` landmark, real links, sufficient contrast in both modes.

---

## Per-component definition of done
- [ ] Composes real tokens (no hardcoded hex/px/shadow)
- [ ] All required states implemented, both color modes
- [ ] Responsive across the four breakpoints
- [ ] WCAG 2.1 AA on rendered output (contrast, focus, targets, keyboard, semantics, motion)
- [ ] Zero brand violations (flat, no red CTA, Geist, line icons)
- [ ] Governing law(s) cited in the handoff note for the component
