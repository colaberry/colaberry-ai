/**
 * Distribution orchestrator — the one function the cron route calls.
 *
 * Pipeline:
 *   1. `fetchRecentEntries()` — pull catalog content updated in the last
 *      N hours from Strapi, across all 5 ContentKinds.
 *   2. Filter to enabled platforms (each client's `isEnabled()` gate).
 *   3. `buildDrafts()` — render one PostDraft per (entry × enabled
 *      platform). Pure function, no I/O.
 *   4. Dispatch each draft through its platform client in parallel,
 *      bounded by a per-platform concurrency cap so we don't thrash
 *      rate limits. Every client's `dispatch()` is contractually
 *      non-throwing.
 *   5. Aggregate results into a `DistributionRunResult` that's suitable
 *      for logging, alerting, and (future) a Strapi audit content type.
 *
 * Design guarantees:
 *   - One platform's total failure does not take down the run.
 *   - DRY_RUN is the default. Live posting requires an explicit flag.
 *   - The result shape is stable and serializable — the cron handler
 *     returns it directly; tests assert on it.
 */

import { fetchRecentEntries } from "./source";
import { buildDrafts } from "./templates";
import { moltbookClient } from "./clients/moltbook";
import { xClient } from "./clients/x";
import { huggingfaceClient } from "./clients/huggingface";
import type {
  ContentKind,
  DispatchOptions,
  DispatchResult,
  DistributionRunResult,
  Platform,
  PlatformClient,
  PlatformSummary,
  PostDraft,
} from "./types";

/** Registry of every platform client. Order here = dispatch order for
 * readability in logs; parallelism is per-platform (see DISPATCH_CONCURRENCY). */
const CLIENTS: Record<Platform, PlatformClient> = {
  x: xClient,
  moltbook: moltbookClient,
  huggingface: huggingfaceClient,
};

/** Max concurrent dispatches per platform. Keeps us well under any sane
 * rate limit while still finishing in a sensible wall-clock window. */
const DISPATCH_CONCURRENCY = 3;

export interface RunOptions {
  /** When true, clients serialize the payload but do not call external
   * APIs. Defaults to true — live posting is explicit-opt-in. */
  dryRun?: boolean;
  /** Lookback window. Default 24 hours. */
  windowHours?: number;
  /** Cap per kind in the source layer. Default 25. */
  maxPerKind?: number;
  /** Restrict to specific kinds. Empty / undefined = all. */
  kinds?: ContentKind[];
  /** Restrict to specific platforms. Empty / undefined = all enabled. */
  platforms?: Platform[];
  /** Per-dispatch timeout. Default 10_000ms (per client defaults). */
  timeoutMs?: number;
  /** Override Moltbook agent slug (e.g. staging vs prod). */
  moltbookAgentSlug?: string;
  /** Override HF target dataset. */
  huggingfaceDatasetId?: string;
  /** Fixed "now" for deterministic tests. */
  nowMs?: number;
}

/**
 * Execute one distribution run. Never throws — top-level errors land in
 * `runErrors` on the result so the cron route can return 200 with a
 * structured body regardless of what went wrong.
 */
