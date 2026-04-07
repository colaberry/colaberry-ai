# Enterprise SaaS Sidebar Navigation -- Design Reference Guide

> Research compiled from: shadcn/ui source code (exact Tailwind classes), Vercel Geist
> design system (layout tokens), Linear app (dark mode palette), Stripe dashboard
> (structure patterns), and Colaberry AI existing design tokens.

---

## 1. Overall Sidebar Width

| Product        | Expanded        | Collapsed (icon-only) | Mobile        |
|----------------|-----------------|----------------------|---------------|
| shadcn/ui      | 256px (16rem)   | 48px (3rem)          | 288px (18rem) |
| Vercel         | 260px           | --                   | Full-screen   |
| Linear         | 240px           | 48px                 | Full-screen   |
| Stripe         | 240px           | 56px                 | Full-screen   |
| **Consensus**  | **240--260px**  | **48px**             | **288px**     |

**Tailwind:** `w-64` (256px) expanded, `w-12` (48px) collapsed, `w-72` (288px) mobile.

**CSS variable pattern (shadcn):**
```css
--sidebar-width: 16rem;     /* 256px */
--sidebar-width-icon: 3rem; /* 48px  */
```

---

## 2. Nav Item Heights

| Product        | Default | Small   | Large   |
|----------------|---------|---------|---------|
| shadcn/ui      | 32px    | 28px    | 48px    |
| Vercel         | 32px    | --      | 40px    |
| Linear         | 28--32px| 24px    | --      |
| Stripe         | 32px    | --      | 40px    |
| **Consensus**  | **32px**| **28px**| **40--48px** |

**Tailwind:** `h-8` (32px default), `h-7` (28px small), `h-12` (48px large).

The 32px height is the dominant standard. It provides a good click target while
keeping density high enough for 15--25 nav items without scrolling.

---

## 3. Padding on Nav Items

| Area                    | Value              | Tailwind          |
|-------------------------|--------------------|-------------------|
| Item horizontal padding | 8px (0.5rem)       | `px-2`            |
| Item vertical padding   | 8px (implicit via h-8 + flexbox centering) | `p-2` |
| Group/section padding   | 8px all sides      | `p-2`             |
| Sub-menu left indent    | 14px (mx-3.5)      | `mx-3.5`          |
| Sub-menu inner padding  | 10px left (px-2.5) | `px-2.5`          |
| Header/Footer padding   | 8px all sides      | `p-2`             |
| Sidebar edge padding    | 0 (items handle own padding) | --       |

**Key insight:** Enterprise sidebars use remarkably tight padding. The `p-2` (8px)
on items is universal. Never use `p-3` or `p-4` on individual items -- it creates
an "amateur" bloated feel. The density is the point.

---

## 4. Gap Between Items

| Context              | Value       | Tailwind   |
|----------------------|-------------|------------|
| Between menu items   | 4px (1px in some) | `gap-1` (4px) |
| Between sections     | 8px         | `gap-2`    |
| Between content blocks | 8px       | `gap-2`    |
| Header/Footer internal | 8px       | `gap-2`    |
| Sub-menu items       | 4px         | `gap-1`    |

**Key insight:** `gap-1` (4px) between items, `gap-2` (8px) between sections.
This is the universal pattern. Never use `gap-3` or larger between individual
nav items. The tight spacing creates visual density that reads as "professional."

---

## 5. Font Sizes and Weights

| Element              | Size           | Weight       | Tailwind               |
|----------------------|----------------|--------------|------------------------|
| Nav item (default)   | 14px (0.875rem)| 400 (normal) | `text-sm font-normal`  |
| Nav item (small)     | 12px (0.75rem) | 400          | `text-xs`              |
| Nav item (active)    | 14px           | 500 (medium) | `text-sm font-medium`  |
| Section header/label | 12px (0.75rem) | 500 (medium) | `text-xs font-medium`  |
| Sub-nav item (sm)    | 12px           | 400          | `text-xs`              |
| Sub-nav item (md)    | 14px           | 400          | `text-sm`              |
| Badge/count          | 12px           | 500          | `text-xs font-medium`  |
| Workspace name       | 14px           | 600          | `text-sm font-semibold`|

