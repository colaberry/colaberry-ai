import type { NextApiRequest, NextApiResponse } from "next";
import {
  generateBotToken,
  hasRealBrowserHeaders,
  isAllowedOrigin,
  isKnownBot,
} from "../../lib/bot-defense";
import { checkRateLimit, getClientIp } from "../../lib/rate-limit";

/**
 * GET /api/bot-token
 *
 * Issues a short-lived HMAC-signed timing token that the demo-request form
 * (and any other form wired up in the future) embeds as the `_bt` field in
 * its POST body. The server-side `validateBotToken()` check enforces:
 *
 *  - token must be signed with the production `BOT_TOKEN_SECRET`
 *  - token must be at least 5 s old (real users take >5 s to fill a form)
 *  - token must be no more than 1 h old (limits replay window)
 *
 * Defense-in-depth notes:
 *  - Always returns 200 with `{ token: "" }` for bot / disallowed-origin
 *    requests so bots cannot probe which layer caught them (anti-enumeration,
 *    matches the silent-fake-success pattern on /api/demo-request).
 *  - Cache-Control: no-store so CDNs never serve a stale signed token.
 *  - Per-IP rate limit so a single client cannot burn through tokens.
 *  - If `BOT_TOKEN_SECRET` is unset, `generateBotToken()` returns "" and the
 *    endpoint gracefully degrades — the demo-request handler's feature flag
 *    `DEMO_REQUEST_REQUIRE_BOT_TOKEN` stays off until both envs are set.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ token: "" });
  }

  // Per-IP flood guard — a single client should not need more than ~30
  // tokens in 10 min (form mounts + retries). Anything above is abuse.
  const rl = checkRateLimit("bot-token-ip", getClientIp(req), 30, 10 * 60_000);
  if (rl.limited) {
    res.setHeader("Retry-After", String(rl.retryAfterSec));
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ token: "" });
  }

  // Bot defense — do not hand out signed tokens to known bots, to
  // requests missing real-browser headers, or to cross-origin requests.
  // Silent empty-token response so bots cannot enumerate the layer.
  if (
    isKnownBot(req) ||
    !hasRealBrowserHeaders(req) ||
    !isAllowedOrigin(req)
  ) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ token: "" });
  }

  const token = generateBotToken();
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ token });
}
