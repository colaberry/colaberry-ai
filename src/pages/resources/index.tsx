import type { GetStaticProps } from "next";
import Link from "next/link";
import Layout from "../../components/Layout";
import Head from "next/head";
import SectionHeader from "../../components/SectionHeader";
import EnterpriseCtaBand from "../../components/EnterpriseCtaBand";
import { seoTags, canonicalUrl as buildCanonical, type SeoMeta } from "../../lib/seo";
import { fetchPodcastEpisodes, fetchArticles, fetchBooks, fetchCaseStudies } from "../../lib/cms";

type ResourceCounts = {
  podcasts: number;
  articles: number;
  books: number;
  caseStudies: number;
};
type ResourcesProps = { counts: ResourceCounts };

export const getStaticProps: GetStaticProps<ResourcesProps> = async () => {
  const counts: ResourceCounts = { podcasts: 0, articles: 0, books: 0, caseStudies: 0 };
  try {
    const [pods, arts, bks, cs] = await Promise.allSettled([
      fetchPodcastEpisodes(),
      fetchArticles(),
      fetchBooks(),
      fetchCaseStudies(),
    ]);
    if (pods.status === "fulfilled") counts.podcasts = pods.value.length;
    if (arts.status === "fulfilled") counts.articles = arts.value.length;
    if (bks.status === "fulfilled") counts.books = bks.value.length;
    if (cs.status === "fulfilled") counts.caseStudies = cs.value.length;
  } catch {}
  return { props: { counts }, revalidate: 600 };
};

/* ── Resource lanes ───────────────────────────────────────────────── */

const RESOURCE_LANES: {
  href: string;
  title: string;
  description: string;
  meta: string;
  countKey?: keyof ResourceCounts;
}[] = [
  {
    href: "/resources/podcasts",
    title: "Podcasts + transcripts",
    description: "Searchable conversations tied to agents and MCP servers.",
    meta: "Audio",
    countKey: "podcasts",
  },
  {
    href: "/resources/white-papers",
    title: "White papers + POVs",
    description: "Technical guidance, frameworks, and executive summaries.",
    meta: "Research",
  },
  {
    href: "/resources/articles",
    title: "Articles + analysis",
    description: "CMS-backed articles, practical notes, and implementation updates.",
    meta: "Editorial",
    countKey: "articles",
  },
  {
    href: "/resources/case-studies",
    title: "Case studies",
    description: "Outcome stories with measurable impact and context.",
    meta: "Outcomes",
    countKey: "caseStudies",
  },
  {
    href: "/resources/books",
    title: "Books + artifacts",
    description: "Reference material, templates, and delivery assets.",
    meta: "Artifacts",
    countKey: "books",
  },
];

/* ── Page ──────────────────────────────────────────────────────────── */

export default function Resources({ counts }: ResourcesProps) {
  const seoMeta: SeoMeta = {
    title: "Resources | Colaberry AI - Podcasts, Books, White Papers, Case Studies",
    description: "Explore Colaberry AI resources: podcasts with transcripts, white papers, books, case studies, and articles on enterprise AI agents, MCP servers, and skills.",
    canonical: buildCanonical("/resources"),
  };

  return (
    <Layout>
      <Head>
        <title>{seoMeta.title}</title>
        {seoTags(seoMeta).map(({ key, ...props }) => (
          "rel" in props ? <link key={key} {...props} /> : <meta key={key} {...props} />
        ))}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Colaberry AI Resources",
          "description": "Enterprise AI knowledge resources: podcasts, books, white papers, case studies, and articles.",
          "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://colaberry.ai"}/resources`,
        }).replace(/</g, "\\u003c") }} />
      </Head>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="reveal flex flex-col gap-4">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-2.5 pr-3.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-600 dark:bg-red-400" />
          Modular layer
        </div>
        <SectionHeader
          as="h1"
          size="xl"
          title="Resources"
          description="A structured knowledge layer for podcasts, books, white papers, case studies, and editorial signals — ready for teams, SEO, and LLM indexing."
        />
      </div>

      {/* ── Metrics band ──────────────────────────────────────────── */}
      <div className="reveal mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-700">
        <div className="flex flex-col gap-1 bg-zinc-50 px-5 py-4 dark:bg-zinc-900">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Resource lanes</span>
          <span className="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{RESOURCE_LANES.length}</span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Core resource surfaces in active navigation.</span>
        </div>
        <div className="flex flex-col gap-1 bg-zinc-50 px-5 py-4 dark:bg-zinc-900">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Publishing model</span>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Internal + curated</span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Owned content with selective external aggregation.</span>
        </div>
        <div className="flex flex-col gap-1 bg-zinc-50 px-5 py-4 dark:bg-zinc-900">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Discovery</span>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Search-ready</span>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Metadata-first structure for users and assistants.</span>
        </div>
      </div>

      {/* ── Resource lanes grid ───────────────────────────────────── */}
      <section className="reveal section-spacing">
        <SectionHeader
          kicker="Browse"
          title="Resource lanes"
          description="Explore structured content across five knowledge surfaces."
          size="md"
        />
        <div className="stagger-grid mt-6 grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-700 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCE_LANES.map((lane) => {
            const count = lane.countKey ? counts[lane.countKey] : 0;
            return (
              <Link
                key={lane.href}
                href={lane.href}
                className="group flex flex-col gap-3 bg-zinc-50 p-6 transition-colors duration-150 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">{lane.title}</span>
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-zinc-300 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400">
                    <path d="M6.5 3.5 11 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{lane.description}</p>
                <div className="mt-auto flex items-center gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {lane.meta}
                  </span>
                  {count > 0 ? (
                    <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{count} items</span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── CTA band ──────────────────────────────────────────────── */}
      <EnterpriseCtaBand
        kicker="Knowledge engine"
        title="Publish faster. Curate better. Keep every resource indexable."
        description="Use one structured workflow for podcasts, articles, white papers, books, and case studies so teams and LLMs can discover trusted content quickly."
        primaryHref="/resources/podcasts"
        primaryLabel="Browse podcasts"
        secondaryHref="/updates"
        secondaryLabel="Open updates feed"
      />
    </Layout>
  );
}