**Key insight:** `text-sm` (14px) is the universal nav item size. NEVER use `text-base`
(16px) for sidebar nav items -- it immediately looks like a marketing page, not an app.
Section labels use `text-xs` (12px). The weight shift from `font-normal` to `font-medium`
on active state is subtle but critical.

---

## 6. Active State Styling

### shadcn/ui (industry standard pattern)
```
data-[active=true]:bg-sidebar-accent
data-[active=true]:font-medium
data-[active=true]:text-sidebar-accent-foreground
```

### Cross-product comparison

| Signal            | Vercel    | Linear       | Stripe       | shadcn/ui    |
|-------------------|-----------|--------------|--------------|--------------|
| Background        | gray-100  | rgba(w,0.06) | gray-100     | accent bg    |
| Font weight       | medium    | medium       | semibold     | medium       |
| Text color        | gray-1000 | white        | gray-900     | accent fg    |
| Left indicator    | No        | 2px bar      | No           | No           |
| Border radius     | 6px       | 6px          | 6px          | 6px          |

**Consensus active state:**
- Background: subtle fill (zinc-100 light / zinc-800 dark)
- Font weight bumps to `font-medium` (500)
- Text becomes highest-contrast color
- `rounded-md` (6px) on the background highlight
- Transition: `150ms ease`

**Tailwind for Colaberry (zinc scale):**
```
/* Light active */
bg-zinc-100 text-zinc-900 font-medium rounded-md

/* Dark active */
dark:bg-zinc-800 dark:text-zinc-50 font-medium rounded-md
```

### Optional: Left accent indicator (Linear style)
```css
/* 2px coral bar on left edge of active item */
.nav-item-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 2px;
  border-radius: 1px;
  background: #DC2626; /* coral accent */
}
/* Dark mode */
.dark .nav-item-active::before {
  background: #F87171;
}
```

---

## 7. Hover State Styling

### shadcn/ui pattern
```
hover:bg-sidebar-accent
hover:text-sidebar-accent-foreground
```

### Cross-product comparison

| Signal           | Vercel        | Linear           | Stripe       | shadcn/ui       |
|------------------|---------------|------------------|--------------|-----------------|
| Background       | gray-50       | rgba(w,0.04)     | gray-50      | accent bg       |
| Text color       | gray-1000     | no change        | no change    | accent fg       |
| Transition       | 150ms         | 100ms            | 150ms        | built-in        |
| Cursor           | pointer       | pointer          | pointer      | pointer         |

**Consensus hover state:**
- Background: very subtle fill, lighter than active
- Text color: unchanged or slightly darker
- Smooth transition (150ms)

**Tailwind for Colaberry (zinc scale):**
```
/* Light hover */
hover:bg-zinc-50 transition-colors duration-150

/* Dark hover */
dark:hover:bg-zinc-800/50 transition-colors duration-150
```

**Premium detail:** Hover background should be approximately 50% opacity of active
background. This creates a visual hierarchy: hover (subtle) < active (definite).

---

## 8. Icon Sizing and Spacing

| Property               | Value       | Tailwind      |
|------------------------|-------------|---------------|
| Icon size (default)    | 16x16px     | `size-4`      |
| Icon size (collapsed)  | 20x20px     | `size-5`      |
| Icon-to-text gap       | 8px         | `gap-2`       |
| Icon stroke width      | 1.5px       | `stroke-[1.5]`|
| Icon color (default)   | muted       | `text-zinc-500 dark:text-zinc-400` |
| Icon color (active)    | primary     | `text-zinc-900 dark:text-zinc-50`  |
| Icon color (hover)     | slightly brighter | inherited from parent |

**Key insight:** Icons are always 16x16 in expanded sidebar, never 20 or 24. The
`gap-2` (8px) between icon and label is universal. Using `size-4` (16px) with
`stroke-[1.5]` produces the crisp, thin-line aesthetic of Lucide/Phosphor icons
that enterprise apps favor.

**shadcn pattern for icon inside menu button:**
```tsx
<SidebarMenuButton>
  <Icon className="size-4" />
  <span>Label</span>
</SidebarMenuButton>
```

---

## 9. Section Header Styling

