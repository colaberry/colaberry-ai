/**
 * BrandLogo — Premium ColaberryAI logo with "Knowledge Berry" mark.
 *
 * Design rationale:
 * - Mark: 3 circles in asymmetric triangular cluster = berry bunch + knowledge graph nodes
 * - One coral circle = the "AI" accent node, two zinc circles = the "Colaberry" foundation
 * - Ultra-thin connection lines between nodes suggest graph edges (barely visible = premium restraint)
 * - Minimal stem curve from top node = organic berry feel, not generic tech
 * - Typography: "Colaberry" Inter SemiBold + "AI" Inter ExtraBold in coral
 * - Inline SVG: auto-adapts to dark/light, uses loaded Inter font, no separate files needed
 *
 * Based on feedback:
 * - Ram: "A and I capital letters" + "professional for sales people" + "no purple"
 * - Karun: "add icons, not just text"
 * - Design system: zinc scale + coral #DC2626 accent only
 */

type BrandLogoProps = {
  /** Logo size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Show the berry mark icon */
  showMark?: boolean;
  /** Additional className */
  className?: string;
  /** Render as watermark (larger, lighter text) */
  watermark?: boolean;
};

const SIZE_CONFIG = {
  xs: { mark: 18, text: "text-[0.875rem]", gap: "gap-1" },
  sm: { mark: 22, text: "text-[1.05rem]", gap: "gap-1.5" },
  md: { mark: 28, text: "text-[1.3rem]", gap: "gap-2" },
  lg: { mark: 34, text: "text-[1.55rem]", gap: "gap-2.5" },
  xl: { mark: 42, text: "text-[2rem]", gap: "gap-3" },
  "2xl": { mark: 56, text: "text-[2.75rem]", gap: "gap-4" },
} as const;

/* ── Berry Mark SVG ───────────────────────────────────────────────────── */

function BerryMark({ size }: { size: number }) {
  const h = size * (44 / 34);
  return (
    <svg
      viewBox="0 -4 34 44"
      width={size}
      height={h}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Connection lines — knowledge graph edges (subtle, behind berries) */}
      <line x1="13" y1="15" x2="25" y2="18" stroke="currentColor" strokeWidth="0.8" opacity="0.12" />
      <line x1="13" y1="15" x2="14" y2="29" stroke="currentColor" strokeWidth="0.8" opacity="0.12" />
      <line x1="14" y1="29" x2="25" y2="18" stroke="currentColor" strokeWidth="0.8" opacity="0.12" />

      {/* Berry 1 — top-left (largest, anchor node) */}
      <circle cx="13" cy="15" r="8.5" fill="currentColor" />

      {/* Berry 2 — right (medium, overlaps berry 1 slightly) */}
      <circle cx="25" cy="18" r="6" fill="currentColor" opacity="0.85" />

      {/* Berry 3 — bottom-center (coral AI accent — the signature) */}
      <circle cx="14" cy="29" r="7" className="fill-[#DC2626] dark:fill-[#F87171]" />

      {/* Stem — tall curved stem like original Colaberry cherry logo */}
      <path
        d="M13,6.5 C13.5,3.5 14.5,1.5 16,-1"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Leaves — large filled shapes unmistakably berry-like */}
      <path
        d="M14.5,0.5 C12,-2 9.5,-0.5 11.5,2.5 C12.5,3.5 14,2.5 14.5,0.5Z"
        fill="currentColor"
        opacity="0.75"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M16,-0.5 C18.5,-3 21,-1.5 19.5,1.5 C18.5,3 17,2 16,-0.5Z"
        fill="currentColor"
        opacity="0.75"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

/* ── Main Component ───────────────────────────────────────────────────── */

export default function BrandLogo({
  size = "md",
  showMark = true,
  className = "",
  watermark = false,
}: BrandLogoProps) {
  const config = SIZE_CONFIG[size];

  if (watermark) {
    return (
      <span
        className={`inline-flex items-center ${config.gap} select-none ${className}`}
        aria-label="ColaberryAI"
      >
        <span
          className={`${config.text} leading-none tracking-[-0.03em]`}
          style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
        >
          <span className="font-semibold text-zinc-300 dark:text-zinc-700">Colaberry</span>
          <span className="font-extrabold text-zinc-400 dark:text-zinc-600">AI</span>
        </span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center ${config.gap} select-none ${className}`}
      aria-label="ColaberryAI"
    >
      {showMark && <BerryMark size={config.mark} />}

      <span
        className={`${config.text} leading-none tracking-[-0.03em]`}
        style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
      >
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">Colaberry</span>
        <span className="font-extrabold text-[#DC2626] dark:text-[#F87171]">AI</span>
      </span>
    </span>
  );
}
