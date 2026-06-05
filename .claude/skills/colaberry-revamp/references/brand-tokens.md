# Brand & Tokens — WoT / Atlas governing system

Load this in Phase 0 (extract ground truth) and Phase 2 (lock direction), and any time a color,
type, spacing, or brand-compliance question comes up.

> **Prime directive:** Never hardcode or guess a value. The numbers below are the *governing
> reference* for the WoT/Atlas design system. The *authority* for any specific surface is the
> production codebase. Extract real tokens at runtime and reconcile — colors sampled from a
> screenshot are unreliable and must be confirmed against the actual CSS variables / Tailwind
> theme / Figma variables.

## Extraction protocol (do this first, every time)

1. **Find the token source of truth** in the repo, in this order of trust:
   - Tailwind v4 theme (`@theme` block / `tailwind.config.*`) and CSS custom properties
     (`:root` and `.dark` / `[data-theme]`).
   - The shadcn/ui token layer (`--background`, `--foreground`, `--primary`, `--muted`,
     `--border`, `--ring`, `--radius`, etc.) — usually in `globals.css`.
   - Figma variables / published library, if that's where design leads.
2. **Record exact values for BOTH modes.** colaberry.ai ships a color-mode toggle, so capture
   light and dark for every token. A change that only works in one mode is incomplete.
3. **Note which tokens are semantic vs. raw.** Prefer semantic tokens (`--primary`,
   `--card`, `--ring`) over raw scale values when composing components.
4. **Reconcile** against the WoT/Atlas reference below. If production drifts from the system,
   flag the drift as a finding (don't silently adopt the drift). If the revamp intentionally
   moves colaberry.ai toward Atlas, document the deltas explicitly in Phase 2.

## WoT / Atlas reference values

These are the system's intended values. Confirm/override against production per the protocol.

**Typography**
- Family: **Geist** (variable). Use the real variable-font instance/weights shipped in the repo.
- One modular scale; consistent line-heights; tabular numerals for stat bands and data tables.
- Body measure 45–75 characters; long-form content constrained, never full-width.

**Color (core brand)**
- Navy `#0B1E3D` — primary dark / ink / dark-surface base
- Cyan `#06B6D4` — primary accent (CTAs, active states, links)
- Teal `#00C2A8` — secondary accent (success, secondary emphasis, data viz)
- The system is expressed in **OKLCH** tokens; when adding values, define them in the same color
  space the repo uses so they sit correctly on the existing ramp.
- Map these to semantic roles (`--primary`, `--accent`, `--ring`, chart colors) — don't apply raw
  brand hexes directly in components.

**Surface & shape**
- **Flat aesthetic. No gradients. No drop shadows.** Depth/separation comes from borders,
  spacing, and surface tone — not blur or glow.
- Consistent radius from the `--radius` token; don't mix radii arbitrarily.

**Spacing**
- Single base-unit scale (4 / 8 / 16 / 24 / 32 …). All proximity and rhythm decisions use it.
  No off-scale one-off margins.

**Iconography**
- A single line-icon set (e.g., the repo's lucide/shadcn icons). **No emoji as UI icons.**

## Forbidden treatments — treat each as a bug, not a style choice

These have been explicit violations on this project. Reject them in critique and never ship them:
- ❌ Gradients of any kind on surfaces, buttons, or text
- ❌ Drop shadows / glows for elevation
- ❌ **Red CTAs** — emphasis comes from the cyan/teal accent + weight, never an alarm color
- ❌ Gradient or off-system "selected"/active states
- ❌ Emoji used as interface icons
- ❌ Hardcoded hex / px / shadow values where a token exists
- ❌ Off-scale spacing or mismatched radii
- ❌ Fonts other than Geist for UI text

## Voice & tone
Confident, structured, enterprise-grade — this is governance and discovery tooling for teams
evaluating AI infrastructure. Favor precise, scannable labels over hype. Numbers are evidence;
present them cleanly. The design should feel *trustworthy and calm*, which is also why the flat,
systematic aesthetic matters (Aesthetic-Usability Effect for an enterprise audience).

## Dark mode parity checklist
- Every token has a tested dark value; contrast re-checked in dark (it often fails there first).
- Accents (cyan/teal) remain AA-legible on dark navy surfaces; adjust the token, don't eyeball.
- Borders carry separation in dark where shadow would in other systems (we don't use shadow).
- Charts/graph viz re-mapped for dark, not just inverted.
