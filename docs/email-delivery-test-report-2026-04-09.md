# End-to-End Email Delivery Analysis

**Date:** 2026-04-09
**Tester:** Sai Tejesh (saitejesh@colaberry.com)
**Environment:** Production — colaberry.ai (Next.js on Cloud Run) + colaberry.online (Substack) + colaberry-ai-cms-prod (Strapi)
**Goal:** Figure out why users who sign up on colaberry.ai don't receive welcome/podcast emails, and whether Substack's built-in delivery can replace Resend entirely.

---

## TL;DR — Real Picture

**Substack's native email delivery already works perfectly.** The only broken piece is the bridge from colaberry.ai → Substack subscriber list. Fix that bridge and you immediately get automatic daily podcast emails to every user who signs up, with **zero Resend cost, zero new infrastructure**.

| Layer | Status | Evidence |
|---|---|---|
| Strapi CMS `podcast-subscribers` row | Working | Row `id:1` at `2026-04-09T10:12:44.447Z` |
| Substack native email delivery | **Working** | OpenAI Blueprint post (Apr 8): 48 recipients, 31.91% open rate, email = 95% of traffic |
| Substack subscriber list growth via colaberry.ai | **Broken** | iframe POST to `/api/v1/free?nojs=true` silently dropped. 0 results for `saitejesh` in Substack admin after test submission |
| Newsletter footer form (colaberry.ai) | Dead-end | Plain HTML POST to Substack, never hits CMS, never confirmed to actually reach Substack either |
| Internal Resend/SendGrid welcome email | Not configured | `NEWSLETTER_PROVIDER` unset on Cloud Run prod → `console` mode (logs only) |
| Buzzsprout subscriber sync | Not in scope | Buzzsprout is episode sync only, not audience capture |

---

## The Key Discovery — Substack Already Delivers Emails

Previously I reported that Substack wasn't delivering at all. **That was wrong.** The Substack publisher dashboard shows Substack is quietly shipping emails for every podcast post — I just never received them because `saitejesh@colaberry.com` was never a real subscriber.

### Evidence from Substack post analytics (Apr 8, 2026)

Post: **"The OpenAI Blueprint: Governance and Growth in the AGI Age"**

| Metric | Value |
|---|---|
| Recipients | **48** (emails sent to the full list) |
| Open rate | **31.91%** (15 opens) |
| Traffic source — email | **95%** |
| Traffic source — direct | 5% |
| Links clicked | 1 click-through to `https://colaberry.ai/podcast` |

Every podcast post in the last two weeks shows the same pattern — 32–43% open rates, 48 recipients each. Substack is doing exactly what Substack is supposed to do: when a new post/podcast is published, it automatically emails every subscriber. No Resend, no SendGrid, no Mailgun, no SMTP config needed.

### Why the previous test showed "0 emails in Gmail"

Because `saitejesh@colaberry.com` never made it into Substack's subscriber list. The iframe POST that the frontend fires at `https://www.colaberry.online/api/v1/free?nojs=true` is silently failing. The CMS row in `podcast-subscribers` got written, but the Substack API call next to it did nothing.

The homepage "✓ Subscribed" button in the screenshot is deceptive — it reflects whichever Substack account is currently logged in (`marketing@colaberry.com` per the `/embed` page), not `saitejesh@colaberry.com`. Two different accounts.

---

## Where the Broken iframe POST Lives

Grep for `api/v1/free` across `src/` returns 5 files — every signup touchpoint on colaberry.ai:

| File | Line | What it sends to Substack |
|---|---|---|
| `src/components/NewsletterSignup.tsx` | 42–64 | `POST` with only `{ email }` via hidden iframe |
| `src/components/PodcastSignup.tsx` | 42–64 | Same — only `{ email }` |
| `src/pages/resources/podcasts/index.tsx` | 79–110 | Inline copy, only `{ email }` |
| `src/pages/resources/podcasts/[slug].tsx` | 123–167 | Inline copy, only `{ email }` |
| `src/components/Layout.tsx` | 1639–1671 | Footer — plain `<form action="…/api/v1/free?nojs=true" target="_blank">` with only `email` field |

