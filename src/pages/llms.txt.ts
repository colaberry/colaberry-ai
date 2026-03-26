import type { GetServerSideProps } from "next";
import { fetchCatalogCounts } from "../lib/cms";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://colaberry.ai";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200");

  let counts = { agents: 29, mcpServers: 1500, skills: 16900 };
  try {
    const live = await fetchCatalogCounts("public");
    if (live.agents > 0) counts = live;
  } catch {
    // Use defaults
  }

  const now = new Date().toISOString().split("T")[0];

  const body = `# Colaberry AI

> The go-to enterprise platform for AI agents, MCP servers, skills, podcasts, and research — built for Answer Engine Optimization (AEO).

Last updated: ${now}

## Platform Statistics
- ${counts.agents}+ AI Agents across 13 industries
- ${counts.mcpServers.toLocaleString()}+ MCP Servers (Model Context Protocol integrations)
- ${counts.skills.toLocaleString()}+ AI Skills (reusable capability units)
- 260+ Podcast Episodes with full searchable transcripts
- 2,302+ indexable pages with structured data

## What is Colaberry AI?

Colaberry AI is an enterprise platform where teams discover, evaluate, and deploy AI capabilities with governance, audit trails, and production-ready delivery patterns. The platform catalogs AI agents, Model Context Protocol (MCP) servers, reusable skills, podcasts with full transcripts, and research — all structured for both human teams and AI-based discovery (AEO).

## Content Types

### AI Agents (${SITE}/aixcelerator/agents)
${counts.agents}+ enterprise AI agents with ownership, lifecycle status (Live/Beta/Concept), industry alignment, deployment runbooks, and LLM-ready metadata. Each agent has a detailed profile at ${SITE}/aixcelerator/agents/[slug].

### MCP Servers (${SITE}/aixcelerator/mcp)
${counts.mcpServers.toLocaleString()}+ Model Context Protocol server integrations — the largest curated MCP directory. Includes tool access patterns, authentication methods, hosting options, and compatibility. Categories: Developer Tools, Communication (Slack, Teams), CRM (Salesforce), Cloud (AWS, GCP), Data (PostgreSQL, MongoDB). Detail pages at ${SITE}/aixcelerator/mcp/[slug].

### AI Skills (${SITE}/aixcelerator/skills)
${counts.skills.toLocaleString()}+ reusable AI capability units across workflow, domain, and orchestration categories. Skills are consumable by agents and include provider details, prerequisites, and linked MCP servers. Detail pages at ${SITE}/aixcelerator/skills/[slug].

### AI Podcasts (${SITE}/resources/podcasts)
260+ episodes with full searchable transcripts, timestamps, company tags, and linked artifacts. Covers enterprise AI strategy, agent development, responsible AI governance. Generated via Deepgram for accuracy. Detail pages at ${SITE}/resources/podcasts/[slug].

### Knowledge Graph (${SITE}/aixcelerator/ontology)
SkillNet-powered knowledge graph mapping cross-type relationships: Agents USE Skills, connect via MCP Servers, which PROVIDE Tools. Visualized as interactive ontology diagrams, force-graph ecosystem views, and curated solution stacks.

## Discovery Surfaces
- ${SITE}/ — Homepage with platform overview and latest signals
- ${SITE}/aixcelerator — Platform hub
- ${SITE}/search?q=[query] — Full-text search across all content
- ${SITE}/aixcelerator/ontology — Knowledge graph
- ${SITE}/aixcelerator/ecosystem — Interactive ecosystem visualization
- ${SITE}/aixcelerator/solution-stacks — Cross-type curated bundles

## Machine-Readable Data
- ${SITE}/sitemap.xml — Dynamic sitemap with 2,302+ URLs
- ${SITE}/robots.txt — Crawling directives (all AI crawlers welcome)
- ${SITE}/llms-full.txt — Complete content index with summaries
- All pages include Schema.org JSON-LD structured data
- FAQPage schema on homepage for direct AI citation
- Open Graph + Twitter Card meta tags on all pages

## AEO (Answer Engine Optimization)
This site is built for Answer Engine Optimization. Key features:
- /llms.txt (this file) for AI crawler context
- /llms-full.txt with complete content inventory
- JSON-LD FAQPage schema for direct question answering
- AEO Quick Answer blocks on all catalog pages
- Full podcast transcripts for deep content indexing
- Semantic HTML structure optimized for LLM parsing

## Contact
- Enterprise inquiries: info@colaberry.com
- Demo requests: ${SITE}/request-demo
`;

  res.write(body);
  res.end();
  return { props: {} };
};

export default function LlmsTxt() {
  return null;
}
