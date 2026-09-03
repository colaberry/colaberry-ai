/**
 * AI Dev Wire — source adapters. Ported from the standalone fetch.mjs.
 *
 * Every source implements the same `SourceAdapter` contract and emits
 * `WireItem[]`. Six ship today; adding a source is one new adapter (or, for an
 * RSS/Atom feed, one row in `FEEDS` that the generic `blogs` adapter reads).
 * Each fetch is failure-isolated — it is awaited inside `Promise.allSettled`,
 * so one dead feed never kills the run.
 */
import type { SourceAdapter, WireItem } from "./types";
import { dedupeModels, isDevRelevant, isRelevant, devScore } from "./relevance";

const UA = "Mozilla/5.0 (compatible; ai-dev-wire/1.0; +https://colaberry.ai)";
const DAY = 86400;
const now = (): number => Math.floor(Date.now() / 1000);

/* ---------- helpers ---------- */
async function getRes(url: string, accept: string, timeout: number): Promise<Response> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: accept },
      signal: ctl.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}
const getText = async (url: string, timeout = 20000): Promise<string> =>
  (await getRes(url, "*/*", timeout)).text();
async function getJson<T>(url: string, timeout = 20000): Promise<T> {
  return (await getRes(url, "application/json", timeout)).json() as Promise<T>;
}

const strip = (s = ""): string =>
  s.replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(+n))
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
const clip = (s = "", n = 190): string => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
const tsOf = (raw: string | undefined | null): number | null => {
  const t = Date.parse((raw || "").trim());
  return Number.isFinite(t) ? Math.floor(t / 1000) : null;
};

/** Minimal RSS/Atom parser — good enough for well-formed feeds, never throws. */
function parseFeed(xml: string, sourceName: string): WireItem[] {
  const out: WireItem[] = [];
  const blocks = xml.match(/<(item|entry)\b[\s\S]*?<\/\1>/g) || [];
  for (const b of blocks) {
    const title = strip((b.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1] || "");
    const link = (b.match(/<link[^>]*href="([^"]+)"/) || [])[1]
      || strip((b.match(/<link[^>]*>([\s\S]*?)<\/link>/) || [])[1] || "");
    const dateRaw = (b.match(/<(pubDate|published|updated|dc:date)[^>]*>([\s\S]*?)<\/\1>/) || [])[2] || "";
    const desc = strip((b.match(/<(description|summary|content)[^>]*>([\s\S]*?)<\/\1>/) || [])[2] || "");
    if (!title || !link) continue;
    out.push({ title, url: link.trim(), summary: clip(desc), source: sourceName, score: 0, ts: tsOf(dateRaw) });
  }
  return out;
}

/* ---------- source response shapes (only the fields we read) ---------- */
interface HFModel {
  id: string; private?: boolean; pipeline_tag?: string; tags?: string[];
  downloads?: number; likes?: number; trendingScore?: number; createdAt?: string; lastModified?: string;
}
interface HFPaper { id: string; title?: string; summary?: string; upvotes?: number; publishedAt?: string }
interface HFPaperRow { paper?: HFPaper; upvotes?: number; publishedAt?: string }
interface HNHit { title?: string; url?: string; objectID: string; points?: number; num_comments?: number; created_at_i: number }

/* ---------- sources ---------- */

// 1. Hugging Face trending models — what the open-weights world is actually pulling down.
async function hfModels(): Promise<WireItem[]> {
  const rows = await getJson<HFModel[]>("https://huggingface.co/api/models?sort=trendingScore&limit=40");
  const mapped: WireItem[] = rows.filter((m) => !m.private).map((m) => ({
    title: m.id,
    url: `https://huggingface.co/${m.id}`,
    summary: [m.pipeline_tag, (m.tags || []).find((t) => t.startsWith("license:"))].filter(Boolean).join(" · "),
    metric: `${(m.downloads || 0).toLocaleString()} dl · ${(m.likes || 0).toLocaleString()} ♥`,
    score: m.trendingScore || 0,
    source: "Hugging Face",
    ts: tsOf(m.createdAt || m.lastModified),
  }));
  return dedupeModels(mapped).slice(0, 12);
}

