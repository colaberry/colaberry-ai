import SkillCard from "../../../components/SkillCard";
import CatalogSnapshot from "../../../components/CatalogSnapshot";
import Layout from "../../../components/Layout";
import SectionHeader from "../../../components/SectionHeader";
import StatePanel from "../../../components/StatePanel";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GetStaticProps } from "next";
import { Skill, fetchSkills } from "../../../lib/cms";
import { useRouter } from "next/router";
import Head from "next/head";
import { seoTags, canonicalUrl as buildCanonical, type SeoMeta } from "../../../lib/seo";

type SkillsPageProps = {
  skills: Skill[];
  allowPrivate: boolean;
  fetchError: boolean;
};

type SkillSortMode = "alphabetical" | "latest" | "trending";

export const getStaticProps: GetStaticProps<SkillsPageProps> = async () => {
  const allowPrivate = process.env.NEXT_PUBLIC_SHOW_PRIVATE === "true";
  const visibilityFilter = allowPrivate ? undefined : "public";

  try {
    const skills = (await fetchSkills(visibilityFilter, { maxRecords: 400 })).map(
      toSkillListItem
    );
    return {
      props: { skills, allowPrivate, fetchError: false },
      revalidate: 600,
    };
  } catch {
    return {
      props: { skills: [], allowPrivate, fetchError: true },
      revalidate: 120,
    };
  }
};

