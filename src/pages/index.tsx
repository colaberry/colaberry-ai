import Layout from "../components/Layout";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import type { GetStaticProps } from "next";
import type { ContentTypeName } from "../lib/ontologyTypes";
import { useCallback, useEffect, useRef, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import {
  fetchAgents,
  fetchSkills,
  fetchMCPServers,
  fetchPodcastEpisodes,
  fetchUseCases,
  fetchCatalogCounts,
  type Agent,
  type Skill,
  type MCPServer,
  type PodcastEpisode,
  type UseCase,
} from "../lib/cms";
// heroImage available from ../lib/media if needed
import { seoTags, type SeoMeta } from "../lib/seo";

type HomePodcastSignal = {
  id: number;
  slug: string;
  title: string;
  publishedDate: string | null;
  podcastType?: string | null;
  coverImageUrl?: string | null;
  duration?: string | null;
  episodeNumber?: number | null;
};

type HomeAgentSignal = {
  id: number;
  slug: string;
  name: string;
  category?: string | null;
  lastUpdated?: string | null;
  rating?: number | null;
  usageCount?: number | null;
};

type HomeUseCaseSignal = {
  id: number;
  slug: string;
  title: string;
  lastUpdated?: string | null;
  verified?: boolean | null;
  linkedCount: number;
};

type HomeMcpSignal = {
  id: number;
  slug: string;
  name: string;
  category?: string | null;
  lastUpdated?: string | null;
  rating?: number | null;
  usageCount?: number | null;
};

type HomeSkillSignal = {
  id: number;
  slug: string;
  name: string;
  category?: string | null;
  lastUpdated?: string | null;
  rating?: number | null;
  usageCount?: number | null;
};

type HomeProps = {
  latestPodcasts: HomePodcastSignal[];
  trendingPodcasts: HomePodcastSignal[];
  latestAgents: HomeAgentSignal[];
  trendingAgents: HomeAgentSignal[];
  latestSkills: HomeSkillSignal[];
  trendingSkills: HomeSkillSignal[];
  latestUseCases: HomeUseCaseSignal[];
  trendingUseCases: HomeUseCaseSignal[];
  latestMCPs: HomeMcpSignal[];
  trendingMCPs: HomeMcpSignal[];
  catalogCounts: { agents: number; mcpServers: number; skills: number };
};

/* ── Integration chip logos (20×20 accurate brand SVGs from Simple Icons) ── */
const _sz = { width: 20, height: 20, viewBox: "0 0 24 24", className: "shrink-0" };
const INTEGRATION_CHIPS: { name: string; logo: React.ReactNode }[] = [
  /* Slack — official 4-color mark */
  { name: "Slack", logo: <svg {..._sz}><path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.163 0a2.528 2.528 0 012.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.163 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 01-2.52-2.523 2.527 2.527 0 012.52-2.52h6.315A2.528 2.528 0 0124 15.163a2.528 2.528 0 01-2.522 2.523h-6.315z" fill="#E01E5A"/></svg> },
  /* Microsoft Teams — T in a square */
  { name: "Microsoft Teams", logo: <svg {..._sz}><path d="M20.625 8.5h-6.25a.625.625 0 00-.625.625v6.25c0 .345.28.625.625.625h6.25c.345 0 .625-.28.625-.625v-6.25a.625.625 0 00-.625-.625zm-3.125 5.625h-1.875V11.75H17.5v2.375zm1.875 0H17.5V11.75h1.875v2.375zM16.5 7.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm4.75 1a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zm0 1.5a2.5 2.5 0 00-1.625.6V10a1.25 1.25 0 00-1.25-1.25h-.75a3 3 0 001-2.25 3 3 0 00-6 0c0 .924.418 1.75 1.075 2.3H9.625C8.728 8.8 8 9.528 8 10.425v5.95C8 17.272 8.728 18 9.625 18H17.5c.897 0 1.625-.728 1.625-1.625v-.85A2.5 2.5 0 0024 13a2.5 2.5 0 00-2.75-2.5zM14.5 6.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" fill="#5B5FC7"/></svg> },
  /* Google Drive — triangle */
  { name: "Google Drive", logo: <svg {..._sz}><path d="M7.71 3.5L1.15 15l2.76 4.79L10.47 8.3z" fill="#0066DA"/><path d="M22.85 15H15.6L8.96 3.5h7.16z" fill="#00AC47"/><path d="M7.71 3.5L1.15 15h7.25l6.6-11.5z" fill="#00832D" opacity=".001"/><path d="M14.17 15l3.39 4.79h-7.17L7.63 15z" fill="#EA4335"/><path d="M22.85 15H15.6l1.96 4.79h7.17z" fill="#FFBA00"/><path d="M3.91 19.79l3.72-4.79H1.15z" fill="#00AC47"/><path d="M8.96 3.5L1.15 15l2.76 4.79 6.56-11.49z" fill="#0066DA" opacity=".001"/><path d="M15.6 15H7.63l2.76 4.79h7.17z" fill="#EA4335" opacity=".001"/></svg> },
  /* Salesforce — cloud */
  { name: "Salesforce", logo: <svg {..._sz}><path d="M10.006 5.17a4.639 4.639 0 013.497-1.592 4.664 4.664 0 014.372 3.068 3.87 3.87 0 012.879 3.726c0 2.143-1.737 3.88-3.88 3.88H5.932a3.248 3.248 0 01-3.215-3.686 3.248 3.248 0 012.4-2.56 4.083 4.083 0 014.89-2.836z" fill="#00A1E0"/></svg> },
  /* ServiceNow — ring */
  { name: "ServiceNow", logo: <svg {..._sz}><path d="M12 .5C5.648.5.5 5.648.5 12S5.648 23.5 12 23.5 23.5 18.352 23.5 12 18.352.5 12 .5zm0 17.55a6.048 6.048 0 110-12.097 6.048 6.048 0 010 12.098z" fill="#81B5A1"/></svg> },
  /* Workday — sunrise */
  { name: "Workday", logo: <svg {..._sz}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#F68D2E"/><path d="M12 6a1 1 0 011 1v2.5a1 1 0 01-2 0V7a1 1 0 011-1zm4.95 2.05a1 1 0 010 1.414l-1.768 1.768a1 1 0 11-1.414-1.414l1.768-1.768a1 1 0 011.414 0zM7.05 8.05a1 1 0 011.414 0l1.768 1.768a1 1 0 11-1.414 1.414L7.05 9.464a1 1 0 010-1.414zM12 11a3 3 0 100 6 3 3 0 000-6z" fill="#fff"/></svg> },
  /* Jira — official mark */
  { name: "Jira", logo: <svg {..._sz}><path d="M11.571 11.513H0a5.218 5.218 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.575 24V12.518a1.005 1.005 0 00-1.005-1.005z" fill="#2684FF"/><path d="M5.783 5.726H17.35A5.218 5.218 0 0012.116.512H9.989V-1.55A5.217 5.217 0 004.776 3.667v11.488a1.005 1.005 0 001.007 1.006z" fill="#2684FF" opacity=".65" transform="translate(0 5.726)"/></svg> },
  /* Okta — blue circle */
  { name: "Okta", logo: <svg {..._sz}><path d="M12 0C5.389 0 0 5.389 0 12s5.389 12 12 12 12-5.389 12-12S18.611 0 12 0zm0 18a6 6 0 110-12 6 6 0 010 12z" fill="#007DC1"/></svg> },
  /* Zendesk — Z shape */
  { name: "Zendesk", logo: <svg {..._sz}><path d="M11.088 2.77v12.98L0 2.77h11.088zM11.088 21.23a5.544 5.544 0 110-11.088 5.544 5.544 0 010 11.088zM12.912 21.23V8.25L24 21.23H12.912zM12.912 2.77a5.544 5.544 0 110 11.088 5.544 5.544 0 010-11.088z" fill="currentColor" className="text-[#03363D] dark:text-[#5EEAD4]"/></svg> },
  /* Snowflake — asterisk */
  { name: "Snowflake", logo: <svg {..._sz}><path d="M21.854 14.49l-1.265-.734 1.09-.633a.636.636 0 00.233-.87.637.637 0 00-.87-.233l-1.09.633.004-1.266a.636.636 0 00-.636-.638.636.636 0 00-.635.635l-.005 1.97-3.39 1.96v-3.92l1.7-1.7a.636.636 0 000-.9.636.636 0 00-.9 0l-.8.8V8.33a.636.636 0 00-1.27 0v1.264l-.804-.804a.636.636 0 00-.9.9l1.704 1.704v3.919l-3.39-1.957-.005-1.97a.636.636 0 00-1.271.002l.004 1.266-1.09-.633a.636.636 0 10-.636 1.103l1.09.633-1.266.734a.636.636 0 10.636 1.102l1.968-1.138 3.39 1.958-3.39 1.957-1.968-1.137a.636.636 0 10-.636 1.102l1.266.734-1.09.633a.636.636 0 00.636 1.102l1.09-.633-.004 1.266a.636.636 0 001.271.003l.005-1.97 3.39-1.958v3.92l-1.704 1.703a.636.636 0 00.9.9l.804-.803V22.7a.636.636 0 001.271 0v-1.265l.8.8a.636.636 0 10.9-.9l-1.7-1.7v-3.92l3.39 1.958.005 1.97a.636.636 0 001.271-.003l-.004-1.266 1.09.633a.636.636 0 10.636-1.102l-1.09-.633 1.265-.734a.636.636 0 10-.636-1.102l-1.967 1.137-3.39-1.957 3.39-1.958 1.967 1.138a.636.636 0 10.636-1.102z" fill="#29B5E8"/></svg> },
  /* AWS — smile arrow */
  { name: "AWS", logo: <svg {..._sz}><path d="M6.763 10.036a4.58 4.58 0 00.15 1.2c.1.34.22.7.39 1.06.06.12.08.24.08.34 0 .15-.09.3-.28.44l-.92.62c-.13.09-.26.13-.38.13-.15 0-.3-.07-.44-.22a4.54 4.54 0 01-.53-.69 6.4 6.4 0 01-.46-.87c-1.14 1.35-2.58 2.02-4.3 2.02-1.23 0-2.21-.35-2.93-1.05-.72-.7-1.08-1.63-1.08-2.8 0-1.24.44-2.24 1.33-3.02.89-.77 2.07-1.16 3.56-1.16.49 0 1 .04 1.54.12.53.08 1.08.2 1.66.34V5.6c0-1.1-.23-1.88-.69-2.32-.47-.44-1.27-.66-2.4-.66-.52 0-1.05.06-1.6.19-.55.13-1.08.3-1.6.52-.24.1-.41.16-.52.19a.88.88 0 01-.22.04c-.2 0-.3-.14-.3-.43V2.5c0-.22.03-.39.09-.5.06-.11.18-.22.37-.33.52-.27 1.14-.5 1.87-.68A8.96 8.96 0 013.62 0h.01z" fill="#FF9900" transform="translate(4 4) scale(0.85)"/><path d="M14.778 19.29c-1.94 1.43-4.75 2.19-7.17 2.19-3.39 0-6.45-1.25-8.76-3.34-.18-.16-.02-.38.2-.26 2.49 1.45 5.58 2.33 8.77 2.33 2.15 0 4.51-.45 6.69-1.37.33-.14.6.22.27.45z" fill="#FF9900"/><path d="M15.607 18.33c-.25-.32-1.64-.15-2.27-.08-.19.02-.22-.14-.05-.26 1.11-.78 2.93-.56 3.15-.3.21.27-.06 2.1-1.1 2.97-.16.13-.31.06-.24-.11.23-.58.75-1.9.51-2.22z" fill="#FF9900"/></svg> },
  /* GitHub — octocat */
  { name: "GitHub", logo: <svg {..._sz}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor" className="text-zinc-800 dark:text-zinc-200"/></svg> },
];

export default function Home({
  latestPodcasts,
  latestAgents,
  latestSkills,
  latestUseCases,
  latestMCPs,
  trendingPodcasts,
  trendingAgents,
  trendingSkills,
  trendingUseCases,
  trendingMCPs,
  catalogCounts,
}: HomeProps) {
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k+` : `${n}+`;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- false positive: used at line ~492
  const industries = [
    { name: "Agriculture", slug: "agriculture", icon: "leaf" as const },
    { name: "Energy", slug: "energy", icon: "droplet" as const },
    { name: "Utilities", slug: "utilities", icon: "tower" as const },
    {
      name: "Healthcare & Life Sciences",
      slug: "healthcare-life-sciences",
      icon: "dna" as const,
    },
    { name: "Climate Tech", slug: "climate-tech", icon: "leaf" as const },
    { name: "Manufacturing", slug: "manufacturing", icon: "factory" as const },
    { name: "Fintech", slug: "fintech", icon: "truck" as const },
    { name: "Supply Chain", slug: "supply-chain", icon: "truck" as const },
  ];

  const catalogs: CatalogItem[] = [
    {
      href: "/aixcelerator/agents",
      title: "AI Agents",
      description: `${catalogCounts.agents || 160}+ enterprise agents with ownership, runbooks, and deployment readiness across 13 industries.`,
      meta: `${fmt(catalogCounts.agents || 160)} agents`,
      iconType: "agent",
      gradient: "from-zinc-900 via-zinc-800 to-zinc-900",
      accentColor: "#ef4444",
    },
    {
      href: "/aixcelerator/mcp",
      title: "MCP Servers",
      description: "1,500+ Model Context Protocol servers with tool access, connectors, and integration templates.",
      meta: "1.5k+ servers",
      iconType: "mcp",
      gradient: "from-zinc-900 via-zinc-800 to-zinc-950",
      accentColor: "#3b82f6",
    },
    {
      href: "/aixcelerator/skills",
      title: "AI Skills",
      description: "16,900+ reusable capability units across workflow, domain, and orchestration categories.",
      meta: "16.9k+ skills",
      iconType: "skill",
      gradient: "from-zinc-900 via-zinc-800 to-zinc-900",
      accentColor: "#f59e0b",
    },
    /* Use cases hidden for Release-1.0
    {
      href: "/solutions",
      title: "Use Cases",
      description: "Solution blueprints mapped to outcomes and operating models.",
      meta: "Solutions",
      iconType: "tool",
      gradient: "from-zinc-900 via-zinc-800 to-zinc-900",
      accentColor: "#10b981",
    },
    */
    {
      href: "/resources/podcasts",
      title: "AI Podcasts",
      description: "246 episodes with full transcripts, timestamps, and linked artifacts from Colaberry AI.",
      meta: "246 episodes",
      iconType: "podcast",
      gradient: "from-zinc-900 via-zinc-800 to-zinc-950",
      accentColor: "#a78bfa",
    },
    {
      href: "/resources/books",
      title: "Books & Research",
      description: "Enterprise reference material, delivery frameworks, and responsible AI research.",
      meta: "Research",
      iconType: "skill",
      gradient: "from-zinc-900 via-zinc-800 to-zinc-900",
      accentColor: "#22d3ee",
    },
    {
      href: "/aixcelerator/ontology",
      title: "Knowledge Graph",
      description: "Knowledge graph ontology mapping agents, skills, MCPs, and tools into a structured intelligence layer.",
      meta: "Ontology",
      iconType: "mcp",
      gradient: "from-zinc-900 via-zinc-800 to-zinc-950",
      accentColor: "#f87171",
    },
  ];

  const platformTabs = [
    {
      id: "agents" as const,
      label: "Agents",
      title: "Agents & assistants catalog",
      description: "Adopt agents with clear ownership, status, and workflow alignment — ready for rollout. Browse by industry, deployment stage, and readiness level.",
      href: "/aixcelerator/agents",
      metrics: [
        { value: fmt(catalogCounts.agents), label: "Agent profiles" },
        { value: "14", label: "Industries" },
        { value: fmt(catalogCounts.agents), label: "Public agents" },
      ],
    },
    {
      id: "mcp" as const,
      label: "MCP",
      title: "MCP integration library",
      description: "Standardize tool access via MCP with integration-ready server patterns and endpoints. Connect your existing stack with governed, tested connectors.",
      href: "/aixcelerator/mcp",
      metrics: [
        { value: fmt(catalogCounts.mcpServers), label: "MCP servers" },
        { value: "12", label: "Tool categories" },
        { value: "100%", label: "Tested connectors" },
      ],
    },
    {
      id: "skills" as const,
      label: "Skills",
      title: "Reusable AI skill library",
      description: "Discover modular, composable skills that agents use to execute tasks — from data extraction to code generation. Browse by category, source, and compatibility.",
      href: "/aixcelerator/skills",
      metrics: [
        { value: fmt(catalogCounts.skills), label: "Skills indexed" },
        { value: "10", label: "Categories" },
        { value: "Composable", label: "Architecture" },
      ],
    },
    {
      id: "observability" as const,
      label: "Observability",
      title: "Observability + evaluation",
      description: "Track outcomes and failures, then close the loop with evaluations to improve reliability. Monitor agent performance across deployment stages.",
      href: "/aixcelerator",
      metrics: [
        { value: "Real-time", label: "Performance data" },
        { value: "Full", label: "Lifecycle tracking" },
        { value: "Built-in", label: "Eval frameworks" },
      ],
    },
    {
      id: "security" as const,
      label: "Security",
      title: "Security by design",
      description: "Access controls, data boundaries, and governance workflows designed for enterprise. Every agent and connector governed from day one.",
      href: "/aixcelerator",
      metrics: [
        { value: "SOC 2", label: "Compliant" },
        { value: "RBAC", label: "Access control" },
        { value: "Full", label: "Audit trail" },
      ],
    },
    {
      id: "workspaces" as const,
      label: "Workspaces",
      title: "Industry workspaces",
      description: "Bring domain context into delivery with repeatable playbooks and patterns. Tailored for agriculture, healthcare, oil & gas, biotech, and more.",
      href: "/industries",
      metrics: [
        { value: "10", label: "Industries" },
        { value: "Custom", label: "Playbooks" },
        { value: "Domain", label: "Intelligence" },
      ],
    },
    {
      id: "developer" as const,
      label: "Developer",
      title: "Developer control",
      description: "Use a clean platform surface that supports code-level control with faster patterns when needed. API-first design with full SDK access.",
      href: "/aixcelerator",
      metrics: [
        { value: "REST", label: "API access" },
        { value: "Full", label: "SDK support" },
        { value: "CI/CD", label: "Integration" },
      ],
    },
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://colaberry.ai";
  const metaDescription =
    "Colaberry AI is a marketplace and destination for AI agents, MCP servers, skills, podcasts, case studies, and trusted research-built for SEO and LLM indexing.";
  const seoMeta: SeoMeta = {
    title: "Colaberry AI | The go-to destination for agents, MCPs, and AI knowledge",
    description: metaDescription,
    canonical: siteUrl,
    ogImage: "/og/homepage.png",
    ogImageAlt: "Colaberry AI — The go-to destination for AI agents, MCP servers, skills, and podcasts",
  };
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Colaberry AI",
      url: siteUrl,
      logo: `${siteUrl}/brand/colaberry-ai-logo.png`,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Colaberry AI",
      url: siteUrl,
      description: metaDescription,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Colaberry AI?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `Colaberry AI is an enterprise platform for discovering, evaluating, and deploying AI agents, MCP servers, skills, and research. It catalogs ${catalogCounts.agents}+ AI agents, ${catalogCounts.mcpServers.toLocaleString()}+ MCP servers, and ${catalogCounts.skills.toLocaleString()}+ reusable AI skills — all structured for both human teams and LLM-based discovery.`,
          },
        },
        {
          "@type": "Question",
          name: "What are MCP servers and why do enterprises need them?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `Model Context Protocol (MCP) servers provide standardized tool access and integration templates for AI agents. Colaberry AI catalogs ${catalogCounts.mcpServers.toLocaleString()}+ MCP servers across categories like Slack, Salesforce, GitHub, and AWS — enabling enterprises to connect AI agents to their existing tool stack through a unified protocol.`,
          },
        },
        {
          "@type": "Question",
          name: "How is Colaberry AI optimized for Answer Engine Optimization (AEO)?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Colaberry AI is built for AEO — Answer Engine Optimization. Every page includes JSON-LD structured data, the site provides /llms.txt for AI crawlers (GPTBot, ClaudeBot, PerplexityBot), and all 260+ podcast episodes include full searchable transcripts. The Colaberry Knowledge Graph maps relationships between agents, skills, MCP servers, and tools — making the content natively accessible to AI answer engines like ChatGPT, Perplexity, and Claude.",
          },
        },
      ],
    },
  ];

  return (
    <Layout>
      <Head>
        <title>{seoMeta.title}</title>
        {seoTags(seoMeta).map(({ key, ...props }) => (
          "rel" in props ? <link key={key} {...props} /> : <meta key={key} {...props} />
        ))}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>
      {/* ---- Hero (dark animated hero) ---- */}
      <section className="-mx-4 sm:mx-0 relative overflow-hidden rounded-none sm:rounded-2xl" style={{ background: "var(--gradient-hero)" }}>
        {/* Animated gradient mesh background */}
        <div className="hero-gradient-mesh" aria-hidden="true">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-orb hero-orb-center" />
        </div>

        {/* Concentric rings (depth effect) */}
        <div className="hero-concentric-rings" aria-hidden="true">
          <div className="hero-ring hero-ring-1" />
          <div className="hero-ring hero-ring-2" />
          <div className="hero-ring hero-ring-3" />
        </div>

        {/* Subtle grid overlay */}
        <div className="animated-signal-grid pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true" />

        {/* Radial vignette for depth */}
        <div className="hero-vignette" aria-hidden="true" />

        {/* Floating content-type icon nodes (constellation layout) */}
        <div className="hero-floating-nodes" aria-hidden="true">
          {/* Agents node */}
          <div className="hero-node hero-node-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.3 24.3 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M12 21a9 9 0 0 0 9-9m-9 9a9 9 0 0 1-9-9" /></svg>
          </div>
          {/* MCP node */}
          <div className="hero-node hero-node-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-13.5-3a3 3 0 0 1 0-6h13.5a3 3 0 1 1 0 6M6 6.75h.008v.008H6V6.75Zm0 7.5h.008v.008H6v-.008Zm0 7.5h.008v.008H6v-.008Z" /></svg>
          </div>
          {/* Skills node */}
          <div className="hero-node hero-node-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>
          </div>
          {/* Podcasts node */}
          <div className="hero-node hero-node-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" /></svg>
          </div>
          {/* Knowledge Graph node */}
          <div className="hero-node hero-node-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
          </div>
        </div>

        {/* Content — centered layout */}
        <div className="relative z-10 mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-20 md:px-10 lg:py-24">
          <div
            className="rise-in rise-delay-1 kicker-chip mx-auto inline-flex rounded-full px-4 py-1.5 tracking-[0.2em]"
            style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#FAFAFA" }}
          >
            <span className="kicker-chip-dot" />
            Enterprise AI Platform
          </div>

          <h1 className="mt-6 font-sans text-display-md font-bold text-white sm:text-display-lg md:text-display-xl lg:text-display-2xl xl:text-display-hero">
            Discover, govern, and scale{" "}
            <span className="text-gradient">enterprise AI</span>
          </h1>

          <p className="rise-in rise-delay-3 mx-auto mt-6 max-w-2xl text-body-lg leading-relaxed text-zinc-400">
            A unified catalog where teams discover, evaluate, and deploy AI agents, MCP servers, skills, and research — governed and structured for both people and LLMs.
          </p>

          <div className="rise-in mt-8 flex flex-wrap justify-center gap-4" style={{ animationDelay: "0.32s" }}>
            <Link href="/request-demo" className="btn btn-cta" data-tour="hero-cta">
              Book a demo
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/aixcelerator"
              className="btn"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "#FAFAFA", background: "rgba(255,255,255,0.06)" }}
            >
              Explore platform
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Trust metrics ---- */}
      <section className="reveal section-spacing">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatedMetric value="8+" label="Industries served" note="Agriculture to fintech" delay={0} />
          <AnimatedMetric value={fmt(catalogCounts.agents)} label="Agent profiles" note="Cataloged and governed" delay={150} />
          <AnimatedMetric value={fmt(catalogCounts.mcpServers)} label="MCP servers" note="Integration-ready connectors" delay={300} />
          <AnimatedMetric value={fmt(catalogCounts.skills)} label="Skills indexed" note="Reusable capability units" delay={450} />
        </div>
      </section>

      <hr className="section-divider" />

      <section className="section-spacing">
        <div className="reveal">
          <SectionHeader
            kicker="Explore the catalog"
            title="A structured destination for agents, MCPs, podcasts, and research"
            description="Give teams and LLMs a single place to discover, compare, and deploy intelligence."
          />
        </div>
        <div className="stagger-grid mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-tour="catalog-grid">
          {catalogs.map((catalog) => (
            <CatalogCard key={catalog.title} {...catalog} />
          ))}
        </div>
      </section>

      {/* ---- Signal Dashboard (tabbed consolidation) ---- */}
      <SignalDashboard
        latestAgents={latestAgents}
        trendingAgents={trendingAgents}
        latestSkills={latestSkills}
        trendingSkills={trendingSkills}
        latestMCPs={latestMCPs}
        trendingMCPs={trendingMCPs}
        latestPodcasts={latestPodcasts}
        trendingPodcasts={trendingPodcasts}
        latestUseCases={latestUseCases}
        trendingUseCases={trendingUseCases}
      />

      <PlatformTabsSection tabs={platformTabs} />

      <section className="reveal section-spacing surface-panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            kicker="Connect your stack"
            title="Integrations-ready from day one"
            description="Build assistants that can act across your tools — using a standardized MCP surface."
          />
          <Link href="/aixcelerator/mcp" className="btn btn-secondary shrink-0">
            Explore MCP servers
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {INTEGRATION_CHIPS.map(({ name, logo }) => (
            <Link
              key={name}
              href={`/aixcelerator/mcp?q=${encodeURIComponent(name.toLowerCase())}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-white"
            >
              {logo}
              {name}
            </Link>
          ))}
        </div>
      </section>

      {/* Industries section hidden for Release-1.0 — re-enable when industry pages have content
      <section className="reveal section-spacing">
        <SectionHeader
          kicker="Industry expertise"
          title="Proven success across industries"
          description="Domain-specific playbooks and patterns for your sector."
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {industries.map((item) => (
            <IndustryTile key={item.slug} href={`/industries/${item.slug}`} title={item.name} icon={item.icon} />
          ))}
        </div>
      </section>
      */}

      <section className="reveal section-spacing surface-panel p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionHeader
              kicker="Explore next"
              title="Resources, solutions, and updates"
              description="Dedicated landing spots for podcasts, books, white papers, case studies, and news."
            />
          </div>
          <Link
            href="/resources"
            className="btn btn-primary shrink-0"
          >
            Explore resources
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink
            href="/resources/books#trust-before-intelligence"
            title="Trust Before Intelligence"
            description="Foundational research on responsible AI."
          />
          <QuickLink href="/resources/podcasts" title="Podcasts" description="Audio insights, transcripts, and AI narratives." />
          {/* Hidden for Release-1.0: Solutions, Case Studies, News & product */}
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const allowPrivate = process.env.NEXT_PUBLIC_SHOW_PRIVATE === "true";
  const visibilityFilter = allowPrivate ? undefined : "public";
  const fetchOrEmpty = async <T,>(label: string, task: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await task();
    } catch (error) {
      console.error(`[home:getStaticProps] ${label} failed`, error);
      return fallback;
    }
  };

  // Parallelize all CMS fetches for 60-80% faster ISR regeneration
  const [
    latestPodcasts,
    trendingPodcasts,
    latestAgentsRaw,
    trendingAgentsRaw,
    latestSkillsRaw,
    trendingSkillsRaw,
    latestUseCasesRaw,
    trendingUseCasesRaw,
    latestMCPRaw,
    trendingMCPRaw,
    catalogCounts,
  ] = await Promise.all([
    fetchOrEmpty("latestPodcasts", () => fetchPodcastEpisodes({ maxRecords: 6, sortBy: "latest" }), [] as PodcastEpisode[]),
    fetchOrEmpty("trendingPodcasts", () => fetchPodcastEpisodes({ maxRecords: 80, sortBy: "trending" }), [] as PodcastEpisode[]),
    fetchOrEmpty("latestAgents", () => fetchAgents(visibilityFilter, { maxRecords: 6, sortBy: "latest" }), [] as Agent[]),
    fetchOrEmpty("trendingAgents", () => fetchAgents(visibilityFilter, { maxRecords: 300 }), [] as Agent[]),
    fetchOrEmpty("latestSkills", () => fetchSkills(visibilityFilter, { maxRecords: 6, sortBy: "latest" }), [] as Skill[]),
    fetchOrEmpty("trendingSkills", () => fetchSkills(visibilityFilter, { maxRecords: 300, sortBy: "latest" }), [] as Skill[]),
    fetchOrEmpty("latestUseCases", () => fetchUseCases(visibilityFilter, { maxRecords: 6, sortBy: "latest" }), [] as UseCase[]),
    fetchOrEmpty("trendingUseCases", () => fetchUseCases(visibilityFilter, { maxRecords: 300, sortBy: "latest" }), [] as UseCase[]),
    fetchOrEmpty("latestMCP", () => fetchMCPServers(visibilityFilter, { maxRecords: 6, sortBy: "latest" }), [] as MCPServer[]),
    fetchOrEmpty("trendingMCP", () => fetchMCPServers(visibilityFilter, { maxRecords: 300 }), [] as MCPServer[]),
    fetchOrEmpty("catalogCounts", () => fetchCatalogCounts(visibilityFilter), { agents: 0, mcpServers: 0, skills: 0, tools: 0, podcasts: 0 }),
  ]);

  const latestAgents = sortAgentsByDate(latestAgentsRaw).slice(0, 6).map(toHomeAgentSignal);
  const trendingAgents = sortAgentsByTrending(trendingAgentsRaw).slice(0, 6).map(toHomeAgentSignal);
  const latestSkills = sortSkillsByDate(latestSkillsRaw).slice(0, 6).map(toHomeSkillSignal);
  const trendingSkills = sortSkillsByTrending(trendingSkillsRaw).slice(0, 6).map(toHomeSkillSignal);
  const latestUseCases = sortUseCasesByDate(latestUseCasesRaw).slice(0, 6).map(toHomeUseCaseSignal);
  const trendingUseCases = sortUseCasesByTrending(trendingUseCasesRaw).slice(0, 6).map(toHomeUseCaseSignal);
  const latestMCPs = sortMCPByDate(latestMCPRaw).slice(0, 6).map(toHomeMcpSignal);
  const trendingMCPs = sortMCPByTrending(trendingMCPRaw).slice(0, 6).map(toHomeMcpSignal);

  return {
    props: {
      latestPodcasts: latestPodcasts.map(toHomePodcastSignal),
      trendingPodcasts: trendingPodcasts.slice(0, 6).map(toHomePodcastSignal),
      latestAgents,
      trendingAgents,
      latestSkills,
      trendingSkills,
      latestUseCases,
      trendingUseCases,
      latestMCPs,
      trendingMCPs,
      catalogCounts,
    },
    revalidate: 600,
  };
};

