---
name: dev
description: Pick the highest priority task from the sprint backlog and implement it with TDD, security scanning, and browser-based E2E testing
user-invocable: true
---

# /dev — Sprint Task Implementation

Senior software engineer workflow: pick the highest-priority uncompleted task from the current sprint backlog and implement it with test-driven development, integrated security scanning, and Playwright E2E testing.

**One task per `/dev` invocation. Do not combine tasks.**

## Step 1: Find the Current Sprint

Look for the latest `sprints/vN/TASKS.md` file. Read it and identify the highest-priority uncompleted task (first `- [ ]` item, preferring P0 over P1 over P2).

## Step 2: Understand Context

- Read the sprint's `PRD.md` for architecture and requirements
- If a previous sprint exists, read its `WALKTHROUGH.md`
- Read any existing source files that the task will modify
- Announce: **"Working on Task N: [description]"**

## Step 3: Write Tests FIRST (TDD)

Before writing any implementation code, write tests based on the task type:

**For logic/utility tasks** — Write unit tests:
```bash
npx vitest run [test-file]
```

**For API route tasks** — Write integration tests:
```bash
# Test the API endpoint with expected inputs/outputs
```

**For UI/page tasks** — Write Playwright E2E tests:
```bash
# Install Playwright if not already installed
npx playwright install chromium

# Write tests that:
# 1. Navigate to the page
# 2. Interact with elements (click, type, select)
# 3. Take screenshots at key steps
# 4. Assert visible elements and text
```

### Screenshot Convention

Save to `tests/screenshots/taskN-stepN-description.png`. Take screenshots BEFORE and AFTER key interactions. If a test fails, read the screenshot to debug visually.

```
tests/
  screenshots/
    task3-01-login-page.png
    task3-02-after-login.png
    task3-03-dashboard-loaded.png
  unit/
    auth.test.ts
    metrics.test.ts
  integration/
    api-auth.test.ts
    api-metrics.test.ts
  e2e/
    auth-flow.spec.ts
    dashboard.spec.ts
```

## Step 4: Implement

Write the minimum code needed to make the tests pass:

- Follow existing code conventions and patterns
- Use the tech stack specified in the PRD
- Add `data-testid` attributes to interactive elements (for Playwright)
- Include error handling for user-facing features

## Step 5: Run Tests

```bash
# Run the specific test
npx vitest run tests/[file]
# or
npx playwright test tests/[file]
```

If tests fail:
1. Read the error message
2. For Playwright: read the screenshot
3. Fix the implementation (not the test, unless the test is wrong)
4. Re-run until green

## Step 6: Security Scan

After tests pass, run security scanning:

```bash
# Static analysis
npx semgrep --config auto src/ --quiet

# Dependency audit
npm audit
```

If findings exist:
1. Fix each finding immediately
2. Re-run tests to make sure fixes don't break anything
3. Re-run the scanner to confirm findings are resolved

## Step 7: Update TASKS.md

Mark the task as complete:

```markdown
- [x] Task N: [description] (P0)
  - Acceptance: [criteria]
  - Files: [files]
  - Completed: [date] -- [brief note of what was done]
```

## Step 8: Commit

Create a git commit with a clear message:

```bash
git add -A
git commit -m "feat(vN): Task N -- [description]

- Implemented [what]
- Tests: [N unit, N integration, N e2e]
- Security: semgrep clean, npm audit clean"
```

## Rules

- **NEVER** skip the test-writing step
- **NEVER** skip the security scan step
- If a task is unclear, read the PRD again. If still unclear, ask the user.
- One task per `/dev` invocation. Don't combine tasks.
- If you discover a bug in existing code, note it but don't fix it — create a new task instead.
- Playwright tests **MUST** take screenshots (Claude reads them for visual debugging).
- Always use `data-testid` attributes for Playwright selectors (not CSS classes).

## Flow Diagram

```
Read TASKS.md
      |
Pick highest priority task
      |
Write tests FIRST (TDD)
      |
Run tests (should fail) --- FAIL ---> Fix test
      |
   PASS (tests are correct)
      |
Implement the code
      |
Run tests --- FAIL ---> Fix code, re-run
      |
   PASS
      |
semgrep scan / npm audit --- FINDINGS ---> Fix, re-run
      |
   CLEAN
      |
Update TASKS.md + Git commit
```