| Property           | Value                | Tailwind                              |
|--------------------|----------------------|---------------------------------------|
| Height             | 32px                 | `h-8`                                 |
| Font size          | 12px                 | `text-xs`                             |
| Font weight        | 500 (medium)         | `font-medium`                         |
| Text color         | 70% opacity of fg    | `text-zinc-500 dark:text-zinc-500`    |
| Text transform     | none (not uppercase) | --                                    |
| Horizontal padding | 8px                  | `px-2`                                |
| Border radius      | 6px                  | `rounded-md`                          |
| Margin-top         | 0 (gap handles it)   | --                                    |

**Key insight:** Modern enterprise sidebars do NOT uppercase section headers.
The old "SECTION HEADER" pattern (uppercase + letter-spacing) is dated. Current
standard: normal case, `text-xs font-medium` in a muted color. Some products
(Linear, Vercel) skip section headers entirely and use visual whitespace instead.

**shadcn exact classes:**
```
flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium
text-sidebar-foreground/70 transition-[margin,opacity] duration-200
```

---

## 10. Color Palette (Light and Dark Modes)

### Mapped to Colaberry's zinc scale

| Token                    | Light Mode         | Dark Mode          | Tailwind (light/dark)              |
|--------------------------|--------------------|--------------------|------------------------------------|
| Sidebar background       | `#FFFFFF`          | `#09090B` (zinc-950) or `#0A0A0F` | `bg-white dark:bg-zinc-950`      |
| Sidebar border (right)   | `#E4E4E7` (zinc-200) | `#3F3F46` (zinc-700) | `border-r border-zinc-200 dark:border-zinc-700` |
| Item text (default)      | `#52525B` (zinc-600) | `#A1A1AA` (zinc-400) | `text-zinc-600 dark:text-zinc-400` |
| Item text (hover)        | `#18181B` (zinc-900) | `#FAFAFA` (zinc-50)  | `text-zinc-900 dark:text-zinc-50`  |
| Item text (active)       | `#18181B` (zinc-900) | `#FAFAFA` (zinc-50)  | `text-zinc-900 dark:text-zinc-50`  |
| Item bg (hover)          | `#FAFAFA` (zinc-50)  | `rgba(39,39,42,0.5)` | `hover:bg-zinc-50 dark:hover:bg-zinc-800/50` |
| Item bg (active)         | `#F4F4F5` (zinc-100) | `#27272A` (zinc-800) | `bg-zinc-100 dark:bg-zinc-800`     |
| Section label text       | `#71717A` (zinc-500) | `#71717A` (zinc-500) | `text-zinc-500`                    |
| Icon (default)           | `#A1A1AA` (zinc-400) | `#71717A` (zinc-500) | `text-zinc-400 dark:text-zinc-500` |
| Icon (active)            | `#18181B` (zinc-900) | `#FAFAFA` (zinc-50)  | `text-zinc-900 dark:text-zinc-50`  |
| Accent indicator         | `#DC2626` (coral)    | `#F87171` (coral-light) | `bg-red-600 dark:bg-red-400`    |
| Badge bg                 | `#F4F4F5` (zinc-100) | `#27272A` (zinc-800) | `bg-zinc-100 dark:bg-zinc-800`     |
| Badge text               | `#52525B` (zinc-600) | `#A1A1AA` (zinc-400) | `text-zinc-600 dark:text-zinc-400` |
| Separator                | `#E4E4E7` (zinc-200) | `#27272A` (zinc-800) | `bg-zinc-200 dark:bg-zinc-800`     |

### Per-product dark mode backgrounds

| Product  | Dark BG      | Equivalent         |
|----------|--------------|--------------------|
| Vercel   | `#000000`    | Pure black         |
| Linear   | `#1F2023`    | ~zinc-850          |
| Stripe   | `#0A2540`    | Navy (brand)       |
| shadcn   | `hsl(var(--sidebar-background))` | Configurable |
| **Colaberry** | `#09090B` / `#0A0A0F` | zinc-950 (matches existing) |

---

## 11. Transition and Animation

| Property                | Value                          | CSS / Tailwind                   |
|-------------------------|--------------------------------|----------------------------------|
| Color transitions       | 150ms ease                     | `transition-colors duration-150` |
| Width collapse/expand   | 200ms ease-linear              | `transition-[width] duration-200 ease-linear` |
| Opacity transitions     | 200ms ease-linear              | `transition-[opacity] duration-200` |
| Mobile slide-in         | 200ms ease-out                 | Via Sheet/Dialog animation       |
| Hover scale (none)      | --                             | No transform on hover (premium!) |

