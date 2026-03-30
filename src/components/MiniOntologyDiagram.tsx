/**
 * MiniOntologyDiagram — Premium enterprise taxonomy diagram for listing page heroes.
 * Glass card container with animated connection lines, glowing nodes, and subtle depth.
 * Links to the full 3-layer ontology page.
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

  const svgWidth = 420;
  const svgHeight = 320;
  const centerX = svgWidth / 2;
  const centerY = 72;
  const catWidth = 110;
  const catHeight = 30;

  // Position categories in a 3×2 or 2×3 grid below center
  const cols = Math.min(categories.length, 3);
  const catPositions = categories.map((_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const rowCount = Math.min(categories.length - row * cols, cols);
    const totalWidth = rowCount * (catWidth + 14) - 14;
    const startX = (svgWidth - totalWidth) / 2;
    const x = startX + col * (catWidth + 14);
    const y = 158 + row * (catHeight + 28);
    return { x, y };
  });

  // Colors
  const nodeStroke = isDark ? "rgba(161,161,170,0.5)" : "rgba(82,82,91,0.4)";
  const nodeText = isDark ? "#e4e4e7" : "#3f3f46";
  const countText = isDark ? "#a1a1aa" : "#71717a";
  const lineColor = isDark ? "rgba(161,161,170,0.3)" : "rgba(82,82,91,0.2)";

  const handleCategoryClick = useCallback(
    (slug: string) => router.push(`${config.catalogPath}?category=${slug}`),
    [router, config.catalogPath],
  );

  return (
    <div className="mini-ontology-card group relative">
      {/* "Explore ontology" button — always visible */}
      <Link
        href={`${config.basePath}/ontology`}
        className="mini-ontology-explore-link"
      >
        <span>Explore ontology</span>
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
      </Link>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full"
        style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
      >
        <defs>
          {/* Node shadow */}
          <filter id={`mns-${config.contentType}`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={isDark ? "#000" : "#71717a"} floodOpacity={isDark ? 0.4 : 0.08} />
          </filter>
          {/* Central node glow */}
          <filter id={`mcg-${config.contentType}`} x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#DC2626" floodOpacity="0.25" />
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={isDark ? "#000" : "#71717a"} floodOpacity={isDark ? 0.3 : 0.06} />
          </filter>
          {/* Hover glow — per category color */}
          <filter id={`mhg-${config.contentType}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#DC2626" floodOpacity="0.3" />
          </filter>
          {/* Animated dash */}
          <style>{`
            @keyframes miniDash { to { stroke-dashoffset: -16; } }
            .mini-line-animated { animation: miniDash 3s linear infinite; }
          `}</style>
        </defs>

        {/* ── Layer label pill ── */}
        <rect x="12" y="10" width={config.label.length * 7.5 + 90} height="22" rx="11"
          fill={isDark ? "rgba(63,63,70,0.5)" : "rgba(244,244,245,0.9)"}
          stroke={isDark ? "rgba(113,113,122,0.3)" : "rgba(228,228,231,0.8)"}
          strokeWidth="0.5"
        />
        <text x="24" y="24" fontSize="9.5" fontWeight="700" letterSpacing="0.1em"
          fill={isDark ? "#a1a1aa" : "#71717a"}>
          {config.label.toUpperCase()} TAXONOMY
        </text>

        {/* ── Connection lines — curved bezier with animated dashes ── */}
        {catPositions.map((pos, i) => {
          const cat = categories[i];
          const isHovered = hoveredCategory === cat.slug;
          const catColor = config.categoryColors[cat.slug] || "#a1a1aa";
          const endX = pos.x + catWidth / 2;
          const endY = pos.y;
          const midY = (centerY + 32 + endY) / 2;

          return (
            <path
              key={`line-${cat.slug}`}
              d={`M${centerX},${centerY + 20} C${centerX},${midY} ${endX},${midY} ${endX},${endY}`}
              fill="none"
              stroke={isHovered ? catColor : lineColor}
              strokeWidth={isHovered ? 1.5 : 0.8}
              strokeDasharray={isHovered ? "none" : "4 4"}
              className={isHovered ? "" : "mini-line-animated"}
              opacity={isHovered ? 0.8 : 1}
            />
          );
        })}

        {/* ── Central hub node ── */}
        <rect
          x={centerX - 56} y={centerY - 18}
          width="112" height="36" rx="18"
          fill={isDark ? "#18181b" : "#fafafa"}
          stroke={isDark ? "rgba(220,38,38,0.4)" : "rgba(220,38,38,0.25)"}
          strokeWidth="1"
          filter={`url(#mcg-${config.contentType})`}
        />
        {/* Inner accent line */}
        <rect
          x={centerX - 55} y={centerY - 17}
          width="110" height="34" rx="17"
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.03)"}
          strokeWidth="0.5"
        />
        <text x={centerX} y={centerY + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize="14" fontWeight="800" letterSpacing="-0.03em"
          fill={isDark ? "#fafafa" : "#18181b"}>
          {config.label}
        </text>

        {/* Total count */}
        <text x={centerX} y={centerY + 30} textAnchor="middle"
          fontSize="11" fontWeight="600" fill={isDark ? "#a1a1aa" : "#71717a"}>
          {totalItems.toLocaleString()} cataloged
        </text>

        {/* Relationship label */}
        <text x={centerX} y={centerY + 48} textAnchor="middle"
          fontSize="8.5" fontWeight="500" fontStyle="italic"
          fill={isDark ? "rgba(161,161,170,0.5)" : "rgba(113,113,122,0.5)"}>
          has_category
        </text>

        {/* ── Category nodes ── */}
        {catPositions.map((pos, i) => {
          const cat = categories[i];
          const count = categoryCounts[cat.slug] || 0;
          const isHovered = hoveredCategory === cat.slug;
          const catColor = config.categoryColors[cat.slug] || "#a1a1aa";

          return (
            <g
              key={cat.slug}
              onClick={() => handleCategoryClick(cat.slug)}
              onMouseEnter={() => setHoveredCategory(cat.slug)}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Node background */}
              <rect
                x={pos.x} y={pos.y}
                width={catWidth} height={catHeight} rx="10"
                fill={isDark
                  ? isHovered ? `${catColor}22` : "rgba(39,39,42,0.7)"
                  : isHovered ? `${catColor}12` : "rgba(250,250,250,0.9)"
                }
                stroke={isHovered ? catColor : nodeStroke}
                strokeWidth={isHovered ? 1.2 : 0.6}
                filter={isHovered ? `url(#mhg-${config.contentType})` : `url(#mns-${config.contentType})`}
              />
              {/* Inner highlight */}
              <rect
                x={pos.x + 0.5} y={pos.y + 0.5}
                width={catWidth - 1} height={catHeight - 1} rx="9.5"
                fill="none"
                stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)"}
                strokeWidth="0.5"
              />
              {/* Category color accent dot */}
              <circle
                cx={pos.x + 12} cy={pos.y + catHeight / 2}
                r="3"
                fill={catColor}
                opacity={isHovered ? 1 : 0.6}
              />
              {/* Label */}
              <text
                x={pos.x + 22} y={pos.y + catHeight / 2}
                dominantBaseline="middle"
                fontSize="10.5" fontWeight="600"
                fill={isHovered ? catColor : nodeText}
              >
                {cat.label}
              </text>
              {/* Count — right-aligned */}
              <text
                x={pos.x + catWidth - 10} y={pos.y + catHeight / 2}
                textAnchor="end" dominantBaseline="middle"
                fontSize="9.5" fontWeight="700"
                fill={isHovered ? catColor : countText}
                opacity={isHovered ? 1 : 0.7}
              >
                {count > 0 ? count.toLocaleString() : "—"}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
