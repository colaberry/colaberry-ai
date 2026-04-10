import type { GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import SectionHeader from "../../../components/SectionHeader";
import EnterpriseCtaBand from "../../../components/EnterpriseCtaBand";
import { seoTags, canonicalUrl as buildCanonical, type SeoMeta } from "../../../lib/seo";
import { SKILL_CATEGORIES } from "../../../data/skill-taxonomy";
import { SKILL_COLLECTIONS } from "../../../data/skill-collections";
import { fetchSkillCategoryCounts, fetchAllSkillTags } from "../../../lib/cms";
// RELATIONSHIP_TYPE_COLORS and RELATIONSHIP_TYPE_LABELS available from graphUtils if needed

import ContentTypeIcon from "../../../components/ContentTypeIcon";

/* ── Relationship metadata ─────────────────────────────────────────── */

const RELATIONSHIP_TYPES = [
  { type: "similar_to" as const, label: "Similar To", description: "Functionally equivalent or substitutable skills", color: "#34d399", dash: "8,4" },
  { type: "belong_to" as const, label: "Belong To", description: "Hierarchical categorization within larger workflows", color: "#fbbf24", dash: "" },
  { type: "compose_with" as const, label: "Compose With", description: "Skills that combine together with output-to-input flow", color: "#60a5fa", dash: "" },
  { type: "depend_on" as const, label: "Depend On", description: "Prerequisites and environment setup requirements", color: "#f87171", dash: "4,4" },
];

/* ── Representative skills for the relation graph layer ────────────── */
const REPRESENTATIVE_SKILLS = [
  { slug: "nextjs-expert", name: "nextjs-expert", x: 80, y: 30 },
  { slug: "react-patterns", name: "react-patterns", x: 200, y: 60 },
  { slug: "seaborn", name: "seaborn", x: 350, y: 20 },
  { slug: "matplotlib", name: "matplotlib", x: 480, y: 50 },
  { slug: "playwright", name: "playwright", x: 620, y: 30 },
  { slug: "browser-automation", name: "browser-automation", x: 750, y: 60 },
];

const REPRESENTATIVE_EDGES = [
  { from: 0, to: 1, type: "similar_to" as const },
  { from: 2, to: 3, type: "compose_with" as const },
  { from: 3, to: 2, type: "similar_to" as const },
  { from: 4, to: 5, type: "depend_on" as const },
  { from: 0, to: 2, type: "belong_to" as const },
];

/* ── Data fetching ─────────────────────────────────────────────────── */

type OntologyProps = {
  categoryCounts: Record<string, number>;
  totalSkills: number;
  totalCollections: number;
  totalCollectionSkills: number;
  topTags: { name: string; slug: string; count: number }[];
};

export const getStaticProps: GetStaticProps<OntologyProps> = async () => {
  try {
    const [categoryCounts, allTags] = await Promise.all([
      fetchSkillCategoryCounts(),
      fetchAllSkillTags(),
    ]);

    const totalSkills = Object.values(categoryCounts).reduce((s, c) => s + c, 0);
    const totalCollectionSkills = new Set(
      SKILL_COLLECTIONS.flatMap((c) => c.skillSlugs),
    ).size;

    return {
      props: {
        categoryCounts,
        totalSkills,
        totalCollections: SKILL_COLLECTIONS.length,
        totalCollectionSkills,
        topTags: allTags.slice(0, 30),
      },
      revalidate: 600,
    };
  } catch {
    return {
      props: {
        categoryCounts: {},
        totalSkills: 0,
        totalCollections: SKILL_COLLECTIONS.length,
        totalCollectionSkills: 0,
        topTags: [],
      },
      revalidate: 120,
    };
  }
};

/* ── Dark mode detection ────────────────────────────────────────────── */

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    setDark(el.classList.contains("dark"));
    const obs = new MutationObserver(() => setDark(el.classList.contains("dark")));
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function useWindowWidth() {
  const [w, setW] = useState(920);
  useEffect(() => {
    const update = () => setW(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return w;
}

/* ── Interactive SVG Ontology Diagram — Clean flat style ─────────────── */

function OntologyDiagram({
  categoryCounts,
  totalSkills,
  topTags,
}: {
  categoryCounts: Record<string, number>;
  totalSkills: number;
  topTags: { name: string; slug: string; count: number }[];
}) {
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);
  const [hoveredCollection, setHoveredCollection] = useState<string | null>(null);
  const isDark = useIsDark();

  const categories = SKILL_CATEGORIES.filter((c) => c.slug !== "other").slice(0, 6);
  const collections = SKILL_COLLECTIONS.slice(0, 6);

  const catColors: Record<string, string> = {
    development: "#60a5fa", "ai-generation": "#f87171", research: "#a78bfa",
    "data-science": "#34d399", business: "#fbbf24", testing: "#fb923c",
    productivity: "#38bdf8", security: "#f472b6", infrastructure: "#a3e635", other: "#94a3b8",
  };

  /* ── Hooks that must be called unconditionally ── */
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 640;
  const handleCategoryClick = useCallback(
    (slug: string) => router.push(`/aixcelerator/skills?category=${slug}`),
    [router],
  );

  /* ── Mobile card layout ── */
  if (isMobile) {
    const DownArrow = () => (
      <div className="flex justify-center py-0.5">
        <svg width="12" height="16" viewBox="0 0 12 16" fill="none"><line x1="6" y1="0" x2="6" y2="12" stroke="currentColor" className="text-zinc-300 dark:text-zinc-600" strokeWidth="1" /><path d="M3 10l3 4 3-4" stroke="currentColor" className="text-zinc-300 dark:text-zinc-600" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    );
    return (
      <div className="space-y-2 p-3">
        {/* Layer 1: Taxonomy */}
        <div className="rounded-lg border border-zinc-200/60 bg-zinc-50/50 p-3 dark:border-zinc-700/60 dark:bg-zinc-800/30">
          <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">Skill Taxonomy</div>
          <div className="mt-2 flex justify-center">
            <span className="rounded-full bg-zinc-950 px-3 py-1 text-[11px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-950">Skills · {totalSkills.toLocaleString()}</span>
          </div>
          <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
            {categories.map((cat) => (
              <button key={cat.slug} onClick={() => router.push(`/aixcelerator/skills?category=${cat.slug}`)} className="flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-medium text-zinc-600 active:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: catColors[cat.slug] || "#a1a1aa" }} />
                {cat.label}
                <span className="ml-0.5 text-zinc-400 dark:text-zinc-500">{(categoryCounts[cat.slug] || 0).toLocaleString()}</span>
              </button>
            ))}
          </div>
          {topTags.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {topTags.slice(0, 6).map((tag) => (
                <span key={tag.slug} className="rounded-full border border-zinc-200 px-1.5 py-0.5 text-[9px] text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">{tag.name}</span>
              ))}
            </div>
          )}
        </div>
        <DownArrow />
        {/* Layer 2: Relation Graph */}
        <div className="rounded-lg border border-zinc-200/60 bg-zinc-50/50 p-3 dark:border-zinc-700/60 dark:bg-zinc-800/30">
          <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">Skill Relation Graph</div>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {REPRESENTATIVE_SKILLS.slice(0, 4).map((item) => (
              <button key={item.slug} onClick={() => router.push(`/aixcelerator/skills/${item.slug}`)} className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-medium text-zinc-600 active:border-[#DC2626] active:text-[#DC2626] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{item.name}</button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-2.5">
            {RELATIONSHIP_TYPES.slice(0, 3).map((rel) => (
              <span key={rel.type} className="flex items-center gap-1 text-[9px] text-zinc-400 dark:text-zinc-500"><span className="h-px w-2.5 bg-zinc-300 dark:bg-zinc-600" />{rel.label}</span>
            ))}
          </div>
        </div>
        <DownArrow />
        {/* Layer 3: Collections */}
        <div className="rounded-lg border border-zinc-200/60 bg-zinc-50/50 p-3 dark:border-zinc-700/60 dark:bg-zinc-800/30">
          <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">Skill Collection Library</div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {collections.map((col) => (
              <button key={col.slug} onClick={() => router.push(`/aixcelerator/skills/collections/${col.slug}`)} className="rounded-md border border-zinc-200 bg-zinc-50 p-2 text-center active:border-[#DC2626] dark:border-zinc-600 dark:bg-zinc-800">
                <div className="truncate text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">{col.slug}</div>
                <div className="text-[9px] text-zinc-400 dark:text-zinc-500">{col.skillSlugs.length} skills</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* Color tokens */
  const bg = isDark ? "#18181b" : "#ffffff";
  const surface = isDark ? "#3f3f46" : "#f4f4f5";
  const surfaceAlt = isDark ? "#27272a" : "#fafafa";
  const border = isDark ? "#52525b" : "#e4e4e7";
  const textPrimary = isDark ? "#fafafa" : "#18181b";
  const textSecondary = isDark ? "#a1a1aa" : "#71717a";
  const textTertiary = isDark ? "#71717a" : "#a1a1aa";
  const lineStroke = isDark ? "#3f3f46" : "#d4d4d8";
  const hubFill = isDark ? "#fafafa" : "#18181b";
  const hubText = isDark ? "#18181b" : "#ffffff";

  /* Layout */
  const svgWidth = 920;
  const margin = 16;
  const pad = 12;

  /* Category sizing */
  const catCharW = 6.2;
  const catPadX = 24;
  const catH = 30;
  const catGap = 8;
  const catWidths = categories.map((cat) => Math.max(cat.label.length * catCharW + catPadX, 96));
  const catTotalW = catWidths.reduce((s, w) => s + w, 0) + (categories.length - 1) * catGap;
  let catRunX = (svgWidth - catTotalW) / 2;
  const catPositions = catWidths.map((w) => { const x = catRunX; catRunX += w + catGap; return x; });

  /* Tags */
  const visibleTags = topTags.slice(0, 8);
  const tagCharW = 5.5;
  const tagPadX = 14;
  const tagH = 18;
  const tagGap = 5;
  const tagWidths = visibleTags.map((t) => Math.max(t.name.length * tagCharW + tagPadX, 40));
  const tagTotalW = tagWidths.reduce((s, w) => s + w, 0) + (visibleTags.length - 1) * tagGap;
  let tagRunX = (svgWidth - tagTotalW) / 2;
  const tagPositions = tagWidths.map((w) => { const x = tagRunX; tagRunX += w + tagGap; return x; });

  /* Layer Y positions */
  const l1Y = 8; const l1H = 190;
  const hubY = l1Y + 44; const hubW = 90; const hubH = 32;
  const catY = l1Y + 100; const tagY = l1Y + 156;
  const l2Y = l1Y + l1H + 14; const l2H = 130;
  const l2BaseY = l2Y + 40;
  const l3Y = l2Y + l2H + 14; const l3H = 108;
  const colY = l3Y + 38;
  const legendY = l3Y + l3H + 10;
  const svgHeight = legendY + 36;

  /* Collections */
  const colW = 130;
  const colGap = 8;
  const colTotalW = collections.length * colW + (collections.length - 1) * colGap;
  const colStartX = (svgWidth - colTotalW) / 2;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full min-w-[700px]" style={{ maxHeight: `${svgHeight}px`, fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}>
        <rect width={svgWidth} height={svgHeight} rx="12" fill={bg} />

        {/* ─── LAYER 1: TAXONOMY ─── */}
        <rect x={margin} y={l1Y} width={svgWidth - margin * 2} height={l1H} rx="10" fill={surfaceAlt} stroke={border} strokeWidth="1" />
        <text x={margin + pad} y={l1Y + 22} fontSize="10" fontWeight="600" letterSpacing="0.08em" fill={textTertiary}>SKILL TAXONOMY</text>
        <line x1={margin + pad} y1={l1Y + 30} x2={svgWidth - margin - pad} y2={l1Y + 30} stroke={border} strokeWidth="0.5" />

        {/* Hub */}
        <rect x={svgWidth / 2 - hubW / 2} y={hubY} width={hubW} height={hubH} rx={hubH / 2} fill={hubFill} />
        <text x={svgWidth / 2} y={hubY + hubH / 2 - 1} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="700" fill={hubText}>Skills</text>
        <text x={svgWidth / 2} y={hubY + hubH + 12} textAnchor="middle" fontSize="9" fontWeight="500" fill={textTertiary}>{totalSkills.toLocaleString()} total</text>

        {/* Connection curves */}
        {catPositions.map((x, i) => {
          const cat = categories[i];
          const w = catWidths[i];
          const isHovered = hoveredCategory === cat.slug;
          const color = catColors[cat.slug] || textTertiary;
          const endX = x + w / 2;
          const startY = hubY + hubH + 2;
          const cp1Y = startY + (catY - startY) * 0.35;
          const cp2Y = startY + (catY - startY) * 0.65;
          return <path key={`l-${cat.slug}`} d={`M${svgWidth / 2},${startY} C${svgWidth / 2},${cp1Y} ${endX},${cp2Y} ${endX},${catY}`} fill="none" stroke={isHovered ? color : lineStroke} strokeWidth={isHovered ? 1.5 : 0.75} style={{ transition: "stroke 0.15s" }} />;
        })}

        {/* Category nodes */}
        {categories.map((cat, i) => {
          const x = catPositions[i]; const w = catWidths[i];
          const count = categoryCounts[cat.slug] || 0;
          const isHovered = hoveredCategory === cat.slug;
          const color = catColors[cat.slug] || textTertiary;
          return (
            <g key={cat.slug} onClick={() => handleCategoryClick(cat.slug)} onMouseEnter={() => setHoveredCategory(cat.slug)} onMouseLeave={() => setHoveredCategory(null)} style={{ cursor: "pointer" }}>
              <rect x={x} y={catY} width={w} height={catH} rx="6" fill={isHovered ? (isDark ? `${color}15` : `${color}0A`) : surface} stroke={isHovered ? color : border} strokeWidth={isHovered ? 1 : 0.5} style={{ transition: "stroke 0.15s, fill 0.15s" }} />
              <circle cx={x + 11} cy={catY + catH / 2} r="2.5" fill={color} opacity={isHovered ? 1 : 0.65} />
              <text x={x + 20} y={catY + catH / 2 + 0.5} dominantBaseline="middle" fontSize="10" fontWeight="500" fill={isHovered ? textPrimary : textSecondary} style={{ transition: "fill 0.15s" }}>{cat.label}</text>
              <text x={x + w / 2} y={catY + catH + 13} textAnchor="middle" fontSize="9" fontWeight="500" fill={textTertiary}>{count.toLocaleString()}</text>
            </g>
          );
        })}

        {/* Tags */}
        {visibleTags.map((tag, i) => {
          const x = tagPositions[i]; const w = tagWidths[i];
          return (
            <g key={tag.slug}>
              <rect x={x} y={tagY} width={w} height={tagH} rx={tagH / 2} fill={surface} stroke={border} strokeWidth="0.5" />
              <text x={x + w / 2} y={tagY + tagH / 2 + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fontWeight="500" fill={textTertiary}>{tag.name}</text>
            </g>
          );
        })}

        {/* Arrow */}
        <line x1={svgWidth / 2} y1={l1Y + l1H + 2} x2={svgWidth / 2} y2={l2Y - 2} stroke={lineStroke} strokeWidth="1" />
        <path d={`M${svgWidth / 2 - 4},${l2Y - 6} L${svgWidth / 2},${l2Y - 1} L${svgWidth / 2 + 4},${l2Y - 6}`} fill="none" stroke={lineStroke} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />

        {/* ─── LAYER 2: RELATION GRAPH ─── */}
        <rect x={margin} y={l2Y} width={svgWidth - margin * 2} height={l2H} rx="10" fill={surfaceAlt} stroke={border} strokeWidth="1" />
        <text x={margin + pad} y={l2Y + 22} fontSize="10" fontWeight="600" letterSpacing="0.08em" fill={textTertiary}>SKILL RELATION GRAPH</text>
        <line x1={margin + pad} y1={l2Y + 30} x2={svgWidth - margin - pad} y2={l2Y + 30} stroke={border} strokeWidth="0.5" />

        {/* Relation legend inline */}
        {RELATIONSHIP_TYPES.map((rel, i) => (
          <g key={rel.type}>
            <line x1={500 + i * 108} y1={l2Y + 22} x2={518 + i * 108} y2={l2Y + 22} stroke={textTertiary} strokeWidth="1.5" strokeLinecap="round" />
            <text x={523 + i * 108} y={l2Y + 25} fontSize="8.5" fontWeight="500" fill={textTertiary}>{rel.label}</text>
          </g>
        ))}

        {/* Edges */}
        {REPRESENTATIVE_EDGES.map((edge, i) => {
          const from = REPRESENTATIVE_SKILLS[edge.from];
          const to = REPRESENTATIVE_SKILLS[edge.to];
          const fW = from.name.length * 6.5 + 18;
          const tW = to.name.length * 6.5 + 18;
          return <line key={i} x1={from.x + fW / 2} y1={from.y + l2BaseY + 12} x2={to.x + tW / 2} y2={to.y + l2BaseY + 12} stroke={lineStroke} strokeWidth="0.75" />;
        })}

        {/* Skill nodes */}
        {REPRESENTATIVE_SKILLS.map((skill, i) => {
          const isHovered = hoveredSkill === i;
          const nW = skill.name.length * 6.5 + 18;
          const nH = 24;
          const ny = skill.y + l2BaseY;
          return (
            <g key={skill.slug} onMouseEnter={() => setHoveredSkill(i)} onMouseLeave={() => setHoveredSkill(null)} onClick={() => router.push(`/aixcelerator/skills/${skill.slug}`)} style={{ cursor: "pointer" }}>
              <rect x={skill.x} y={ny} width={nW} height={nH} rx="6" fill={isHovered ? (isDark ? "#DC262615" : "#DC26260A") : surface} stroke={isHovered ? "#DC2626" : border} strokeWidth={isHovered ? 1 : 0.5} style={{ transition: "stroke 0.15s, fill 0.15s" }} />
              <text x={skill.x + nW / 2} y={ny + nH / 2 + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fontWeight="500" fill={isHovered ? textPrimary : textSecondary} style={{ transition: "fill 0.15s" }}>{skill.name}</text>
            </g>
          );
        })}

        {/* Arrow */}
        <line x1={svgWidth / 2} y1={l2Y + l2H + 2} x2={svgWidth / 2} y2={l3Y - 2} stroke={lineStroke} strokeWidth="1" />
        <path d={`M${svgWidth / 2 - 4},${l3Y - 6} L${svgWidth / 2},${l3Y - 1} L${svgWidth / 2 + 4},${l3Y - 6}`} fill="none" stroke={lineStroke} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />

        {/* ─── LAYER 3: COLLECTION LIBRARY ─── */}
        <rect x={margin} y={l3Y} width={svgWidth - margin * 2} height={l3H} rx="10" fill={surfaceAlt} stroke={border} strokeWidth="1" />
        <text x={margin + pad} y={l3Y + 22} fontSize="10" fontWeight="600" letterSpacing="0.08em" fill={textTertiary}>SKILL COLLECTION LIBRARY</text>
        <line x1={margin + pad} y1={l3Y + 30} x2={svgWidth - margin - pad} y2={l3Y + 30} stroke={border} strokeWidth="0.5" />

        {collections.map((col, i) => {
          const x = colStartX + i * (colW + colGap);
          const isHovered = hoveredCollection === col.slug;
          return (
            <g key={col.slug} onClick={() => router.push(`/aixcelerator/skills/collections/${col.slug}`)} onMouseEnter={() => setHoveredCollection(col.slug)} onMouseLeave={() => setHoveredCollection(null)} style={{ cursor: "pointer" }}>
              <rect x={x} y={colY} width={colW} height="52" rx="6" fill={isHovered ? (isDark ? "#DC262610" : "#DC262606") : surface} stroke={isHovered ? "#DC2626" : border} strokeWidth={isHovered ? 1 : 0.5} style={{ transition: "stroke 0.15s, fill 0.15s" }} />
              <text x={x + colW / 2} y={colY + 20} textAnchor="middle" fontSize="10" fontWeight="600" fill={isHovered ? textPrimary : textSecondary} style={{ transition: "fill 0.15s" }}>{col.slug}</text>
              <text x={x + colW / 2} y={colY + 38} textAnchor="middle" fontSize="8.5" fontWeight="500" fill={textTertiary}>{col.skillSlugs.length} skills</text>
            </g>
          );
        })}

        {/* Legend */}
        <text x={margin + pad} y={legendY + 12} fontSize="9" fontWeight="600" letterSpacing="0.06em" fill={textTertiary}>LEGEND</text>
        <line x1={margin + pad} y1={legendY + 18} x2={margin + pad + 50} y2={legendY + 18} stroke={border} strokeWidth="0.5" />
        {[{ label: "Category" }, { label: "Skill" }, { label: "Collection" }].map((item, i) => (
          <g key={item.label}>
            <rect x={margin + pad + 1} y={legendY + 26 + i * 16 - 5} width="10" height="10" rx="2" fill={surface} stroke={border} strokeWidth="0.5" />
            <text x={margin + pad + 18} y={legendY + 26 + i * 16 + 1} dominantBaseline="middle" fontSize="9" fontWeight="500" fill={textSecondary}>{item.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ── Page component ─────────────────────────────────────────────────── */

export default function OntologyPage({
  categoryCounts,
  totalSkills,
  totalCollections,
  totalCollectionSkills,
  topTags,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const seoMeta: SeoMeta = {
    title: "Skill Ontology | Colaberry AI",
    description: "How skills are organized into a structured, composable network — taxonomy, relation graph, and package library.",
    canonical: buildCanonical("/aixcelerator/skills/ontology"),
  };

  const catCount = SKILL_CATEGORIES.filter((c) => c.slug !== "other").length;

  return (
    <Layout>
      <Head>
        <title>{seoMeta.title}</title>
        {seoTags(seoMeta).map(({ key, ...props }) =>
          "rel" in props ? <link key={key} {...props} /> : <meta key={key} {...props} />
        )}
      </Head>

      <div className="reveal grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div className="min-w-0">
          <SectionHeader
            as="h1"
            size="xl"
            kicker="Ontology"
            title="Skill Ontology"
            description="Skill Ontology organizes individual skills into a structured, composable network, enabling agents to reason, plan, and execute complex tasks as an extensible, maintainable capability system."
          />
          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-zinc-950/30">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#DC2626]/10 dark:bg-[#DC2626]/15">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#DC2626] dark:text-[#F87171]" aria-hidden="true"><path d="M12 16v-4m0-4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#DC2626] dark:text-[#F87171]">How it works</span>
                <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  When querying for a task, the system traverses this graph to identify the necessary collections and skills to construct a capable agent.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive 3-Layer Architecture Diagram */}
        <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <OntologyDiagram
            categoryCounts={categoryCounts}
            totalSkills={totalSkills}
            topTags={topTags}
          />
        </div>
      </div>

      {/* Architecture Explanation Cards */}
      <section className="reveal mt-12">
        <SectionHeader size="md" kicker="Architecture" title="Three-Layer Design" description="How skills are organized from abstract taxonomy to deployable packages." />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="catalog-card overflow-hidden p-0" style={{ borderLeft: "3px solid #DC2626" }}>
            <div className="p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-950">1</span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Skill Taxonomy</h3>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">The Abstraction Layer</div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                The top layer defines the broad categorization and detailed tags of skills. It organizes capabilities into categories such as:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                {SKILL_CATEGORIES.filter((c) => c.slug !== "other").slice(0, 3).map((cat) => (
                  <li key={cat.slug} className="flex items-center gap-2">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    {cat.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-zinc-200/60 bg-zinc-50/80 px-6 py-2.5 dark:border-zinc-700/50 dark:bg-zinc-800/30">
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Classification & Vocabulary — <span className="font-semibold text-zinc-700 dark:text-zinc-300">{catCount} categories</span>, <span className="font-semibold text-zinc-700 dark:text-zinc-300">{topTags.length}+ tags</span>
              </div>
            </div>
          </div>

          <div className="catalog-card overflow-hidden p-0" style={{ borderLeft: "3px solid #DC2626" }}>
            <div className="p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-950">2</span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Skill Relation Graph</h3>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">The Semantic Layer</div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                The middle layer instantiates specific skills and defines how they interact. It maps relationships using edges like:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                {RELATIONSHIP_TYPES.map((rel) => (
                  <li key={rel.type} className="flex items-center gap-2">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    {rel.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-zinc-200/60 bg-zinc-50/80 px-6 py-2.5 dark:border-zinc-700/50 dark:bg-zinc-800/30">
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Reasoning & Composition — <span className="font-semibold text-zinc-700 dark:text-zinc-300">{totalSkills.toLocaleString()} skills</span>, <span className="font-semibold text-zinc-700 dark:text-zinc-300">4 relationship types</span>
              </div>
            </div>
          </div>

          <div className="catalog-card overflow-hidden p-0" style={{ borderLeft: "3px solid #DC2626" }}>
            <div className="p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-950">3</span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Skill Collection</h3>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">The Execution Layer</div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Groups related skills into deployable units. These are the actual functional toolkits agents load at runtime:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                {SKILL_COLLECTIONS.slice(0, 4).map((col) => (
                  <li key={col.slug} className="flex items-center gap-2">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    <Link href={`/aixcelerator/skills/collections/${col.slug}`} className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-200">
                      {col.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-zinc-200/60 bg-zinc-50/80 px-6 py-2.5 dark:border-zinc-700/50 dark:bg-zinc-800/30">
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Deployment & Execution — <span className="font-semibold text-zinc-700 dark:text-zinc-300">{totalCollections} collections</span>, <span className="font-semibold text-zinc-700 dark:text-zinc-300">{totalCollectionSkills} skills</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Relationship Types Section */}
      <section className="reveal mt-12">
        <SectionHeader size="md" kicker="Edges" title="Relationship Types" description="How skills connect and depend on each other within the ontology." />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RELATIONSHIP_TYPES.map((rel) => (
            <div key={rel.type} className="catalog-card overflow-hidden p-0">
              <div className="h-0.5 bg-[#DC2626]/30 dark:bg-[#F87171]/20" />
              <div className="p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-zinc-500 dark:text-zinc-400" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{rel.label}</span>
                </div>
                <code className="mt-2 inline-block rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{rel.type}</code>
                <p className="mt-2.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{rel.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="reveal mt-12 grid gap-4 sm:grid-cols-3">
        <Link href="/aixcelerator/skills/graph" className="group catalog-card p-5 text-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="mx-auto text-zinc-500 dark:text-zinc-400" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div className="mt-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">Skill Graph</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Interactive force-graph with {totalSkills.toLocaleString()}+ skills</div>
          <div className="mt-2 text-xs font-semibold text-[#DC2626] group-hover:underline dark:text-[#F87171]">Explore →</div>
        </Link>
        <Link href="/aixcelerator/skills/collections" className="group catalog-card p-5 text-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="mx-auto text-zinc-500 dark:text-zinc-400" aria-hidden="true"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div className="mt-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">Collections</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{totalCollections} curated skill bundles</div>
          <div className="mt-2 text-xs font-semibold text-[#DC2626] group-hover:underline dark:text-[#F87171]">Browse →</div>
        </Link>
        <Link href="/aixcelerator/skills" className="group catalog-card p-5 text-center">
          <ContentTypeIcon type="skill" size={22} className="mx-auto text-zinc-500 dark:text-zinc-400" />
          <div className="mt-2 text-sm font-bold text-zinc-900 dark:text-zinc-50">Skills Catalog</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Browse all skills with taxonomy filters</div>
          <div className="mt-2 text-xs font-semibold text-[#DC2626] group-hover:underline dark:text-[#F87171]">Browse →</div>
        </Link>
      </section>

      <EnterpriseCtaBand
        kicker="Skills ontology"
        title="Explore the skill network"
        description="Discover how AI skills connect, compose, and depend on each other across the platform."
        primaryHref="/aixcelerator/skills/graph"
        primaryLabel="View skill graph"
        secondaryHref="/aixcelerator/skills"
        secondaryLabel="Browse all skills"
        className="mt-16"
      />
    </Layout>
  );
}
