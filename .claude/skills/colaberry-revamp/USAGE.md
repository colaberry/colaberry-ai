# USAGE — colaberry-frontend-revamp

Two parts: **(A) push it to GitHub** and **(B) use it day to day** in Claude Code.

---

## A. Push this to your GitHub repo

You run these on your own machine — they need your GitHub login, which is why they can't be run
for you from a sandbox. Pick the layout that matches where this should live.

### Option 1 — Its own new repo (recommended for a shareable plugin/marketplace)

1. Create an empty repo on GitHub (e.g. `colaberry/designer-skills` or
   `colaberry/colaberry-frontend-revamp`). **Don't** add a README/license on creation — keep it
   empty so the first push is clean.
2. Unzip the bundle, then from inside the `colaberry-revamp/` folder run the helper:
   ```bash
   cd colaberry-revamp
   chmod +x push-to-github.sh
   ./push-to-github.sh https://github.com/<org>/<repo>.git main
   ```
   That initializes git, commits, and pushes. (Swap the URL for your repo; `main` is the branch.)

   Prefer to do it by hand? The script just runs:
   ```bash
   git init
   git add .
   git commit -m "Add colaberry-frontend-revamp Claude Code plugin"
   git branch -M main
   git remote add origin https://github.com/<org>/<repo>.git
   git push -u origin main
   ```

### Option 2 — A subfolder inside an existing repo (e.g. WorldOfTaxonomy)

1. Copy the whole `colaberry-revamp/` folder into your repo, e.g. under a `skills/` or
   `.claude/plugins/` path. **Do not** copy any `.git` folder into it.
2. Commit and push from the existing repo:
   ```bash
   cd <your-existing-repo>
   git add colaberry-revamp        # or skills/colaberry-revamp
   git commit -m "Add colaberry-frontend-revamp Claude Code plugin"
   git push
   ```

### Authentication, if `git push` asks
- **HTTPS:** when prompted for a password, paste a **GitHub personal access token** (Settings →
  Developer settings → Fine-grained tokens, with `Contents: read/write` on the repo). Better, run
  `gh auth login` once (GitHub CLI) and it handles auth for you.
- **SSH:** use the `git@github.com:<org>/<repo>.git` form if you have SSH keys set up.

---

## B. Use it in Claude Code

### 1. Make Claude Code see it
- **As a plugin (with the `/` commands):** put the `colaberry-revamp/` folder where your team
  loads plugins — typically a plugin marketplace repo you've added, or your project's
  `.claude/` plugins location. Reload Claude Code. Verify the skill shows in available skills and
  that `/revamp-surface` and `/critique-surface` are registered.
- **As a project skill (simplest):** drop the folder into your colaberry.ai repo (e.g.
  `.claude/skills/colaberry-revamp/`). Claude Code reads `SKILL.md` and triggers it automatically
  when you work on colaberry.ai UI — no command needed.

### 2. Run it — three ways

**Full revamp of one surface (the main workflow):**
```
/revamp-surface the agents catalog
```
or just describe it and let the skill trigger itself:
```
The home hero has three competing buttons and feels off. Revamp it.
```

**Critique only (no rebuild) — fast, great for reviews and tickets:**
```
/critique-surface /aixcelerator/mcp
```

**Point it at an artifact:** paste a Figma URL or attach a screenshot with either command —
`/critique-surface <figma-url>` or `/revamp-surface <screenshot>`.

### 3. What the skill will do (the 6 phases)
1. **Ground truth** — read your real tokens/fonts/components (light + dark), screenshot the
   current surface. It will *not* guess values.
2. **Critique** — score 6 dimensions, output a prioritized **P1/P2/P3** fix list with the UX law
   behind each item.
3. **Direction** — a one-page design philosophy + locked target tokens + a reuse/refactor/new
   component list.
4. **Rebuild** — implement in Next.js/React/Tailwind/shadcn, every state, both color modes.
5. **Verify** — it screenshots the *rendered* result and checks collisions, contrast, focus,
   targets, responsive, and brand compliance; fixes and re-shoots (expect 2–3 passes).
6. **Hand off** — a developer handoff doc (tokens, props, states, responsive, edge cases, a11y)
   with before/after screenshots.

### 4. What good output looks like
- A critique in the exact rubric template (dimension scores → P1/P2/P3 → overall assessment).
- Implemented components that compose tokens (no hardcoded hex/px/shadow), pass WCAG 2.1 AA, and
  have zero brand violations (flat, no red CTA, Geist, line icons).
- A shareable Markdown handoff + a standalone HTML preview for stakeholders when useful.

### 5. Steering it
- Disagree with a priority? Say so — "treat the contrast issue as P1" — and it re-ranks.
- Want it stricter on a rule? Point it at the relevant reference: "follow `brand-tokens.md` —
  the selected-state gradient is a violation."
- Scope it: "just Phase 1 on the footer" or "rebuild only the catalog card, all states."

### 6. Extending it
Mirror the structure of the `ui-design` / `visual-critique` plugins it's modeled on:
- Add atomic skills under a `skills/<name>/SKILL.md` folder (e.g. `dark-mode-parity`,
  `catalog-filtering`).
- Add more slash commands under `commands/` (e.g. `/responsive-audit`, `/a11y-audit`).
- Keep `SKILL.md` the tight orchestrator; push detail into `references/`.
