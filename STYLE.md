# Colaberry AI — Style Reference

Monochrome + Coral Accent design system. Zinc scale for all UI chrome, coral `#DC2626` reserved for CTAs and small accent dots only.

---

## Color Palette

### Zinc Scale (Primary)

| Token      | Hex       | Usage                          |
|------------|-----------|--------------------------------|
| zinc-50    | `#FAFAFA` | Light surface, text on dark    |
| zinc-100   | `#F4F4F5` | Alt background (light)         |
| zinc-200   | `#E4E4E7` | Borders (light)                |
| zinc-300   | `#D4D4D8` | Muted borders, dark text muted |
| zinc-400   | `#A1A1AA` | Muted text (dark mode)         |
| zinc-500   | `#71717A` | Mid-tone, disabled             |
| zinc-600   | `#52525B` | Muted text (light mode)        |
| zinc-700   | `#3F3F46` | Borders (dark), dark surface   |
| zinc-800   | `#27272A` | Dark surface                   |
| zinc-900   | `#18181B` | Text primary (light), surface  |
| zinc-950   | `#09090B` | Background (dark mode)         |

### Coral Accent

| Token        | Hex       | Usage                        |
|--------------|-----------|------------------------------|
| Coral        | `#DC2626` | CTA buttons, accent dots     |
| Coral hover  | `#B91C1C` | Hover state for CTAs         |
| Coral light  | `#FEE2E2` | Light accent surface         |
| Coral dark   | `#F87171` | Dark mode accent             |

### Forbidden Colors

These colors must **never** appear in page code:

- `emerald-*`, `green-*` — no green for status/success
- `blue-*` — no blue for headings or accents
- `amber-*` — no amber for badges
- `slate-*` — use zinc equivalents

**Exception:** `text-red-600` for error states only. SVG ontology diagram fills use `config.categoryColors`.

---

## Semantic Tokens (CSS Custom Properties)

### Light Mode (`:root`)

| Token                | Value       | Purpose                  |
|----------------------|-------------|--------------------------|
| `--bg`               | `#FFFFFF`   | Page background          |
| `--bg-alt`           | `#F4F4F5`   | Alternate background     |
| `--surface-strong`   | `#FAFAFA`   | Card/panel surface       |
| `--surface-soft`     | `#F4F4F5`   | Hover surface            |
| `--surface-elevated` | `#FFFFFF`   | Elevated card            |
| `--text-primary`     | `#18181B`   | Primary text             |
| `--text-muted`       | `#52525B`   | Muted/secondary text     |
| `--text-inverse`     | `#FAFAFA`   | Text on dark backgrounds |
| `--stroke`           | `#E4E4E7`   | Default border           |
| `--neutral-stroke`   | `#E4E4E7`   | Neutral borders          |
| `--neutral-surface`  | `#FAFAFA`   | Neutral surfaces         |
| `--pivot-fill`       | `#DC2626`   | Coral accent fill        |
| `--pivot-surface`    | `#FEF2F2`   | Coral tinted surface     |
| `--pivot-stroke`     | `#FECACA`   | Coral tinted border      |

### Dark Mode (`.dark`)

| Token                | Value              | Purpose              |
|----------------------|--------------------|----------------------|
| `--bg`               | `#0A0A0F`          | Page background      |
| `--bg-alt`           | `#111118`          | Alternate background |
| `--surface-strong`   | `#141420`          | Card/panel surface   |
| `--surface-soft`     | `#1E1E2E`          | Hover surface        |
| `--surface-elevated` | `#181825`          | Elevated card        |
| `--text-primary`     | `#FAFAFA`          | Primary text         |
| `--text-muted`       | `#D4D4D8`          | Muted/secondary text |
| `--text-inverse`     | `#18181B`          | Text on light bg     |
| `--stroke`           | `#3F3F46`          | Default border       |
| `--neutral-stroke`   | `#3F3F46`          | Neutral borders      |
| `--neutral-surface`  | `#18181B`          | Neutral surfaces     |
| `--pivot-fill`       | `#F87171`          | Coral accent fill    |
| `--pivot-surface`    | `#1C1412`          | Coral tinted surface |
| `--pivot-stroke`     | `#3F1D15`          | Coral tinted border  |

---

## Typography

**Font:** Inter (all weights, loaded via `next/font/google`)
**Font families:** `font-sans`, `font-display`, `font-serif` all resolve to Inter.

### Type Scale

