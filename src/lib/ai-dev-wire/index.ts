/**
 * AI Dev Wire — pipeline orchestrator + serving cache.
 *
 * `getWire()` runs every source adapter (failure-isolated), ranks the picks,
 * and caches the result per serverless instance. Normal loads serve the cache;
 * a manual refresh forces a re-run, but no more than once a minute so a click
 * can't hammer the sources. On a total failure it serves the last good payload.
 */
import type { SectionKey, SourceHealth, WireItem, WirePayload } from "./types";
import { SOURCES } from "./sources";
import { pickRecommendations } from "./recommend";

const emptySections = (): Record<SectionKey, WireItem[]> => ({
  models: [], papers: [], hn: [], repos: [], blogs: [], arxiv: [],
  tutorials: [], community: [], industry: [],
});

async function runPipeline(): Promise<WirePayload> {
  const results = await Promise.allSettled(SOURCES.map((s) => s.fetch()));
  const sections = emptySections();
  const errors: string[] = [];
  const sourceHealth: SourceHealth[] = [];

  results.forEach((r, i) => {
    const src = SOURCES[i];
    if (r.status === "fulfilled") {
      sections[src.key] = r.value;
      sourceHealth.push({ key: src.key, label: src.label, count: r.value.length, ok: true });
    } else {
      const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
      errors.push(`${src.id}: ${msg}`);
      sourceHealth.push({ key: src.key, label: src.label, count: 0, ok: false });
    }
  });

  const picks = pickRecommendations(sections, 3);
  return { generatedAt: new Date().toISOString(), picks, sections, errors, sourceHealth, cached: false };
}

let cache: WirePayload | null = null;
let cachedAt = 0;
let inflight: Promise<WirePayload> | null = null;

const CACHE_TTL_MS = 30 * 60 * 1000;   // serve cached for 30 minutes
const REFRESH_MIN_MS = 60 * 1000;      // a manual refresh re-fetches at most once/minute

export async function getWire(force = false): Promise<WirePayload> {
  const age = Date.now() - cachedAt;
  const fresh = cache !== null && age < CACHE_TTL_MS;
  const canForce = force && age > REFRESH_MIN_MS;

  if (fresh && !canForce) return { ...cache as WirePayload, cached: true };
  if (inflight) return inflight.then((p) => ({ ...p, cached: false }));

  inflight = runPipeline()
    .then((p) => { cache = p; cachedAt = Date.now(); return p; })
    .catch((e: unknown) => {
      if (cache !== null) return { ...cache, cached: true };   // stale-if-error
      throw e;
    })
    .finally(() => { inflight = null; });

  return inflight;
}
