/**
 * Audio Stream Proxy — streams Buzzsprout-hosted audio through our server.
 *
 * Buzzsprout's Cloudflare protection serves JS challenge pages to <audio>
 * element requests (503). Server-side fetch bypasses this since it presents
 * a regular HTTP client. The native AudioPlayerUI stays unchanged — only
 * the src URL routes through this proxy.
 *
 * Security: Only allows Buzzsprout audio URLs. Rate-limited per IP.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { checkRateLimit, getClientIp } from "../../lib/rate-limit";

const ALLOWED_HOST = "www.buzzsprout.com";
const BUZZSPROUT_PATH_RE = /^\/\d+\/episodes\/\d+-[\w-]+\.mp3$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limit: 30 requests per minute per IP
  const ip = getClientIp(req);
  const rl = checkRateLimit("audio", ip, 30, 60_000);
  if (rl.limited) {
    res.setHeader("Retry-After", String(rl.retryAfterSec));
    return res.status(429).json({ error: "Too many requests" });
  }

  const rawUrl = typeof req.query.url === "string" ? req.query.url : "";
  if (!rawUrl) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  // Validate: only allow Buzzsprout audio URLs
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  if (parsed.protocol !== "https:" || parsed.host !== ALLOWED_HOST || !BUZZSPROUT_PATH_RE.test(parsed.pathname)) {
    return res.status(403).json({ error: "Only Buzzsprout audio URLs are allowed" });
  }

  try {
    const upstream = await fetch(rawUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ColaberryAI/1.0)",
        Accept: "audio/mpeg, audio/*, */*",
      },
      redirect: "follow",
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Upstream returned ${upstream.status}` });
    }

    // Forward audio headers
    const contentType = upstream.headers.get("content-type") || "audio/mpeg";
    const contentLength = upstream.headers.get("content-length");

    res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Stream the response body
    if (upstream.body) {
      const reader = upstream.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      };
      await pump();
    } else {
      // Fallback: buffer entire response (shouldn't happen with fetch streaming)
      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.end(buffer);
    }
  } catch (err) {
    if (!res.headersSent) {
      return res.status(502).json({ error: "Failed to fetch audio" });
    }
    res.end();
  }
}

export const config = {
  api: {
    responseLimit: false, // Allow large audio files
  },
};
