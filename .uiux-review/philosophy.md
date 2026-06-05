# Design Philosophy — Homepage revamp (within the locked system)

**Direction:** *Enforce the system we already have.* The homepage is not under-designed — it is
over-decorated and hierarchically flat. The revamp removes off-system noise and re-establishes one
clear focal path, using only the repo's existing tokens. No new palette, no new font, no Atlas
migration.

**Voice:** confident, structured, enterprise. Numbers are evidence presented cleanly — not a
light show.

## The 5 rules everything obeys

1. **One focal point per section.** Each section has exactly one dominant element and one primary
   action. The hero's dominant element is the headline; the metric panel supports it, it does not
   rival it. (Von Restorff, hierarchy.)
2. **Coral is the only accent. Zinc is everything else.** No `blue/amber/purple/cyan/green` in page
   chrome. Category colors live only inside SVG ontology diagrams. CTAs are coral; emphasis
   otherwise comes from weight and size. (CLAUDE.md locked rule.)
3. **Flat surfaces, borders not shadows-as-decoration.** Cards are `.catalog-card`: 1px border, no
   hover-lift, no glow, no particles. The hero keeps its gradient/orbs (locked-system exception)
   but they are the *only* place decoration is allowed, and they freeze under reduced-motion.
4. **Never show the same data twice; never show "0".** Each fact appears once on the page. Stat
   numbers render their real value server-side and only animate toward it.
5. **Motion is reducible.** Every decorative animation sits behind
   `@media (prefers-reduced-motion: reduce)`; meaning never depends on motion.

## Token set (locked, from globals.css + tailwind.config.ts — unchanged)
- Accent: coral `#DC2626` (light) / `#F87171` (dark). CTA = `.btn-cta`.
- Surfaces: `--bg`, `--surface-strong`, `--surface-soft`; cards `bg-zinc-50 dark:bg-zinc-900`.
- Text: `text-zinc-900/50` + `dark:` per existing pattern; muted `text-zinc-500/400`.
- Type scale: `display-*` / `body-*` from `tailwind.config.ts`. Inter only.
- Radius: existing `rounded-xl` for cards, `rounded-full` for buttons. Borders `zinc-200/zinc-700`.

## Component inventory
| Component | Disposition | Why |
|---|---|---|
| Hero (`/` section) | **Refactor** | Resolve dual focal point; demote metric panel; a11y the rotator; reduced-motion guard |
| Stat band (`AnimatedMetric`, `PodcastPromoCard`) | **Refactor** | Kill the "0" SSR flash; keep as the single home for the counts |
| Hero right-rail bar chart | **Remove counts / repurpose** | Eliminates the duplicate-data violation |
| `CatalogCard` | **Rebuild** | Flatten to `.catalog-card`; coral/zinc icons only; drop glow/particles/lift |
| `SignalDashboard` | **Keep** (light touch) | Already token-correct, proper tab semantics |
| `PlatformTabsSection` | **Keep** | Token-correct; coral underline is on-system |
| Integration chips | **Keep** | Official brand logos = sanctioned exception |
| Global `@media reduced-motion` | **Net-new** | Required a11y guard for hero/decorative CSS |

## Out of scope (explicitly)
Removing the hero gradient/orbs, changing the font, or replacing coral — all excluded by the
"keep locked system" decision. Nav/footer/other pages are separate surfaces.
