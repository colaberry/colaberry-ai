---
name: animation-review
description: >-
  Review, evaluate, and implement web animations and motion design so they
  enhance UX, performance, and conversion instead of distracting. Use whenever
  the user is reviewing or critiquing an animation, deciding whether or how to
  animate a UI element, adding micro-interactions (hovers, button feedback,
  form/input states), building transitions, scroll-triggered reveals, parallax,
  or loading states, or asking whether motion is accessible or performant.
  Trigger even when the user does not say the word "animation" — phrases like
  "this hover feels off", "should this fade in", "the page feels janky/laggy",
  "add a loading spinner", "make this transition smoother", or "is this motion
  too much on mobile" should all activate this skill. Covers purposeful-motion
  principles, timing and easing standards (200–500ms), SVG/Lottie vs GIF/video
  asset selection, prefers-reduced-motion and accessibility, Core Web Vitals
  impact, and a concrete review checklist.
---

# Animation Review & UI/UX Guidelines

A framework for evaluating and implementing web animations so they enhance user
experience, performance, and conversion without becoming a distraction.

When this skill triggers, do one of two things depending on the request:
- **Reviewing** an existing design/code → walk the [Review Checklist](#review-checklist)
  and report concrete issues with fixes.
- **Implementing** new motion → apply the principles and technical standards below,
  and verify your own output against the checklist before handing it back.

---

## 1. Fundamental Principles

- **Purposeful motion.** Animation is never added for flashiness. Every animation
  must have a clear intention — guiding attention to an element or signaling a
  state change.
- **Content is king.** Motion must never overshadow the primary message or the
  call-to-action (CTA).
- **Visual hierarchy.** Use motion to prioritize content: draw the eye to
  headlines, key benefits, or conversion buttons, while letting static elements
  recede into the background.
- **Trust and credibility.** Polished, high-quality animation signals
  professionalism and builds trust with first-time visitors.

## 2. UI/UX Guidelines

- **Feedback via micro-interactions.** Subtle animation on button hovers, form
  submissions, and input highlights provides real-time confirmation of user
  actions.
- **Guided navigation.** Scroll-triggered reveals and directional cues help users
  navigate complex pages and understand information flow intuitively.
- **Transition and orientation.** Entrance and exit animations should orient the
  user, clearly signaling that the interface is moving into a new state.
- **Narrative storytelling.** Sequential or parallax animation can tell a visual
  story that mirrors the funnel and keeps users engaged as they scroll.
- **Loading states.** Animated loaders reduce *perceived* wait time and prevent
  frustration during necessary delays.

## 3. Technical Standards

- **Timing and easing.** Aim for smooth, natural timing, typically **200–500ms**.
  Use varied easing functions (`ease-in-out`, `ease-in-quad`, etc.) so movement
  feels organic rather than mechanical.
- **Asset format.** Prefer **SVG or Lottie (JSON)** over GIF or video — they are
  resolution-independent, scalable, and far lighter (often 5–50KB), preserving
  page load speed.
- **Mobile responsiveness.** Optimize for mobile; avoid heavy parallax or complex
  motion that lags or stutters on slower networks and lower-end devices.
- **Avoid animating large elements.** Do not animate the root `<html>` or `<body>`
  tags or very large elements — this causes browser bugs and a poor experience.

## 4. Accessibility & Performance

- **Reduced-motion support.** Always respect the `prefers-reduced-motion` media
  query so motion-sensitive users can opt out.
- **No infinite loops.** Avoid endless animations; they distract and annoy.
- **Manage overflow.** Animations that move elements across the screen should be
  contained by a parent with `overflow: hidden` to prevent unwanted scrollbars.
- **Core Web Vitals.** Favor lightweight implementations (CSS-based transitions
  where possible) so animation does not degrade performance scores.

## Review Checklist

When reviewing a design or code, evaluate each animation against these criteria
and flag any that fail, with a specific fix:

1. **Purpose** — Does it serve a function (feedback, guiding focus, state change),
   or is it decorative noise?
2. **Timing** — Is it in the natural 200–500ms range with appropriate easing?
3. **Assets** — Are they optimized (SVG/Lottie preferred over video/GIF)?
4. **Accessibility** — Does it honor `prefers-reduced-motion`? Any infinite loops?
5. **Mobile** — Does it overwhelm or stutter on smaller screens / slow networks?
6. **Conversion** — Does it distract from, or compete with, the CTA?
7. **Containment** — Are moving elements clipped (`overflow: hidden`) to avoid
   stray scrollbars? Are large/root elements left un-animated?
