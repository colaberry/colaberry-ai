---
name: design-logo
description: Multi-agent logo design pipeline orchestrating 6 agents through Strategy, Concepts, Figma, Code, Preview, and QA phases
user-invocable: true
---

# /design-logo — Multi-Agent Logo Design Pipeline

Design or redesign the ColaberryAI logo using a coordinated multi-agent pipeline. This skill orchestrates 6 specialized agents to produce a production-ready logo.

## Pipeline Overview

```
User triggers /design-logo
        │
        ▼
┌─────────────────────────┐
│  @logo-design-director  │ ← Orchestrator (you run this)
│  Creative Director       │
└─────────┬───────────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
Phase 1      Phase 2
Strategy     Concepts
    │           │
    ▼           ▼
@brand-      @canvas-
strategist   designer
    │           │
    └─────┬─────┘
          ▼
       Phase 3
       Figma
          │
          ▼
    @figma-designer
          │
          ▼
       Phase 4
       Code
          │
          ▼
    @svg-engineer
          │
          ▼
       Phase 5
       Preview
          │
          ▼
    @lovable-prototyper
          │
          ▼
       Phase 6
       QA
          │
          ▼
    @logo-qa
```

## How to Run

### Full Pipeline
```
/design-logo
```
Runs all 6 phases sequentially.

### Single Phase
```
/design-logo strategy     → Run @brand-strategist only
/design-logo concepts     → Run @canvas-designer only
/design-logo figma        → Run @figma-designer only
/design-logo code         → Run @svg-engineer only
/design-logo preview      → Run @lovable-prototyper only
/design-logo qa           → Run @logo-qa only
```

### From Specific Phase
```
/design-logo from:figma   → Run phases 3-6
/design-logo from:code    → Run phases 4-6
```

## Phase Details

### Phase 1: Brand Strategy (@brand-strategist)
**Input:** CLAUDE.md, design system, stakeholder feedback
**Output:** Brand brief with personality, principles, metaphor options
**Duration:** ~2 min

### Phase 2: Concept Generation (@canvas-designer)
**Input:** Brand brief from Phase 1
**Output:** 5+ scored logo concepts with SVG specifications
**Duration:** ~3 min

### Phase 3: Figma Refinement (@figma-designer)
**Input:** Top 2-3 concepts from Phase 2
**Output:** Polished vector designs, all variants, export-ready
**Duration:** ~5 min (requires Figma desktop app)

### Phase 4: SVG Engineering (@svg-engineer)
**Input:** Polished designs from Phase 3
**Output:** `BrandLogo.tsx` component + standalone SVGs
**Duration:** ~3 min

### Phase 5: Live Preview (@lovable-prototyper)
**Input:** React component from Phase 4
**Output:** `/brand-preview` page with all contexts
**Duration:** ~3 min

### Phase 6: Quality Assurance (@logo-qa)
**Input:** All outputs from phases 1-5
**Output:** QA report with pass/fail per criterion
**Duration:** ~2 min

## Design Constraints (Cannot Override)

| Constraint | Source | Rule |
|-----------|--------|------|
| Casing | Ram (CEO) | Must be "ColaberryAI" — capital A and I |
| Icon required | Karun | Must have a visual mark, not text-only |
| No purple | Ram | Zero purple — professional for sales |
| No complex icons | Ram | Rejected illustrated flask concept |
| SVG format | Aleem | All outputs must be SVG |
| Colors | Design system | Zinc monochrome + coral #DC2626 only |
| Font | Design system | Inter (SemiBold + ExtraBold) |
| Scale | Technical | Must work 16px (favicon) to 200px+ |
| Dark-first | Design system | Primary mode is dark (#09090B) |

## Files Created/Modified

### Created (new)
- `.claude/agents/logo-design-director.md`
- `.claude/agents/brand-strategist.md`
- `.claude/agents/canvas-designer.md`
- `.claude/agents/figma-designer.md`
- `.claude/agents/svg-engineer.md`
- `.claude/agents/lovable-prototyper.md`
- `.claude/agents/logo-qa.md`
- `.claude/agents/competitive-analysis.md`

### Modified (when approved)
- `src/components/BrandLogo.tsx` — Logo React component
- `src/components/Layout.tsx` — Header/footer logo swap
- `public/brand/` — SVG + PNG assets
- `src/pages/brand-preview.tsx` — Design showcase page

## Stakeholder Review
After pipeline completes:
1. Share `/brand-preview` URL with Ram
2. Capture key screenshots for Basecamp thread
3. Iterate based on feedback (re-run specific phases)