**Key insight:** Enterprise sidebars NEVER use hover scale/lift animations on nav
items. No `hover:scale-105`, no shadows on hover. The only motion is background
color fade. This restraint is what separates "premium" from "amateur."

---

## 12. Sub-navigation / Nested Items

### shadcn exact pattern
```
/* Container */
mx-3.5 flex min-w-0 translate-x-px flex-col gap-1
border-l border-sidebar-border px-2.5 py-0.5

/* Sub-item button */
flex h-7 min-w-0 -translate-x-px items-center gap-2
overflow-hidden rounded-md px-2 text-xs
```

| Property            | Value           | Tailwind          |
|---------------------|-----------------|-------------------|
| Left border         | 1px solid       | `border-l`        |
| Left margin         | 14px            | `mx-3.5`          |
| Inner left padding  | 10px            | `px-2.5`          |
| Item height         | 28px            | `h-7`             |
| Font size           | 12px            | `text-xs`         |
| Gap between items   | 4px             | `gap-1`           |
| Vertical padding    | 2px             | `py-0.5`          |

---

## 13. Collapsed / Icon-Only State

| Property             | Value            | Tailwind / CSS                |
|----------------------|------------------|-------------------------------|
| Width                | 48px (3rem)      | `w-12`                        |
| Icon size            | 16px (centered)  | `size-4` inside `size-8` btn  |
| Button size          | 32x32px          | `size-8`                      |
| Padding              | 8px all          | `p-2`                         |
| Tooltip on hover     | Yes              | Via Tooltip component          |
| Labels               | Hidden           | `overflow-hidden` + width: 0  |
| Section headers      | Hidden (opacity) | `opacity-0 -mt-8`            |
| Sub-menus            | Hidden           | `hidden`                      |

---

## 14. Premium vs Amateur -- Checklist

### What makes it feel PREMIUM

1. **Tight spacing** -- `gap-1` between items, `p-2` padding, `h-8` height
2. **Small font** -- `text-sm` (14px) for items, `text-xs` (12px) for labels
3. **Subtle active state** -- Background fill only, `font-medium` weight bump, no bold
4. **No shadows on items** -- Zero box-shadow on hover or active
5. **No scale transforms** -- No `hover:scale-*` on any nav element
6. **Thin icons** -- 16px with 1.5px stroke weight (Lucide default)
7. **Restrained color** -- Monochrome except one accent color for indicators
8. **Single-pixel border** -- Right border on sidebar, `border-l` on sub-nav
9. **No uppercase labels** -- Section headers use normal case + muted color
10. **Smooth collapse** -- 200ms width transition, not instant
11. **Consistent radius** -- `rounded-md` (6px) everywhere, never `rounded-lg`
12. **Tabular nums on badges** -- `tabular-nums` for count badges

### What makes it feel AMATEUR

1. Large padding (`p-4` or more on items)
2. `text-base` (16px) or larger for nav items
3. Bold text for default state items
4. Colored icons (blue, green, etc.) for nav items
5. Drop shadows on nav items
6. Hover lift/scale animations
7. Large border-radius (`rounded-xl` or `rounded-full`)
8. Uppercase section headers with wide letter-spacing
9. Multiple accent colors
10. Wide gaps between items (`gap-3` or more)
11. Oversized icons (20px+ in expanded state)
12. Background gradients on sidebar

---

## 15. Complete Tailwind Implementation Reference

### Sidebar container
```tsx
<aside className="
  flex h-full w-64 flex-col
  bg-white dark:bg-zinc-950
  border-r border-zinc-200 dark:border-zinc-700
  text-zinc-600 dark:text-zinc-400
">
```

### Sidebar header (workspace selector area)
```tsx
<div className="flex flex-col gap-2 p-2">
  {/* Workspace name + avatar */}
</div>
```

### Section label
```tsx
<div className="
  flex h-8 shrink-0 items-center rounded-md px-2
  text-xs font-medium text-zinc-500
">
  Section Name
</div>
```

### Nav menu container
```tsx
<ul className="flex w-full min-w-0 flex-col gap-1">
```

