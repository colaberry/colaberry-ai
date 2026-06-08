# Critique Rubric

Load this in Phase 1. Use it to score a colaberry.ai surface across six dimensions, then
compile a single prioritized fix list. The goal is a critique a developer can act on — every
finding names what is wrong, which dimension/law it belongs to, and the specific fix.

## The six critique dimensions

Score each `pass` / `minor` / `major`. For each finding, write *Observation → Problem → Fix*.

### 1. Visual hierarchy
- **Entry point:** Is the first thing the eye lands on the *most important* thing? One dominant
  element, or does attention scatter?
- **Eye flow:** Is the scan path deliberate (F/Z-pattern, intentional order)? Any dead ends?
- **Weight:** Are size steps ≥1.5× between levels? Is bold used sparingly enough to keep signal?
- **Emphasis:** Exactly one primary emphasis zone per view? Is the CTA louder than its
  surroundings, or buried?
- Failure patterns: competing primaries, flattened hierarchy, false emphasis (decoration louder
  than function), buried CTA.

### 2. Brand consistency
- Does it use the WoT/Atlas tokens (Geist, navy/cyan/teal, flat) — or off-system values?
- Any forbidden treatments: gradients, drop shadows, red CTAs, emoji icons, mismatched radii?
- Voice/tone: confident, structured, enterprise — not hypey. (Details in `brand-tokens.md`.)

### 3. Composition
- Balance and rhythm: consistent spacing scale, aligned grid, intentional whitespace.
- Density: is the catalog readable, or a wall? Gestalt grouping correct (proximity/common region)?
- Alignment: shared baselines, edges, and gutters across the grid.

### 4. Typography
- One modular scale, consistent line-heights, no orphan sizes.
- **Measure:** body line length 45–75 characters (≈65 ideal). Long-form (podcast notes, books,
  research) must not run full-width.
- Hierarchy via type is legible at a glance; numerals in stat bands are tabular and aligned.

### 5. Accessibility (WCAG 2.1 AA — this is P1)
- **Contrast:** text ≥4.5:1 (≥3:1 for large/▢UI), measured on *rendered* pixels in BOTH modes.
- **Focus:** visible focus-visible state on every interactive element; logical tab order.
- **Targets:** interactive targets ≥44×44px.
- **Keyboard:** everything operable without a mouse; no traps; skip-to-content present.
- **Semantics:** landmarks (nav/main/footer), headings in order, labels tied to inputs, alt text,
  ARIA only where native semantics fall short.
- **Motion:** honor `prefers-reduced-motion`; no essential info conveyed by color alone.

### 6. Content & IA
- Is the label honest and scannable? Is jargon necessary or showing off?
- Does the nav structure reduce Hick's-Law load (grouped, ≤ a few choices per level)?
- Empty/loading/error states present and humane?

## Nielsen's 10 heuristics (quick audit pass)
Run alongside the dimensions; flag any that fail.
1. Visibility of system status (loading, filter counts, demo-funnel progress)
2. Match to the real world (catalog terms users know; Jakob's Law)
3. User control & freedom (undo filters, back out of flows, clear search)
4. Consistency & standards (one card pattern, one CTA treatment)
5. Error prevention (forgiving forms; confirm destructive)
6. Recognition over recall (visible filters/sort; don't make users remember state)
7. Flexibility & efficiency (search shortcuts, saved filters, table/card toggle)
8. Aesthetic & minimalist design (flat, calm, no decoration tax)
9. Help users recognize/recover from errors (specific, recoverable messages)
10. Help & documentation (contextual, findable when the catalog is complex)

## Output template — the prioritized fix list

Always conclude a critique with this exact structure:

```
# Critique — <surface> (<route>)

## Dimension scores
Hierarchy: <pass|minor|major>  Brand: …  Composition: …  Typography: …  A11y: …  Content/IA: …

## Prioritized fixes

### P1 — Critical (breaks usability, a11y, or brand; fix before shipping)
- Issue: <what's wrong> · Dimension: <…> · Law/Heuristic: <…> · Fix: <specific change>

### P2 — Important (degrades experience or creates inconsistency; this sprint)
- Issue: … · Dimension: … · Law/Heuristic: … · Fix: …

### P3 — Polish (minor refinement; when capacity allows)
- Issue: … · Dimension: … · Law/Heuristic: … · Fix: …

## Overall assessment
<one paragraph: strongest dimension, weakest dimension, the single highest-leverage change>
```

Priority rule of thumb: anything that fails a11y, blocks the primary task, or violates brand is
**P1**. Inconsistencies and friction are **P2**. Refinements are **P3**. When in doubt, the fix
that unblocks the surface's one primary job outranks everything else.