| Token          | Size     | Line Height | Letter Spacing | Usage                 |
|----------------|----------|-------------|----------------|-----------------------|
| `display-hero` | 7rem     | 1.02        | -0.04em        | Hero headlines        |
| `display-2xl`  | 5.5rem   | 1.04        | -0.035em       | Major section titles  |
| `display-xl`   | 4.5rem   | 1.05        | -0.03em        | Page titles           |
| `display-lg`   | 3.5rem   | 1.06        | -0.028em       | Large headings        |
| `display-md`   | 2.625rem | 1.08        | -0.022em       | Section headings      |
| `display-sm`   | 2rem     | 1.12        | -0.018em       | Sub-headings          |
| `display-xs`   | 1.5rem   | 1.2         | -0.01em        | Card titles           |
| `body-lg`      | 1.125rem | 1.65        | 0              | Lead paragraphs       |
| `body-md`      | 1rem     | 1.65        | 0              | Body text             |
| `body-sm`      | 0.875rem | 1.6         | 0.01em         | Captions, metadata    |
| `body-xs`      | 0.75rem  | 1.5         | 0.02em         | Fine print, labels    |
| `label`        | 0.6875rem| 1           | 0.14em         | Uppercase kickers     |
| `caption`      | 0.9375rem| 1.45        | 0              | Supporting text       |

---

## Shadows

| Token         | Light                                                    | Dark                                                                |
|---------------|----------------------------------------------------------|---------------------------------------------------------------------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)`                            | `0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)`     |
| `--shadow-md` | `0 2px 4px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.06)` | `0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)` |
| `--shadow-lg` | `0 4px 8px rgba(0,0,0,0.04), 0 12px 28px rgba(0,0,0,0.08)` | `0 12px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)` |
| `--shadow-xl` | `0 8px 16px rgba(0,0,0,0.05), 0 24px 48px rgba(0,0,0,0.10)` | `0 24px 56px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)` |

Dark shadows include a subtle `1px` inner glow ring for edge definition.

---

## Border Radius

| Token          | Value    | Usage             |
|----------------|----------|-------------------|
| `--radius-sm`  | 0.375rem | Small inputs      |
| `--radius-md`  | 0.5rem   | Buttons, chips    |
| `--radius-lg`  | 0.75rem  | Cards, panels     |
| `--radius-xl`  | 1rem     | Large containers  |
| `--radius-2xl` | 1.25rem  | Hero sections     |
| `rounded-2xl`  | 1rem     | Tailwind utility  |
| `rounded-3xl`  | 1.5rem   | Tailwind utility  |

---

## Spacing

Custom spacing tokens beyond Tailwind defaults:

| Class   | Value    |
|---------|----------|
| `p-18`  | 4.5rem   |
| `p-22`  | 5.5rem   |
| `p-26`  | 6.5rem   |
| `p-30`  | 7.5rem   |
| `p-34`  | 8.5rem   |
| `p-42`  | 10.5rem  |

Section gap tokens:

| Token               | Value   |
|---------------------|---------|
| `--section-gap-sm`  | 2.5rem  |
| `--section-gap-md`  | 3.5rem  |
| `--section-gap-lg`  | 5rem    |

---

## Motion & Animation

### Easing Curves

| Token              | Value                            | Usage            |
|--------------------|----------------------------------|------------------|
| `--ease-expo-out`  | `cubic-bezier(0.16, 1, 0.3, 1)` | Standard ease    |
| `--ease-spring`    | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy interactions |
| `--ease-smooth`    | `cubic-bezier(0.16, 1, 0.3, 1)` | Smooth reveals   |

### Duration Tokens

| Token               | Value  |
|----------------------|--------|
| `--duration-micro`   | 150ms  |
| `--duration-normal`  | 200ms  |
| `--duration-slow`    | 400ms  |
| `--duration-reveal`  | 400ms  |
| `--duration-page`    | 300ms  |

### Tailwind Animations

| Class               | Effect                                  |
|----------------------|-----------------------------------------|
| `animate-fade-in`   | Fade in (0.3s ease-out)                 |
| `animate-slide-up`  | Slide up 12px + fade (0.4s expo-out)    |
| `animate-slide-down`| Slide down 8px + fade (0.3s expo-out)   |
| `animate-scale-in`  | Scale from 0.95 + fade (0.2s expo-out)  |
| `animate-shimmer`   | Background shimmer loop (2s linear)     |
| `animate-blur-in`   | Blur from 8px + fade (0.5s expo-out)    |
| `animate-pulse-soft`| Gentle opacity pulse (3s infinite)      |
| `animate-float`     | Vertical float 12px (6s infinite)       |

---

## Component Classes

### `.catalog-card`
Listing cards used across all catalog pages.
```css
/* Light */
background: var(--surface-strong);
border: 1px solid var(--neutral-stroke);
border-radius: 0.75rem;

