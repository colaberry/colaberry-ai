import type { NextApiRequest, NextApiResponse } from "next";
import { fetchSkills, type Skill } from "../../lib/cms";
import { isRateLimited, getClientIp } from "../../lib/rate-limit";

const PAGE_SIZE = 24;

type SkillSortMode = "trending" | "latest" | "alphabetical";

function parseSort(raw: string): SkillSortMode {
  if (raw === "latest") return "latest";
  if (raw === "alphabetical") return "alphabetical";
  return "trending";
}

function normalizeSearch(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 120);
}

function matchesFilters(
  skill: Skill,
  query: string,
  category: string,
  status: string,
  source: string,
  tag: string,
  visibility: string,
  allowPrivate: boolean
): boolean {
  if (!allowPrivate && (skill.visibility || "public").toLowerCase() !== "public") return false;
  if (visibility !== "all" && (skill.visibility || "public").toLowerCase() !== visibility) return false;

  if (category !== "all" && (skill.category || "").toLowerCase() !== category) return false;
  if (status !== "all" && (skill.status || "unknown").toLowerCase() !== status) return false;
  if (source !== "all" && (skill.source || "internal").toLowerCase() !== source) return false;
  if (
    tag !== "all" &&
    !(skill.tags || []).some((t) => (t.slug || t.name || "").toLowerCase() === tag)
  )
    return false;

  if (!query) return true;
  const haystack = [
    skill.name,
    skill.summary,
    skill.category,
    skill.provider,
    ...(skill.tags || []).map((t) => t.name),
    ...(skill.companies || []).map((c) => c.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function toTimestamp(value?: string | null): number {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function scoreTrending(skill: Skill): number {
  const ratingScore = typeof skill.rating === "number" ? Math.max(skill.rating, 0) * 18 : 0;
  const usageScore =
    typeof skill.usageCount === "number" && skill.usageCount > 0
      ? Math.log10(skill.usageCount + 1) * 25
      : 0;
  const verifiedScore = skill.verified ? 8 : 0;
  const ts = toTimestamp(skill.lastUpdated);
  let freshnessScore = 0;
  if (ts) {
    const days = (Date.now() - ts) / 86_400_000;
    if (days <= 14) freshnessScore = 12;
    else if (days <= 45) freshnessScore = 8;
    else if (days <= 90) freshnessScore = 4;
  }
  const relationScore =
    ((skill.agents?.length || 0) + (skill.mcpServers?.length || 0) + (skill.useCases?.length || 0)) * 2;
  return ratingScore + usageScore + verifiedScore + freshnessScore + relationScore;
}

function sortSkills(skills: Skill[], mode: SkillSortMode): Skill[] {
  const sorted = [...skills];
  if (mode === "alphabetical") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (mode === "latest") {
    return sorted.sort(
      (a, b) => toTimestamp(b.lastUpdated) - toTimestamp(a.lastUpdated) || a.name.localeCompare(b.name)
    );
  }
  // trending
  return sorted.sort((a, b) => {
    const delta = scoreTrending(b) - scoreTrending(a);
    if (delta !== 0) return delta;
    return toTimestamp(b.lastUpdated) - toTimestamp(a.lastUpdated) || a.name.localeCompare(b.name);
  });
}

type Facets = {
  categories: string[];
  statuses: string[];
  sources: string[];
  tags: { value: string; label: string }[];
};

function buildFacets(skills: Skill[]): Facets {
  const categorySet = new Set<string>();
  const statusSet = new Set<string>();
  const sourceSet = new Set<string>();
  const tagMap = new Map<string, string>();
  for (const skill of skills) {
    if (skill.category) categorySet.add(skill.category);
    statusSet.add((skill.status || "unknown").toLowerCase());
    sourceSet.add((skill.source || "internal").toLowerCase());
    for (const tag of skill.tags || []) {
      const key = (tag.slug || tag.name || "").toLowerCase();
      if (key && !tagMap.has(key)) tagMap.set(key, tag.name || tag.slug || key);
    }
  }
  return {
    categories: Array.from(categorySet).filter(Boolean).sort(),
    statuses: Array.from(statusSet).sort(),
    sources: Array.from(sourceSet).sort(),
    tags: Array.from(tagMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  };
}

function clipText(value?: string | null, limit = 220) {
  if (!value) return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit - 1).trimEnd()}...`;
}

function toListItem(skill: Skill): Skill {
  return {
    id: skill.id,
    name: skill.name,
    slug: skill.slug,
    summary: clipText(skill.summary, 220),
    category: skill.category ?? null,
    provider: skill.provider ?? null,
    skillType: skill.skillType ?? null,
    industry: skill.industry ?? null,
    rating: typeof skill.rating === "number" ? skill.rating : null,
    usageCount: typeof skill.usageCount === "number" ? skill.usageCount : null,
    lastUpdated: skill.lastUpdated ?? null,
    status: skill.status ?? null,
    visibility: skill.visibility ?? null,
    source: skill.source ?? null,
    sourceName: skill.sourceName ?? null,
    verified: skill.verified ?? null,
    tags: skill.tags ?? [],
    companies: skill.companies ?? [],
    agents: skill.agents ?? [],
    mcpServers: skill.mcpServers ?? [],
    useCases: skill.useCases ?? [],
  };
}

type ResponsePayload = {
  skills: Skill[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  total: number;
  catalogTotal: number;
  facets: Facets;
};

let cachedSkills: Skill[] | null = null;
let cachedTotal: number = 0;
let cacheTime = 0;
const CACHE_TTL = 120_000; // 2 minutes
const MAX_CACHED_SKILLS = 500;

const CMS_URL = (process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || "").trim().replace(/\/$/, "");

async function fetchTotalCount(): Promise<number> {
  try {
    const res = await fetch(`${CMS_URL}/api/skills?pagination[pageSize]=1`);
    if (!res.ok) return 0;
    const json = await res.json();
    return json?.meta?.pagination?.total ?? 0;
  } catch {
    return 0;
  }
}

async function getAllSkills(): Promise<{ skills: Skill[]; totalInCms: number }> {
  const now = Date.now();
  if (cachedSkills && now - cacheTime < CACHE_TTL) {
    return { skills: cachedSkills, totalInCms: cachedTotal };
  }
  const [skills, total] = await Promise.all([
    fetchSkills(undefined, { maxRecords: MAX_CACHED_SKILLS }),
    fetchTotalCount(),
  ]);
  cachedSkills = skills;
  cachedTotal = total || skills.length;
  cacheTime = now;
  return { skills: cachedSkills, totalInCms: cachedTotal };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponsePayload | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (isRateLimited("skills", getClientIp(req), 60, 60_000)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  try {
    const rawPage = Number(req.query.page) || 1;
    const page = Math.max(1, rawPage);
    const sortMode = parseSort(String(req.query.sort || "trending"));
    const searchQuery = normalizeSearch(String(req.query.q || "")).toLowerCase();
    const category = String(req.query.category || "all").toLowerCase();
    const status = String(req.query.status || "all").toLowerCase();
    const source = String(req.query.source || "all").toLowerCase();
    const tag = String(req.query.tag || "all").toLowerCase();
    const visibility = String(req.query.visibility || "all").toLowerCase();
    const allowPrivate = process.env.NEXT_PUBLIC_SHOW_PRIVATE === "true";

    const { skills: allSkills, totalInCms } = await getAllSkills();

    // Build facets from the full visible dataset
    const visibleSkills = allowPrivate
      ? allSkills
      : allSkills.filter((s) => (s.visibility || "public").toLowerCase() === "public");
    const facets = buildFacets(visibleSkills);
    const catalogTotal = totalInCms || visibleSkills.length;

    // Apply all filters
    const filtered = allSkills.filter((skill) =>
      matchesFilters(skill, searchQuery, category, status, source, tag, visibility, allowPrivate)
    );

    // Sort
    const sorted = sortSkills(filtered, sortMode);

    const total = sorted.length;
    const start = (page - 1) * PAGE_SIZE;
    const skills = sorted.slice(start, start + PAGE_SIZE).map(toListItem);
    const hasMore = start + PAGE_SIZE < total;

    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json({ skills, page, pageSize: PAGE_SIZE, hasMore, total, catalogTotal, facets });
  } catch {
    return res.status(500).json({ error: "Failed to fetch skills" });
  }
}
