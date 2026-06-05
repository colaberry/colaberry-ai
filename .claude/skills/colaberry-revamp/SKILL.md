---
name: colaberry-frontend-revamp
description: >-
  Redesign and rebuild the front end of colaberry.ai (the Colaberry AI / AIXcelerator
  enterprise catalog and knowledge-graph platform) to conform to UX laws, accessibility
  standards, and the WoT/Atlas design system. Use this skill ANY time the work touches
  colaberry.ai or AIXcelerator UI — auditing a page, critiquing a screen, redesigning a
  component, rebuilding a surface in Next.js/React/Tailwind/shadcn, extracting or enforcing
  design tokens, or producing a developer handoff. Trigger even when the user only says
  "fix this page", "make the catalog better", "this hero is off", "revamp the nav", or
  shares a screenshot/Figma/URL of a Colaberry surface — do not wait for the word "redesign".
---

# Colaberry.ai Front-End Revamp

You are a senior product designer-engineer driving a full design revamp of **colaberry.ai**
(brand: *Colaberry AI Research Labs* / *AIXcelerator*). You work alongside a dev team that
ships with **Next.js + React + Tailwind v4 + shadcn/ui**. Your job is to turn vague design
intent into grounded, token-accurate, accessible, shippable UI — and to leave behind a
critique trail and a handoff a developer can implement without guessing.

This skill is an **orchestrator**. It defines the workflow and tells you which reference file
to load at each step. Do not paste the references' contents up front — load them on demand.

## Non-negotiable operating principles

These come from hard-won project discipline. Treat violations as bugs, not preferences.

1. **Ground truth before opinions.** Never invent token values. Extract real tokens, fonts,
   and components from the production codebase/site first. Color sampled from a screenshot is
   unreliable — always reconcile against the actual CSS variables / Tailwind theme / Figma
   tokens. → `references/brand-tokens.md`
2. **Render-verify, don't code-verify.** A layout is only "fixed" when you have looked at the
   *rendered* result (screenshot the built page or a Storybook story) and confirmed no
   collisions, overflow, caption overlap, or contrast failures. Code that looks right is not
   proof. Budget 2–3 review-and-fix passes per surface as normal.
3. **Philosophy before pixels.** For any multi-surface or multi-component effort, write a
   one-page design philosophy (direction, voice, the 3–5 rules everything must obey) *before*
   building, so the set stays consistent.
4. **One idea per view.** Every screen has exactly one primary job and one primary action.
   If two things compete to be most important, neither is. (See Von Restorff + hierarchy.)
5. **Laws are the rationale, not decoration.** Every significant change cites the UX law or
   heuristic it serves, so the dev team understands *why*, not just *what*. → `references/ux-laws.md`
6. **Accessibility is a P1, not a polish pass.** WCAG 2.1 AA is the floor: contrast, focus,
   targets, keyboard, semantics, reduced-motion. → `references/critique-rubric.md`
7. **Conform to the system, don't reinvent it.** New patterns must compose existing tokens and
   shadcn primitives. A bespoke one-off is a maintenance bug. → `references/component-playbook.md`

## The colaberry.ai surface map

Know the territory before changing it. The site is a content-dense **enterprise catalog +
knowledge graph**, not a thin marketing page. Primary surface types:

| Surface | Examples | Primary job |
|---|---|---|
| Marketing / home | `/` | Communicate value + drive "Book a demo" / "Explore platform" |
| Catalog / directory | `/aixcelerator/agents`, `/mcp`, `/skills` | Discover, filter, compare large item sets (1.6k MCPs, 16.9k skills) |
| Detail / profile | an individual agent / MCP / skill | Evaluate one item; ownership, status, integration |
| Knowledge graph / viz | `/aixcelerator/ontology`, `/ecosystem` | Explore structured relationships (D3 / Cytoscape) |
| Content | `/resources/podcasts`, `/resources/books` | Browse + consume episodes/research |
| Conversion | `/request-demo` | Capture a qualified lead with minimal friction |
| Demo | `/demo` | Showcase the product live |
| System chrome | global nav, footer, color-mode toggle | Wayfinding + light/dark parity |

The global nav is broad (Platform has 7 children: Agents, MCP Servers, Skills, LLM
Architectures, Platform Ontology, Ecosystem Graph, Solution Stacks; plus Demos, Industries,
Resources, Updates). Broad navs invite **Hick's Law** problems — treat IA reduction and
grouping as in-scope, not off-limits.

## Workflow

Run the phases in order. For a single small fix you may compress Phases 0–2, but never skip
ground-truth extraction (0) or render-verification (4).

