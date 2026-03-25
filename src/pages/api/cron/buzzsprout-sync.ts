import type { NextApiRequest, NextApiResponse } from "next";
import { syncBuzzsproutToStrapi, type SyncResult } from "../../../lib/buzzsproutSync";
import { isBearerAuthorized } from "../../../lib/api-auth";

const SYNC_SECRET = (process.env.PODCAST_SYNC_SECRET || "").trim();

type ErrorResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SyncResult | ErrorResponse>
) {
  // Only allow POST (Cloud Scheduler sends POST)
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify shared secret — timing-safe comparison, rejects when secret is unset
  if (!isBearerAuthorized(req, SYNC_SECRET)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const result = await syncBuzzsproutToStrapi();

    // Never cache cron responses
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(result);
  } catch (error) {
    console.error("[buzzsprout-sync]", error instanceof Error ? error.message : error);
    return res.status(500).json({ error: "Sync failed" });
  }
}