export async function runDistribution(
  options: RunOptions = {}
): Promise<DistributionRunResult> {
  const startedAt = new Date().toISOString();
  const startMs = Date.now();
  const dryRun = options.dryRun ?? true;
  const windowHours = options.windowHours ?? 24;
  const runErrors: string[] = [];
  const dispatches: DispatchResult[] = [];

  // Determine which platforms to run. "Enabled" = has creds (or for HF,
  // at least a token set). Dry-run bypasses the `isEnabled` gate because
  // we want the dry-run to exercise every platform regardless.
  const requestedPlatforms: Platform[] = options.platforms?.length
    ? options.platforms
    : (Object.keys(CLIENTS) as Platform[]);

  const activePlatforms = requestedPlatforms.filter((platform) => {
    const client = CLIENTS[platform];
    if (!client) {
      runErrors.push(`Unknown platform requested: ${platform}`);
      return false;
    }
    return dryRun || client.isEnabled();
  });

  // Summary scaffolding — we fill in counts as dispatches return.
  const summary = buildEmptySummary(requestedPlatforms);
  for (const platform of requestedPlatforms) {
    summary[platform].enabled = CLIENTS[platform]?.isEnabled() ?? false;
  }

  // 1) Source layer — pull recent entries.
  let entries: Awaited<ReturnType<typeof fetchRecentEntries>>["entries"] = [];
  try {
    const fetched = await fetchRecentEntries({
      windowHours,
      maxPerKind: options.maxPerKind,
      kinds: options.kinds,
      nowMs: options.nowMs,
    });
    entries = fetched.entries;
    runErrors.push(...fetched.errors);
  } catch (err) {
    runErrors.push(
      `[orchestrator] source failed: ${err instanceof Error ? err.message : String(err)}`
    );
    return finishRun({
      startedAt,
      startMs,
      windowHours,
      entriesMatched: 0,
      draftsRendered: 0,
      summary,
      dispatches,
      runErrors,
      dryRun,
    });
  }

  if (entries.length === 0 || activePlatforms.length === 0) {
    // Nothing to send is still a successful run.
    return finishRun({
      startedAt,
      startMs,
      windowHours,
      entriesMatched: entries.length,
      draftsRendered: 0,
      summary,
      dispatches,
      runErrors,
      dryRun,
    });
  }

  // 2) Template layer — fan out each entry to one draft per active platform.
  const drafts: PostDraft[] = [];
  for (const entry of entries) {
    try {
      const entryDrafts = buildDrafts(entry, {
        platforms: activePlatforms,
        moltbookAgentSlug: options.moltbookAgentSlug,
        huggingfaceDatasetId: options.huggingfaceDatasetId,
      });
      drafts.push(...entryDrafts);
    } catch (err) {
      runErrors.push(
        `[orchestrator] template failed for entry ${entry.id}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  // 3) Dispatch — group by platform, then run each group with bounded
  // concurrency. We don't care about cross-platform ordering; within a
  // platform we dispatch newest-first (the source layer already sorted).
  const dispatchOptions: DispatchOptions = {
    dryRun,
    timeoutMs: options.timeoutMs,
  };

  const byPlatform = new Map<Platform, PostDraft[]>();
  for (const draft of drafts) {
    const bucket = byPlatform.get(draft.platform) ?? [];
    bucket.push(draft);
    byPlatform.set(draft.platform, bucket);
  }

  const platformRuns = Array.from(byPlatform.entries()).map(
    async ([platform, platformDrafts]) => {
      const client = CLIENTS[platform];
      const results = await dispatchWithConcurrency(
        platformDrafts,
        client,
        dispatchOptions,
        DISPATCH_CONCURRENCY
      );
      return { platform, results };
    }
  );

  const settled = await Promise.allSettled(platformRuns);
  for (const outcome of settled) {
    if (outcome.status === "fulfilled") {
      dispatches.push(...outcome.value.results);
      for (const result of outcome.value.results) {
        tallyResult(summary, result);
      }
    } else {
      // A rejected outer promise means the dispatchWithConcurrency wrapper
      // itself failed — the client contract says clients never throw, so
      // this is a bug, not a platform outage. Surface it loudly.
      runErrors.push(
        `[orchestrator] dispatch wrapper failed: ${
          outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason)
        }`
      );
    }
  }

  // Stable dispatch log order: platform asc, then attemptedAt asc.
  dispatches.sort((a, b) => {
    const byPlat = a.platform.localeCompare(b.platform);
    return byPlat !== 0 ? byPlat : a.attemptedAt.localeCompare(b.attemptedAt);
  });

  return finishRun({
    startedAt,
    startMs,
    windowHours,
    entriesMatched: entries.length,
    draftsRendered: drafts.length,
    summary,
    dispatches,
    runErrors,
    dryRun,
  });
}

/* ---------- helpers ----------------------------------------------------- */

async function dispatchWithConcurrency(
  drafts: PostDraft[],
  client: PlatformClient,
  options: DispatchOptions,
  concurrency: number
): Promise<DispatchResult[]> {
  const results: DispatchResult[] = new Array(drafts.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(concurrency, drafts.length) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= drafts.length) return;
      const draft = drafts[index];
      // Client contract: never throws. But we wrap anyway so a rogue
      // implementation can't poison the whole run.
      try {
        results[index] = await client.dispatch(draft, options);
      } catch (err) {
        results[index] = {
          platform: draft.platform,
          idempotencyKey: draft.idempotencyKey,
          status: "failed",
          remoteId: null,
          message: `Client threw: ${err instanceof Error ? err.message : String(err)}`,
          attemptedAt: new Date().toISOString(),
          errorCode: "client-exception",
        };
      }
    }
  });

  await Promise.all(workers);
  return results;
}

function buildEmptySummary(platforms: Platform[]): Record<Platform, PlatformSummary> {
  const base: Record<Platform, PlatformSummary> = {
    x: { enabled: false, sent: 0, skipped: 0, failed: 0, dryRun: 0 },
    moltbook: { enabled: false, sent: 0, skipped: 0, failed: 0, dryRun: 0 },
    huggingface: { enabled: false, sent: 0, skipped: 0, failed: 0, dryRun: 0 },
  };
  // Mark platforms we weren't asked to run with enabled: false so the
  // caller can distinguish "not enabled" from "not attempted".
  for (const key of Object.keys(base) as Platform[]) {
    if (!platforms.includes(key)) {
      base[key].enabled = false;
    }
  }
  return base;
}

function tallyResult(
  summary: Record<Platform, PlatformSummary>,
  result: DispatchResult
): void {
  const row = summary[result.platform];
  if (!row) return;
  switch (result.status) {
    case "sent":
      row.sent += 1;
      break;
    case "skipped":
      row.skipped += 1;
      break;
    case "failed":
      row.failed += 1;
      break;
    case "dry-run":
      row.dryRun += 1;
      break;
  }
}

interface FinishArgs {
  startedAt: string;
  startMs: number;
  windowHours: number;
  entriesMatched: number;
  draftsRendered: number;
  summary: Record<Platform, PlatformSummary>;
  dispatches: DispatchResult[];
  runErrors: string[];
  dryRun: boolean;
}

function finishRun(args: FinishArgs): DistributionRunResult {
  return {
    startedAt: args.startedAt,
    finishedAt: new Date(args.startMs + (Date.now() - args.startMs)).toISOString(),
    windowHours: args.windowHours,
    entriesMatched: args.entriesMatched,
    draftsRendered: args.draftsRendered,
    summary: args.summary,
    dispatches: args.dispatches,
    runErrors: args.runErrors,
    dryRun: args.dryRun,
  };
}