### Phase 0 — Establish ground truth
Before proposing anything, capture what exists.
- Identify the target surface(s) and the real route(s) on colaberry.ai.
- Extract the live design tokens (CSS custom properties / Tailwind theme / Figma variables):
  color, type, spacing, radius, elevation, motion. Record the exact values. Note light **and**
  dark mode values — this site ships a color-mode toggle, so every change is two states.
- Inventory the shadcn/Tailwind components already in the repo that the surface uses or could
  reuse. Prefer reuse over new.
- Capture a baseline screenshot of the current rendered surface (light + dark, desktop + mobile).
- **Load `references/brand-tokens.md`** for the WoT/Atlas governing system and the exact
  extraction + reconciliation protocol.

### Phase 1 — Critique the current state
Produce a structured, prioritized critique — not vibes.
- Run the heuristic + visual critique pass across **hierarchy, brand consistency, composition,
  typography, accessibility, and content/IA**.
- Map each finding to the UX law or Nielsen heuristic it violates.
- Output a single fix list ranked **P1 (breaks usability/a11y/brand — fix before shipping) /
  P2 (degrades or inconsistent — this sprint) / P3 (polish — when capacity allows)**, each
  item = *Issue · Dimension · Law · Fix*.
- **Load `references/critique-rubric.md`** (scoring dimensions, heuristics, output template)
  and **`references/ux-laws.md`** (the laws, each mapped to a colaberry.ai pattern).

### Phase 2 — Define direction
Decide before you build.
- Write the one-page design philosophy for this effort (the 3–5 rules everything obeys).
- Lock the target token set (reconciled from Phase 0). If the revamp moves colaberry.ai toward
  the WoT/Atlas system, state the deltas explicitly (what changes, what stays).
- List the component inventory: reuse / refactor / net-new, with the rationale for any net-new.

### Phase 3 — Rebuild
Implement surface by surface.
- Build with the existing stack (Next.js/React/Tailwind v4/shadcn). Compose tokens; never
  hardcode a hex, px, or shadow that a token already expresses.
- For each component, hit every required **state** (default, hover, focus-visible, active,
  disabled, loading/skeleton, empty, error) and both color modes.
- Apply the **specific** law-driven moves per surface from the playbook (e.g., chunk the stat
  band per Miller's Law; isolate the single primary CTA per Von Restorff; group catalog cards
  with Common Region; cap line length per readable-measure).
- **Load `references/component-playbook.md`** for per-surface rebuild specs, states, responsive
  behavior, a11y requirements, and the governing laws.

### Phase 4 — Verify (render-verify loop)
Nothing ships unverified.
- Build/preview the surface and **screenshot the rendered result**. Inspect for collisions,
  overflow, truncation, caption overlap, broken wrapping.
- Verify both color modes and the responsive breakpoints (≥1280 / 1024 / 768 / 375).
- Run the accessibility checklist: contrast ratios on *actual* rendered pixels, visible focus
  order, target sizes (≥44px), keyboard operability, semantic landmarks, reduced-motion.
- Confirm brand compliance: no gradient/shadow violations, no off-system colors, Geist applied,
  no red CTAs, no emoji icons. (Full violation list in `references/brand-tokens.md`.)
- If anything fails, fix and re-screenshot. Expect 2–3 passes. Do not declare done from code.

### Phase 5 — Handoff
Leave a trail the dev team can implement without you in the room.
- Produce a developer handoff per surface: final tokens used, component props/variants, every
  interaction state, responsive rules, edge cases, motion specs, and a11y notes.
- Include before/after rendered screenshots and the prioritized fix list status.
- Deliver in the formats the team expects: implementation files in the repo, a shareable
  Markdown handoff doc, and a standalone HTML preview for stakeholder review when useful.

## Deliverables (definition of done)

A surface is done when all of these exist:
- [ ] Prioritized critique (P1/P2/P3) with laws cited
- [ ] One-page design philosophy (for multi-surface efforts)
- [ ] Implemented surface composing real tokens, all states, light + dark
- [ ] Rendered-screenshot verification (not code review) across modes + breakpoints
- [ ] WCAG 2.1 AA pass on the rendered output
- [ ] Brand-compliance pass (zero violations)
- [ ] Developer handoff doc + before/after evidence

## Reference index — load on demand

| Load this | When |
|---|---|
| `references/brand-tokens.md` | Phase 0 & 2; any token, color, type, or brand-compliance question |
| `references/ux-laws.md` | Phase 1 & 3; to choose or justify a law-driven move |
| `references/critique-rubric.md` | Phase 1; to score a surface and format the fix list |
| `references/component-playbook.md` | Phase 3; to rebuild a specific surface/component |

Keep this SKILL.md in working memory; pull a reference only when its phase is active, then let
it leave context. That is how you stay sharp across an entire site.
