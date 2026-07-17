import type { NextApiRequest, NextApiResponse } from "next";
import { isAllowedOrigin } from "../../../lib/bot-defense";
import { clearSessionCookie } from "../../../lib/auth/session";

/**
 * POST /api/auth/logout — clear the session cookie. POST-only so a stray link
 * prefetch can't log a user out; origin-checked so a cross-site form can't force
 * a logout either. The real "Sign out" fetch is same-origin (no body, so no
 * content-type to require here). CSRF on logout is only an annoyance, but the
 * guard is free.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false });
  }
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ ok: false });
  }
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
