# colaberry-frontend-revamp

A Claude Code skill (packaged as a plugin) that drives a full, disciplined design revamp of
**colaberry.ai** (Colaberry AI Research Labs / AIXcelerator) — auditing, critiquing, redesigning,
rebuilding, verifying, and handing off UI that conforms to UX laws, WCAG 2.1 AA, and the
**WoT/Atlas design system**.

It's built so the dev team (and you) can point Claude Code at any colaberry.ai surface and get
consistent, token-accurate, accessible output with a critique trail and a developer handoff —
instead of one-off vibes.

## What's inside
```
colaberry-frontend-revamp/
├── .claude-plugin/plugin.json     # plugin manifest
├── SKILL.md                       # the master orchestrator (start here)
├── commands/
│   ├── revamp-surface.md          # /revamp-surface — full workflow
│   └── critique-surface.md        # /critique-surface — critique only
└── references/                    # loaded on demand, to keep context sharp
    ├── ux-laws.md                 # UX laws, each mapped to a colaberry.ai pattern
    ├── critique-rubric.md         # heuristics + 6 dimensions + a11y + output template
    ├── brand-tokens.md            # WoT/Atlas system + token-extraction protocol + violations
    └── component-playbook.md      # per-surface rebuild specs (states, responsive, a11y, laws)
```

## Why this structure
A whole-site revamp is too large for one flat file — loading everything at once degrades the
agent. This uses **progressive disclosure**: a tight orchestrator (`SKILL.md`) that pulls a
reference only when that phase is active. Same architecture as the `ui-design` and
`visual-critique` plugins it's modeled on.

## Install (Claude Code)
1. Drop this folder into your plugins/skills directory (e.g. your marketplace repo or
   `.claude/` plugins location your team uses).
2. Reload Claude Code so it picks up the plugin.
3. Confirm the skill appears in available skills and the commands are registered.

## Use
- Full revamp of a surface: `/revamp-surface the agents catalog`
- Critique only: `/critique-surface /aixcelerator/mcp`
- Or just describe the work ("the home hero is off, fix it") — the skill is written to trigger
  on any colaberry.ai UI task without needing the exact word "redesign".

## The seven non-negotiables (from SKILL.md)
1. Ground truth before opinions (extract real tokens; never guess)
2. Render-verify, not code-verify (look at the built screenshot)
3. Philosophy before pixels
4. One idea / one primary action per view
5. Cite the UX law behind every change
6. Accessibility is P1
7. Conform to the system; don't reinvent it

## Notes
- Stack assumed: Next.js + React + Tailwind v4 + shadcn/ui.
- Token values in `brand-tokens.md` are the governing reference; the production codebase is the
  authority — the skill always reconciles the two.
- Extend it the way the reference plugins do: add atomic skills under a `skills/` folder or more
  slash commands under `commands/`.
