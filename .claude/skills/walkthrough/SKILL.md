---
name: walkthrough
description: Generate a sprint review report documenting exactly what was built — architecture, data flow, code walkthrough, and known limitations
user-invocable: true
---

# `/walkthrough` — Sprint Review Report Generator

You are a technical writer generating a sprint review report. Your job is to read all code produced in the current sprint and create a comprehensive, human-readable walkthrough document.

## Step 1: Identify the Sprint

Find the latest `sprints/vN/` directory. Read:
- `PRD.md` — what was planned
- `TASKS.md` — what tasks were attempted

If no sprint directory exists, tell the user and stop.

## Step 2: Inventory All Changes

Use git to find all files created or modified in this sprint:
```bash
# Find commits and changed files for this sprint
git log --oneline --name-only
```
Cross-reference with the `TASKS.md` completed entries for the full file list.

## Step 3: Read Every Changed File

Read each file that was created or modified. Understand:
- What the file does
- Key functions/components it exports
- How it connects to other files
- Any complex logic worth explaining

## Step 4: Generate WALKTHROUGH.md

Write `sprints/vN/WALKTHROUGH.md` with this exact structure:

```markdown
# Sprint vN — Walkthrough

## Summary
[2-3 sentence summary of what this sprint accomplished]

## Architecture Overview
[ASCII diagram showing the main components and how they connect]

## Files Created/Modified

### [filename.ext]
**Purpose**: [What this file does in 1 sentence]
**Key Functions/Components**:
- `functionName()` — [What it does]
- `ComponentName` — [What it renders/handles]

**How it works**:
[2-3 paragraph plain English explanation. Include relevant code snippets
for the most important logic. Explain WHY, not just WHAT.]

[Repeat for each file]

## Data Flow
[Describe how data moves through the application. Example:
"User submits form → API route validates → Database write →
Redirect to dashboard → Dashboard fetches data → Renders UI"]

## Test Coverage
[List all tests and what they verify]
- Unit: [N tests] — [what they cover]
- Integration: [N tests] — [what they cover]
- E2E: [N tests] — [what they cover]

## Security Measures
[List security features implemented in this sprint]

## Known Limitations
[Be honest about what's missing, hacky, or could be improved]

## What's Next
[Based on the limitations and PRD trajectory, suggest v(N+1) priorities]
```

## Rules

- Write for a developer who has **NEVER** seen this codebase
- Include actual code snippets for complex logic (5-10 lines, not entire files)
- Every changed file gets its own section under "Files Created/Modified"
- Be honest about limitations — don't oversell
- Use the same terminology as the PRD
- Architecture diagram **MUST** be ASCII art (works everywhere)
- The walkthrough should be self-contained — reader shouldn't need to open source files
- If a task was attempted but not completed, document what was done and what remains
