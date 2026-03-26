import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://colaberry.ai").replace(/\/$/, "");

  const body = [
    "# Colaberry AI — Answer Engine Optimized (AEO)",
    "# We welcome all AI crawlers. Content structured for LLM citation.",
    "",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /internal/",
    "",
    "# AI Crawlers — explicitly welcomed",
    "User-agent: GPTBot",
    "Allow: /",
    "",
    "User-agent: ClaudeBot",
    "Allow: /",
    "",
    "User-agent: PerplexityBot",
    "Allow: /",
    "",
    "User-agent: Google-Extended",
    "Allow: /",
    "",
    "User-agent: Bingbot",
    "Allow: /",
    "",
    "# AEO Resources",
    `# LLM manifest: ${siteUrl}/llms.txt`,
    `# Full content index: ${siteUrl}/llms-full.txt`,
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(body);
  res.end();

  return { props: {} };
};

export default function RobotsTxt() {
  return null;
}
