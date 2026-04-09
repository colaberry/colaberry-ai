# ColaberryAI Research Labs — Logo Design Brief V60

> Source: ChatGPT Deep Research (April 2026)
> Status: Approved specification for designer execution

## Executive Summary

Colaberry owns a rare, high-equity signature: the dual-reading "Co" berry device (a typographic "C" and "o" that simultaneously reads as two berries connected by a stem and leaf). The most defensible branding move for ColaberryAI Research Labs is to **protect that recognizability** and add "AI + Research Labs" cues using enterprise discipline: restrained color, minimal elements, and typographic precision rather than illustrative metaphors.

The Research Labs mark must signal **governance + trust + rigor**, not "fun AI."

---

## Color System

### Strict Heritage (Default)

| Token    | Hex       | Usage                              | Contrast on White |
|----------|-----------|------------------------------------|--------------------|
| Primary  | `#357895` | Berry shapes, stem, leaf, "laberry", "AI" | 4.9:1 (WCAG AA)   |
| Subtitle | `#52525B` | "RESEARCH LABS"                    | 7.7:1 (WCAG AAA)  |
| Divider  | `#E4E4E7` | Decorative rule (if used)          | Decorative only    |

### Refined Enterprise (Optional)

| Token      | Hex       | Usage                                    |
|------------|-----------|------------------------------------------|
| Primary    | `#2F6F8F` | Slightly more authoritative blue         |
| Dark accent| `#1F4E67` | Hover/emphasis states                    |

**Forbidden:** No red, no green, no purple, no gradients, no multi-color.

---

## Typography

### Typeface Options

| Typeface        | Why                                      | "laberry"     | "AI"          | "RESEARCH LABS"      |
|-----------------|------------------------------------------|---------------|---------------|----------------------|
| Inter           | Open-source, screen-optimized            | Regular 400   | SemiBold 600  | Light 300 +120 track |
| Suisse Int'l    | Premium agency feel                      | Regular 400   | Bold 700      | Light 300 +140 track |
| Helvetica Now   | Optical sizes for tiny rendering         | Text Regular  | Text Bold     | Micro Regular +160   |

### Weight/Tracking Spec

- **"laberry"**: Weight 400-500, tracking -1% to 0%
- **"AI"**: Weight 650-700, tracking -2% to -4%, tighten yA junction by 10-25 units
- **"RESEARCH LABS"**: All caps, weight 300-400, tracking +120 to +180, color #52525B

---

## Berry Geometry (Parametric)

**Unit system:**
- `X` = x-height of "laberry" letters
- `S` = stroke unit = 0.12X
- `G` = gap unit = 0.18X

### C-berry (open ring)
- Outer diameter: **2.05X**
- Stroke thickness: **S = 0.12X**
- Opening angle: **40-48 degrees** (optical — must read as "C" and feel like a berry)
- Inner counter: perfectly concentric

### o-berry (closed ring)
- Outer diameter: **1.00X**
- Stroke: **S** (match C exactly)
- Horizontal offset: o center sits **0.78X-0.86X** right of C center
- Vertical offset: o center sits **0.08X-0.14X** lower than C center

### Stem
- Stroke thickness: **0.60S** (thinner than berry strokes)
- Curve: single smooth Bezier from upper-left of C to top of o
- Optional "signal" refinement: two micro-tapers where stem thins to 0.45S for ~0.18X length

### Leaf
- Shape: simple teardrop/pointed ellipse
- Bounding box: width 0.55X, height 0.32X
- Rotation: 20-30 degrees clockwise
- Fill: same steel blue as stem

---

## Four Variations

### 1. Direct Evolution
- **Goal:** Maximum brand continuity
- **Palette:** Strict heritage (#357895 + #52525B)
- **Spec:** Berry "Co" geometry matches current asset. "AI" bold weight only. Subtitle centered or aligned with "l" of "laberry"
- **Deploy:** Sales decks, proposal headers, partner slides

### 2. With Signal Waves
- **Goal:** Add technical cue while staying enterprise-clean
- **Spec:** Same as Direct Evolution + micro signal bars flanking subtitle (4 bars per side, heights 3/6/9/6 px, steel blue). Optional thin #E4E4E7 divider behind subtitle
- **Deploy:** Tech-forward slide sections

### 3. Refined Geometry
- **Goal:** "40 hours of optical polish"
- **Spec:** Tighten C/o spacing by ~0.04X. Stem Bezier becomes more engineered. Leaf simplified to geometric teardrop. "AI" kerning tightened. Optional refined palette (#2F6F8F)
- **Deploy:** Premium brand touchpoints

### 4. Stacked Layout
- **Goal:** Narrow-width contexts
- **Spec:** Line 1: ColaberryAI. Line 2: RESEARCH LABS at 0.55-0.65 of main x-height. Left-aligned block
- **Deploy:** LinkedIn banners, narrow app headers, sidebars

---

## Alignment & Sizing

- **Default alignment:** Left-aligned (enterprise standard)
- **Clear space:** Minimum 1.0X, preferred 1.5X on all sides
- **Minimum size:** Stem thickness >= 1px at export; remove subtitle under ~160-200px width

---

## Deliverables

### Export Formats
- SVG (primary master)
- PDF (vector, print-friendly)
- PNG (transparent, 1x/2x/4x)
- Monochrome set (all-steel-blue, all-black, all-white)

### Naming Convention
```
colaberryai-researchlabs_primary_horizontal_blue.svg
colaberryai-researchlabs_primary_horizontal_blue.pdf
colaberryai-researchlabs_primary_horizontal_blue_2048.png
colaberryai-researchlabs_secondary_stacked_blue.svg
colaberryai-researchlabs_small_no-subtitle_blue.svg
colaberryai-researchlabs_monochrome_black.svg
colaberryai-researchlabs_monochrome_white.svg
```

---

## Competitive Alignment

| Organization      | Key Pattern                                    | Implication for ColaberryAI             |
|-------------------|------------------------------------------------|-----------------------------------------|
| IBM Research      | Iconic parent mark + clean descriptor lockup   | Keep berry "Co" as immutable parent     |
| Microsoft Research| Brand architecture, content-forward             | "Research Labs" as subordinate line     |
| Palantir          | Strict composition + clear space rules         | Adopt strict lockup rules for decks    |
| MIT Media Lab     | Grid-based system, no literal lab symbols      | Use structure, not beakers/atoms        |
