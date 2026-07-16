import type { NextApiRequest, NextApiResponse } from "next";
import { clearSessionCookie } from "../../../lib/auth/session";

/**
 * POST /api/auth/logout — clear the session cookie. POST-only so a stray link
 * prefetch can't log a user out.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false });
  }
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
