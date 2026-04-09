/**
 * SubstackEmbedSignup
 *
 * Production signup surface used by every subscribe touchpoint on colaberry.ai.
 *
 * Architecture: a native on-brand form that hands off to Substack's subscribe
 * page. There is no cross-origin iframe — Substack's `/embed` renders a fixed
 * white card with a turquoise Subscribe button and its own typography that
 * clashes with the zinc + coral design system and breaks in narrow columns,
 * so we replaced it with our own form that fits the design system and works
 * at every width.
 *
 * Flow when a visitor submits:
 *  1. Client-side email validation.
 *  2. Native form submit (GET, `target="_blank"`) opens
 *     `https://www.colaberry.online/subscribe?email=...` in a new tab.
 *     Substack's subscribe page renders with the email pre-filled; the user
 *     confirms there and Substack handles the actual subscription (double
 *     opt-in, bounce handling, DKIM/SPF/DMARC, daily broadcast delivery).
 *  3. In parallel, a fire-and-forget POST to `/api/{newsletter|podcast}-subscribe`
 *     records CMS telemetry (sourcePath, sourcePage, utm, ipHash, bot defense,
 *     rate-limit) so we still have internal analytics for every signup.
 *
 * Why handoff instead of direct POST: Substack's `/api/v1/free?nojs=true`
 * endpoint is silently dropped by Cloudflare on cross-origin POSTs (root cause
 * in `docs/email-delivery-test-report-2026-04-09.md`). Handing off to Substack's
 * own subscribe page uses the session/CSRF flow Substack expects.
 *
 * AEO layer: the wrapper carries schema.org SubscribeAction microdata and the
 * visible heading + description are citable by LLM crawlers without any
 * sr-only shim.
 */

import { useState, type FormEvent } from "react";

export type SubstackEmbedSignupVariant =
  | "default"
  | "compact"
  | "sidebar"
  | "footer";

export type SubstackEmbedSignupListKind = "newsletter" | "podcast";

type SubmitStatus =
  | { state: "idle" }
  | { state: "error"; message: string }
  | { state: "success"; message: string };

type SubstackEmbedSignupProps = {
  /**
   * Visual variant. Controls padding density, heading size, and whether the
   * email input + submit button stack vertically (narrow columns) or sit
   * side-by-side.
   */
  variant?: SubstackEmbedSignupVariant;
  /**
   * Which subscriber list this surface belongs to. Drives the telemetry
   * endpoint (`/api/newsletter-subscribe` vs `/api/podcast-subscribe`) —
   * email delivery is handled by Substack regardless.
   */
  listKind?: SubstackEmbedSignupListKind;
  /**
   * Visible heading. Used by LLM crawlers via schema.org microdata.
   */
  title?: string;
  /**
   * Paragraph under the heading. Used by crawlers as the answer snippet.
   */
  description?: string;
  /**
   * Heading level. Defaults to h4. Use h3 when this component is the primary
   * heading of a section (e.g. the global footer column).
   */
  headingLevel?: "h3" | "h4";
  /**
   * Extra classes merged into the outer <section>.
   */
  className?: string;
};

const SUBSTACK_SUBSCRIBE_URL = "https://www.colaberry.online/subscribe";

const DEFAULT_TITLE = "Subscribe to the Colaberry AI Podcast";
const DEFAULT_DESCRIPTION =
  "Daily AI podcast episodes on enterprise agents, MCP servers, skills, and tools — delivered free to your inbox the moment each episode drops. One-click unsubscribe.";

/** Permissive email regex — server-side bot defense performs strict validation. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

/**
 * Padding is variant-aware because the footer column (`footer-surface`) and
 * the podcast sidebar panel already paint the warm `#E8E5DE` / `#2A2824`
 * background and apply their own padding. Adding another card chrome on top
 * looks pasted-on — so footer + sidebar render with zero outer padding and
 * let the parent surface show through, while default + compact keep the
 * boxed card style for standalone placements (CTA bands, content grids).
 */
const PADDING: Record<SubstackEmbedSignupVariant, string> = {
  default: "p-6 md:p-8",
  compact: "p-5",
  sidebar: "",
  footer: "",
};

const TITLE_SIZE: Record<SubstackEmbedSignupVariant, string> = {
  default: "text-xl md:text-2xl",
  compact: "text-lg",
  sidebar: "text-base",
  footer: "text-base",
};