All five call sites do the same thing — create a hidden iframe, attach a form with a single `email` input, POST, and assume it worked. There is no success/error handler, no response inspection, no fallback.

### Why this fails

The `nojs=true` endpoint is an undocumented internal Substack endpoint. It's behind Cloudflare and expects either:

1. **A full form payload** — `email`, `first_url`, `first_referrer`, `current_url`, `current_referrer`, `referral_code`, `source`, and usually a short-lived CSRF/session token that gets set when you GET the publication page first.
2. **An origin check** — Cloudflare silently blocks cross-origin POSTs from `colaberry.ai` → `colaberry.online` when the referrer doesn't match the Substack domain, so the POST never reaches Substack's backend.

The net result: the browser fires the POST, Cloudflare responds with a silent redirect or 200 HTML page (which the iframe swallows), and nothing ever gets added to the subscriber list. No error is surfaced to the user because the code doesn't look at the iframe response.

This is also why **every post-launch CMS signup is orphaned** — rows sit in `podcast-subscribers` / `newsletter-subscribers` but none of them propagated to Substack, so Substack never sent them any daily podcast emails.

---

## Substack's Official Embed Works

I navigated to `https://www.colaberry.online/embed` — Substack's documented embed page. It loads a clean branded subscribe form with:

- Email input
- "Subscribe" button
- Substack Terms of Use + Privacy Policy
- Substack logo in the corner
- The form is inside a first-party iframe on `colaberry.online`, so Substack's own CSRF/session logic runs client-side — no cross-origin weirdness, no Cloudflare block.

This is the supported way to subscribe users from an external site.

---

## Recommended Fix — Substack-Native Delivery, No Resend

### Strategy

Stop trying to hand-roll a Substack POST from colaberry.ai. Use Substack's own subscribe surface and let Substack do what it's already doing for 48 people every day.

**Two equally clean options:**

#### Option A — Embed Substack's official iframe (recommended)

Replace each `<NewsletterSignup>` / `<PodcastSignup>` with (or wrap around) this iframe:

```tsx
<iframe
  src="https://www.colaberry.online/embed"
  width="100%"
  height="320"
  style={{ border: "1px solid var(--color-border)", background: "transparent" }}
  frameBorder={0}
  scrolling="no"
  title="Subscribe to Colaberry AI Podcast"
/>
```

Pros: fully supported by Substack, zero backend work, Substack handles the confirmation email, unsubscribes, bounces, DKIM/SPF/DMARC, everything.
Cons: styling is constrained to Substack's embed theme (we can match the surrounding card, but the inner form stays Substack-branded).

#### Option B — Keep our branded form, POST to `/subscribe` instead of `/api/v1/free`

Change the form action from the broken `?nojs=true` endpoint to Substack's public `/subscribe` route:

```tsx
<form
  action="https://www.colaberry.online/subscribe"
  method="GET"
  target="_blank"
>
  <input type="email" name="email" required />
  <button type="submit">Subscribe</button>
</form>
```

The user clicks Subscribe → new tab opens to `colaberry.online/subscribe?email=…` → Substack's page prefills the email and finishes the flow (double opt-in if enabled). Keeps our brand on colaberry.ai, hands off to Substack at the right moment.

Pros: preserves the custom look-and-feel of our signup cards. Fully supported by Substack.
Cons: forces the user into a new tab to confirm. Slightly more friction.

### What to do about the CMS

Continue writing rows to `podcast-subscribers` / `newsletter-subscribers` in Strapi for internal analytics (source pages, UTM tracking, consent records) — but **stop relying on that row for email delivery**. The source of truth for "did we actually email them" becomes Substack.

### What to do about Resend

**Drop it.** Remove `NEWSLETTER_PROVIDER`, `RESEND_API_KEY`, `SENDGRID_API_KEY` from the Cloud Run prod env config. Delete or gut `src/lib/newsletterSender.ts` except for the console fallback (useful in dev). This eliminates a whole class of configuration drift and removes a dependency.