// 2. HF Daily Papers — community-upvoted, far higher signal than raw arXiv.
async function hfPapers(): Promise<WireItem[]> {
  const rows = await getJson<HFPaperRow[]>("https://huggingface.co/api/daily_papers?limit=40");
  return rows
    .map((r): WireItem => {
      const p = r.paper || (r as HFPaper);
      const upvotes = p.upvotes ?? r.upvotes ?? 0;
      return {
        title: p.title ? strip(p.title) : "",
        url: `https://huggingface.co/papers/${p.id}`,
        summary: clip(strip(p.summary || ""), 220),
        metric: `${upvotes} upvotes`,
        score: upvotes,
        source: "HF Daily Papers",
        ts: tsOf(p.publishedAt || r.publishedAt),
      };
    })
    .filter((p) => p.title)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

// 3. Hacker News — the discourse layer. Broad pull, then AI-filtered locally.
async function hackernews(): Promise<WireItem[]> {
  const u = new URL("https://hn.algolia.com/api/v1/search_by_date");
  u.searchParams.set("tags", "story");
  u.searchParams.set("numericFilters", `points>50,created_at_i>${now() - 2 * DAY}`);
  u.searchParams.set("hitsPerPage", "200");
  const { hits = [] } = await getJson<{ hits?: HNHit[] }>(u.toString());
  return hits
    // Title only: a long Ask HN body will keyword-match almost anything.
    .filter((h) => h.title && isDevRelevant(h.title, ""))
    .map((h): WireItem => ({
      title: h.title as string,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      discussUrl: `https://news.ycombinator.com/item?id=${h.objectID}`,
      metric: `${h.points || 0} pts · ${h.num_comments || 0} comments`,
      score: h.points || 0,
      source: "Hacker News",
      ts: h.created_at_i,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

// 4. GitHub Trending — what developers are starring today (scrape; no official API).
async function ghTrending(): Promise<WireItem[]> {
  const html = await getText("https://github.com/trending?since=daily");
  const rows: { repo: string; desc: string; stars: string }[] = [];
  const re = /<h2 class="h3 lh-condensed">[\s\S]*?href="\/([^"]+)"[\s\S]*?<\/h2>([\s\S]*?)(?=<article|<\/div>\s*<\/div>\s*<\/div>)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && rows.length < 40) {
    const repo = m[1].replace(/\s+/g, "");
    const rest = m[2];
    const desc = strip((rest.match(/<p class="col-9[^"]*">([\s\S]*?)<\/p>/) || [])[1] || "");
    const stars = strip((rest.match(/stars today[\s\S]*?<\/svg>([\s\S]*?)<\/span>/) || [])[1] || "");
    rows.push({ repo, desc, stars });
  }
  return rows
    .filter((r) => isRelevant(r.repo.replace(/[/-]/g, " "), r.desc))
    .slice(0, 10)
    .map((r, i): WireItem => ({
      title: r.repo,
      url: `https://github.com/${r.repo}`,
      summary: clip(r.desc),
      metric: r.stars ? `${r.stars} stars today` : "trending",
      score: 100 - i,
      source: "GitHub Trending",
      ts: null,
    }));
}

// 5. Vendor + practitioner blogs — the "official release" layer.
// Adding a feed here (name + url) is the cheapest way to grow the wire.
export const FEEDS: [url: string, name: string][] = [
  ["https://openai.com/news/rss.xml", "OpenAI"],
  ["https://blog.google/technology/ai/rss/", "Google AI"],
  ["https://simonwillison.net/atom/everything/", "Simon Willison"],
  ["https://www.latent.space/feed", "Latent Space"],
  ["https://github.blog/changelog/feed/", "GitHub Changelog"],
  ["https://huggingface.co/blog/feed.xml", "HF Blog"],
  ["https://aws.amazon.com/blogs/machine-learning/feed/", "AWS ML"],
  ["https://engineering.fb.com/feed/", "Meta Engineering"],
];
async function blogs(): Promise<WireItem[]> {
  const cutoff = now() - 7 * DAY;
  const settled = await Promise.allSettled(
    FEEDS.map(async ([url, name]) => parseFeed(await getText(url), name))
  );
  return settled
    .flatMap((s) => (s.status === "fulfilled" ? s.value : []))
    .filter((i) => i.ts && i.ts > cutoff)
    .filter((i) => isDevRelevant(i.title, i.summary))
    .filter((i) => !/^quoting /i.test(i.title))
    .map((i) => ({ ...i, score: devScore(i.title, i.summary) }))
    .sort((a, b) => (b.ts || 0) - (a.ts || 0))
    .slice(0, 12);
}

// 6. arXiv — the raw firehose, capped tight. Secondary to HF Daily Papers.
async function arxiv(): Promise<WireItem[]> {
  const xml = await getText(
    "https://export.arxiv.org/api/query?search_query=cat:cs.CL+OR+cat:cs.SE&sortBy=submittedDate&sortOrder=descending&max_results=25"
  );
  return parseFeed(xml, "arXiv")
    .filter((p) => isRelevant(p.title, p.summary))
    .slice(0, 6)
    .map((p) => ({ ...p, summary: clip(p.summary, 200), url: p.url.replace("http://", "https://") }));
}

/** The source registry — the one place the set of sources is declared. */
export const SOURCES: SourceAdapter[] = [
  { id: "hf-models", key: "models", label: "Hugging Face", fetch: hfModels },
  { id: "hf-papers", key: "papers", label: "HF Daily Papers", fetch: hfPapers },
  { id: "hacker-news", key: "hn", label: "Hacker News", fetch: hackernews },
  { id: "github-trending", key: "repos", label: "GitHub Trending", fetch: ghTrending },
  { id: "blogs", key: "blogs", label: "Vendor & practitioner blogs", fetch: blogs },
  { id: "arxiv", key: "arxiv", label: "arXiv cs.CL/cs.SE", fetch: arxiv },
];
