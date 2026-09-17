/**
 * GET /api/ai-dev-wire  → the day's AI Dev Wire (picks + feeds).
 * GET /api/ai-dev-wire?refresh=1  → force a live re-run (rate-limited in getWire).
 *
 * Runs the source pipeline server-side (public APIs, no keys/CORS), served from
 * an in-memory cache. The colaberry.ai page fetches this on load and on refresh.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getWire } from "../../lib/ai-dev-wire";
import type { WirePayload } from "../../lib/ai-dev-wire/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WirePayload | { error: string }>
): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const force = req.query.refresh === "1" || req.query.refresh === "true";

  try {
    const payload = await getWire(force);
    // Non-refresh loads are CDN-cacheable; a fresh copy is still a click away.
    res.setHeader(
      "Cache-Control",
      force ? "no-store" : "public, max-age=0, s-maxage=300, stale-while-revalidate=1800"
    );
    res.status(200).json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI Dev Wire pipeline failed";
    res.status(502).json({ error: msg });
  }
}