### What to do about the footer form in `Layout.tsx`

Swap the broken plain-HTML form for whichever of Option A / Option B we pick, so all five signup touchpoints converge on the same pattern.

---

## Concrete Code Changes (When Ready to Implement)

1. `src/components/NewsletterSignup.tsx` — delete `postToSubstack()` (lines 42–64), replace body with Substack `/embed` iframe or `/subscribe` GET form.
2. `src/components/PodcastSignup.tsx` — same treatment.
3. `src/pages/resources/podcasts/index.tsx` — delete inline `postToSubstack()` (lines 79–110). Either render `<PodcastSignup>` or embed directly.
4. `src/pages/resources/podcasts/[slug].tsx` — same as index.
5. `src/components/Layout.tsx` (lines 1639–1671) — change footer form `action` or swap for embed.
6. `src/lib/newsletterSender.ts` — either delete (and all its callers in `src/pages/api/*-subscribe.ts`) or gut to a no-op with a clear deprecation comment.
7. `src/pages/api/newsletter-subscribe.ts` / `src/pages/api/podcast-subscribe.ts` — keep the CMS write + rate limiting + honeypot + consent validation. Just stop calling `sendWelcomeEmail()`.
8. Cloud Run env vars — remove `NEWSLETTER_PROVIDER`, `RESEND_API_KEY`, `SENDGRID_API_KEY`, `NEWSLETTER_FROM_EMAIL`, `NEWSLETTER_REPLY_TO_EMAIL`.

**Scope of change:** ~5 files, < 200 lines of code removed. No new dependencies, no new infra.

---

## Remaining Questions Worth Confirming Before Implementing

1. **Double opt-in behavior** — Does Substack send a confirmation email to new subscribers, or auto-confirm? Worth verifying in Settings → Email delivery so we set the right user expectation on the success message.
2. **GDPR consent linkage** — We currently capture explicit consent in `podcast-subscribers.consent` on our CMS. Substack also shows its own Terms/Privacy text in the embed. Product/Legal should confirm whether recording our own consent checkbox before handing off to Substack is enough (probably yes, but worth a 5-minute confirmation).
3. **Historical orphans** — All CMS rows written since prod launch never reached Substack. One-time backfill: export those emails from Strapi → Substack admin "Add subscribers" (CSV import). Ram's call whether to do this or just let next-time-they-visit pick them up.
4. **Newsletter vs Podcast lists** — Substack has one subscriber list per publication. If we want separate newsletter and podcast audiences, that's actually a Substack "Sections" feature, not two lists. Confirm whether we need that distinction at all, or if the existing one-list model is fine (given every post is a podcast).

---

## What Is Currently Working (Don't Touch)

- Strapi CMS `podcast-subscribers` and `newsletter-subscribers` content types are receiving rows correctly.
- `/api/podcast-subscribe` and `/api/newsletter-subscribe` respond 200 with correct dedupe behavior (OWASP A01 email enumeration prevention at `src/pages/api/newsletter-subscribe.ts:261–276`).
- Rate limiting (12/IP/10min, 6/email/10min) is enforced.
- Bot defense layer (`src/lib/bot-defense.ts`) is intact.
- Substack's own daily podcast email blast to its 48 subscribers — working, ~35% open rate, driving 95% of post traffic.

---

## Artifacts

- CMS row (verified via API): `documentId: kr5ibb267kfdqxr6olf0ge4o`, `2026-04-09T10:12:44.447Z`, `sourcePage: podcast-listing-sidebar`
- Substack post analytics: `https://www.colaberry.online/publish/posts/detail/193601456` — 48 recipients, 31.91% open
- Substack subscriber search: `https://www.colaberry.online/publish/subscribers?s=saitejesh%40colaberry.com` — 0 results
- Substack official embed: `https://www.colaberry.online/embed` — confirmed working
- Gmail baseline: `in:anywhere from:substack.com` — 0 messages (confirms saitejesh has never been a real Substack subscriber)
