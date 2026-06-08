# Developer Handoff — `/request-demo` → WoT/Atlas (migration pilot)

**Date:** 2026-06-07 · **Surface:** Conversion (`/request-demo`) · **Effort:** Atlas migration pilot #1
**Skill:** `/colaberry-revamp` (Phases 0–5) · **Status:** ✅ Done — rendered-verified, WCAG 2.1 AA pass, brand-compliant.

> This is the **first surface** of an *incremental* migration from the live system
> (Inter + coral `#DC2626` + zinc) to **WoT/Atlas** (Geist + cyan/teal + navy, flat). The Atlas
> token layer is **scoped under `.atlas`** so every other surface stays on the current system
> until its own migration turn. Expect the rest of the site to still be coral — that is by design.

---

## 1. Token layer (added, scoped under `.atlas` in `globals.css`)

| Token | Value | Role |
|---|---|---|
| `--atlas-primary` | `#06B6D4` (cyan) ≈ `oklch(0.715 0.135 220)` | Primary accent / CTA fill |
| `--atlas-primary-hover` | `#0891B2` (cyan-600) | CTA hover |
| `--atlas-primary-active` | `#0E7490` (cyan-700) | CTA active |
| `--atlas-primary-fg` | `#06283D` (navy ink) | Text **on** cyan (AA, 6.3:1 measured) |
| `--atlas-secondary` | `#00C2A8` (teal) ≈ `oklch(0.73 0.13 180)` | Secondary accent (reserved) |
| `--atlas-ring` | `rgba(6,182,212,.45)` | Focus ring |
| `--atlas-radius` | `0.625rem` (10px) | One consistent radius (replaces full-pill) |
| Font | `--font-geist` (Geist, loaded in `_app.tsx`) | UI type for `.atlas` surfaces |
| Dark surface base | `#0B1E3D` (navy) | `.surface-panel`/`.detail-section`/`.card-elevated` inside `.atlas` in dark |

**Scoped overrides** (all under `.atlas …`): `.btn-cta` → cyan + navy ink + no shadow + token radius (with a `.dark .atlas .btn-cta` rule to beat the global `.dark .btn-cta` coral); `.btn` → token radius; `.input-premium` → token radius + cyan focus ring; `.chip-brand` → cyan tint; checkbox → `accent-color: cyan` + cyan focus ring; panels flat + navy in dark.

---

## 2. Files changed

| File | Change |
|---|---|
| `src/pages/_app.tsx` | Load **Geist** via `next/font/google` → `--font-geist` (variable exposed globally; font-family only applied via `.atlas`). |
| `src/styles/globals.css` | New `.atlas` token block + scoped component overrides (cyan/navy/Geist/flat/radius). |
| `src/pages/request-demo.tsx` | `atlas` class on page root; **demoted** "Explore AIXcelerator" from a button to a quiet text link (P1 hierarchy); accent dots → `var(--atlas-primary)`. |
| `src/components/DemoRequestForm.tsx` | Explicit `<label htmlFor>` on **all** fields (P1 a11y); **chunked** into `About you` / `About your team (optional)` fieldsets (Miller); "* required" legend; **success panel** replacing the form on submit + focus move (Peak-End, P2); tabular-nums counter; cyan-aware states inherited from `.atlas`. |

---

## 3. Component states (DemoRequestForm) — all verified

| State | Treatment |
|---|---|
| Default | Geist; cyan kicker chip; zinc labels; 10px-radius inputs |
| Focus-visible (input) | cyan border + `0 0 0 3px var(--atlas-ring)` |
| Error (field) | red border + inline `role="alert"` message (red reserved for errors — allowed) |
| Submitting | button disabled + "Sending request…" |
| **Success** | form replaced by navy/`role=status` confirmation panel ("Request received…"), focus moved to it, cyan check icon + cyan "Explore AIXcelerator while you wait →" |
| CTA hover/active | `#0891B2` / `#0E7490`, **no glow** |
| Consent checkbox | cyan `accent-color` + cyan focus ring |

Both color modes verified. Dark uses the **navy `#0B1E3D`** panel base.

---

## 4. Responsive
- ≥`sm`: two-column field grids inside each fieldset; page is 7/5 two-column at `lg`.
- `<sm` (375/390): fields stack single-column; CTA + demoted link stack; verified at 390px.

## 5. Accessibility (WCAG 2.1 AA — measured on rendered pixels)
Contrast (light / dark): subhead 7.41 / 11.21 · label 4.63 / 6.47 · helper 4.63 / 6.47 · CTA text 6.27 / 6.27 · demoted link 4.83 / 7.71 — **all ≥4.5:1**. Visible cyan focus ring; every control has an explicit label; success moves focus + `aria-live`; CTA target ≥44px; honeypot preserved; reduced-motion unaffected (no new motion).

## 6. Brand compliance (Atlas) — zero violations on this surface
✅ Geist · ✅ cyan primary (no red CTA) · ✅ flat (no gradients/shadows/glows; removed the coral CTA glow) · ✅ one radius token · ✅ no emoji · ✅ tokens not hardcoded hexes in the new code.

---

## 7. Before / after evidence (in `tmp_shots/`)
- **Before:** `request-demo__LIGHT.png`, `request-demo__desktop-dark.png`, `request-demo__mobile-light.png` (coral + Inter).
- **After:** `atlas2-light.png`, `atlas3-dark.png`, `atlas2-mobile.png`, `atlas3-success-dark.png`, `atlas3-focus.png` (Geist + cyan + navy).

## 8. Critique status (Phase 1 fixes)
P1 — all resolved: off-system brand → Atlas tokens; coral CTA glow → flat cyan; implicit labels → explicit; exit CTA demoted. P2 — resolved: success-panel + focus; field chunking; required legend; pill → token radius. P3 — tabular counter done.

---

## 9. Rollout order (next surfaces)
1. **request-demo** ✅ (this doc)
2. **Home** (`/`) — hero, stat band (Miller chunk), single primary CTA (Von Restorff)
3. **Catalog** (`/aixcelerator/skills|agents|mcp`) — cards, filters, skeleton/loading
4. **Detail** → **Knowledge graph** → **Content** → **System chrome (nav/footer)**
5. **Global flip:** once surfaces are migrated, promote `.atlas` tokens to `:root`/`.dark`, retire coral, drop the `.atlas` scope, and remove Inter.

**Known intentional inconsistency during migration:** global chrome (header "Book a demo" button, pre-footer CTA band) is still coral because it lives in `Layout` (outside `.atlas`). It migrates in step 4.
