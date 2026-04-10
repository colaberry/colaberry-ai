import type { NextApiRequest, NextApiResponse } from "next";
import { isAdminAuthorized } from "../../lib/api-auth";
import {
  fetchAgents,
  fetchMCPServers,
  fetchSkills,
  fetchPodcastEpisodes,
} from "../../lib/cms";

/**
 * POST /api/index-now
 *
 * Submits all site URLs to IndexNow (Bing, Yandex) and pings Google
 * to trigger immediate crawling. Requires admin auth.
 *
 * IndexNow is the fastest path to ChatGPT citations because ChatGPT
 * uses Bing's index. Bing supports IndexNow natively.
 */

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.colaberry.ai"
).replace(/\/$/, "");

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "colaberry-ai-indexnow-key-2026";

const ADMIN_KEY = process.env.ADMIN_API_KEY || "";

/** Static routes with high SEO value. */
const STATIC_URLS = [
  "/",
  "/aixcelerator",
  "/aixcelerator/agents",
  "/aixcelerator/mcp",
  "/aixcelerator/skills",
  "/aixcelerator/tools",
  "/aixcelerator/ontology",
  "/aixcelerator/ecosystem",
  "/aixcelerator/solution-stacks",
  "/aixcelerator/agents/ontology",
  "/aixcelerator/agents/graph",
  "/aixcelerator/agents/collections",
  "/aixcelerator/mcp/ontology",
  "/aixcelerator/mcp/graph",
  "/aixcelerator/mcp/collections",
  "/aixcelerator/skills/ontology",
  "/aixcelerator/skills/graph",
  "/aixcelerator/skills/collections",
  "/resources/podcasts",
  "/resources/podcasts/ontology",
  "/resources/podcasts/graph",
  "/resources/podcasts/collections",
  "/industries",
  "/updates",
  "/search",
  "/request-demo",
  "/use-cases",
  "/llms.txt",
  "/llms-full.txt",
];

/** Industry slugs for /industries/[slug] pages. */
const INDUSTRY_SLUGS = [
  "agriculture",
  "energy",
  "oil-gas",
  "utilities",
  "healthcare",
  "biotech",
  "climate-tech",
  "manufacturing",
  "fintech",
  "supply-chain",
];

async function collectAllUrls(): Promise<string[]> {
  const urls = STATIC_URLS.map((p) => `${SITE_URL}${p}`);

  // Industry pages
  for (const slug of INDUSTRY_SLUGS) {
    urls.push(`${SITE_URL}/industries/${slug}`);
  }

  // Dynamic CMS pages — cap at 500 per type to stay within IndexNow 10k limit
  const [agentsR, mcpR, skillsR, podcastsR] = await Promise.allSettled([
    fetchAgents("public", { maxRecords: 500 }),
    fetchMCPServers("public", { maxRecords: 500 }),
    fetchSkills("public", { maxRecords: 500 }),
    fetchPodcastEpisodes({ maxRecords: 500 }),
  ]);

  if (agentsR.status === "fulfilled") {
    for (const a of agentsR.value) {
      if (a.slug) urls.push(`${SITE_URL}/aixcelerator/agents/${a.slug}`);
    }
  }
  if (mcpR.status === "fulfilled") {
    for (const m of mcpR.value) {
      if (m.slug) urls.push(`${SITE_URL}/aixcelerator/mcp/${m.slug}`);
    }
  }
  if (skillsR.status === "fulfilled") {
    for (const s of skillsR.value) {
      if (s.slug) urls.push(`${SITE_URL}/aixcelerator/skills/${s.slug}`);
    }
  }
  if (podcastsR.status === "fulfilled") {
    for (const p of podcastsR.value) {
      if (p.slug) urls.push(`${SITE_URL}/resources/podcasts/${p.slug}`);
    }
  }

  return urls;
}

/** Submit URLs to IndexNow (Bing + Yandex). Max 10,000 per request. */
async function submitToIndexNow(urls: string[]): Promise<{ status: number; body: string }> {
  const payload = {
    host: new URL(SITE_URL).host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls.slice(0, 10_000),
  };

  const resp = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  const body = await resp.text();
  return { status: resp.status, body };
}

/** Ping Google to re-crawl the sitemap. */
async function pingGoogle(): Promise<{ status: number }> {
  const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
  const resp = await fetch(
    `https://www.google.com/ping?sitemap=${sitemapUrl}`
  );
  return { status: resp.status };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAdminAuthorized(req, ADMIN_KEY)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const urls = await collectAllUrls();

    const [indexNowResult, googleResult] = await Promise.allSettled([
      submitToIndexNow(urls),
      pingGoogle(),
    ]);

    const indexNow =
      indexNowResult.status === "fulfilled"
        ? indexNowResult.value
        : { status: 0, body: String(indexNowResult.reason) };

    const google =
      googleResult.status === "fulfilled"
        ? googleResult.value
        : { status: 0 };

    return res.status(200).json({
      ok: true,
      urlCount: urls.length,
      indexNow: {
        status: indexNow.status,
        accepted: indexNow.status === 200 || indexNow.status === 202,
        body: indexNow.body.slice(0, 500),
      },
      google: {
        status: google.status,
        accepted: google.status === 200,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to submit URLs", detail: String(err) });
  }
}
