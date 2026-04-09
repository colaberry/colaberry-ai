/**
 * PodcastSignup
 *
 * Thin backwards-compatible wrapper around `SubstackEmbedSignup`.
 *
 * Previously this component hand-rolled a hidden-iframe POST to
 * `https://www.colaberry.online/api/v1/free?nojs=true` which Cloudflare
 * silently dropped (see `docs/email-delivery-test-report-2026-04-09.md`).
 * Zero signups from colaberry.ai ever reached the Substack subscriber list.
 *
 * The fix is the Hybrid pattern: render our indexable wrapper markup with
 * schema.org SubscribeAction microdata, and embed Substack's official
 * `/embed` iframe inside. Substack handles CSRF, double opt-in, and daily
 * podcast delivery end-to-end.
 *
 * All old props (`sourcePage`, `compact`, `title`, `description`) still
 * work — they're mapped onto the new component's variants and headings.
 * The obsolete `sourcePath` / `ctaLabel` props are accepted but ignored.
 */

import SubstackEmbedSignup from "./SubstackEmbedSignup";

type PodcastSignupProps = {
  sourcePath?: string;
  sourcePage?: string;
  compact?: boolean;
  title?: string;
  description?: string;
  ctaLabel?: string;
};

export default function PodcastSignup({
  compact = false,
  title,
  description,
}: PodcastSignupProps) {
  return (
    <SubstackEmbedSignup
      variant={compact ? "compact" : "default"}
      listKind="podcast"
      title={title}
      description={description}
    />
  );
}