const DESCRIPTION_SIZE: Record<SubstackEmbedSignupVariant, string> = {
  default: "text-sm md:text-base",
  compact: "text-sm",
  sidebar: "text-xs",
  footer: "text-xs",
};

export default function SubstackEmbedSignup({
  variant = "default",
  listKind = "podcast",
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  headingLevel = "h4",
  className = "",
}: SubstackEmbedSignupProps) {
  const HeadingTag = headingLevel;
  const [status, setStatus] = useState<SubmitStatus>({ state: "idle" });

  const isNarrow = variant === "sidebar" || variant === "footer";
  const formLayout = isNarrow
    ? "flex flex-col gap-2"
    : "flex flex-col gap-2 sm:flex-row";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[name="email"]');
    const email = (input?.value || "").trim();

    if (!email || !EMAIL_PATTERN.test(email)) {
      e.preventDefault();
      setStatus({
        state: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    // Fire-and-forget telemetry: records the signup attempt in our CMS with
    // sourcePath / sourcePage / bot-defense so we have internal analytics.
    // Failures are silent — Substack's hand-off tab is the source of truth.
    const endpoint =
      listKind === "newsletter"
        ? "/api/newsletter-subscribe"
        : "/api/podcast-subscribe";
    const sourcePath =
      typeof window !== "undefined" ? window.location.pathname : "";
    void fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        consent: true,
        sourcePath,
        sourcePage: `substack-embed-${variant}`,
      }),
      keepalive: true,
    }).catch(() => {
      /* silent — telemetry only */
    });

    setStatus({
      state: "success",
      message:
        "Opened Substack in a new tab — finish confirming your subscription there.",
    });

    // Do NOT preventDefault — the native form submit opens Substack's subscribe
    // page in a new tab via `target="_blank"`, with the email pre-filled.
    // React's re-render from setStatus is scheduled AFTER the event completes,
    // so the browser's submit goes through first.
  };

  // Footer + sidebar inherit their background from the parent surface so
  // they visually dissolve into it. Default + compact keep a bordered card
  // for standalone placements.
  const surfaceChrome = isNarrow
    ? "bg-transparent"
    : "rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950";

  return (
    <section
      className={[surfaceChrome, PADDING[variant], className]
        .filter(Boolean)
        .join(" ")}
      itemScope
      itemType="https://schema.org/SubscribeAction"
    >
      <HeadingTag
        className={`${TITLE_SIZE[variant]} font-semibold tracking-tight text-zinc-900 dark:text-zinc-50`}
        itemProp="name"
      >
        {title}
      </HeadingTag>
      <p
        className={`mt-2 ${DESCRIPTION_SIZE[variant]} leading-relaxed text-zinc-600 dark:text-zinc-400`}
        itemProp="description"
      >
        {description}
      </p>
      <link itemProp="target" href={SUBSTACK_SUBSCRIBE_URL} />

      <form
        action={SUBSTACK_SUBSCRIBE_URL}
        method="GET"
        target="_blank"
        rel="noopener"
        onSubmit={handleSubmit}
        className={`mt-4 ${formLayout}`}
        noValidate
      >
        <label className="sr-only" htmlFor={`substack-email-${variant}`}>
          Email address
        </label>
        <input
          id={`substack-email-${variant}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Work email"
          className="min-w-0 flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 transition-colors focus:border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-[#F87171] dark:focus:ring-[#F87171]/20"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#DC2626] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 dark:bg-[#DC2626] dark:hover:bg-[#EF4444]"
        >
          Subscribe
        </button>
      </form>

      {status.state !== "idle" && (
        <p
          className={`mt-3 text-xs ${
            status.state === "success"
              ? "text-zinc-600 dark:text-zinc-400"
              : "text-red-600 dark:text-red-400"
          }`}
          role={status.state === "error" ? "alert" : "status"}
        >
          {status.message}
        </p>
      )}

      <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
        Free. No spam. One-click unsubscribe. Delivered by{" "}
        <a
          href={SUBSTACK_SUBSCRIBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-zinc-400 underline-offset-2 hover:text-zinc-900 dark:decoration-zinc-600 dark:hover:text-zinc-100"
        >
          Substack
        </a>
        .
      </p>
    </section>
  );
}
