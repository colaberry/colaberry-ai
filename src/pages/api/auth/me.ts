import type { NextApiRequest, NextApiResponse } from "next";
import { resolveSession } from "../../../lib/auth/session";

/**
 * GET /api/auth/me — current login state for the header/UI. Never cached.
 * Returns { authenticated:false } for anon; { authenticated:true, email } when
 * a valid session cookie is present.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ authenticated: false });
  }
  res.setHeader("Cache-Control", "no-store");
  const session = await resolveSession(req);
  if (!session) {
    return res.status(200).json({ authenticated: false });
  }
  return res.status(200).json({ authenticated: true, email: session.email, sub: session.sub });
}
