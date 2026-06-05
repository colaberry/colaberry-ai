---
description: Critique a colaberry.ai surface and output a prioritized P1/P2/P3 fix list with UX laws cited.
argument-hint: "[surface, route, screenshot, or Figma URL — e.g. 'the home hero' or '/aixcelerator/mcp']"
---
# /critique-surface
Run Phase 1 of the `colaberry-frontend-revamp` skill only — a structured critique, no rebuild.

## Steps
1. Extract ground truth needed to judge fairly (real tokens, both modes, baseline screenshot).
2. Score across the six dimensions — Hierarchy, Brand, Composition, Typography, Accessibility,
   Content/IA — using `references/critique-rubric.md`.
3. Map each finding to its UX law / Nielsen heuristic using `references/ux-laws.md`.
4. Compile the single prioritized fix list.

## Output
The critique in the rubric's exact template: dimension scores, P1/P2/P3 fixes
(Issue · Dimension · Law · Fix), and a one-paragraph overall assessment naming the strongest
and weakest dimension and the single highest-leverage change.
