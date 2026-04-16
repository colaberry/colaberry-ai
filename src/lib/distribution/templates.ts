/**
 * Template engine — render one `DistributableEntry` into one `PostDraft`
 * per enabled platform.
 *
 * Every platform has its own copy budget and affordances:
 *   - X: 280 chars, hashtags + 1 link. Aggressive truncation, keep URL intact.
 *   - Moltbook: longer body OK, native title/body split, tag array.
 *   - Hugging Face: JSONL row for a dataset repo — no copy length constraint,
 *     but the dataset audience expects structured data over marketing.
 *
 * The template engine is pure — no I/O, no env reads. All inputs are
 * passed in by the orchestrator. That means tests can call `buildDrafts`
 * directly with a fixture and assert on the output.
 */

import type {
  DistributableEntry,
  PostDraft,
  Platform,
  XPayload,
  MoltbookPayload,
  HuggingfacePayload,
  ContentKind,
} from "./types";

/** Agent identity on Moltbook — one slug per colaberry org. Overridable
 * via env in the orchestrator so the POC can point at a staging agent. */
const DEFAULT_MOLTBOOK_AGENT_SLUG = "colaberry-ai";

/** HF target dataset — structured daily drops of catalog deltas. One
 * dataset for all kinds keeps the interface simple; rows carry `kind`
 * so downstream consumers can filter. */
const DEFAULT_HF_DATASET_ID = "colaberry/catalog-updates";

const X_CHAR_BUDGET = 280;
/** X treats t.co URLs as a fixed-width 23 chars. We reserve 24 (23 + space). */
const X_URL_WIDTH = 24;

export interface TemplateOptions {
  /** Override the Moltbook agent identity (defaults to colaberry-ai). */
  moltbookAgentSlug?: string;
  /** Override the HF dataset target (defaults to colaberry/catalog-updates). */
  huggingfaceDatasetId?: string;
  /** Platforms to render. Orchestrator passes only the enabled ones. */
  platforms: Platform[];
}

/**
 * Render an entry into one draft per requested platform. No side
 * effects — the orchestrator decides whether to dispatch.
 */
export function buildDrafts(
  entry: DistributableEntry,
  options: TemplateOptions
): PostDraft[] {
  return options.platforms.map((platform) => {
    switch (platform) {
      case "x":
        return buildXDraft(entry);
      case "moltbook":
        return buildMoltbookDraft(entry, {
          agentSlug: options.moltbookAgentSlug ?? DEFAULT_MOLTBOOK_AGENT_SLUG,
        });
      case "huggingface":
        return buildHuggingfaceDraft(entry, {
          repoId: options.huggingfaceDatasetId ?? DEFAULT_HF_DATASET_ID,
        });
    }
  });
}

/** X/Twitter — single tweet. Truncates summary to fit 280 chars alongside
 * the headline, URL (23 chars reserved), and up to 2 hashtags. */
function buildXDraft(entry: DistributableEntry): PostDraft {
  const headline = buildHeadline(entry); // "New: Name" | "Updated: Name"
  const hashtags = pickHashtags(entry.tags, 2);
  const hashtagsStr = hashtags.length ? " " + hashtags.map((t) => `#${t}`).join(" ") : "";

  // Budget: 280 - headline - hashtags - url(24) - separator spacing
  const fixedCost =
    headline.length + hashtagsStr.length + X_URL_WIDTH + 2; // 2 = two "\n\n" separators compressed
  const summaryBudget = Math.max(0, X_CHAR_BUDGET - fixedCost);
  const summary = truncate(entry.summary, summaryBudget);

  // Final shape: "Headline\n\nSummary\n\nURL #tag #tag"
  const text = [headline, summary, `${entry.url}${hashtagsStr}`.trim()]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  const payload: XPayload = {
    platform: "x",
    text,
    replySettings: "everyone",
  };

  return {
    platform: "x",
    idempotencyKey: makeIdempotencyKey("x", entry),
    text,
    payload,
    sourceEntry: entry,
  };
}

