/**
 * The recommendation layer — the part Ram actually asked for. Ported from the
 * standalone ai-dev-wire pipeline.
 *
 * A link dump is not a recommendation. The strongest mechanical signal that
 * something matters today is *corroboration*: the same subject showing up in
 * independent sources (a vendor blog AND Hacker News AND GitHub) on the same
 * morning. That echo is what we rank on, with release-type items favoured over
 * commentary, because a release changes what you can build today.
 */
import type { Recommendation, SectionKey, WireItem, WireKind } from "./types";

const STOP = new Set(
  `the a an and or of for to in on with without from by is are was were be been
being this that these those it its as at into over under new now how why what when who your you
our their his her using use used make makes making just more most less least than then also
can could should would will may might must has have had do does did not no yes but if so such
about after before during while between across against around through up down out off again very
each other others some any all both few many much own same too only via per vs versus`.split(/\s+/)
);

const SECTION_LABEL: Record<SectionKey, string> = {
  models: "Hugging Face", repos: "GitHub", hn: "Hacker News",
  blogs: "vendor blogs", papers: "research", arxiv: "research",
  tutorials: "dev.to", community: "Lobsters", industry: "industry news",
};

/** Vendors, products and frameworks worth treating as named entities. */
const VENDORS = new Set(
  `openai anthropic claude gemini deepmind qwen alibaba llama meta deepseek
mistral nvidia blackwell jalapeno codex copilot cursor gradio granite minimax ollama vllm
huggingface pytorch tensorflow langchain llamaindex groq cerebras perplexity cohere grok gemma
olmo falcon phi whisper sora midjourney runway replicate modal vercel supabase bedrock sagemaker
kubernetes docker rust typescript python mcp rag gguf lora qlora chatgpt`.split(/\s+/)
);

/** Vocabulary so common in AI writing that sharing it proves nothing. */
const GENERIC = new Set(
  `ai llm llms model models modeling agent agents agentic data dataset
open source code coding developer developers tool tools tooling api apis new release releases
launch launches build building built ship ships shipping training train inference context window
token tokens weights benchmark benchmarks eval evals research paper papers system systems app
apps platform service services cloud team teams user users work works introducing announcing
available general generally version update updates support supports memory cost workflows
modern improve personal compound recommendation`.split(/\s+/)
);

const COMMON_CAP = new Set(
  `the how why what when where who your our this that these those with
from into over under introducing announcing meet make making using use best first next now new`.split(/\s+/)
);

interface EchoEntry { sources: Set<string>; df: number }
interface EchoHit { token: string; sources: Set<string>; df: number }

/**
 * Pull *named entities* out of a title: version-numbered product names
 * (Qwen3.8-27B, LTX-2.5), acronyms (MCP, GGUF), and known vendors.
 */
