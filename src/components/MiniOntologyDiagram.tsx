/**
 * MiniOntologyDiagram — Compact taxonomy-only ontology SVG for listing page hero sections.
 * Shows Layer 1 (taxonomy) from the full 3-layer ontology as a hero visual.
 * Links to the full ontology page for deep exploration.
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { ContentOntologyConfig } from "../lib/ontologyTypes";

/* ── Dark mode detection ─────────────────────────────────────────────── */

function useIsDark() {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setDark(el.classList.contains("dark")));
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

/* ── Props ────────────────────────────────────────────────────────────── */

type MiniOntologyDiagramProps = {
  config: ContentOntologyConfig;
  categoryCounts: Record<string, number>;
  totalItems: number;
};

/* ── Component ───────────────────────────────────────────────────────── */

export default function MiniOntologyDiagram({
  config,
  categoryCounts,
  totalItems,
}: MiniOntologyDiagramProps) {
  const router = useRouter();
  const isDark = useIsDark();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const categories = config.categories.filter((c) => c.slug !== "other").slice(0, 6);

  const svgWidth = 480;
  const svgHeight = 280;
  const centerX = svgWidth / 2;
  const centerY = 60;
  const catWidth = 100;
  const catHeight = 28;
  const catY = 140;

  // Position categories in an arc below center
  const catPositions = categories.map((_, i) => {
    const cols = Math.min(categories.length, 3);
    const rows = Math.ceil(categories.length / cols);
    const row = Math.floor(i / cols);
    const col = i % cols;
    const totalWidth = cols * (catWidth + 12) - 12;
    const startX = (svgWidth - totalWidth) / 2;
    const x = startX + col * (catWidth + 12);
    const y = catY + row * (catHeight + 22);
    return { x, y };
  });

  const nodeStroke = isDark ? "#a1a1aa" : "#52525b";
  const nodeText = isDark ? "#e4e4e7" : "#52525b";
  const nodeFill = isDark ? "#3f3f46" : "#3f3f46";
  const nodeFillOpacity = isDark ? 0.35 : 0.12;

  const handleCategoryClick = useCallback(
    (slug: string) => router.push(`${config.catalogPath}?category=${slug}`),
    [router, config.catalogPath],
  );

  return (
    <div className="relative group">
      <Link
        href={`${config.basePath}/ontology`}
        className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full border border-zinc-700/50 bg-zinc-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white hover:border-zinc-500 dark:border-zinc-600/50 dark:bg-zinc-800/80"
      >
        Full ontology
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full"
        style={{ maxHeight: "320px", fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
      >
        <defs>
          <filter id="miniNodeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1" stdDeviation="3" floodOpacity="0.06" />
          </filter>
          <filter id="miniCentralShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="6" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Central node — content type pill */}
        <rect
          x={centerX - 50}
          y={centerY - 16}
          width="100"
          height="32"
          rx="16"
          className="fill-zinc-900 dark:fill-zinc-100"
          filter="url(#miniCentralShadow)"
        />
        <text
          x={centerX}
          y={centerY + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white dark:fill-zinc-900"
          fontSize="13"
          fontWeight="700"
          letterSpacing="-0.02em"
        >
          {config.label}
        </text>

        {/* Total count below center */}
        <text
          x={centerX}
          y={centerY + 26}
          textAnchor="middle"
          className="fill-zinc-400 dark:fill-zinc-500"
          fontSize="10"
          fontWeight="500"
        >
          {totalItems.toLocaleString()} total
        </text>

        {/* "has_category" label */}
        <text
          x={centerX}
          y={centerY + 44}
          textAnchor="middle"
          className="fill-zinc-400 dark:fill-zinc-500"
          fontSize="9"
          fontWeight="500"
          fontStyle="italic"
          opacity="0.7"
        >
          has_category
        </text>

        {/* Connection lines from center to categories */}
        {catPositions.map((pos, i) => {
          const cat = categories[i];
          const isHovered = hoveredCategory === cat.slug;
          const catColor = config.categoryColors[cat.slug] || nodeStroke;
          return (
            <line
              key={`line-${cat.slug}`}
              x1={centerX}
              y1={centerY + 16}
              x2={pos.x + catWidth / 2}
              y2={pos.y}
              stroke={isHovered ? catColor : nodeStroke}
              strokeWidth="1"
              strokeDasharray="4,3"
              opacity={isHovered ? 0.6 : 0.25}
            />
          );
        })}

        {/* Category nodes */}
        {catPositions.map((pos, i) => {
          const cat = categories[i];
          const count = categoryCounts[cat.slug] || 0;
          const isHovered = hoveredCategory === cat.slug;
          const catColor = config.categoryColors[cat.slug] || nodeFill;

          return (
            <g
              key={cat.slug}
              onClick={() => handleCategoryClick(cat.slug)}
              onMouseEnter={() => setHoveredCategory(cat.slug)}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={pos.x}
                y={pos.y}
                width={catWidth}
                height={catHeight}
                rx="8"
                fill={isHovered ? catColor : nodeFill}
                opacity={isHovered ? 0.2 : nodeFillOpacity}
              />
              <rect
                x={pos.x}
                y={pos.y}
                width={catWidth}
                height={catHeight}
                rx="8"
                fill="none"
                stroke={isHovered ? catColor : nodeStroke}
                strokeWidth={isHovered ? 1.5 : 0.8}
                filter="url(#miniNodeShadow)"
              />
              <text
                x={pos.x + catWidth / 2}
                y={pos.y + catHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="600"
                fill={isHovered ? catColor : nodeText}
              >
                {cat.label}
              </text>
              {/* Count below node */}
              <text
                x={pos.x + catWidth / 2}
                y={pos.y + catHeight + 12}
                textAnchor="middle"
                className="fill-zinc-400 dark:fill-zinc-500"
                fontSize="9"
                fontWeight="500"
              >
                {count.toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Layer label pill */}
        <rect x="8" y="6" width={config.label.length * 7 + 80} height="18" rx="9" className="fill-zinc-100/80 dark:fill-zinc-700/40" />
        <text x="16" y="18" className="fill-zinc-500 dark:fill-zinc-400" fontSize="9" fontWeight="700" letterSpacing="0.08em">
          {config.label.toUpperCase()} TAXONOMY
        </text>
      </svg>
    </div>
  );
}
