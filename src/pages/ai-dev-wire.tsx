import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import SectionHeader from "../components/SectionHeader";
import EnterpriseCtaBand from "../components/EnterpriseCtaBand";
import { seoTags, canonicalUrl as buildCanonical, type SeoMeta } from "../lib/seo";
import type { Recommendation, SectionKey, WireItem, WirePayload } from "../lib/ai-dev-wire/types";

const SECTION_META: { key: SectionKey; label: string; note: string }[] = [
  { key: "models", label: "Models", note: "Hugging Face trending" },
  { key: "blogs", label: "Releases", note: "Vendor & practitioner blogs" },
  { key: "repos", label: "Repos", note: "GitHub trending" },
  { key: "hn", label: "Discussions", note: "Hacker News" },
  { key: "papers", label: "Papers", note: "HF Daily Papers" },
  { key: "arxiv", label: "arXiv", note: "cs.CL / cs.SE" },
];
const KIND_LABEL: Record<Recommendation["kind"], string> = {
  release: "Release", model: "Model", repo: "Repo", discussion: "Discussion", paper: "Paper",
};

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      className={spinning ? "animate-spin" : ""}
      width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function updatedLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function AiDevWirePage() {
  const seoMeta: SeoMeta = {
    title: "AI Dev Wire | Colaberry AI",
    description:
      "The developer slice of AI, every morning — trending models, papers, repos and the discussions that matter, with a ranked pick of what to look at first.",
    canonical: buildCanonical("/ai-dev-wire"),
  };

  const [data, setData] = useState<WirePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SectionKey | "all">("all");

  const load = useCallback(async (refresh: boolean) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai-dev-wire${refresh ? "?refresh=1" : ""}`);
      if (!res.ok) throw new Error(`Couldn't reach the wire (HTTP ${res.status})`);
      setData((await res.json()) as WirePayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load the wire.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(false); }, [load]);

  const sectionsWithCounts = useMemo(
    () => SECTION_META.map((s) => ({ ...s, count: data?.sections[s.key]?.length ?? 0 })).filter((s) => s.count > 0),
    [data]
  );
  const visibleGroups = useMemo(() => {
    if (!data) return [] as { key: SectionKey; label: string; note: string; items: WireItem[] }[];
    return SECTION_META
      .filter((s) => (filter === "all" ? true : s.key === filter))
      .map((s) => ({ ...s, items: data.sections[s.key] ?? [] }))
      .filter((g) => g.items.length > 0);
  }, [data, filter]);

  return (
    <Layout>
      <Head>
        <title>{seoMeta.title}</title>
        {seoTags(seoMeta).map(({ key, ...props }) =>
          "rel" in props ? <link key={key} {...props} /> : <meta key={key} {...props} />
        )}
      </Head>

      {/* Hero — rendered statically (no SectionHeader/KineticHeading/.reveal).
          This page is client-fetched and the site's entrance animations
          (scroll-reveal + KineticHeading) don't fire here, which left the hero
          and every section stuck invisible (opacity:0). Plain markup guarantees
          it renders. */}
      <div className="flex w-full flex-col items-start gap-5 text-left">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-label font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
          <span>Daily brief · AI Dev Wire</span>
        </div>
        <h1 className="font-sans text-display-md font-bold text-zinc-900 dark:text-zinc-50 sm:text-display-lg md:text-display-xl lg:text-display-2xl">
          {"What's vibing in AI dev today"}
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-lg">
          Trending open weights, fresh papers, hot repos and the discussions that matter — pulled every morning from six sources and ranked into a short list of what to look at first.
        </p>
      </div>

      {/* Controls */}
      <div className="surface-panel mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          {data ? (
            <>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
              <span>Updated {updatedLabel(data.generatedAt)}</span>
              {data.sourceHealth.some((h) => !h.ok) ? (
                <span className="text-red-600">· {data.sourceHealth.filter((h) => !h.ok).length} source(s) unavailable</span>
              ) : (
                <span className="text-zinc-400 dark:text-zinc-500">· {data.sourceHealth.filter((h) => h.ok).length} sources live</span>
              )}
            </>
          ) : (
            <span>{error ? "" : "Loading the wire…"}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => void load(true)}
          disabled={refreshing || loading}
          className="btn inline-flex items-center gap-2 rounded-full bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshIcon spinning={refreshing} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-red-600">{error}</p>
          <button type="button" onClick={() => void load(true)} className="mt-4 rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-[#DC2626] hover:text-[#DC2626] dark:border-zinc-600 dark:text-zinc-300">
            Try again
          </button>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
          ))}
        </div>
      ) : null}

      {/* Start here — the ranked picks. NOTE: these sections render AFTER the client
          fetch, so they must NOT use .reveal / .stagger-grid — the site's scroll-reveal
          only observes elements present at mount, leaving async-added ones stuck at
          opacity:0 (invisible). Render them plainly visible instead. */}
      {data && data.picks.length > 0 ? (
        <section className="mt-14">
          <SectionHeader as="h2" size="md" animate={false} kicker="Start here" title="Today's three" description="Ranked by cross-source corroboration — the same subject surfacing in independent sources is the strongest same-day signal." />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {data.picks.map((p, i) => (
              <article key={p.url} className="catalog-card flex flex-col gap-3 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-700">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-label font-semibold uppercase tracking-[0.12em] text-[#DC2626]">
                    <span className="font-mono text-sm tabular-nums text-zinc-400 dark:text-zinc-500">0{i + 1}</span>
                    {KIND_LABEL[p.kind]}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{p.source}</span>
                </div>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-base font-semibold leading-snug text-zinc-900 hover:text-[#DC2626] dark:text-zinc-50">
                  {p.title}
                </a>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{p.why}</p>
                {p.metric ? <div className="mt-auto pt-1 font-mono text-xs text-zinc-400 dark:text-zinc-500">{p.metric}</div> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* The feeds */}
      {data && sectionsWithCounts.length > 0 ? (
        <section className="mt-16">
          <SectionHeader as="h2" size="md" animate={false} kicker="The feeds" title="Every source, browsable" description="The full pull behind today's picks — filter by source." />
          <div className="surface-panel mt-6 flex flex-wrap gap-2 rounded-2xl px-4 py-3">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" count={data.sourceHealth.reduce((n, h) => n + h.count, 0)} />
            {sectionsWithCounts.map((s) => (
              <FilterChip key={s.key} active={filter === s.key} onClick={() => setFilter(s.key)} label={s.label} count={s.count} />
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-12">
            {visibleGroups.map((g) => (
              <div key={g.key}>
                <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-zinc-200 pb-2 dark:border-zinc-800">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{g.label}</h3>
                  <span className="text-xs uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">{g.note}</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {g.items.map((it) => (
                    <article key={it.url} className="catalog-card flex flex-col gap-2 rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">{it.source}</span>
                        {it.metric ? <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">{it.metric}</span> : null}
                      </div>
                      <a href={it.url} target="_blank" rel="noopener noreferrer" className="font-semibold leading-snug text-zinc-900 hover:text-[#DC2626] dark:text-zinc-50">
                        {it.title}
                        {it.variants ? <span className="ml-2 align-middle text-xs font-normal text-zinc-400">+{it.variants} variants</span> : null}
                      </a>
                      {it.summary ? <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{it.summary}</p> : null}
                      {it.discussUrl ? (
                        <a href={it.discussUrl} target="_blank" rel="noopener noreferrer" className="mt-auto pt-1 text-xs font-semibold text-zinc-500 hover:text-[#DC2626] dark:text-zinc-400">
                          Discussion →
                        </a>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-20">
        <EnterpriseCtaBand
          animate={false}
          kicker="AI platform"
          title="The whole platform, not just the wire"
          description="AI Dev Wire is one surface of the Colaberry AI platform — explore the agents, MCP servers, and skills catalog built for both people and LLMs."
          primaryHref="/aixcelerator"
          primaryLabel="Explore the platform"
          secondaryHref="/request-demo"
          secondaryLabel="Book a demo"
        />
      </div>
    </Layout>
  );
}

function FilterChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "chip-brand inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold"
          : "chip-neutral inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium"
      }
    >
      {label}
      <span className="font-mono text-xs tabular-nums opacity-70">{count}</span>
    </button>
  );
}
