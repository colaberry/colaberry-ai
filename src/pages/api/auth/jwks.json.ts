import type { NextApiRequest, NextApiResponse } from "next";
import { authConfigured, getPublicJwk } from "../../../lib/auth/keys";

/**
 * Public JWKS for the shared Colaberry demo-auth JWT. Every demo (Voice Agent,
 * VTON, future) + Harsh's MCP gateway fetch this to VERIFY tokens colaberry.ai
 * signs — no shared secret ever leaves this app. Served with a short cache so
 * key rotation propagates within minutes. Returns an empty key set (never 500)
 * when auth keys aren't configured, so verifiers degrade gracefully.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  if (!authConfigured()) {
    return res.status(200).json({ keys: [] });
  }
  try {
    const jwk = await getPublicJwk();
    return res.status(200).json({ keys: [jwk] });
  } catch {
    return res.status(200).json({ keys: [] });
  }
}
