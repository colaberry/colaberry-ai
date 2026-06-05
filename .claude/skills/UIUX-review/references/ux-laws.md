# UX Laws — applied to colaberry.ai

Load this in Phase 1 (to name what's broken) and Phase 3 (to justify a move). Each law below
is paired with where it bites on **colaberry.ai** specifically, so the application is concrete,
not academic. Cite the law in critiques and handoffs so the dev team understands the *why*.

## Contents
- Cognitive load & choice: Hick's, Miller's, Tesler's, Cognitive Load
- Attention & emphasis: Von Restorff, Aesthetic-Usability, Serial Position
- Grouping (Gestalt): Proximity, Common Region, Similarity, Uniform Connectedness
- Interaction & targets: Fitts's, Doherty Threshold, Postel's
- Memory & familiarity: Jakob's, Goal-Gradient, Zeigarnik, Peak-End

---

## Cognitive load & choice

### Hick's Law — time-to-decide grows with the number/complexity of choices
The global nav exposes a 7-item "Platform" menu plus Demos, Industries, Resources, Updates.
The home page also offers parallel CTA clusters ("Book a demo", "Explore platform", plus six
"Explore the LLM-ready catalogs" links). **Application:** reduce simultaneous choices. Lead
with one primary action; demote the rest. Group the Platform children into 2–3 labeled
clusters (e.g., *Catalogs* / *Structure* / *Stacks*) instead of a flat list of seven. On
catalog pages, progressively disclose advanced filters rather than showing all at once.

### Miller's Law — people hold ~7±2 chunks; chunk, don't pile
The stat band ("19k+ resources", podcasts 299+, agents 151+, MCP 1.6k+, skills 16.9k+,
industries, agent profiles, etc.) is a wall of numbers. **Application:** chunk into 3–4
meaningful groups with clear labels and consistent formatting; let one headline number lead.
Catalog cards should chunk metadata (name → category → status → action), not list everything.

### Tesler's Law (Conservation of Complexity) — irreducible complexity lives somewhere
A catalog of 16.9k skills *is* complex. **Application:** absorb that complexity into smart
defaults, good search, saved filters, and sensible sort — don't push it onto the user as a
20-facet filter rail. The system should do the hard part.

### Cognitive Load — minimize extraneous load; spend the budget on the task
Decorative gradients, competing accents, and dense copy all tax working memory. **Application:**
flat surfaces (matches the brand), generous whitespace, plain labels. Every element must earn
its place against the user's actual goal (discover / evaluate / deploy / book a demo).

---

## Attention & emphasis

### Von Restorff (Isolation) Effect — the different one gets remembered
On every surface, the single most important action must be visually distinct from everything
around it. **Application:** the primary CTA (e.g., "Book a demo") uses the brand accent and is
the *only* element with that treatment in its region. Note the brand rule: **no red CTAs** —
isolation comes from the cyan/teal accent and weight, not an alarm color. Don't dilute it by
making secondary links look equally loud.

### Aesthetic-Usability Effect — polished interfaces are perceived as more usable
Consistency *is* a feature here: uniform spacing, a single type scale, aligned card grids, and
flat, calm surfaces make the platform feel trustworthy and easier to use — which matters for an
enterprise audience evaluating governance tooling. **Application:** systematize before
decorating; inconsistency reads as low quality regardless of function.

### Serial Position Effect — first and last items are remembered best
In the nav and in catalog lists, position carries weight. **Application:** put the highest-value
destinations first and last in the nav (and the primary CTA at the end of the bar). In long
catalog scrolls, anchor important items or surface "trending/latest" near the top and a strong
end-state (CTA, related items) at the bottom.

---

## Grouping (Gestalt)

### Law of Proximity — closeness implies relationship
**Application:** in catalog cards, keep title/category/status tight and separate cards with more
gap than the within-card spacing. In the demo form, label sits tighter to its input than to the
next field. Section headers sit closer to their content than to the prior section. Use a single
spacing scale so proximity reads systematically. (See also: spacing in `component-playbook.md`.)

### Law of Common Region — a shared boundary groups elements
**Application:** catalog items live in cards (a region); filter controls live in their own
region; the stat band is one region. Use containment *or* proximity to group — not both
redundantly. Don't box things that whitespace already groups.

### Law of Similarity — like-looking things are read as related
**Application:** all agent cards look identical in structure; all "status" pills share one
visual language; all primary CTAs share one treatment. Visual difference must mean semantic
difference — never style two unrelated things the same, or two same things differently.

### Law of Uniform Connectedness — connected/aligned elements feel grouped
**Application:** align the catalog grid to the layout grid; connect a label to its control via
alignment and shared baseline; tab groups (Latest/Trending; Podcasts/Agents/Skills/MCP) read as
one connected control, not scattered buttons.

---

## Interaction & targets

### Fitts's Law — acquisition time depends on target size and distance
**Application:** primary CTAs are large and have ample hit area (min 44×44px touch target,
generous padding). Don't place critical actions in tiny corners. Keep frequently paired actions
near each other; keep a destructive action away from a confirm.

### Doherty Threshold — keep system response under ~400ms (perceived)
Catalogs of thousands of items and graph visualizations can feel slow. **Application:** skeleton
loaders, optimistic UI, instant filter feedback, and progressive rendering so the interface
*feels* responsive even while data streams. Perceived performance is a design responsibility.

### Postel's Law (Robustness) — be liberal in what you accept, conservative in what you do
On `/request-demo`: accept messy input (phone formats, pasted emails with spaces), validate
forgivingly, never punish the user for formatting. **Application:** inline, specific, recoverable
validation; preserve entered data on error; clear, human error copy.

---

## Memory & familiarity

### Jakob's Law — users expect your site to work like the others they know
This is enterprise SaaS / a developer catalog. Users carry mental models from npm, GitHub,
Hugging Face, cloud consoles. **Application:** use conventional catalog patterns (search +
facets + sort + cards/table toggle), conventional detail-page layout, conventional dark-mode
toggle placement. Innovate on substance (the knowledge graph), not on where the search box
lives.

### Goal-Gradient Effect — motivation rises closer to the goal
The demo-request funnel and any onboarding benefit from visible progress. **Application:** show
remaining steps; reduce perceived distance to completion; make the final step feel one tap away.

### Zeigarnik Effect — incomplete tasks stay top-of-mind
**Application:** progress indicators, "X of Y", and gentle resume affordances for multi-step
flows (filtering, comparison, demo request) keep users oriented and pull them to completion.

### Peak-End Rule — experiences are judged by their peak and their end
**Application:** invest in the peak moments (the "aha" of the knowledge graph, a great catalog
detail page) and the end states (a confident demo-confirmation screen, a satisfying podcast-end
with next-episode + related artifacts). A strong end disproportionately shapes overall judgment.

---

## How to cite in a critique
Format: `Issue — [Law] — Fix`.
Example: *Three buttons in the hero compete for attention — Von Restorff / Hick's — demote
"Explore platform" to a text link and keep one accent CTA so the primary action is unmistakable.*
