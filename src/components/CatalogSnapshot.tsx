/**
 * CatalogSnapshot — Enterprise-grade stats banner for catalog listing pages.
 *
 * Renders a dark, full-width panel with large hero metrics, subtle grid texture,
 * and a coral accent line. Numbers count up from 0 on scroll.
 */

import { useEffect, useRef, useState } from "react";

export type SnapshotStat = {
  label: string;
  value: string | number;
  note: string;
};

type CatalogSnapshotProps = {
  /** Array of 2-4 stat objects */
  stats: SnapshotStat[];
  /** Optional accent color override (defaults to coral #DC2626) */
  accent?: string;
};

/** Extract numeric part from value like "29", "1,505", "16.9k", "12 public" */
function parseStatNum(value: string | number): { target: number; format: (n: number) => string } {
  const str = String(value);
  // Match leading number with optional comma/decimal (e.g. "1,505", "16.9k", "29", "12 public")
  const match = str.match(/^([\d,]+(?:\.\d+)?)(k?)(.*)$/i);
  if (!match) return { target: 0, format: () => str };
  const numStr = match[1].replace(/,/g, "");
  const num = parseFloat(numStr);
  const hasK = match[2].toLowerCase() === "k";
  const suffix = match[2] + match[3]; // e.g. "k+", " public"
  const actualTarget = hasK ? num * 1000 : num;

  const format = (n: number) => {
    if (hasK) {
      const kVal = n / 1000;
      const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
      return kVal.toFixed(decimals) + suffix;
    }
    // Preserve comma formatting for large numbers
    const rounded = Math.round(n);
    const formatted = rounded >= 1000 ? rounded.toLocaleString() : String(rounded);
    return formatted + suffix;
  };

  return { target: actualTarget, format };
}

function useCountUp(target: number, duration: number, started: boolean): number {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!started || target === 0) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCurrent(target);
      return;
    }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const progress = elapsed === 1 ? 1 : 1 - Math.pow(2, -10 * elapsed);
      setCurrent(target * progress);
      if (elapsed < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);
  return current;
}

function AnimatedStatValue({ value, delay }: { value: string | number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [counting, setCounting] = useState(false);
  const { target, format } = parseStatNum(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setCounting(true), delay);
    return () => clearTimeout(timer);
  }, [visible, delay]);

  const counted = useCountUp(target, 1500, counting);
  const display = target === 0 ? String(value) : counting ? format(counted) : "0";

  return (
    <div ref={ref} className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
      {display}
    </div>
  );
}

export default function CatalogSnapshot({ stats, accent = "#DC2626" }: CatalogSnapshotProps) {
  return (
    <section className="reveal mt-8 sm:mt-10">
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 dark:bg-zinc-950">
        {/* Subtle grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Coral accent line at top */}
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, ${accent}, ${accent}80, transparent)` }}
        />

        {/* Content */}
        <div className="relative px-6 py-7 sm:px-8 sm:py-9">
          {/* Stats grid */}
          <div
            className={`grid gap-px overflow-hidden rounded-xl bg-white/[0.06] ${
              stats.length <= 2 ? "sm:grid-cols-2" : stats.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"
            }`}
          >
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`group relative bg-zinc-900 px-5 py-5 transition-colors hover:bg-zinc-800/80 dark:bg-zinc-950 dark:hover:bg-zinc-900/80 sm:px-6 sm:py-6 ${
                  i === 0 ? "rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none" : ""
                } ${i === stats.length - 1 ? "rounded-b-xl sm:rounded-r-xl sm:rounded-bl-none" : ""}`}
              >
                {/* Stat label */}
                <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  {stat.label}
                </div>

                {/* Stat value — animated counting number */}
                <AnimatedStatValue value={stat.value} delay={i * 150} />

                {/* Stat note */}
                <div className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                  {stat.note}
                </div>

                {/* Subtle hover accent dot */}
                <div
                  className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: accent }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
