/**
 * Platform Ontology — Cross-type knowledge graph diagram showing how all content types connect.
 * This is Colaberry's unique differentiator — "our own method."
 */

import type { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import Layout from "../../components/Layout";
import SectionHeader from "../../components/SectionHeader";
import EnterpriseCtaBand from "../../components/EnterpriseCtaBand";
import { seoTags, canonicalUrl as buildCanonical, type SeoMeta } from "../../lib/seo";
import { CONTENT_TYPE_META, CROSS_TYPE_RELATIONS } from "../../lib/ontologyRegistry";
import type { ContentTypeName } from "../../lib/ontologyTypes";
import ContentTypeIcon, { ContentTypeIconSvg } from "../../components/ContentTypeIcon";

/* ── Data fetching ─────────────────────────────────────────────────── */

type Props = {
  typeCounts: Record<ContentTypeName, number>;
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  // Fetch real counts from CMS pagination totals
  const cms = await import("../../lib/cms");
  const counts = await cms.fetchCatalogCounts().catch(() => ({
    agents: 0, mcpServers: 0, skills: 0, tools: 0, podcasts: 0,
  }));

  return {
    props: {
      typeCounts: {
        skill: counts.skills,
        agent: counts.agents,
        mcp: counts.mcpServers,
        tool: counts.tools,
        podcast: counts.podcasts,
      },
    },
    revalidate: 600,
  };
};

/* ── Platform Ontology SVG Diagram ────────────────────────────────── */

const NODE_POSITIONS: Partial<Record<ContentTypeName, { x: number; y: number }>> = {
  agent: { x: 200, y: 100 },
  skill: { x: 520, y: 100 },
  mcp: { x: 200, y: 320 },
  podcast: { x: 520, y: 320 },
};

function PlatformDiagram({ typeCounts }: { typeCounts: Record<ContentTypeName, number> }) {
  const [hoveredType, setHoveredType] = useState<ContentTypeName | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null);

  const svgWidth = 720;
  const svgHeight = 500;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full min-w-[600px]" style={{ maxHeight: `${svgHeight}px`, fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
        <defs>
          <filter id="kgNodeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.08" />
          </filter>
          <filter id="kgHoverShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="3" stdDeviation="8" floodColor="#DC2626" floodOpacity="0.12" />
          </filter>
          <style>{`
            @keyframes kgDashMove { to { stroke-dashoffset: -18; } }
            .kg-edge { animation: kgDashMove 2s linear infinite; }
          `}</style>
        </defs>

        <rect width={svgWidth} height={svgHeight} rx="12" className="fill-zinc-50 dark:fill-zinc-900" />

        {/* Cross-type relationship edges */}
        {CROSS_TYPE_RELATIONS.map((rel, i) => {
          const from = NODE_POSITIONS[rel.sourceType];
          const to = NODE_POSITIONS[rel.targetType];
          if (!from || !to) return null;
          const isHovered = hoveredEdge === i;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredEdge(i)}
              onMouseLeave={() => setHoveredEdge(null)}
              style={{ cursor: "pointer" }}
            >
              <line
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={isHovered ? "#DC2626" : "#71717a"}
                strokeWidth={isHovered ? 2.5 : 1}
                strokeDasharray="6,3"
                opacity={isHovered ? 0.9 : 0.3}
                className="kg-edge"
              />
              {isHovered && (
                <>
                  <rect
                    x={midX - rel.label.length * 3.5 - 6}
                    y={midY - 12}
                    width={rel.label.length * 7 + 12}
                    height="18"
                    rx="9"
                    fill="#DC2626"
                    opacity="0.9"
                  />
                  <text x={midX} y={midY} textAnchor="middle" fontSize="9" fontWeight="600" fill="#fff">
                    {rel.label}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* Content type nodes */}
        {(Object.entries(CONTENT_TYPE_META) as [ContentTypeName, typeof CONTENT_TYPE_META[ContentTypeName]][]).filter(([type]) => type in NODE_POSITIONS).map(([type, meta]) => {
          const pos = NODE_POSITIONS[type]!;
          const isHovered = hoveredType === type;
          const count = typeCounts[type] || 0;
          const config: Record<string, string> = { skill: "/aixcelerator/skills/ontology", agent: "/aixcelerator/agents/ontology", mcp: "/aixcelerator/mcp/ontology", podcast: "/resources/podcasts/ontology" };

          return (
            <g
              key={type}
              onMouseEnter={() => setHoveredType(type)}
              onMouseLeave={() => setHoveredType(null)}
              style={{ cursor: "pointer" }}
              onClick={() => { window.location.href = config[type]; }}
            >
              {/* Glow ring on hover — coral accent */}
              {isHovered && (
                <circle cx={pos.x} cy={pos.y} r="46" fill="#DC2626" opacity="0.06" />
              )}

              {/* Node circle */}
              <circle
                cx={pos.x} cy={pos.y} r="36"
                fill="none"
                stroke={isHovered ? "#DC2626" : "#52525b"}
                strokeWidth={isHovered ? 2 : 1}
                opacity={isHovered ? 1 : 0.6}
                filter="url(#kgNodeShadow)"
              />
              <circle cx={pos.x} cy={pos.y} r="36" fill={isHovered ? "#DC2626" : "#3f3f46"} opacity={isHovered ? 0.06 : 0.15} />

              {/* Icon */}
              <ContentTypeIconSvg type={type} x={pos.x} y={pos.y - 4} size={20} fill={isHovered ? "#DC2626" : "#a1a1aa"} />

              {/* Label */}
              <text x={pos.x} y={pos.y + 14} textAnchor="middle" fontSize="10" fontWeight="700" fill={isHovered ? "#DC2626" : "#a1a1aa"}>
                {meta.label}
              </text>

              {/* Count */}
              <text x={pos.x} y={pos.y + 56} textAnchor="middle" className="fill-zinc-400 dark:fill-zinc-500" fontSize="9" fontWeight="500">
                {count > 0 ? `${count}+` : ""}
              </text>
            </g>
          );
        })}

        {/* Title */}
        <text x={svgWidth / 2} y="24" textAnchor="middle" className="fill-zinc-400 dark:fill-zinc-500" fontSize="9" fontWeight="700" letterSpacing="0.12em">
          COLABERRY AI KNOWLEDGE GRAPH
        </text>
      </svg>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */

export default function PlatformOntologyPage({ typeCounts }: InferGetStaticPropsType<typeof getStaticProps>) {
  const seoMeta: SeoMeta = {
    title: "AI Knowledge Graph — Platform Ontology | Colaberry AI",
    description: "Knowledge graph mapping how AI agents, skills, MCP servers, and podcasts connect across the Colaberry AI platform.",
    canonical: buildCanonical("/aixcelerator/ontology"),
    ogImage: "/og/ontology.png",
    ogImageAlt: "Colaberry AI — AI knowledge graph and platform ontology",
  };

  const totalItems = Object.entries(typeCounts).filter(([k]) => k !== "tool").reduce((s, [, c]) => s + c, 0);

  return (
    <Layout>
      <Head>
        <title>{seoMeta.title}</title>
        {seoTags(seoMeta).map(({ key, ...props }) =>
          "rel" in props ? <link key={key} {...props} /> : <meta key={key} {...props} />
        )}
      </Head>

      <div className="reveal grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div>
          <SectionHeader
            as="h1"
            size="xl"
            kicker="Platform"
            title="Knowledge Graph"
            description="How Agents, Skills, MCP Servers, and Podcasts are interconnected in the Colaberry AI platform. Click any node to explore its ontology."
          />
          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-zinc-950/30">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#DC2626]/10 dark:bg-[#DC2626]/15">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#DC2626] dark:text-[#F87171]" aria-hidden="true"><path d="M12 16v-4m0-4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#DC2626] dark:text-[#F87171]">Colaberry&apos;s Own Method</span>
                <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Cross-type relationships create a unified knowledge graph. Agents USE Skills, connect via MCPs. Podcasts DISCUSS all of them.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="reveal rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <PlatformDiagram typeCounts={typeCounts} />
        </div>
      </div>

      {/* Stats */}
      <section className="reveal mt-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.entries(CONTENT_TYPE_META) as [ContentTypeName, typeof CONTENT_TYPE_META[ContentTypeName]][]).filter(([type]) => type !== "tool").map(([type, meta]) => (
            <Link key={type} href={`${type === "podcast" ? "/resources/podcasts" : `/aixcelerator/${type === "skill" ? "skills" : type === "agent" ? "agents" : "mcp"}`}/ontology`} className="group catalog-card p-5 text-center">
              <ContentTypeIcon type={type as ContentTypeName} size={28} className="mx-auto text-zinc-400 dark:text-zinc-500 transition-colors group-hover:text-[#DC2626] dark:group-hover:text-[#F87171]" />
              <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{(typeCounts[type] || 0).toLocaleString()}+</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{meta.label}</div>
              <div className="mt-2 text-[10px] font-semibold text-[#DC2626] group-hover:underline dark:text-[#F87171]">View Ontology →</div>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-bold text-zinc-900 dark:text-zinc-50">{totalItems.toLocaleString()}+</span> total items · <span className="font-bold text-zinc-900 dark:text-zinc-50">{CROSS_TYPE_RELATIONS.length}</span> cross-type relationships
        </div>
      </section>

      {/* Cross-Type Relationships */}
      <section className="reveal mt-8">
        <SectionHeader size="md" kicker="Relationships" title="Cross-Type Connections" description="How different content types relate to each other across the platform." />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CROSS_TYPE_RELATIONS.slice(0, 4).map((rel) => (
            <div key={`${rel.sourceType}-${rel.targetType}-${rel.relationType}`} className="catalog-card p-5">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#DC2626] dark:bg-[#F87171]" />
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{rel.label}</span>
              </div>
              <div className="mt-1 text-[10px] text-zinc-400">
                {CONTENT_TYPE_META[rel.sourceType].label} → {CONTENT_TYPE_META[rel.targetType].label}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{rel.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="reveal mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/aixcelerator/ecosystem" className="group catalog-card p-5 text-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="mx-auto text-zinc-500 dark:text-zinc-400" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" stroke="currentColor" strokeWidth="1.5" /></svg>
          <div className="mt-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">Ecosystem Graph</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Interactive force-graph with all content types</div>
          <div className="mt-2 text-xs font-semibold text-[#DC2626] group-hover:underline dark:text-[#F87171]">Explore →</div>
        </Link>
        <Link href="/aixcelerator/solution-stacks" className="group catalog-card p-5 text-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="mx-auto text-zinc-500 dark:text-zinc-400" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div className="mt-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">Solution Stacks</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Cross-type curated bundles</div>
          <div className="mt-2 text-xs font-semibold text-[#DC2626] group-hover:underline dark:text-[#F87171]">Browse →</div>
        </Link>
        <Link href="/aixcelerator/skills/graph" className="group catalog-card p-5 text-center">
          <ContentTypeIcon type="skill" size={22} className="mx-auto text-zinc-500 dark:text-zinc-400" />
          <div className="mt-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">Skill Graph</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">500+ skills in an interactive graph</div>
          <div className="mt-2 text-xs font-semibold text-[#DC2626] group-hover:underline dark:text-[#F87171]">View →</div>
        </Link>
      </section>

      <EnterpriseCtaBand
        kicker="Platform knowledge graph"
        title="Explore the full ecosystem"
        description="Discover how Agents, Skills, MCP Servers, and Podcasts connect across the Colaberry AI platform."
        primaryHref="/aixcelerator/ecosystem"
        primaryLabel="View ecosystem graph"
        secondaryHref="/aixcelerator/skills"
        secondaryLabel="Browse skills"
        className="mt-10"
      />
    </Layout>
  );
}
