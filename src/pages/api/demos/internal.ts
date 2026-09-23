import type { NextApiRequest, NextApiResponse } from "next";
import { resolveSession } from "../../../lib/auth/session";
import { isInternalDemoViewer } from "../../../lib/auth/internalAccess";
import { internalDemos } from "../../../data/internalDemos";

export interface InternalDemoCard {
  slug: string;
  title: string;
  category: string;
  tagline: string;
  status: string;
}

/**
 * GET /api/demos/internal — the staff-only demo cards for the /demo hub.
 *
 * Everyone who isn't a signed-in Colaberry staff member gets an empty list
 * with a 200, never a 401/403: the response looks identical whether or not any
 * internal demo exists, so this endpoint can't be used to discover one.
 *
 * Only card-level fields are returned; the full record (launch URL included)
 * stays server-side until the gated detail page authorises the viewer.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ demos: InternalDemoCard[] }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ demos: [] });
  }

  // Per-user and never shared: must not land in a CDN or browser cache.
  res.setHeader("Cache-Control", "private, no-store");

  const session = await resolveSession(req);
  if (!session || !isInternalDemoViewer(session.email)) {
    return res.status(200).json({ demos: [] });
  }

  return res.status(200).json({
    demos: internalDemos.map((demo) => ({
      slug: demo.slug,
      title: demo.title,
      category: demo.category,
      tagline: demo.tagline,
      status: demo.status,
    })),
  });
}
