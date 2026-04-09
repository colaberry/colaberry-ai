/**
 * NewsletterSignup
 *
 * Thin backwards-compatible wrapper around `SubstackEmbedSignup`.
 *
 * Previously hand-rolled a silent POST to Substack's undocumented
 * `/api/v1/free?nojs=true` endpoint that Cloudflare dropped on cross-origin.
 * Full root cause in `docs/email-delivery-test-report-2026-04-09.md`.
 *
 * Now delegates to the Hybrid component so both LLM crawlers (who need
 * indexable HTML) and humans (who need working email delivery) are served
 * by the same surface.
 */

import SubstackEmbedSignup from "./SubstackEmbedSignup";

type NewsletterSignupProps = {
  sourcePath?: string;
  sourcePage?: string;
  compact?: boolean;
  title?: string;
  description?: string;
  ctaLabel?: string;
};

const DEFAULT_NEWSLETTER_TITLE = "Subscribe to the Colaberry AI Newsletter";
const DEFAULT_NEWSLETTER_DESCRIPTION =
  "Product updates and enterprise AI implementation signals — agents, MCP servers, skills, tools, and podcasts. Delivered free via Substack, one-click unsubscribe.";

export default function NewsletterSignup({
  compact = false,
  title = DEFAULT_NEWSLETTER_TITLE,
  description = DEFAULT_NEWSLETTER_DESCRIPTION,
}: NewsletterSignupProps) {
  return (
    <SubstackEmbedSignup
      variant={compact ? "compact" : "default"}
      listKind="newsletter"
      title={title}
      description={description}
    />
  );
}
