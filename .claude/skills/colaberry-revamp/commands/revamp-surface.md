---
description: Run the full colaberry.ai revamp workflow on a surface — audit, critique, redesign, rebuild, verify, hand off.
argument-hint: "[surface or route — e.g. 'the agents catalog', '/request-demo', or a screenshot/Figma URL]"
---
# /revamp-surface
Drive an end-to-end revamp of a colaberry.ai surface using the `colaberry-frontend-revamp` skill.

## Steps
1. **Ground truth** — Identify the route and extract live tokens, fonts, and reusable components
   (light + dark). Capture a baseline screenshot. Load `references/brand-tokens.md`.
2. **Critique** — Score the surface across the six dimensions and produce the prioritized
   P1/P2/P3 fix list with laws cited. Load `references/critique-rubric.md` + `references/ux-laws.md`.
3. **Direction** — Write the one-page design philosophy, lock target tokens (note any Atlas
   deltas), and list reuse / refactor / net-new components.
4. **Rebuild** — Implement in Next.js/React/Tailwind/shadcn, composing tokens, hitting every
   state in both modes, applying the per-surface law-driven moves. Load `references/component-playbook.md`.
5. **Verify** — Render-screenshot loop across modes + breakpoints; run the a11y and brand-
   compliance checks; fix and re-screenshot until clean (expect 2–3 passes).
6. **Hand off** — Produce the developer handoff (tokens, props/variants, states, responsive,
   edge cases, motion, a11y) with before/after evidence and fix-list status.

## Output
Implemented surface + a Markdown handoff doc + before/after rendered screenshots + the
prioritized fix list (with status). Offer a standalone HTML preview for stakeholder review.