/* Hover: border darkens, background shifts */
/* Dark: inverted zinc tones, hover → #1f1f23 */
```
- No hover lift/shadow — flat interaction only
- Arrow icon nudges right 2px on hover

### `.surface-panel`
Filter/search bar containers.
```css
/* Light */
background: var(--surface-strong);      /* #FAFAFA */
border: 1px solid var(--neutral-stroke); /* #E4E4E7 */
border-radius: 0.75rem;

/* Dark */
background: #141420;
border-color: rgba(255, 255, 255, 0.08);
```

### `.chip-brand` (Active Filter)
```css
/* Light */
border-color: var(--pivot-stroke);  /* coral tint */
background: var(--pivot-surface);   /* coral wash */
color: var(--pivot-fill);           /* #DC2626 */

/* Hover: scale(1.03), coral ring glow */
```

### `.chip-neutral` (Default Filter)
```css
/* Light */
border-color: #E4E4E7;
background: #F4F4F5;
color: #52525B;

/* Dark */
border-color: #3F3F46;
background: #27272A;
color: #D4D4D8;
```

### `.detail-section`
Content blocks on detail pages.
```css
padding: 1.5rem;
border: 1px solid var(--stroke);
border-radius: var(--radius-lg);    /* 0.75rem */
background: var(--surface-strong);
/* Stacks with 1rem gap between siblings */
```

---

## Reveal Animations

Scroll-triggered via IntersectionObserver in `Layout.tsx`.

| Class             | Effect                        | Duration |
|-------------------|-------------------------------|----------|
| `.reveal`         | Slide up 32px + fade          | 0.7s     |
| `.reveal-left`    | Slide right 12px + fade       | 0.4s     |
| `.reveal-right`   | Slide left 12px + fade        | 0.4s     |
| `.reveal-scale`   | Scale from 0.97 + fade        | 0.4s     |

Stagger delays: `.reveal-delay-1` (80ms) through `.reveal-delay-4` (320ms).

### `.stagger-grid`
Applied to card grids. Each child staggers by 60ms (capped at 480ms for 10+ items). Never combine `.stagger-grid` and `.reveal` on the same element.

---

## Z-Index Scale

| Token          | Value | Usage         |
|----------------|-------|---------------|
| `--z-base`     | 0     | Default       |
| `--z-card`     | 1     | Cards         |
| `--z-sticky`   | 10    | Sticky bars   |
| `--z-header`   | 40    | Site header   |
| `--z-overlay`  | 50    | Overlays      |
| `--z-modal`    | 60    | Modals        |
| `--z-toast`    | 70    | Toast alerts  |

---

## Dark Mode

- **Toggle:** `.dark` class on `<html>`, persisted in `localStorage`
- **Strategy:** CSS custom properties swap between `:root` and `.dark`
- **Tailwind:** Use `dark:` variants for additional overrides
- **Default theme:** Dark mode (enterprise standard)

### Safety Net Caveat
`globals.css` has `.dark .bg-zinc-900` and `.dark .bg-white` overrides that can clobber Tailwind `dark:` variants at the same specificity. Use `bg-zinc-950` instead of `bg-zinc-900` when you need inverted color pairs.

---

## Page Structure Standard

Every page must follow this structure:

1. `.reveal` wrapper on hero with `SectionHeader` (`size="xl"`, kicker, title, description)
2. `.surface-panel` for filter/search bars
3. `.stagger-grid` on card grids (never on same element as `.reveal`)
4. `.reveal` on each major section
5. `EnterpriseCtaBand` at page bottom
6. `ContentTypeIcon` for content type icons (never emoji)

---

## Quick Reference: Key Files

| File | Purpose |
|------|---------|
| `src/styles/globals.css` | All CSS custom properties and component classes |
| `tailwind.config.ts` | Zinc scale, Inter fonts, animations |
| `src/pages/_app.tsx` | Font loading, global layout |
| `src/components/Layout.tsx` | Header, footer, nav, dark mode toggle |
