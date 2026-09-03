/**
 * AI Dev Wire — shared types.
 *
 * A source is an *adapter* that conforms to `SourceAdapter` and emits
 * `WireItem[]`. Everything downstream (relevance, dedupe, ranking, rendering)
 * depends on this shape, not on any particular source — which is what lets the
 * number of sources grow from six to N without the core changing.
 */

export type SectionKey = "models" | "papers" | "hn" | "repos" | "blogs" | "arxiv";

export type WireKind = "model" | "paper" | "repo" | "discussion" | "release";

/** The normalized item every source produces. */
export interface WireItem {
  title: string;
  url: string;
  summary?: string;
  metric?: string;
  /** Some items (HN) carry a separate discussion link. */
  discussUrl?: string;
  score: number;
  source: string;
  ts: number | null;
  /** For models: how many quantizations/variants were folded onto this base. */
  variants?: number;
}

/** A ranked pick for the "Start here" surface. */
export interface Recommendation extends WireItem {
  kind: WireKind;
  weight: number;
  corroboration: number;
  echoSources: string[];
  echoToken?: string;
  why: string;
}

export interface SourceHealth {
  key: SectionKey;
  label: string;
  count: number;
  ok: boolean;
}

/** The full payload the API returns and the page renders. */
export interface WirePayload {
  generatedAt: string;
  picks: Recommendation[];
  sections: Record<SectionKey, WireItem[]>;
  errors: string[];
  sourceHealth: SourceHealth[];
  /** True when served from the in-memory cache rather than a fresh fetch. */
  cached: boolean;
}

/**
 * The one contract every source implements. Add a source = add one of these
 * (or, for an RSS/Atom feed, one row in the feeds config that the generic RSS
 * adapter reads). `fetch()` must never reject the whole run — it is called
 * inside `Promise.allSettled`, and a thrown error degrades that source only.
 */
export interface SourceAdapter {
  id: string;
  key: SectionKey;
  label: string;
  fetch: () => Promise<WireItem[]>;
}
