/**
 * OntologyPageTemplate — Generic 3-layer ontology page for any content type.
 * Renders interactive SVG diagram, architecture cards, relationship types, quick links.
 * Used by: skills/ontology, mcp/ontology, agents/ontology, tools/ontology, podcasts/ontology
 */

import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import SectionHeader from "./SectionHeader";
import EnterpriseCtaBand from "./EnterpriseCtaBand";
import type { ContentOntologyConfig, ContentCollection } from "../lib/ontologyTypes";
import ContentTypeIcon from "./ContentTypeIcon";

/* ── Props ────────────────────────────────────────────────────────────── */

export type OntologyPageTemplateProps = {
  config: ContentOntologyConfig;
  categoryCounts: Record<string, number>;
  totalItems: number;
  collections: ContentCollection[];
  topTags: { name: string; slug: string; count: number }[];
  /** Representative items shown in the relation graph layer */
  representativeItems?: { slug: string; name: string; x: number; y: number }[];
  /** Representative edges between items */
  representativeEdges?: { from: number; to: number; type: string }[];
};

/* ── Dark mode detection for SVG inline colors ──────────────────────── */

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setDark(el.classList.contains("dark")));
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

/** SVG color tokens — solid zinc values, no rgba */
function svgColors(dark: boolean) {
  return {
    bg: dark ? "#18181b" : "#ffffff",
    surface: dark ? "#3f3f46" : "#f4f4f5",
    surfaceAlt: dark ? "#27272a" : "#fafafa",
    border: dark ? "#52525b" : "#e4e4e7",
    borderMuted: dark ? "#3f3f46" : "#f4f4f5",
    textPrimary: dark ? "#fafafa" : "#18181b",
    textSecondary: dark ? "#a1a1aa" : "#71717a",
    textTertiary: dark ? "#71717a" : "#a1a1aa",
    lineStroke: dark ? "#3f3f46" : "#d4d4d8",
    hubFill: dark ? "#fafafa" : "#18181b",
    hubText: dark ? "#18181b" : "#ffffff",
  };
}

/* ── SVG Ontology Diagram — Clean flat enterprise style ──────────────── */