function entityTokens(title = ""): Set<string> {
  const out = new Set<string>();
  for (const raw of String(title).split(/[\s,:;()\[\]"'—–|]+/)) {
    const clean = raw.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9.+#-]+$/g, "");
    if (clean.length < 3) continue;
    const low = clean.toLowerCase().replace(/[.\-]+$/, "");
    if (GENERIC.has(low) || COMMON_CAP.has(low)) continue;
    const hasDigit = /[A-Za-z]\d|\d[A-Za-z]/.test(clean);        // Qwen3, LTX-2.5, GPT-5
    const isAcronym = /^[A-Z][A-Z0-9.+-]{1,}$/.test(clean);      // MCP, GGUF, AWS
    if (hasDigit || isAcronym || VENDORS.has(low)) out.add(low);
  }
  return out;
}

/**
 * How many *distinct* sources named each entity this morning. Two independent
 * sources naming the same product is the strongest same-day signal available
 * without a human in the loop.
 */
export function buildEcho(sections: Record<SectionKey, WireItem[]>): Map<string, EchoEntry> {
  const tokenSources = new Map<string, Set<string>>();
  const df = new Map<string, number>();
  for (const [key, items] of Object.entries(sections) as [SectionKey, WireItem[]][]) {
    const label = SECTION_LABEL[key] || key;
    for (const it of items || []) {
      for (const t of entityTokens(`${it.title} ${it.summary || ""}`)) {
        if (!tokenSources.has(t)) tokenSources.set(t, new Set());
        tokenSources.get(t)!.add(label);
        df.set(t, (df.get(t) || 0) + 1);
      }
    }
  }
  const entities = new Map<string, EchoEntry>();
  for (const [t, sources] of tokenSources) entities.set(t, { sources, df: df.get(t) || 0 });
  return entities;
}

/** The strongest named entity in an item, plus which sources carried it. */
function echoFor(item: WireItem, echo: Map<string, EchoEntry>): EchoHit | null {
  let best: EchoHit | null = null;
  for (const t of entityTokens(item.title)) {
    const hit = echo.get(t);
    if (!hit) continue;
    if (!best || hit.sources.size > best.sources.size ||
        (hit.sources.size === best.sources.size && hit.df < best.df)) {
      best = { token: t, sources: hit.sources, df: hit.df };
    }
  }
  return best && best.sources.size > 1 ? best : null;
}

/** Items that announce something shippable rank above items that discuss it. */
const RELEASE_RE = /\b(introduc|launch|releas|announc|now available|generally available|ships?|open-?sourc|v?\d+\.\d+)\b/i;

export function pickRecommendations(sections: Record<SectionKey, WireItem[]>, limit = 3): Recommendation[] {
  const echo = buildEcho(sections);
  const pool: Recommendation[] = [];

  const consider = (item: WireItem, kind: WireKind, baseWeight: number): void => {
    const e = echoFor(item, echo);
    const corroboration = e ? e.sources.size : 1;
    const isRelease = RELEASE_RE.test(item.title) || kind === "model";
    const weight =
      baseWeight +
      corroboration * 30 +           // cross-source echo dominates
      (isRelease ? 18 : 0) +
      Math.min((item.score || 0) / 12, 20);
    pool.push({
      ...item, kind, weight, corroboration,
      echoSources: e ? [...e.sources] : [],
      echoToken: e?.token,
      why: "",
    });
  };

  (sections.blogs || []).slice(0, 10).forEach((i) => consider(i, "release", 30));
  (sections.models || []).slice(0, 6).forEach((i) => consider(i, "model", 26));
  (sections.hn || []).slice(0, 6).forEach((i) => consider(i, "discussion", 20));
  (sections.repos || []).slice(0, 6).forEach((i) => consider(i, "repo", 22));
  (sections.papers || []).slice(0, 4).forEach((i) => consider(i, "paper", 12));
  // Newer tiers join the pool at lower base weight: they only reach the top
  // picks on genuine cross-source corroboration, never by tier alone.
  (sections.community || []).slice(0, 4).forEach((i) => consider(i, "discussion", 16));
  (sections.industry || []).slice(0, 4).forEach((i) => consider(i, "news", 14));
  (sections.tutorials || []).slice(0, 4).forEach((i) => consider(i, "tutorial", 10));

  const ranked = pool.sort((a, b) => b.weight - a.weight);
  const seen = new Set<string>();
  const dedupe = (i: Recommendation): boolean => {
    const k = i.echoToken && i.corroboration > 1 ? `echo:${i.echoToken}` : `url:${i.url}`;
    if (seen.has(k)) return false;            // one pick per story, not per link
    seen.add(k);
    return true;
  };

  // Three picks of the same kind is a worse briefing than three angles on the
  // day, so take the best of each kind first and only then backfill by rank.
  const kinds = new Set<WireKind>();
  const picks = ranked.filter((i) => !kinds.has(i.kind) && dedupe(i) && kinds.add(i.kind)).slice(0, limit);
  if (picks.length < limit) {
    for (const i of ranked) {
      if (picks.length >= limit) break;
      if (dedupe(i)) picks.push(i);
    }
  }
  return picks.slice(0, limit).map((i) => ({ ...i, why: whyLine(i) }));
}

/** The "why" is evidence, not adjectives. */
function whyLine(i: Recommendation): string {
  if (i.corroboration > 1) {
    const srcs = i.echoSources.slice(0, 3).join(" and ");
    const subject = i.echoToken ? `"${i.echoToken}"` : "This";
    return `${subject} surfaced in ${i.corroboration} independent sources this morning (${srcs}).`;
  }
  switch (i.kind) {
    case "model":
      return i.variants
        ? `Top open-weights pull today, already forked into ${i.variants} ${i.variants === 1 ? "variant" : "variants"} — the ecosystem is betting on it.`
        : `Leading the Hugging Face trending board — weights you can pull and test today.`;
    case "release":
      return `A shipped change from ${i.source}, not commentary — it moves what you can build this week.`;
    case "repo":
      return `Fastest-rising AI repo on GitHub today (${i.metric}).`;
    case "discussion":
      return `The argument developers are having right now (${i.metric}).`;
    case "tutorial":
      return `A hands-on guide from ${i.source} — something to apply today (${i.metric}).`;
    case "news":
      return `Industry signal for the whole org, via ${i.source}.`;
    default:
      return `Highest-signal research item today (${i.metric}).`;
  }
}
