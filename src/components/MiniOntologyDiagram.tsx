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

  const svgWidth = 460;
  const centerX = svgWidth / 2;
  const centerY = 58;
  const catHeight = 28;
  const nodeGapX = 10;
  const nodeGapY = 14;
  const catStartY = 160; // top of first category row — generous gap from hub
  const charWidth = 6.2; // approximate px per character at 10px font
  const dotSpace = 16; // space for the accent dot

  // Measure node widths dynamically based on label length
  const catWidths = categories.map((cat) => {
    const textW = cat.label.length * charWidth;
    return Math.max(textW + dotSpace + 16, 80); // dot + padding + min width
  });

  // Layout: 3 columns, center-aligned per row
  const cols = Math.min(categories.length, 3);
  const catPositions = categories.map((_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const rowStart = row * cols;
    const rowEnd = Math.min(rowStart + cols, categories.length);
    const rowItems = rowEnd - rowStart;
    // Sum widths for this row
    let rowTotalWidth = 0;
    for (let j = rowStart; j < rowEnd; j++) rowTotalWidth += catWidths[j];
    rowTotalWidth += (rowItems - 1) * nodeGapX;
    let x = (svgWidth - rowTotalWidth) / 2;
    for (let j = rowStart; j < rowStart + col; j++) x += catWidths[j] + nodeGapX;
    const y = catStartY + row * (catHeight + nodeGapY);
    return { x, y };
  });

  // Calculate total SVG height based on rows
  const totalRows = Math.ceil(categories.length / cols);
  const svgHeight = catStartY + totalRows * (catHeight + nodeGapY) + 14;

  // Colors
  const nodeStroke = isDark ? "rgba(161,161,170,0.5)" : "rgba(82,82,91,0.35)";
  const nodeText = isDark ? "#e4e4e7" : "#3f3f46";
  const lineColor = isDark ? "rgba(161,161,170,0.25)" : "rgba(82,82,91,0.18)";

  const handleCategoryClick = useCallback(
    (slug: string) => router.push(`${config.catalogPath}?category=${slug}`),
    [router, config.catalogPath],
  );

  return (
    <div className="mini-ontology-card group relative">
      {/* "Explore ontology" button */}
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
          <filter id={`mns-${config.contentType}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor={isDark ? "#000" : "#71717a"} floodOpacity={isDark ? 0.3 : 0.06} />
          </filter>
          {/* Central node glow */}
          <filter id={`mcg-${config.contentType}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#DC2626" floodOpacity="0.2" />
            <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor={isDark ? "#000" : "#71717a"} floodOpacity={isDark ? 0.25 : 0.05} />
          </filter>
          {/* Animated dash */}
          <style>{`
            @keyframes miniDash { to { stroke-dashoffset: -16; } }
            .mini-line-anim { animation: miniDash 3s linear infinite; }
          `}</style>
        </defs>

        {/* ── Layer label pill ── */}
        <rect x="10" y="8" width={config.label.length * 7.5 + 88} height="20" rx="10"
          fill={isDark ? "rgba(63,63,70,0.5)" : "rgba(244,244,245,0.9)"}
          stroke={isDark ? "rgba(113,113,122,0.25)" : "rgba(228,228,231,0.7)"}
          strokeWidth="0.5"
        />
        <text x="22" y="21.5" fontSize="9" fontWeight="700" letterSpacing="0.1em"
          fill={isDark ? "#a1a1aa" : "#71717a"}>
          {config.label.toUpperCase()} TAXONOMY
        </text>

        {/* ── Connection lines — curved bezier ── */}
        {catPositions.map((pos, i) => {
          const cat = categories[i];
          const w = catWidths[i];
          const isHovered = hoveredCategory === cat.slug;
          const catColor = config.categoryColors[cat.slug] || "#a1a1aa";
          const endX = pos.x + w / 2;
          const endY = pos.y;
          const lineStartY = centerY + 18;
          const midY = (lineStartY + endY) / 2;

          return (
            <path
              key={`line-${cat.slug}`}
              d={`M${centerX},${lineStartY} C${centerX},${midY} ${endX},${midY} ${endX},${endY}`}
              fill="none"
              stroke={isHovered ? catColor : lineColor}
              strokeWidth={isHovered ? 1.2 : 0.7}
              strokeDasharray={isHovered ? "none" : "4 4"}
              className={isHovered ? "" : "mini-line-anim"}
              style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
            />
          );
        })}

        {/* ── Central hub node ── */}
        <rect
          x={centerX - 54} y={centerY - 18}
          width="108" height="36" rx="18"
          fill={isDark ? "#18181b" : "#fafafa"}
          stroke={isDark ? "rgba(220,38,38,0.35)" : "rgba(220,38,38,0.2)"}
          strokeWidth="1"
          filter={`url(#mcg-${config.contentType})`}
        />
        <rect
          x={centerX - 53} y={centerY - 17}
          width="106" height="34" rx="17"
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.03)"}
          strokeWidth="0.5"
        />
        <text x={centerX} y={centerY - 2} textAnchor="middle" dominantBaseline="middle"
          fontSize="13" fontWeight="800" letterSpacing="-0.02em"
          fill={isDark ? "#fafafa" : "#18181b"}>
          {config.label}
        </text>
        <text x={centerX} y={centerY + 12} textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fontWeight="500"
          fill={isDark ? "#a1a1aa" : "#71717a"}>
          {totalItems.toLocaleString()} cataloged
        </text>

        {/* Relationship label */}
        <text x={centerX} y={centerY + 38} textAnchor="middle"
          fontSize="8" fontWeight="500" fontStyle="italic"
          fill={isDark ? "rgba(161,161,170,0.4)" : "rgba(113,113,122,0.4)"}>
          has_category
        </text>

        {/* ── Category nodes ── */}
        {catPositions.map((pos, i) => {
          const cat = categories[i];
          const w = catWidths[i];
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
              {/* Node bg */}
              <rect
                x={pos.x} y={pos.y}
                width={w} height={catHeight} rx="8"
                fill={isDark
                  ? isHovered ? `${catColor}18` : "rgba(39,39,42,0.6)"
                  : isHovered ? `${catColor}0C` : "rgba(250,250,250,0.9)"
                }
                stroke={isHovered ? catColor : nodeStroke}
                strokeWidth={isHovered ? 1 : 0.5}
                filter={`url(#mns-${config.contentType})`}
                style={{ transition: "stroke 0.2s, fill 0.2s" }}
              />
              {/* Inner highlight */}
              <rect
                x={pos.x + 0.5} y={pos.y + 0.5}
                width={w - 1} height={catHeight - 1} rx="7.5"
                fill="none"
                stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)"}
                strokeWidth="0.5"
              />
              {/* Category color accent dot */}
              <circle
                cx={pos.x + 10} cy={pos.y + catHeight / 2}
                r="2.5"
                fill={catColor}
                opacity={isHovered ? 1 : 0.7}
              />
              {/* Label */}
              <text
                x={pos.x + 19} y={pos.y + catHeight / 2}
                dominantBaseline="middle"
                fontSize="10" fontWeight="600"
                fill={isHovered ? catColor : nodeText}
                style={{ transition: "fill 0.2s" }}
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