### Nav item button (default)
```tsx
<button className="
  flex w-full items-center gap-2 rounded-md p-2 h-8
  text-sm text-left
  text-zinc-600 dark:text-zinc-400
  hover:bg-zinc-50 dark:hover:bg-zinc-800/50
  hover:text-zinc-900 dark:hover:text-zinc-50
  transition-colors duration-150
">
  <IconComponent className="size-4 shrink-0" />
  <span className="truncate">Item Label</span>
</button>
```

### Nav item button (active)
```tsx
<button className="
  flex w-full items-center gap-2 rounded-md p-2 h-8
  text-sm font-medium text-left
  bg-zinc-100 dark:bg-zinc-800
  text-zinc-900 dark:text-zinc-50
  transition-colors duration-150
">
  <IconComponent className="size-4 shrink-0" />
  <span className="truncate">Active Item</span>
</button>
```

### Nav badge
```tsx
<span className="
  ml-auto flex h-5 min-w-5 items-center justify-center
  rounded-md px-1 text-xs font-medium tabular-nums
  bg-zinc-100 dark:bg-zinc-800
  text-zinc-600 dark:text-zinc-400
">
  12
</span>
```

### Sub-navigation
```tsx
<ul className="
  mx-3.5 flex min-w-0 flex-col gap-1
  border-l border-zinc-200 dark:border-zinc-700
  px-2.5 py-0.5
">
  <li>
    <button className="
      flex h-7 w-full items-center gap-2 rounded-md px-2
      text-xs text-zinc-600 dark:text-zinc-400
      hover:bg-zinc-50 dark:hover:bg-zinc-800/50
      hover:text-zinc-900 dark:hover:text-zinc-50
      transition-colors duration-150
    ">
      Sub-item
    </button>
  </li>
</ul>
```

### Separator
```tsx
<hr className="mx-2 border-zinc-200 dark:border-zinc-800" />
```

### Sidebar footer
```tsx
<div className="flex flex-col gap-2 p-2 mt-auto">
  {/* User avatar, settings, etc. */}
</div>
```

---

## 16. CSS Custom Properties for Colaberry Integration

These map to your existing design token system in `globals.css`:

```css
:root {
  /* Sidebar tokens */
  --sidebar-width: 16rem;          /* 256px */
  --sidebar-width-collapsed: 3rem; /* 48px */
  --sidebar-width-mobile: 18rem;   /* 288px */
  --sidebar-bg: var(--bg);
  --sidebar-border: var(--stroke);
  --sidebar-text: var(--text-muted);
  --sidebar-text-hover: var(--text-primary);
  --sidebar-text-active: var(--text-primary);
  --sidebar-item-bg-hover: var(--surface-soft);
  --sidebar-item-bg-active: var(--neutral-fill);
  --sidebar-label: var(--text-muted);
  --sidebar-accent: var(--pivot-fill);         /* #DC2626 / #F87171 */
  --sidebar-item-radius: var(--radius-inner);  /* 0.5rem = 8px */
  --sidebar-item-height: 2rem;                 /* 32px */
  --sidebar-item-gap: 0.25rem;                 /* 4px */
  --sidebar-section-gap: 0.5rem;               /* 8px */
  --sidebar-padding: 0.5rem;                   /* 8px */
}
```

---

## 17. Responsive Behavior

| Breakpoint | Behavior                                          |
|------------|---------------------------------------------------|
| < 768px    | Sidebar hidden, accessible via hamburger/sheet     |
| >= 768px   | Sidebar visible, collapsible                       |
| >= 1024px  | Sidebar always expanded                            |

**shadcn pattern:** `hidden md:flex` on sidebar, Sheet component for mobile.

**Transition on collapse:** `transition-[left,right,width] duration-200 ease-linear`

---

## Sources and Confidence Levels

| Source                          | Method                     | Confidence |
|---------------------------------|----------------------------|------------|
| shadcn/ui sidebar.tsx           | Direct source code reading | Exact      |
| Vercel Geist sidebar            | Design system docs + DOM   | High       |
| Linear app                      | Changelog page DOM/CSS     | High       |
| Stripe dashboard                | Public docs structure      | Medium     |
| Ant Design Menu                 | Public documentation       | High       |

All pixel values for shadcn/ui are exact from source. Vercel, Linear, and Stripe
values are derived from DOM inspection patterns and may vary by +/- 2px.