const SIGNAL_TABS = ["Agents", "Skills", "MCP", "Podcasts"] as const; // Use Cases hidden for Release-1.0
type SignalTab = (typeof SIGNAL_TABS)[number];

function SignalDashboard({
  latestAgents,
  trendingAgents,
  latestSkills,
  trendingSkills,
  latestMCPs,
  trendingMCPs,
  latestPodcasts,
  trendingPodcasts,
  latestUseCases: _latestUseCases,
  trendingUseCases: _trendingUseCases,
}: {
  latestAgents: HomeAgentSignal[];
  trendingAgents: HomeAgentSignal[];
  latestSkills: HomeSkillSignal[];
  trendingSkills: HomeSkillSignal[];
  latestMCPs: HomeMcpSignal[];
  trendingMCPs: HomeMcpSignal[];
  latestPodcasts: HomePodcastSignal[];
  trendingPodcasts: HomePodcastSignal[];
  latestUseCases: HomeUseCaseSignal[];
  trendingUseCases: HomeUseCaseSignal[];
}) {
  const [activeTab, setActiveTab] = useState<SignalTab>("Agents");

  const onTabChange = useCallback((tab: SignalTab) => {
    setActiveTab(tab);
  }, []);

  return (
    <section className="reveal section-spacing">
      <SectionHeader
        kicker="Platform signals"
        title="Latest and trending across the catalog"
        description="Fresh profiles and high-interest items across agents, skills, MCP servers, podcasts, and use cases."
      />

      {/* Tab bar */}
      <div
        className="mt-6 flex gap-1 overflow-x-auto rounded-lg border border-[var(--stroke)] bg-[var(--surface-soft)] p-1"
        role="tablist"
        aria-label="Signal category tabs"
      >
        {SIGNAL_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`signal-panel-${tab}`}
            id={`signal-tab-${tab}`}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-white text-[var(--text-primary)] shadow-sm dark:bg-[var(--surface-strong)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="mt-5 overflow-hidden">
        {activeTab === "Agents" && (
          <div role="tabpanel" id="signal-panel-Agents" aria-labelledby="signal-tab-Agents">
            {latestAgents.length > 0 && (
              <div className="mb-4">
                <FeaturedSignalCard item={latestAgents[0]} type="agent" label="Latest agent" href={`/aixcelerator/agents/${latestAgents[0].slug}`} />
              </div>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
              <AgentRail title="Latest agents" description="Most recently updated." items={latestAgents} detailType="latest" />
              {trendingAgents.length > 0 && (
                <AgentRail title="Trending agents" description="Highest rated and most used." items={trendingAgents} detailType="trending" />
              )}
            </div>
            <div className="mt-4 text-center">
              <Link href="/aixcelerator/agents" className="btn btn-secondary">Browse all agents</Link>
            </div>
          </div>
        )}
        {activeTab === "Skills" && (
          <div role="tabpanel" id="signal-panel-Skills" aria-labelledby="signal-tab-Skills">
            {latestSkills.length > 0 && (
              <div className="mb-4">
                <FeaturedSignalCard item={latestSkills[0]} type="skill" label="Latest skill" href={`/aixcelerator/skills/${latestSkills[0].slug}`} />
              </div>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
              <SkillRail title="Latest skills" description="Most recently updated." items={latestSkills} detailType="latest" />
              {trendingSkills.length > 0 && (
                <SkillRail title="Trending skills" description="Highest rated and most used." items={trendingSkills} detailType="trending" />
              )}
            </div>
            <div className="mt-4 text-center">
              <Link href="/aixcelerator/skills" className="btn btn-secondary">Browse all skills</Link>
            </div>
          </div>
        )}
        {activeTab === "MCP" && (
          <div role="tabpanel" id="signal-panel-MCP" aria-labelledby="signal-tab-MCP">
            {latestMCPs.length > 0 && (
              <div className="mb-4">
                <FeaturedSignalCard item={latestMCPs[0]} type="mcp" label="Latest MCP server" href={`/aixcelerator/mcp/${latestMCPs[0].slug}`} />
              </div>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
              <McpRail title="Latest MCP servers" description="Most recently updated." items={latestMCPs} detailType="latest" />
              {trendingMCPs.length > 0 && (
                <McpRail title="Trending MCP servers" description="Highest rated and most used." items={trendingMCPs} detailType="trending" />
              )}
            </div>
            <div className="mt-4 text-center">
              <Link href="/aixcelerator/mcp" className="btn btn-secondary">Browse all MCP servers</Link>
            </div>
          </div>
        )}
        {activeTab === "Podcasts" && (
          <div role="tabpanel" id="signal-panel-Podcasts" aria-labelledby="signal-tab-Podcasts">
            {latestPodcasts.length > 0 && (
              <div className="mb-4">
                <FeaturedPodcastCard episode={latestPodcasts[0]} />
              </div>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
              <PodcastRail title="Latest episodes" description="Most recently published." items={latestPodcasts} />
              {trendingPodcasts.length > 0 && (
                <PodcastRail title="Trending episodes" description="Most viewed and referenced." items={trendingPodcasts} />
              )}
            </div>
            <div className="mt-4 text-center">
              <Link href="/resources/podcasts" className="btn btn-secondary">
                Browse all episodes
              </Link>
            </div>
          </div>
        )}
        {/* Use Cases tab hidden for Release-1.0 */}
      </div>
    </section>
  );
}

type CatalogItem = {
  href: string;
  title: string;
  description: string;
  meta: string;
  iconType: ContentTypeName;
  gradient: string;
  accentColor: string;
};

const CATALOG_ICON_PATHS: Record<string, { d: string; viewBox: string }> = {
  agent: { viewBox: "0 0 24 24", d: "M9 2v2H7a2 2 0 00-2 2v2H3v4h2v2a2 2 0 002 2h2v2h2v-2h2v2h2v-2h2a2 2 0 002-2v-2h2V8h-2V6a2 2 0 00-2-2h-2V2h-2v2h-2V2H9zm-2 6h10v8H7V8zm3 2v1h1v-1h-1zm3 0v1h1v-1h-1zm-4 3v1h4v-1H9z" },
  mcp: { viewBox: "0 0 24 24", d: "M4 6a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm14 1.5a1 1 0 10-2 0 1 1 0 002 0zM4 15a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3zm14 1.5a1 1 0 10-2 0 1 1 0 002 0z" },
  skill: { viewBox: "0 0 24 24", d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
  tool: { viewBox: "0 0 24 24", d: "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" },
  podcast: { viewBox: "0 0 24 24", d: "M12 1a4 4 0 00-4 4v7a4 4 0 008 0V5a4 4 0 00-4-4zM6 11a1 1 0 10-2 0 8 8 0 0016 0 1 1 0 10-2 0 6 6 0 01-12 0zm5 10.93A8 8 0 014.07 14H6.1a6 6 0 0011.8 0h2.03A8 8 0 0113 21.93V24h-2v-2.07z" },
};

function CatalogCard({ href, title, description, meta, iconType, gradient, accentColor }: CatalogItem) {
  const icon = CATALOG_ICON_PATHS[iconType] || CATALOG_ICON_PATHS.skill;
  return (
    <Link
      href={href}
      className="group flex h-full min-h-[280px] flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 dark:border-zinc-700/60 dark:bg-zinc-900 dark:hover:border-zinc-600"
      aria-label={`Open ${title}`}
    >
      <div className={`relative flex items-center justify-center bg-gradient-to-br ${gradient} px-6 py-12`}>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        {/* Large soft glow */}
        <div className="absolute rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-30" style={{ width: 140, height: 140, backgroundColor: accentColor, opacity: 0.2 }} />
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="catalog-particle" style={{ left: "20%", top: "30%", animationDelay: "0s", animationDuration: "4s" }} />
          <div className="catalog-particle" style={{ left: "65%", top: "55%", animationDelay: "1.3s", animationDuration: "5s" }} />
          <div className="catalog-particle" style={{ left: "80%", top: "25%", animationDelay: "2.6s", animationDuration: "3.5s" }} />
        </div>
        {/* Icon with orbit ring */}
        <div className="relative flex items-center justify-center">
          <div className="catalog-orbit-ring" style={{ color: accentColor }} aria-hidden="true">
            <div className="catalog-orbit-dot" />
          </div>
          <svg viewBox={icon.viewBox} className="relative h-16 w-16 drop-shadow-lg transition-transform duration-300 group-hover:scale-110" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon.d} fill={accentColor} fillOpacity={0.85} stroke={accentColor} strokeWidth={0.3} />
          </svg>
        </div>
        {/* Badge */}
        <div className="absolute left-3.5 top-3.5">
          <div className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs font-bold tracking-wide text-white/95 backdrop-blur-md">
            {meta}
          </div>
        </div>
        {/* Arrow */}
        <div className="absolute right-3.5 top-3.5 rounded-full border border-white/10 bg-white/5 p-2 text-white/50 transition-all duration-300 group-hover:bg-white/15 group-hover:text-white">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M7 17L17 7M17 7H7M17 7v10" /></svg>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function FeaturedPodcastCard({ episode }: { episode: HomePodcastSignal }) {
  const isExternal = (episode.podcastType || "internal").toLowerCase() === "external";
  return (
    <Link
      href={`/resources/podcasts/${episode.slug}`}
      className="group section-card flex flex-col gap-4 rounded-lg p-4 transition sm:flex-row sm:items-center"
    >
      {episode.coverImageUrl ? (
        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-40">
          <Image
            src={episode.coverImageUrl}
            alt={episode.title}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(min-width: 640px) 160px, 100vw"
          />
        </div>
      ) : (
        <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-lg bg-[#DC2626]/10 dark:bg-[#DC2626]/20 sm:h-24 sm:w-40">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#DC2626]" fill="none" aria-hidden="true">
            <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-deep dark:text-[#FAFAFA]">
            Latest episode
          </span>
          <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold leading-none ${isExternal ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" : "bg-[#DC2626]/10 text-[#18181B] dark:bg-[#DC2626]/20 dark:text-[#FAFAFA]"}`}>
            {isExternal ? "External" : "Colaberry"}
          </span>
        </div>
        <h4 className="mt-1 line-clamp-2 text-base font-semibold text-zinc-900 group-hover:text-brand-deep dark:text-zinc-100">
          {episode.title}
        </h4>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-zinc-500 dark:text-zinc-400">
          {formatPodcastDate(episode.publishedDate) || "Date pending"}
          {episode.duration ? <span>· {episode.duration}</span> : null}
          {episode.episodeNumber ? <span>· Episode {episode.episodeNumber}</span> : null}
        </div>
      </div>
      <span className="hidden shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-deep sm:block" aria-hidden="true">
        →
      </span>
    </Link>
  );
}

const SIGNAL_ICONS: Record<string, { viewBox: string; d: string }> = {
  agent: { viewBox: "0 0 24 24", d: "M9 2v2H7a2 2 0 00-2 2v2H3v4h2v2a2 2 0 002 2h2v2h2v-2h2v2h2v-2h2a2 2 0 002-2v-2h2V8h-2V6a2 2 0 00-2-2h-2V2h-2v2h-2V2H9zm-2 6h10v8H7V8zm3 2v1h1v-1h-1zm3 0v1h1v-1h-1zm-4 3v1h4v-1H9z" },
  skill: { viewBox: "0 0 24 24", d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
  mcp: { viewBox: "0 0 24 24", d: "M4 6a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm14 1.5a1 1 0 10-2 0 1 1 0 002 0zM4 15a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3zm14 1.5a1 1 0 10-2 0 1 1 0 002 0z" },
};

function FeaturedSignalCard({ item, type, label, href }: { item: { name: string; category?: string | null; lastUpdated?: string | null; rating?: number | null }; type: "agent" | "skill" | "mcp"; label: string; href: string }) {
  const icon = SIGNAL_ICONS[type];
  return (
    <Link
      href={href}
      className="group section-card flex flex-col gap-4 rounded-lg p-4 transition sm:flex-row sm:items-center"
    >
      <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-lg bg-[#DC2626]/10 dark:bg-[#DC2626]/20 sm:h-24 sm:w-40">
        <svg viewBox={icon.viewBox} className="h-8 w-8 text-[#DC2626]" fill="currentColor" aria-hidden="true">
          <path d={icon.d} />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-deep dark:text-[#FAFAFA]">
            {label}
          </span>
          {item.category ? (
            <span className="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold leading-none text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {item.category}
            </span>
          ) : null}
        </div>
        <h4 className="mt-1 line-clamp-2 text-base font-semibold text-zinc-900 group-hover:text-brand-deep dark:text-zinc-100">
          {item.name}
        </h4>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-zinc-500 dark:text-zinc-400">
          {formatPodcastDate(item.lastUpdated) || "Recently updated"}
          {item.rating ? <span>· Rating {item.rating.toFixed(1)}</span> : null}
        </div>
      </div>
      <span className="hidden shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-deep sm:block" aria-hidden="true">
        →
      </span>
    </Link>
  );
}

function PodcastRail({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: HomePodcastSignal[];
}) {
  return (
    <article className="section-card rounded-lg p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          Podcast signals will appear after next content sync.
        </p>
      ) : (
        <ul className="mt-4 grid gap-2">
          {items.map((episode) => {
            const isExternal = (episode.podcastType || "internal").toLowerCase() === "external";
            return (
              <li key={episode.slug}>
                <Link
                  href={`/resources/podcasts/${episode.slug}`}
                  className="group section-card flex items-center gap-3 rounded-lg px-3 py-2.5 transition"
                >
                  {episode.coverImageUrl ? (
                    <Image
                      src={episode.coverImageUrl}
                      alt=""
                      width={48}
                      height={48}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      loading="lazy"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#DC2626]/10 dark:bg-[#DC2626]/20">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#DC2626]" fill="none" aria-hidden="true">
                        <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
                        <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {episode.title}
                    </span>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {formatPodcastDate(episode.publishedDate) || "Date pending"}
                      {episode.duration ? <span>· {episode.duration}</span> : null}
                      <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none ${isExternal ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" : "bg-[#DC2626]/10 text-[#18181B] dark:bg-[#DC2626]/20 dark:text-[#FAFAFA]"}`}>
                        {isExternal ? "External" : "Colaberry"}
                      </span>
                    </div>
                  </div>
                  <span className="ml-1 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-deep dark:text-zinc-400">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

function AgentRail({
  title,
  description,
  items,
  detailType: _detailType,
}: {
  title: string;
  description: string;
  items: HomeAgentSignal[];
  detailType: "latest" | "trending";
}) {
  return (
    <article className="section-card rounded-lg p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Agent signals will appear after next refresh.</p>
      ) : (
        <ul className="mt-4 grid gap-2">
          {items.map((agent) => (
            <li key={agent.slug || agent.id}>
              <Link
                href={`/aixcelerator/agents/${agent.slug || agent.id}`}
                className="group section-card flex items-center gap-3 rounded-lg px-3 py-2.5 transition"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#DC2626]/10 dark:bg-[#DC2626]/20">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#DC2626]" fill="currentColor" aria-hidden="true">
                    <path d="M9 2v2H7a2 2 0 00-2 2v2H3v4h2v2a2 2 0 002 2h2v2h2v-2h2v2h2v-2h2a2 2 0 002-2v-2h2V8h-2V6a2 2 0 00-2-2h-2V2h-2v2h-2V2H9zm-2 6h10v8H7V8zm3 2v1h1v-1h-1zm3 0v1h1v-1h-1zm-4 3v1h4v-1H9z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{agent.name}</span>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatPodcastDate(agent.lastUpdated) || "Recently updated"}
                    {agent.category ? <span>· {agent.category}</span> : null}
                    {agent.rating ? <span>· Rating {agent.rating.toFixed(1)}</span> : null}
                  </div>
                </div>
                <span className="ml-1 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-deep dark:text-zinc-400">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function SkillRail({
  title,
  description,
  items,
  detailType: _detailType,
}: {
  title: string;
  description: string;
  items: HomeSkillSignal[];
  detailType: "latest" | "trending";
}) {
  return (
    <article className="section-card rounded-lg p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</div>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Skill signals will appear after next refresh.</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {items.map((skill) => (
            <li key={skill.slug || skill.id}>
              <Link
                href={`/aixcelerator/skills/${skill.slug || skill.id}`}
                className="section-card group flex items-center gap-3 rounded-lg px-3 py-2.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#DC2626]/10 dark:bg-[#DC2626]/20">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#DC2626]" fill="currentColor" aria-hidden="true">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{skill.name}</span>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatPodcastDate(skill.lastUpdated) || "Recently updated"}
                    {skill.category ? <span>· {skill.category}</span> : null}
                    {skill.rating ? <span>· Rating {skill.rating.toFixed(1)}</span> : null}
                  </div>
                </div>
                <span className="ml-1 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-deep dark:text-zinc-400">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function _UseCaseRail({
  title,
  description,
  items,
  detailType,
}: {
  title: string;
  description: string;
  items: HomeUseCaseSignal[];
  detailType: "latest" | "trending";
}) {
  return (
    <article className="section-card rounded-lg p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</div>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Use case signals will appear after next refresh.</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {items.map((useCase) => (
            <li key={useCase.slug || useCase.id}>
              <Link
                href={`/use-cases/${useCase.slug || useCase.id}`}
                className="section-card group flex items-center justify-between rounded-lg px-3 py-2"
              >
                <span className="truncate pr-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{useCase.title}</span>
                <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 group-hover:text-brand-deep dark:text-zinc-400">
                  {detailType === "latest"
                    ? formatPodcastDate(useCase.lastUpdated) || "Updated"
                    : useCase.verified
                    ? "Verified"
                    : `${useCase.linkedCount} links`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function McpRail({
  title,
  description,
  items,
  detailType: _detailType,
}: {
  title: string;
  description: string;
  items: HomeMcpSignal[];
  detailType: "latest" | "trending";
}) {
  return (
    <article className="section-card rounded-lg p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{title}</div>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">MCP signals will appear after next refresh.</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {items.map((mcp) => (
            <li key={mcp.slug || mcp.id}>
              <Link
                href={`/aixcelerator/mcp/${mcp.slug || mcp.id}`}
                className="section-card group flex items-center gap-3 rounded-lg px-3 py-2.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#DC2626]/10 dark:bg-[#DC2626]/20">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#DC2626]" fill="currentColor" aria-hidden="true">
                    <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm14 1.5a1 1 0 10-2 0 1 1 0 002 0zM4 15a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3zm14 1.5a1 1 0 10-2 0 1 1 0 002 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{mcp.name}</span>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatPodcastDate(mcp.lastUpdated) || "Recently updated"}
                    {mcp.category ? <span>· {mcp.category}</span> : null}
                    {mcp.rating ? <span>· Rating {mcp.rating.toFixed(1)}</span> : null}
                  </div>
                </div>
                <span className="ml-1 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-deep dark:text-zinc-400">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function QuickLink({
  href,
  title,
  description,
  external = false,
}: {
  href: string;
  title: string;
  description: string;
  external?: boolean;
}) {
  const content = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</div>
      </div>
      <div className="mt-0.5 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-deep dark:text-zinc-400">
        <span aria-hidden="true">→</span>
      </div>
    </div>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="card-glass gradient-border group flex items-start justify-between gap-3 p-5"
        aria-label={`Open ${title}`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className="card-glass gradient-border group flex items-start justify-between gap-3 p-5" aria-label={`Open ${title}`}>
      {content}
    </Link>
  );
}

function formatPodcastDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function toHomePodcastSignal(item: PodcastEpisode): HomePodcastSignal {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    publishedDate: item.publishedDate || null,
    podcastType: item.podcastType || null,
    coverImageUrl: item.coverImageUrl || null,
    duration: item.duration || null,
    episodeNumber: typeof item.episodeNumber === "number" ? item.episodeNumber : null,
  };
}

function toHomeAgentSignal(item: Agent): HomeAgentSignal {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: item.department?.category?.name || item.department?.name || item.industry || null,
    lastUpdated: item.lastUpdated || null,
    rating: typeof item.rating === "number" ? item.rating : null,
    usageCount: typeof item.usageCount === "number" ? item.usageCount : null,
  };
}

function toHomeSkillSignal(item: Skill): HomeSkillSignal {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: item.category || item.skillType || null,
    lastUpdated: item.lastUpdated || null,
    rating: typeof item.rating === "number" ? item.rating : null,
    usageCount: typeof item.usageCount === "number" ? item.usageCount : null,
  };
}

function toHomeUseCaseSignal(item: UseCase): HomeUseCaseSignal {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    lastUpdated: item.lastUpdated || null,
    verified: Boolean(item.verified),
    linkedCount: (item.agents?.length || 0) + (item.mcpServers?.length || 0),
  };
}

function toHomeMcpSignal(item: MCPServer): HomeMcpSignal {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: item.category || item.industry || null,
    lastUpdated: item.lastUpdated || null,
    rating: typeof item.rating === "number" ? item.rating : null,
    usageCount: typeof item.usageCount === "number" ? item.usageCount : null,
  };
}

function sortAgentsByDate(agents: Agent[]) {
  return [...agents].sort(
    (a, b) => compareDateDesc(a.lastUpdated, b.lastUpdated) || a.name.localeCompare(b.name)
  );
}

function sortAgentsByTrending(agents: Agent[]) {
  return [...agents].sort((a, b) => {
    const delta = scoreTrendingAgent(b) - scoreTrendingAgent(a);
    if (delta !== 0) return delta;
    return compareDateDesc(a.lastUpdated, b.lastUpdated) || a.name.localeCompare(b.name);
  });
}

function sortUseCasesByDate(useCases: UseCase[]) {
  return [...useCases].sort(
    (a, b) => compareDateDesc(a.lastUpdated, b.lastUpdated) || a.title.localeCompare(b.title)
  );
}

function sortSkillsByDate(skills: Skill[]) {
  return [...skills].sort(
    (a, b) => compareDateDesc(a.lastUpdated, b.lastUpdated) || a.name.localeCompare(b.name)
  );
}

function sortSkillsByTrending(skills: Skill[]) {
  return [...skills].sort((a, b) => {
    const delta = scoreTrendingSkill(b) - scoreTrendingSkill(a);
    if (delta !== 0) return delta;
    return compareDateDesc(a.lastUpdated, b.lastUpdated) || a.name.localeCompare(b.name);
  });
}

function sortUseCasesByTrending(useCases: UseCase[]) {
  return [...useCases].sort((a, b) => {
    const delta = scoreTrendingUseCase(b) - scoreTrendingUseCase(a);
    if (delta !== 0) return delta;
    return compareDateDesc(a.lastUpdated, b.lastUpdated) || a.title.localeCompare(b.title);
  });
}

function sortMCPByDate(mcps: MCPServer[]) {
  return [...mcps].sort((a, b) => compareDateDesc(a.lastUpdated, b.lastUpdated) || a.name.localeCompare(b.name));
}

function sortMCPByTrending(mcps: MCPServer[]) {
  return [...mcps].sort((a, b) => {
    const delta = scoreTrendingMcp(b) - scoreTrendingMcp(a);
    if (delta !== 0) return delta;
    return compareDateDesc(a.lastUpdated, b.lastUpdated) || a.name.localeCompare(b.name);
  });
}

function compareDateDesc(left?: string | null, right?: string | null) {
  return toTimestamp(right) - toTimestamp(left);
}

function toTimestamp(value?: string | null) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function scoreTrendingMcp(mcp: MCPServer) {
  const ratingScore = typeof mcp.rating === "number" ? Math.max(mcp.rating, 0) * 18 : 0;
  const usageScore =
    typeof mcp.usageCount === "number" && mcp.usageCount > 0
      ? Math.log10(mcp.usageCount + 1) * 25
      : 0;
  const verifiedScore = mcp.verified ? 8 : 0;
  const freshnessScore = (() => {
    const timestamp = toTimestamp(mcp.lastUpdated);
    if (!timestamp) return 0;
    const days = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    if (days <= 14) return 12;
    if (days <= 45) return 8;
    if (days <= 90) return 4;
    return 0;
  })();
  return ratingScore + usageScore + verifiedScore + freshnessScore;
}

function scoreTrendingAgent(agent: Agent) {
  const ratingScore = typeof agent.rating === "number" ? Math.max(agent.rating, 0) * 18 : 0;
  const usageScore =
    typeof agent.usageCount === "number" && agent.usageCount > 0
      ? Math.log10(agent.usageCount + 1) * 25
      : 0;
  const verifiedScore = agent.verified ? 8 : 0;
  const freshnessScore = (() => {
    const timestamp = toTimestamp(agent.lastUpdated);
    if (!timestamp) return 0;
    const days = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    if (days <= 14) return 12;
    if (days <= 45) return 8;
    if (days <= 90) return 4;
    return 0;
  })();
  return ratingScore + usageScore + verifiedScore + freshnessScore;
}

function scoreTrendingUseCase(useCase: UseCase) {
  const linkageScore = Math.min(useCase.agents.length * 5 + useCase.mcpServers.length * 4, 30);
  const verifiedScore = useCase.verified ? 8 : 0;
  const completenessScore =
    (useCase.summary ? 2 : 0) +
    (useCase.longDescription ? 4 : 0) +
    (useCase.outcomes ? 3 : 0) +
    (useCase.metrics ? 3 : 0);
  const freshnessScore = (() => {
    const timestamp = toTimestamp(useCase.lastUpdated);
    if (!timestamp) return 0;
    const days = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    if (days <= 14) return 12;
    if (days <= 45) return 8;
    if (days <= 90) return 4;
    return 0;
  })();
  return linkageScore + verifiedScore + completenessScore + freshnessScore;
}

function scoreTrendingSkill(skill: Skill) {
  const ratingScore = typeof skill.rating === "number" ? Math.max(skill.rating, 0) * 18 : 0;
  const usageScore =
    typeof skill.usageCount === "number" && skill.usageCount > 0
      ? Math.log10(skill.usageCount + 1) * 25
      : 0;
  const verifiedScore = skill.verified ? 8 : 0;
  const linkageScore = Math.min(
    (skill.agents?.length || 0) * 3 + (skill.mcpServers?.length || 0) * 3 + (skill.useCases?.length || 0) * 4,
    24
  );
  const completenessScore =
    (skill.summary ? 2 : 0) +
    (skill.longDescription ? 4 : 0) +
    (skill.inputs ? 2 : 0) +
    (skill.outputs ? 2 : 0) +
    (skill.toolsRequired ? 2 : 0) +
    (skill.modelsSupported ? 2 : 0);
  const freshnessScore = (() => {
    const timestamp = toTimestamp(skill.lastUpdated);
    if (!timestamp) return 0;
    const days = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    if (days <= 14) return 12;
    if (days <= 45) return 8;
    if (days <= 90) return 4;
    return 0;
  })();
  return ratingScore + usageScore + verifiedScore + linkageScore + completenessScore + freshnessScore;
}

function _formatUsageLabel(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

type IndustryIcon = "leaf" | "tower" | "droplet" | "dna" | "factory" | "truck";

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- false positive: used at line ~493
function IndustryTile({
  href,
  title,
  icon,
}: {
  href: string;
  title: string;
  icon: IndustryIcon;
}) {
  return (
    <Link
      href={href}
      className="surface-panel surface-hover surface-interactive group relative flex flex-col items-center gap-3 p-4 text-center"
      aria-label={`View ${title} industry`}
    >
      <div className="absolute right-4 top-4 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-deep">
        <span aria-hidden="true">→</span>
      </div>
      <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[#DC2626]/10 bg-[#DC2626]/5 text-zinc-800 dark:border-[#DC2626]/15 dark:bg-[#DC2626]/10 dark:text-zinc-200">
        <IndustryIconSvg icon={icon} />
      </div>
      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</div>
    </Link>
  );
}

function IndustryIconSvg({ icon }: { icon: IndustryIcon }) {
  const common = "h-7 w-7";
  switch (icon) {
    case "leaf":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path
            d="M20 4c-6.5 0-12 3.2-14.8 9.2C4.3 15.1 4 17 4 20c3 0 4.9-.3 6.8-1.2C16.8 16 20 10.5 20 4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M7 17c2-2.6 5.2-5.2 10-7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "tower":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path d="M12 2v20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path
            d="M7 22l5-8 5 8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M6 8c2.2-2 4.3-3 6-3s3.8 1 6 3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "droplet":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path
            d="M12 2s6 6.4 6 12a6 6 0 1 1-12 0C6 8.4 12 2 12 2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "dna":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path
            d="M8 3c3 3 3 6 0 9s-3 6 0 9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M16 3c-3 3-3 6 0 9s3 6 0 9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M9 7h6M9 12h6M9 17h6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "factory":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path
            d="M4 21V10l6 3V10l6 3V8l4 2v11H4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M8 21v-4m4 4v-4m4 4v-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "truck":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden="true">
          <path
            d="M3 7h11v10H3V7Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M14 10h4l3 3v4h-7v-7Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M7 19.5a1.5 1.5 0 1 0 0-.01V19.5Zm12 0a1.5 1.5 0 1 0 0-.01V19.5Z"
            fill="currentColor"
          />
        </svg>
      );
  }
}

/** Parse a display value like "1.5k+" into { num: 1500, decimals: 0, suffix: "+" } */
function parseMetricValue(value: string): { target: number; decimals: number; suffix: string; prefix: string } {
  const match = value.match(/^([^0-9]*)(\d+(?:\.\d+)?)(k\+?|\+|%?)(.*)$/i);
  if (!match) return { target: 0, decimals: 0, suffix: value, prefix: "" };
  const [, prefix, numStr, unit, rest] = match;
  const num = parseFloat(numStr);
  const hasK = unit.toLowerCase().startsWith("k");
  const suffix = unit + rest;
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return { target: hasK ? num * 1000 : num, decimals: hasK ? 0 : decimals, suffix: hasK ? suffix : suffix, prefix: prefix || "" };
}

function formatCountedValue(current: number, original: string): string {
  // Match the original formatting: "1.5k+", "29", "16.9k+", "260"
  const match = original.match(/^([^0-9]*)(\d+(?:\.\d+)?)(k\+?|\+|%?)(.*)$/i);
  if (!match) return original;
  const [, prefix, , unit, rest] = match;
  const hasK = unit.toLowerCase().startsWith("k");
  if (hasK) {
    const kVal = current / 1000;
    const decimals = original.includes(".") ? original.split(".")[1]?.match(/\d+/)?.[0]?.length || 1 : 0;
    return `${prefix}${kVal.toFixed(decimals)}${unit}${rest}`;
  }
  return `${prefix}${Math.round(current)}${unit}${rest}`;
}

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function useCountUp(target: number, duration: number, started: boolean): number {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!started || target === 0) return;
    // Respect prefers-reduced-motion
    if (prefersReducedMotion) {
      const id = requestAnimationFrame(() => setCurrent(target));
      return () => cancelAnimationFrame(id);
    }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1);
      // Ease-out expo: fast start, smooth deceleration
      const progress = elapsed === 1 ? 1 : 1 - Math.pow(2, -10 * elapsed);
      setCurrent(target * progress);
      if (elapsed < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);
  return current;
}

function AnimatedMetric({
  value,
  label,
  note,
  delay = 0,
}: {
  value: string;
  label: string;
  note: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [counting, setCounting] = useState(false);
  const { target } = parseMetricValue(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Start counting after the delay
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setCounting(true), delay);
    return () => clearTimeout(timer);
  }, [visible, delay]);

  const counted = useCountUp(target, 1500, counting);
  const displayValue = counting ? formatCountedValue(counted, value) : "0";

  return (
    <div
      ref={ref}
      className="card-glass gradient-border p-5 text-center"
    >
      <div
        className={visible ? "counter-animate" : "opacity-0"}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="font-sans text-display-sm font-bold bg-gradient-to-r from-[#B91C1C] to-[#DC2626] bg-clip-text text-transparent dark:from-[#F87171] dark:to-[#FCA5A5]">
          {displayValue}
        </div>
        <div className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{label}</div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{note}</p>
      </div>
    </div>
  );
}

type PlatformTab = {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
  metrics: { value: string; label: string }[];
};

function PlatformTabsSection({ tabs }: { tabs: PlatformTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0].id);
  const active = tabs.find((t) => t.id === activeId) || tabs[0];

  return (
    <section className="reveal section-spacing">
      <SectionHeader
        kicker="Platform capabilities"
        title="Everything teams need to build, govern, and scale AI"
        description="From cataloging agents to evaluating outcomes, the platform supports full lifecycle delivery."
      />

      {/* Tab bar */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-[var(--stroke)]" role="tablist" aria-label="Platform capability tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeId === tab.id}
            aria-controls={`platform-panel-${tab.id}`}
            className={`relative px-5 py-3 text-sm font-semibold transition-colors ${
              activeId === tab.id
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
            onClick={() => setActiveId(tab.id)}
          >
            {tab.label}
            {activeId === tab.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[#DC2626] dark:bg-[#F87171]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        key={active.id}
        role="tabpanel"
        id={`platform-panel-${active.id}`}
        className="mt-6 grid gap-6 lg:grid-cols-2 overflow-hidden"
      >
        <div className="flex flex-col justify-center">
          <h3 className="text-display-xs font-bold text-[var(--text-primary)] sm:text-display-sm">
            {active.title}
          </h3>
          <p className="mt-4 text-body-lg leading-relaxed text-[var(--text-muted)]">
            {active.description}
          </p>
          <div className="mt-6">
            <Link href={active.href} className="btn btn-cta">
              Learn more
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Metrics panel (right side) */}
        <div className="flex items-center">
          <div className="grid w-full gap-4 sm:grid-cols-3">
            {active.metrics.map((metric) => (
              <div
                key={metric.label}
                className="surface-panel p-5 text-center"
              >
                <div className="text-display-xs font-bold text-[#DC2626] dark:text-[#F87171]">
                  {metric.value}
                </div>
                <div className="mt-1 text-sm font-medium text-[var(--text-muted)]">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