/** Moltbook — native title + body. Much more generous copy room,
 * canonical URL is first-class metadata not embedded in the body. */
function buildMoltbookDraft(
  entry: DistributableEntry,
  ctx: { agentSlug: string }
): PostDraft {
  const title = buildHeadline(entry);
  const body = [
    entry.summary,
    `Read more: ${entry.url}`,
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  const payload: MoltbookPayload = {
    platform: "moltbook",
    title,
    body,
    agentSlug: ctx.agentSlug,
    tags: entry.tags.slice(0, 8),
    canonicalUrl: entry.url,
  };

  return {
    platform: "moltbook",
    idempotencyKey: makeIdempotencyKey("moltbook", entry),
    text: `${title}\n\n${body}`,
    payload,
    sourceEntry: entry,
  };
}

/** Hugging Face Datasets — one JSONL row appended to the configured
 * dataset repo. Designed for downstream agent fine-tuning / RAG corpora,
 * not marketing copy. Structured, crawler-friendly. */
function buildHuggingfaceDraft(
  entry: DistributableEntry,
  ctx: { repoId: string }
): PostDraft {
  const payload: HuggingfacePayload = {
    platform: "huggingface",
    repoId: ctx.repoId,
    row: {
      id: entry.id,
      kind: entry.kind,
      title: entry.title,
      summary: entry.summary,
      url: entry.url,
      tags: entry.tags,
      updated_at: entry.updatedAt,
      is_new: entry.isNew,
      source: "colaberry.ai",
    },
  };

  // Render a human-readable preview for logging / dry-run echo.
  const text = [
    `[${entry.kind}] ${entry.title}`,
    entry.summary,
    entry.url,
  ]
    .filter(Boolean)
    .join("\n")
    .trim();

  return {
    platform: "huggingface",
    idempotencyKey: makeIdempotencyKey("huggingface", entry),
    text,
    payload,
    sourceEntry: entry,
  };
}

/* ---------- helpers ----------------------------------------------------- */

function buildHeadline(entry: DistributableEntry): string {
  const verb = entry.isNew ? "New" : "Updated";
  const kindLabel = kindToLabel(entry.kind);
  return `${verb} ${kindLabel}: ${entry.title}`;
}

function kindToLabel(kind: ContentKind): string {
  switch (kind) {
    case "agent":
      return "agent";
    case "mcpServer":
      return "MCP server";
    case "skill":
      return "skill";
    case "podcastEpisode":
      return "podcast episode";
    case "llmArchitecture":
      return "LLM architecture";
  }
}

/** Produce up to `n` hashtag-safe strings. Strips non-alphanumerics,
 * camelCases multi-word tags ("rag retrieval" → "RagRetrieval"). */
function pickHashtags(tags: string[], n: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const hashtag = toHashtag(raw);
    if (!hashtag) continue;
    const key = hashtag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(hashtag);
    if (out.length >= n) break;
  }
  return out;
}

function toHashtag(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
  if (!cleaned) return "";
  return cleaned
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

/** Trim long strings on a word boundary, ellipsize. Returns "" if budget
 * is non-positive (happens on absurdly long titles — we'd rather post a
 * clean headline+url than a mangled middle chunk). */
function truncate(text: string, budget: number): string {
  if (!text) return "";
  if (budget <= 1) return "";
  if (text.length <= budget) return text;
  const trimmed = text.slice(0, Math.max(0, budget - 1));
  const lastSpace = trimmed.lastIndexOf(" ");
  const cut = lastSpace > budget * 0.6 ? trimmed.slice(0, lastSpace) : trimmed;
  return cut.trimEnd() + "…";
}

function makeIdempotencyKey(platform: Platform, entry: DistributableEntry): string {
  return `${platform}:${entry.id}:${entry.updatedAt}`;
}