export default function Skills({ skills, allowPrivate, fetchError }: SkillsPageProps) {
  const router = useRouter();
  const [visibility, setVisibility] = useState<"all" | "public" | "private">(
    allowPrivate ? "all" : "public"
  );
  const [sortMode, setSortMode] = useState<SkillSortMode>("trending");
  const [search, setSearch] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const pageSize = 24;
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const querySearch = useMemo(() => {
    const raw = Array.isArray(router.query.q) ? router.query.q[0] : router.query.q;
    return typeof raw === "string" ? raw : "";
  }, [router.query.q]);
  const effectiveSearch = search ?? querySearch;
  const categories = useMemo(
    () =>
      Array.from(new Set(skills.map((s) => s.category || "Other"))).filter(Boolean).sort(),
    [skills]
  );
  const statuses = useMemo(() => {
    const list = Array.from(new Set(skills.map((s) => (s.status || "unknown").toLowerCase())));
    return list.sort();
  }, [skills]);
  const sources = useMemo(() => {
    const list = Array.from(new Set(skills.map((s) => (s.source || "internal").toLowerCase())));
    return list.sort();
  }, [skills]);
  const tagOptions = useMemo(() => {
    const map = new Map<string, string>();
    skills.forEach((skill) => {
      (skill.tags || []).forEach((tag) => {
        const key = (tag.slug || tag.name || "").toLowerCase();
        if (key && !map.has(key)) {
          map.set(key, tag.name || tag.slug || key);
        }
      });
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [skills]);
  const visibilityCounts = skills.reduce<Record<string, number>>((acc, s) => {
    const key = (s.visibility || "public").toLowerCase();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://colaberry.ai";
  const metaTitle = "16,900+ AI Skills — Reusable Capability Library | Colaberry AI";
  const metaDescription =
    "Explore 16,900+ reusable AI skills across workflow, domain, and orchestration categories. Enterprise-grade discovery with structured metadata for agents and LLMs.";
  const seoMeta: SeoMeta = {
    title: metaTitle,
    description: metaDescription,
    canonical: buildCanonical("/aixcelerator/skills"),
    ogImage: "/og/skills.png",
    ogImageAlt: "Colaberry AI — 16,900+ reusable AI skills library",
  };
  const canonicalUrl = seoMeta.canonical!;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Colaberry AI Skills Catalog",
    url: canonicalUrl,
    description: metaDescription,
    itemListElement: skills.slice(0, 12).map((skill, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareApplication",
        name: skill.name,
        description: skill.summary || undefined,
        applicationCategory: "AI Skill",
        url: `${siteUrl}/aixcelerator/skills/${skill.slug || skill.id}`,
      },
    })),
  };
  const filteredSkills = useMemo(() => {
    const query = effectiveSearch.trim().toLowerCase();
    return filterByVisibility(skills, allowPrivate, visibility).filter((skill) =>
      matchesFilters(skill, query, categoryFilter, statusFilter, sourceFilter, tagFilter)
    );
  }, [skills, allowPrivate, visibility, effectiveSearch, categoryFilter, statusFilter, sourceFilter, tagFilter]);
  const sortedSkills = useMemo(
    () => sortSkills(filteredSkills, sortMode),
    [filteredSkills, sortMode]
  );
  const scopedSkills = useMemo(
    () => filterByVisibility(skills, allowPrivate, visibility),
    [skills, allowPrivate, visibility]
  );
  const shownCount = Math.min(visibleCount, sortedSkills.length);
  const visibleSkills = useMemo(
    () => sortedSkills.slice(0, shownCount),
    [sortedSkills, shownCount]
  );
  const hasMore = shownCount < sortedSkills.length;
  const hasResults = sortedSkills.length > 0;

  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + pageSize, sortedSkills.length));
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sortedSkills.length, hasMore, pageSize]);

  return (
    <Layout>
      <Head>
        <title>{seoMeta.title}</title>
        {seoTags(seoMeta).map(({ key, ...props }) => (
          "rel" in props ? <link key={key} {...props} /> : <meta key={key} {...props} />
        ))}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      {fetchError && (
        <div className="mb-6">
          <StatePanel
            variant="error"
            title="Live skill data is temporarily unavailable"
            description="Showing cached catalog entries while we reconnect to the CMS."
            action={
              <button
                type="button"
                onClick={() => router.replace(router.asPath)}
                className="btn btn-secondary btn-sm"
              >
                Retry
              </button>
            }
          />
        </div>
      )}

      <div className="reveal grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="flex flex-col gap-3">
          <SectionHeader
            as="h1"
            size="xl"
            kicker="Skills catalog"
            title="AI Skills"
            description="A governed catalog of AI skills with structured metadata, lifecycle status, and enterprise-grade discovery for agents and workflows."
          />
        </div>
      </div>

      <CatalogSnapshot
        stats={[
          { label: "Skills", value: skills.length.toLocaleString(), note: "Versioned catalog" },
          { label: "Categories", value: String(new Set(skills.map((s) => s.category)).size), note: "Domain-aligned" },
          { label: "Visibility", value: `${visibilityCounts.public ?? 0} public`, note: allowPrivate ? `${visibilityCounts.private ?? 0} private` : "Private hidden" },
        ]}
      />

      <section className="reveal surface-panel mt-6 p-6 sm:mt-8">
        <SectionHeader
          kicker="Filters"
          title="Search and filter"
          description="Find skills by category, status, tags, and visibility."
          size="md"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12">
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-4">
            <label htmlFor="skill-search" className="sr-only">
              Search skills
            </label>
            <div className="relative group">
              <input
                id="skill-search"
                name="skill-search"
                type="search"
                placeholder="Search skills, categories, tags..."
                value={effectiveSearch}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setVisibleCount(pageSize);
                }}
                className="w-full rounded-lg border border-zinc-200/80 bg-white px-4 py-2 pr-11 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:border-zinc-500 dark:focus:ring-zinc-100/10 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200 dark:placeholder:text-zinc-500"
              />
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 dark:text-zinc-500"
                fill="none"
              >
                <path
                  d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M16.25 16.25 21 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="skill-category" className="sr-only">
              Filter by category
            </label>
            <select
              id="skill-category"
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setVisibleCount(pageSize);
              }}
              className="w-full rounded-lg border border-zinc-200/80 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:border-zinc-500 dark:focus:ring-zinc-100/10 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="skill-status" className="sr-only">
              Filter by status
            </label>
            <select
              id="skill-status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setVisibleCount(pageSize);
              }}
              className="w-full rounded-lg border border-zinc-200/80 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:border-zinc-500 dark:focus:ring-zinc-100/10 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200"
            >
              <option value="all">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="skill-source" className="sr-only">
              Filter by source
            </label>
            <select
              id="skill-source"
              value={sourceFilter}
              onChange={(event) => {
                setSourceFilter(event.target.value);
                setVisibleCount(pageSize);
              }}
              className="w-full rounded-lg border border-zinc-200/80 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:border-zinc-500 dark:focus:ring-zinc-100/10 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200"
            >
              <option value="all">All sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {tagOptions.length > 0 && (
            <div className="lg:col-span-2">
              <label htmlFor="skill-tag" className="sr-only">
                Filter by tag
              </label>
              <select
                id="skill-tag"
                value={tagFilter}
                onChange={(event) => {
                  setTagFilter(event.target.value);
                  setVisibleCount(pageSize);
                }}
                className="w-full rounded-lg border border-zinc-200/80 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:border-zinc-500 dark:focus:ring-zinc-100/10 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200"
              >
                <option value="all">All tags</option>
                {tagOptions.map((tag) => (
                  <option key={tag.value} value={tag.value}>
                    {tag.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Sort
          </span>
          {(
            [
              { value: "trending", label: "Trending" },
              { value: "latest", label: "Latest" },
              { value: "alphabetical", label: "A-Z" },
            ] as { value: SkillSortMode; label: string }[]
          ).map((option) => {
            const active = sortMode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSortMode(option.value);
                  setVisibleCount(pageSize);
                }}
                aria-pressed={active}
                className={`chip focus-ring rounded-md px-3 py-1 text-xs font-semibold ${
                  active ? "chip-brand" : "chip-muted"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {allowPrivate && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {(["all", "public", "private"] as const).map((option) => {
              const active = visibility === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setVisibility(option);
                    setVisibleCount(pageSize);
                  }}
                  aria-pressed={active}
                  className={`chip focus-ring rounded-md px-3 py-1 text-xs font-semibold ${
                    active ? "chip-brand" : "chip-muted"
                  }`}
                >
                  {option === "all" ? "All" : option === "public" ? "Public" : "Private"}
                </button>
              );
            })}
          </div>
        )}
        <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500" aria-live="polite">
          Showing {shownCount} of {sortedSkills.length} (catalog {scopedSkills.length})
        </div>
      </section>

      <div className="stagger-grid mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
        {visibleSkills.map((s) => (
          <SkillCard key={s.slug || String(s.id)} skill={s} />
        ))}
      </div>

      {!hasResults && (
        <div className="mt-6">
          <StatePanel
            variant="empty"
            title="No skills match these filters"
            description="Try clearing filters, switching visibility, or using a shorter search query."
          />
        </div>
      )}

      <div className="mt-6 flex flex-col items-center gap-3">
        {hasResults ? (
          hasMore ? (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + pageSize, sortedSkills.length))}
              className="btn btn-secondary"
            >
              Load more skills
            </button>
          ) : (
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              End of results
            </div>
          )
        ) : null}
        <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
      </div>

    </Layout>
  );
}

function toSkillListItem(skill: Skill): Skill {
  return {
    id: skill.id,
    name: skill.name,
    slug: skill.slug,
    summary: clipText(skill.summary, 220),
    category: skill.category ?? null,
    provider: skill.provider ?? null,
    skillType: skill.skillType ?? null,
    industry: skill.industry ?? null,
    rating: typeof skill.rating === "number" ? skill.rating : null,
    usageCount: typeof skill.usageCount === "number" ? skill.usageCount : null,
    lastUpdated: skill.lastUpdated ?? null,
    status: skill.status ?? null,
    visibility: skill.visibility ?? null,
    source: skill.source ?? null,
    sourceName: skill.sourceName ?? null,
    verified: skill.verified ?? null,
    tags: skill.tags ?? [],
    companies: skill.companies ?? [],
    agents: skill.agents ?? [],
    mcpServers: skill.mcpServers ?? [],
    useCases: skill.useCases ?? [],
  };
}

function clipText(value?: string | null, limit = 220) {
  if (!value) return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit - 1).trimEnd()}...`;
}

function matchesFilters(
  skill: Skill,
  query: string,
  categoryFilter?: string,
  statusFilter?: string,
  sourceFilter?: string,
  tagFilter?: string
) {
  const categoryMatch =
    !categoryFilter || categoryFilter === "all"
      ? true
      : (skill.category || "").toLowerCase() === categoryFilter;
  const statusMatch =
    !statusFilter || statusFilter === "all"
      ? true
      : (skill.status || "unknown").toLowerCase() === statusFilter;
  const sourceMatch =
    !sourceFilter || sourceFilter === "all"
      ? true
      : (skill.source || "internal").toLowerCase() === sourceFilter;
  const tagMatch =
    !tagFilter || tagFilter === "all"
      ? true
      : (skill.tags || []).some(
          (tag) => (tag.slug || tag.name || "").toLowerCase() === tagFilter
        );
  if (!categoryMatch || !statusMatch || !sourceMatch || !tagMatch) {
    return false;
  }
  if (!query) {
    return true;
  }
  const haystack = [
    skill.name,
    skill.summary,
    skill.category,
    skill.provider,
    ...(skill.tags || []).map((tag) => tag.name),
    ...(skill.companies || []).map((company) => company.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function filterByVisibility(
  skills: Skill[],
  allowPrivate: boolean,
  visibility: "all" | "public" | "private"
) {
  if (!allowPrivate) {
    return skills.filter((skill) => (skill.visibility || "public").toLowerCase() === "public");
  }
  if (visibility === "all") {
    return skills;
  }
  return skills.filter((skill) => (skill.visibility || "public").toLowerCase() === visibility);
}

function sortSkills(skills: Skill[], mode: SkillSortMode) {
  const sorted = [...skills];
  if (mode === "alphabetical") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (mode === "latest") {
    return sorted.sort((a, b) => compareDatesDesc(a.lastUpdated, b.lastUpdated) || a.name.localeCompare(b.name));
  }
  return sorted.sort((a, b) => {
    const scoreDelta = scoreTrendingSkill(b) - scoreTrendingSkill(a);
    if (scoreDelta !== 0) return scoreDelta;
    return compareDatesDesc(a.lastUpdated, b.lastUpdated) || a.name.localeCompare(b.name);
  });
}

function compareDatesDesc(a?: string | null, b?: string | null) {
  const left = toTimestamp(a);
  const right = toTimestamp(b);
  return right - left;
}

function toTimestamp(value?: string | null) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function scoreTrendingSkill(skill: Skill) {
  const ratingScore = typeof skill.rating === "number" ? Math.max(skill.rating, 0) * 18 : 0;
  const usageScore =
    typeof skill.usageCount === "number" && skill.usageCount > 0
      ? Math.log10(skill.usageCount + 1) * 25
      : 0;
  const verifiedScore = skill.verified ? 8 : 0;
  const freshnessScore = getFreshnessScore(skill.lastUpdated);
  const relationScore =
    ((skill.agents?.length || 0) + (skill.mcpServers?.length || 0) + (skill.useCases?.length || 0)) * 2;
  return ratingScore + usageScore + verifiedScore + freshnessScore + relationScore;
}

function getFreshnessScore(value?: string | null) {
  if (!value) return 0;
  const timestamp = toTimestamp(value);
  if (!timestamp) return 0;
  const days = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
  if (days <= 14) return 12;
  if (days <= 45) return 8;
  if (days <= 90) return 4;
  return 0;
}
