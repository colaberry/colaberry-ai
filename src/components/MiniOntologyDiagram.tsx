/**
 * MiniOntologyDiagram — Clean enterprise taxonomy diagram for listing page heroes.
 * Flat card with solid connection lines, crisp nodes, and zinc-monochrome palette.
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

  /* ── SVG layout constants ── */
  const svgWidth = 420;
  const centerX = svgWidth / 2;
  const hubY = 62;
  const hubW = 120;
  const hubH = 44;
  const catHeight = 30;
  const nodeGapX = 8;
  const nodeGapY = 10;
  const catStartY = 148;
  const charWidth = 6.4;
  const dotSpace = 18;

  const catWidths = categories.map((cat) => {
    const textW = cat.label.length * charWidth;
    return Math.max(textW + dotSpace + 18, 90);
  });

  const cols = Math.min(categories.length, 3);
  const catPositions = categories.map((_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const rowStart = row * cols;
    const rowEnd = Math.min(rowStart + cols, categories.length);
    const rowItems = rowEnd - rowStart;
    let rowTotalWidth = 0;
    for (let j = rowStart; j < rowEnd; j++) rowTotalWidth += catWidths[j];
    rowTotalWidth += (rowItems - 1) * nodeGapX;
    let x = (svgWidth - rowTotalWidth) / 2;
    for (let j = rowStart; j < rowStart + col; j++) x += catWidths[j] + nodeGapX;
    const y = catStartY + row * (catHeight + nodeGapY);
    return { x, y };
  });

  const totalRows = Math.ceil(categories.length / cols);
  const svgHeight = catStartY + totalRows * (catHeight + nodeGapY) + 8;

  /* ── Colors ── */
  const bg = isDark ? "#18181b" : "#ffffff";
  const surfaceFill = isDark ? "#27272a" : "#f4f4f5";
  const stroke = isDark ? "#3f3f46" : "#e4e4e7";
  const textPrimary = isDark ? "#fafafa" : "#18181b";
  const textSecondary = isDark ? "#a1a1aa" : "#71717a";
  const textTertiary = isDark ? "#71717a" : "#a1a1aa";
  const lineStroke = isDark ? "#3f3f46" : "#d4d4d8";

  const handleCategoryClick = useCallback(
    (slug: string) => router.push(`${config.catalogPath}?category=${slug}`),
    [router, config.catalogPath],
  );

  return (
    <div className="mini-ontology-card group relative">
      {/* "Explore ontology" link */}
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
        {/* ── Header label ── */}
        <text x="20" y="24" fontSize="10" fontWeight="600" letterSpacing="0.08em"
          fill={textSecondary}>
          {config.label.toUpperCase()} TAXONOMY
        </text>
        <line x1="20" y1="34" x2={svgWidth - 20} y2="34" stroke={stroke} strokeWidth="0.5" />

        {/* ── Connection lines — clean solid curves ── */}
        {catPositions.map((pos, i) => {
          const cat = categories[i];
          const w = catWidths[i];
          const isHovered = hoveredCategory === cat.slug;
          const catColor = config.categoryColors[cat.slug] || textTertiary;
          const endX = pos.x + w / 2;
          const endY = pos.y;
          const lineStartY = hubY + hubH / 2 + 4;
          const cp1Y = lineStartY + (endY - lineStartY) * 0.35;
          const cp2Y = lineStartY + (endY - lineStartY) * 0.65;

          return (
            <path
              key={`line-${cat.slug}`}
              d={`M${centerX},${lineStartY} C${centerX},${cp1Y} ${endX},${cp2Y} ${endX},${endY}`}
              fill="none"
              stroke={isHovered ? catColor : lineStroke}
              strokeWidth={isHovered ? 1.5 : 0.75}
              style={{ transition: "stroke 0.15s, stroke-width 0.15s" }}
            />
          );
        })}

        {/* ── Central hub ── */}
        <rect
          x={centerX - hubW / 2} y={hubY - hubH / 2}
          width={hubW} height={hubH} rx={hubH / 2}
          fill={bg}
          stroke={stroke}
          strokeWidth="1"
        />
        <text x={centerX} y={hubY - 4} textAnchor="middle" dominantBaseline="middle"
          fontSize="14" fontWeight="700" letterSpacing="-0.02em"
          fill={textPrimary}>
          {config.label}
        </text>
        <text x={centerX} y={hubY + 12} textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fontWeight="500"
          fill={textSecondary}>
          {totalItems.toLocaleString()} cataloged
        </text>

        {/* ── Category nodes ── */}
        {catPositions.map((pos, i) => {
          const cat = categories[i];
          const w = catWidths[i];
          const isHovered = hoveredCategory === cat.slug;
          const catColor = config.categoryColors[cat.slug] || textTertiary;

          return (
            <g
              key={cat.slug}
              onClick={() => handleCategoryClick(cat.slug)}
              onMouseEnter={() => setHoveredCategory(cat.slug)}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={pos.x} y={pos.y}
                width={w} height={catHeight} rx="6"
                fill={isHovered
                  ? (isDark ? `${catColor}15` : `${catColor}0A`)
                  : surfaceFill
                }
                stroke={isHovered ? catColor : stroke}
                strokeWidth={isHovered ? 1 : 0.5}
                style={{ transition: "stroke 0.15s, fill 0.15s" }}
              />
              {/* Category color accent dot */}
              <circle
                cx={pos.x + 12} cy={pos.y + catHeight / 2}
                r="3"
                fill={catColor}
                opacity={isHovered ? 1 : 0.65}
                style={{ transition: "opacity 0.15s" }}
              />
              {/* Label */}
              <text
                x={pos.x + 22} y={pos.y + catHeight / 2 + 0.5}
                dominantBaseline="middle"
                fontSize="11" fontWeight="500"
                fill={isHovered ? textPrimary : textSecondary}
                style={{ transition: "fill 0.15s" }}
              >
                {cat.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