function OntologyDiagram({
  config,
  categoryCounts,
  totalItems,
  topTags,
  collections,
  representativeItems,
  representativeEdges,
}: {
  config: ContentOntologyConfig;
  categoryCounts: Record<string, number>;
  totalItems: number;
  topTags: { name: string; slug: string; count: number }[];
  collections: ContentCollection[];
  representativeItems: { slug: string; name: string; x: number; y: number }[];
  representativeEdges: { from: number; to: number; type: string }[];
}) {
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [hoveredCollection, setHoveredCollection] = useState<string | null>(null);

  const isDark = useIsDark();
  const cl = svgColors(isDark);
  const categories = config.categories.filter((c) => c.slug !== "other").slice(0, 6);
  const topCollections = collections.slice(0, 6);
  const relTypes = config.relationTypes;

  /* ── Layout constants ── */
  const svgWidth = 940;
  const svgHeight = 650;
  const margin = 20;
  const layerPad = 12;

  /* Category node dynamic sizing */
  const catCharW = 6.2;
  const catPadX = 24;
  const catH = 32;
  const catGap = 10;
  const catWidths = categories.map((cat) => Math.max(cat.label.length * catCharW + catPadX, 100));
  const catTotalW = catWidths.reduce((s, w) => s + w, 0) + (categories.length - 1) * catGap;
  let catRunX = (svgWidth - catTotalW) / 2;
  const catPositions = catWidths.map((w) => {
    const x = catRunX;
    catRunX += w + catGap;
    return x;
  });

  /* Tag row */
  const tagCharW = 6;
  const tagPadX = 16;
  const tagH = 20;
  const tagGap = 6;
  const visibleTags = topTags.slice(0, 7);
  const tagWidths = visibleTags.map((t) => Math.max(t.name.length * tagCharW + tagPadX, 48));
  const tagTotalW = tagWidths.reduce((s, w) => s + w, 0) + (visibleTags.length - 1) * tagGap;
  let tagRunX = (svgWidth - tagTotalW) / 2;
  const tagPositions = tagWidths.map((w) => {
    const x = tagRunX;
    tagRunX += w + tagGap;
    return x;
  });

  /* Collection layout */
  const colW = 140;
  const colGap = 8;
  const colTotalW = topCollections.length * colW + (topCollections.length - 1) * colGap;
  const colStartX = (svgWidth - colTotalW) / 2;

  /* Layer Y positions */
  const l1Y = 10;
  const l1H = 210;
  const hubY = l1Y + 52;
  const hubW = 110;
  const hubH = 36;
  const catY = l1Y + 115;
  const tagY = l1Y + 174;

  const l2Y = l1Y + l1H + 16;
  const l2H = 150;
  const l2ItemBaseY = l2Y + 44;

  const l3Y = l2Y + l2H + 16;
  const l3H = 120;
  const colY = l3Y + 40;

  const legendY = l3Y + l3H + 14;

  const handleCategoryClick = useCallback(
    (slug: string) => router.push(`${config.catalogPath}?category=${slug}`),
    [router, config.catalogPath],
  );

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full min-w-[700px]"
        style={{ maxHeight: `${svgHeight}px`, fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
      >
        {/* Background */}
        <rect width={svgWidth} height={svgHeight} rx="12" fill={cl.bg} />

        {/* ─── LAYER 1: TAXONOMY ─── */}
        <rect x={margin} y={l1Y} width={svgWidth - margin * 2} height={l1H} rx="10" fill={cl.surfaceAlt} stroke={cl.border} strokeWidth="1" />

        {/* Layer header */}
        <text x={margin + layerPad} y={l1Y + 24} fontSize="10" fontWeight="600" letterSpacing="0.08em" fill={cl.textTertiary}>
          {config.label.toUpperCase()} TAXONOMY
        </text>
        <line x1={margin + layerPad} y1={l1Y + 32} x2={svgWidth - margin - layerPad} y2={l1Y + 32} stroke={cl.border} strokeWidth="0.5" />

        {/* Central hub pill */}
        <rect x={svgWidth / 2 - hubW / 2} y={hubY} width={hubW} height={hubH} rx={hubH / 2} fill={cl.hubFill} />
        <text x={svgWidth / 2} y={hubY + hubH / 2 - 1} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="700" letterSpacing="-0.02em" fill={cl.hubText}>{config.label}</text>
        <text x={svgWidth / 2} y={hubY + hubH + 14} textAnchor="middle" fontSize="10" fontWeight="500" fill={cl.textTertiary}>{totalItems.toLocaleString()} total</text>

        {/* Connection lines — hub to categories */}
        {catPositions.map((x, i) => {
          const cat = categories[i];
          const w = catWidths[i];
          const isHovered = hoveredCategory === cat.slug;
          const catColor = config.categoryColors[cat.slug] || cl.textTertiary;
          const endX = x + w / 2;
          const startY = hubY + hubH + 2;
          const endY = catY;
          const cp1Y = startY + (endY - startY) * 0.35;
          const cp2Y = startY + (endY - startY) * 0.65;
          return (
            <path
              key={`line-${cat.slug}`}
              d={`M${svgWidth / 2},${startY} C${svgWidth / 2},${cp1Y} ${endX},${cp2Y} ${endX},${endY}`}
              fill="none"
              stroke={isHovered ? catColor : cl.lineStroke}
              strokeWidth={isHovered ? 1.5 : 0.75}
              style={{ transition: "stroke 0.15s, stroke-width 0.15s" }}
            />
          );
        })}

        {/* Category nodes */}
        {categories.map((cat, i) => {
          const x = catPositions[i];
          const w = catWidths[i];
          const count = categoryCounts[cat.slug] || 0;
          const isHovered = hoveredCategory === cat.slug;
          const catColor = config.categoryColors[cat.slug] || cl.textTertiary;

          return (
            <g
              key={cat.slug}
              onClick={() => handleCategoryClick(cat.slug)}
              onMouseEnter={() => setHoveredCategory(cat.slug)}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x} y={catY} width={w} height={catH} rx="6"
                fill={isHovered ? (isDark ? `${catColor}15` : `${catColor}0A`) : cl.surface}
                stroke={isHovered ? catColor : cl.border}
                strokeWidth={isHovered ? 1 : 0.5}
                style={{ transition: "stroke 0.15s, fill 0.15s" }}
              />
              <circle cx={x + 12} cy={catY + catH / 2} r="3" fill={catColor} opacity={isHovered ? 1 : 0.65} style={{ transition: "opacity 0.15s" }} />
              <text x={x + 22} y={catY + catH / 2 + 0.5} dominantBaseline="middle" fontSize="10.5" fontWeight="500" fill={isHovered ? cl.textPrimary : cl.textSecondary} style={{ transition: "fill 0.15s" }}>{cat.label}</text>
              <text x={x + w / 2} y={catY + catH + 14} textAnchor="middle" fontSize="9" fontWeight="500" fill={cl.textTertiary}>{count.toLocaleString()}</text>
            </g>
          );
        })}

        {/* Tags row */}
        {visibleTags.map((tag, i) => {
          const x = tagPositions[i];
          const w = tagWidths[i];
          return (
            <g key={tag.slug}>
              <rect x={x} y={tagY} width={w} height={tagH} rx={tagH / 2} fill={cl.surface} stroke={cl.border} strokeWidth="0.5" />
              <text x={x + w / 2} y={tagY + tagH / 2 + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="500" fill={cl.textTertiary}>{tag.name}</text>
            </g>
          );
        })}

        {/* ─── Layer transition arrow ─── */}
        <line x1={svgWidth / 2} y1={l1Y + l1H + 2} x2={svgWidth / 2} y2={l2Y - 2} stroke={cl.lineStroke} strokeWidth="1" />
        <path d={`M${svgWidth / 2 - 4},${l2Y - 6} L${svgWidth / 2},${l2Y - 1} L${svgWidth / 2 + 4},${l2Y - 6}`} fill="none" stroke={cl.lineStroke} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />

        {/* ─── LAYER 2: RELATION GRAPH ─── */}
        <rect x={margin} y={l2Y} width={svgWidth - margin * 2} height={l2H} rx="10" fill={cl.surfaceAlt} stroke={cl.border} strokeWidth="1" />

        {/* Layer header */}
        <text x={margin + layerPad} y={l2Y + 24} fontSize="10" fontWeight="600" letterSpacing="0.08em" fill={cl.textTertiary}>
          {config.labelSingular.toUpperCase()} RELATION GRAPH
        </text>
        <line x1={margin + layerPad} y1={l2Y + 32} x2={svgWidth - margin - layerPad} y2={l2Y + 32} stroke={cl.border} strokeWidth="0.5" />

        {/* Relation legend — inline right of header */}
        {relTypes.slice(0, 4).map((rel, i) => (
          <g key={rel.type}>
            <line x1={480 + i * 115} y1={l2Y + 24} x2={500 + i * 115} y2={l2Y + 24} stroke={cl.textTertiary} strokeWidth="1.5" strokeLinecap="round" />
            <text x={505 + i * 115} y={l2Y + 27} fontSize="9" fontWeight="500" fill={cl.textTertiary}>{rel.label}</text>
          </g>
        ))}

        {/* Representative edges — solid lines */}
        {representativeEdges.map((edge, i) => {
          const from = representativeItems[edge.from];
          const to = representativeItems[edge.to];
          if (!from || !to) return null;
          const fromW = from.name.length * 7 + 20;
          const toW = to.name.length * 7 + 20;
          return (
            <line
              key={i}
              x1={from.x + fromW / 2} y1={from.y + l2ItemBaseY + 13}
              x2={to.x + toW / 2} y2={to.y + l2ItemBaseY + 13}
              stroke={cl.lineStroke}
              strokeWidth="0.75"
              strokeLinecap="round"
            />
          );
        })}

        {/* Representative item nodes */}
        {representativeItems.map((item, i) => {
          const isHovered = hoveredItem === i;
          const nodeWidth = item.name.length * 7 + 20;
          const nodeH = 26;
          const ny = item.y + l2ItemBaseY;
          return (
            <g
              key={item.slug}
              onMouseEnter={() => setHoveredItem(i)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => router.push(`${config.basePath}/${item.slug}`)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={item.x} y={ny}
                width={nodeWidth} height={nodeH} rx="6"
                fill={isHovered ? (isDark ? "#DC262615" : "#DC26260A") : cl.surface}
                stroke={isHovered ? "#DC2626" : cl.border}
                strokeWidth={isHovered ? 1 : 0.5}
                style={{ transition: "stroke 0.15s, fill 0.15s" }}
              />
              <text
                x={item.x + nodeWidth / 2} y={ny + nodeH / 2 + 0.5}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="10" fontWeight="500"
                fill={isHovered ? cl.textPrimary : cl.textSecondary}
                style={{ transition: "fill 0.15s" }}
              >{item.name}</text>
            </g>
          );
        })}

        {/* ─── Layer transition arrow ─── */}
        <line x1={svgWidth / 2} y1={l2Y + l2H + 2} x2={svgWidth / 2} y2={l3Y - 2} stroke={cl.lineStroke} strokeWidth="1" />
        <path d={`M${svgWidth / 2 - 4},${l3Y - 6} L${svgWidth / 2},${l3Y - 1} L${svgWidth / 2 + 4},${l3Y - 6}`} fill="none" stroke={cl.lineStroke} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />

        {/* ─── LAYER 3: COLLECTION LIBRARY ─── */}
        <rect x={margin} y={l3Y} width={svgWidth - margin * 2} height={l3H} rx="10" fill={cl.surfaceAlt} stroke={cl.border} strokeWidth="1" />

        {/* Layer header */}
        <text x={margin + layerPad} y={l3Y + 24} fontSize="10" fontWeight="600" letterSpacing="0.08em" fill={cl.textTertiary}>
          {config.labelSingular.toUpperCase()} COLLECTION LIBRARY
        </text>
        <line x1={margin + layerPad} y1={l3Y + 32} x2={svgWidth - margin - layerPad} y2={l3Y + 32} stroke={cl.border} strokeWidth="0.5" />

        {/* Collection cards */}
        {topCollections.map((col, i) => {
          const x = colStartX + i * (colW + colGap);
          const isHovered = hoveredCollection === col.slug;

          return (
            <g
              key={col.slug}
              onClick={() => router.push(`${config.basePath}/collections/${col.slug}`)}
              onMouseEnter={() => setHoveredCollection(col.slug)}
              onMouseLeave={() => setHoveredCollection(null)}
              style={{ cursor: "pointer" }}
            >
              <rect x={x} y={colY} width={colW} height="60" rx="6"
                fill={isHovered ? (isDark ? "#DC262610" : "#DC262606") : cl.surface}
                stroke={isHovered ? "#DC2626" : cl.border}
                strokeWidth={isHovered ? 1 : 0.5}
                style={{ transition: "stroke 0.15s, fill 0.15s" }}
              />
              <text x={x + colW / 2} y={colY + 24} textAnchor="middle" fontSize="10.5" fontWeight="600" fill={isHovered ? cl.textPrimary : cl.textSecondary} style={{ transition: "fill 0.15s" }}>{col.slug}</text>
              <text x={x + colW / 2} y={colY + 42} textAnchor="middle" fontSize="9" fontWeight="500" fill={cl.textTertiary}>{col.itemSlugs.length} items</text>
            </g>
          );
        })}

        {/* ─── Legend ─── */}
        <text x={margin + layerPad} y={legendY + 12} fontSize="9" fontWeight="600" letterSpacing="0.06em" fill={cl.textTertiary}>LEGEND</text>
        <line x1={margin + layerPad} y1={legendY + 18} x2={margin + layerPad + 50} y2={legendY + 18} stroke={cl.border} strokeWidth="0.5" />
        {[
          { label: "Category", cx: margin + layerPad + 6, cy: legendY + 32 },
          { label: config.labelSingular, cx: margin + layerPad + 6, cy: legendY + 48 },
          { label: "Collection", cx: margin + layerPad + 6, cy: legendY + 64 },
        ].map((item, i) => (
          <g key={item.label}>
            <rect x={item.cx - 5} y={item.cy - 5} width="10" height="10" rx="2" fill={cl.surface} stroke={cl.border} strokeWidth="0.5" />
            <text x={item.cx + 12} y={item.cy + 1} dominantBaseline="middle" fontSize="9.5" fontWeight="500" fill={cl.textSecondary}>{item.label}</text>
          </g>
        ))}
        {relTypes.slice(0, 4).map((rel, i) => (
          <g key={`legend-${rel.type}`}>
            <line x1={200 + i * 120} y1={legendY + 32} x2={220 + i * 120} y2={legendY + 32} stroke={cl.textTertiary} strokeWidth="1.5" strokeLinecap="round" />
            <text x={226 + i * 120} y={legendY + 35} fontSize="9.5" fontWeight="500" fill={cl.textSecondary}>{rel.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ── Default representative items generator ─────────────────────────── */

const DEFAULT_POSITIONS = [
  { x: 60, y: 20 }, { x: 200, y: 55 }, { x: 350, y: 15 },
  { x: 500, y: 50 }, { x: 650, y: 20 }, { x: 780, y: 55 },
];

const DEFAULT_EDGES = [
  { from: 0, to: 1, type: "" },
  { from: 2, to: 3, type: "" },
  { from: 3, to: 2, type: "" },
  { from: 4, to: 5, type: "" },
  { from: 0, to: 2, type: "" },
];

/* ── Main Template Component ──────────────────────────────────────────── */

export default function OntologyPageTemplate({
  config,
  categoryCounts,
  totalItems,
  collections,
  topTags,
  representativeItems: repItemsProp,
  representativeEdges: repEdgesProp,
}: OntologyPageTemplateProps) {
  const catCount = config.categories.filter((c) => c.slug !== "other").length;
  const totalCollectionItems = new Set(collections.flatMap((c) => c.itemSlugs)).size;
  const relTypes = config.relationTypes;

  // Use provided representative items or generate defaults
  const representativeItems = repItemsProp || DEFAULT_POSITIONS.slice(0, 6).map((pos, i) => ({
    slug: `item-${i}`,
    name: `item-${i}`,
    ...pos,
  }));

  const representativeEdges = repEdgesProp || DEFAULT_EDGES.map((e, i) => ({
    ...e,
    type: relTypes[i % relTypes.length]?.type || "similar_to",
  }));

  return (
    <>
      <div className="reveal grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div className="min-w-0">
          <SectionHeader
            as="h1"
            size="xl"
            kicker="Ontology"
            title={`${config.labelSingular} Ontology`}
            description={`${config.labelSingular} Ontology organizes individual ${config.label.toLowerCase()} into a structured, composable network, enabling agents to reason, plan, and execute complex tasks as an extensible, maintainable capability system.`}
          />
          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-zinc-950/30">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#DC2626]/10 dark:bg-[#DC2626]/15">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#DC2626] dark:text-[#F87171]" aria-hidden="true"><path d="M12 16v-4m0-4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#DC2626] dark:text-[#F87171]">How it works</span>
                <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  When querying for a task, the system traverses this graph to identify the necessary collections and {config.label.toLowerCase()} to construct a capable agent.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive 3-Layer Architecture Diagram */}
        <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <OntologyDiagram
            config={config}
            categoryCounts={categoryCounts}
            totalItems={totalItems}
            topTags={topTags}
            collections={collections}
            representativeItems={representativeItems}
            representativeEdges={representativeEdges}
          />
        </div>
      </div>

      {/* Architecture Explanation Cards */}
      <section className="reveal mt-12">
        <SectionHeader size="md" kicker="Architecture" title="Three-Layer Design" description={`How ${config.label.toLowerCase()} are organized from abstract taxonomy to deployable collections.`} />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="catalog-card overflow-hidden p-0" style={{ borderLeft: "3px solid #DC2626" }}>
            <div className="p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">1</span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{config.labelSingular} Taxonomy</h3>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">The Abstraction Layer</div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                The top layer defines the broad categorization and detailed tags of {config.label.toLowerCase()}. It organizes capabilities into categories such as:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                {config.categories.filter((c) => c.slug !== "other").slice(0, 3).map((cat) => (
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
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">2</span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{config.labelSingular} Relation Graph</h3>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">The Semantic Layer</div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                The middle layer instantiates specific {config.label.toLowerCase()} and defines how they interact. It maps relationships using edges like:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                {relTypes.map((rel) => (
                  <li key={rel.type} className="flex items-center gap-2">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    {rel.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-zinc-200/60 bg-zinc-50/80 px-6 py-2.5 dark:border-zinc-700/50 dark:bg-zinc-800/30">
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Reasoning & Composition — <span className="font-semibold text-zinc-700 dark:text-zinc-300">{totalItems.toLocaleString()} {config.label.toLowerCase()}</span>, <span className="font-semibold text-zinc-700 dark:text-zinc-300">{relTypes.length} relationship types</span>
              </div>
            </div>
          </div>

          <div className="catalog-card overflow-hidden p-0" style={{ borderLeft: "3px solid #DC2626" }}>
            <div className="p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">3</span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{config.labelSingular} Collection</h3>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">The Execution Layer</div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                Groups related {config.label.toLowerCase()} into deployable units. These are the actual functional toolkits agents load at runtime:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                {collections.slice(0, 4).map((col) => (
                  <li key={col.slug} className="flex items-center gap-2">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    <Link href={`${config.basePath}/collections/${col.slug}`} className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-200">
                      {col.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-zinc-200/60 bg-zinc-50/80 px-6 py-2.5 dark:border-zinc-700/50 dark:bg-zinc-800/30">
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Deployment & Execution — <span className="font-semibold text-zinc-700 dark:text-zinc-300">{collections.length} collections</span>, <span className="font-semibold text-zinc-700 dark:text-zinc-300">{totalCollectionItems} {config.label.toLowerCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Relationship Types Section */}
      <section className="reveal mt-12">
        <SectionHeader size="md" kicker="Edges" title="Relationship Types" description={`How ${config.label.toLowerCase()} connect and depend on each other within the ontology.`} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {relTypes.map((rel) => (
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
        <Link href={`${config.basePath}/graph`} className="group catalog-card p-5 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 transition-colors group-hover:bg-zinc-200 dark:bg-zinc-800 dark:group-hover:bg-zinc-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-zinc-600 dark:text-zinc-300" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <div className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-50">{config.labelSingular} Graph</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Interactive force-graph with {totalItems.toLocaleString()}+ {config.label.toLowerCase()}</div>
          <div className="mt-2.5 text-xs font-semibold text-[#DC2626] group-hover:underline dark:text-[#F87171]">Explore →</div>
        </Link>
        <Link href={`${config.basePath}/collections`} className="group catalog-card p-5 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 transition-colors group-hover:bg-zinc-200 dark:bg-zinc-800 dark:group-hover:bg-zinc-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-zinc-600 dark:text-zinc-300" aria-hidden="true"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <div className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-50">Collections</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{collections.length} curated {config.labelSingular.toLowerCase()} bundles</div>
          <div className="mt-2.5 text-xs font-semibold text-[#DC2626] group-hover:underline dark:text-[#F87171]">Browse →</div>
        </Link>
        <Link href={config.catalogPath} className="group catalog-card p-5 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 transition-colors group-hover:bg-zinc-200 dark:bg-zinc-800 dark:group-hover:bg-zinc-700">
            <ContentTypeIcon type={config.contentType} size={20} className="text-zinc-600 dark:text-zinc-300" />
          </span>
          <div className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-50">{config.label} Catalog</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Browse all {config.label.toLowerCase()} with taxonomy filters</div>
          <div className="mt-2.5 text-xs font-semibold text-[#DC2626] group-hover:underline dark:text-[#F87171]">Browse →</div>
        </Link>
      </section>

      <EnterpriseCtaBand
        kicker={`${config.label} ontology`}
        title={`Explore the ${config.labelSingular.toLowerCase()} network`}
        description={`Discover how ${config.label.toLowerCase()} connect, compose, and depend on each other across the platform.`}
        primaryHref={`${config.basePath}/graph`}
        primaryLabel={`View ${config.labelSingular.toLowerCase()} graph`}
        secondaryHref={config.catalogPath}
        secondaryLabel={`Browse all ${config.label.toLowerCase()}`}
        className="mt-16"
      />
    </>
  );
}
