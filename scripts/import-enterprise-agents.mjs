#!/usr/bin/env node

/**
 * Import Colaberry Enterprise Agent Catalog into Strapi CMS.
 * Parses 135 agent .md files from 10 category directories.
 *
 * Usage:
 *   node scripts/import-enterprise-agents.mjs [options]
 *
 * Options:
 *   --dry-run          Preview without updating CMS
 *   --url <cms-url>    Override CMS URL
 *   --token <token>    Override CMS API token
 *   --catalog <path>   Path to agent-catalog directory
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, basename } from "path";

const args = process.argv.slice(2);
function getArg(name, fallback = "") {
  const idx = args.indexOf(name);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : fallback;
}
function hasFlag(name) { return args.includes(name); }

const urlOverride = getArg("--url");
const tokenOverride = getArg("--token");
if (urlOverride) process.env.NEXT_PUBLIC_CMS_URL = urlOverride;
if (tokenOverride) process.env.CMS_API_TOKEN = tokenOverride;

const dryRun = hasFlag("--dry-run");

const baseUrl = (
  process.env.CMS_URL ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  process.env.STRAPI_URL ||
  ""
).trim().replace(/\/$/, "");

const token = (
  process.env.CMS_API_TOKEN ||
  process.env.STRAPI_TOKEN ||
  ""
).trim();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Catalog Config ----------------------------------------------- */

const DEFAULT_CATALOG_PATH = join(
  process.env.HOME || "",
  "Desktop/Projects/COLABERRY AI PROJECT/agent-catalog"
);
const catalogPath = getArg("--catalog") || DEFAULT_CATALOG_PATH;

const CATEGORY_MAP = {
  admissions:     { industry: "Admissions",               department: "Admissions Operations" },
  assistant:      { industry: "Enterprise Assistant",      department: "Data & Analytics" },
  departments:    { industry: "Enterprise Operations",     department: "Cross-Functional" },
  intelligence:   { industry: "Intelligence & Analytics",  department: "Strategic Intelligence" },
  openclaw:       { industry: "Sales & Marketing",         department: "LinkedIn Automation" },
  reporting:      { industry: "Reporting & Analytics",     department: "Business Intelligence" },
  security:       { industry: "Security & Compliance",     department: "Platform Security" },
  services:       { industry: "Customer Services",         department: "Service Automation" },
  "super-agents": { industry: "Orchestration",             department: "Agent Orchestration" },
};

/* ---------- Markdown Parser ---------------------------------------------- */

function parseAgentMd(content, filename) {
  const lines = content.split("\n");

  // Extract H1 title
  const h1 = lines.find((l) => l.startsWith("# "));
  const name = h1 ? h1.replace(/^#\s+/, "").trim() : filename.replace(/-/g, " ").replace(/\.md$/, "");

  // Extract H2 sections
  const sections = {};
  let currentSection = null;
  let currentLines = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentSection) sections[currentSection] = currentLines.join("\n").trim();
      currentSection = line.replace(/^##\s+/, "").trim().toLowerCase();
      currentLines = [];
    } else if (currentSection) {
      currentLines.push(line);
    }
  }
  if (currentSection) sections[currentSection] = currentLines.join("\n").trim();

  return { name, sections };
}

function extractBullets(text) {
  if (!text) return "";
  return text
    .split("\n")
    .map((l) => l.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").trim())
    .filter(Boolean)
    .join("\n");
}

function extractStatus(statusText) {
  if (!statusText) return { status: "active", trigger: "" };
  const lower = statusText.toLowerCase();
  let status = "live";
  if (lower.includes("draft")) status = "beta";
  if (lower.includes("concept")) status = "concept";

  const triggerMatch = statusText.match(/trigger:\s*(.+)/i);
  const trigger = triggerMatch ? triggerMatch[1].trim() : "";

  return { status, trigger };
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ---------- CMS Operations ----------------------------------------------- */

async function fetchCMS(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`CMS ${res.status}: ${body.slice(0, 500)}`);
  }
  return res.json();
}

async function fetchAllCMSAgents() {
  const allAgents = [];
  let page = 1;
  while (true) {
    const data = await fetchCMS(
      `/api/agents?pagination[page]=${page}&pagination[pageSize]=100&pagination[withCount]=true`
    );
    allAgents.push(...(data.data || []));
    if (allAgents.length >= (data.meta?.pagination?.total || 0)) break;
    page++;
  }
  return allAgents;
}

async function findOrCreateTag(tagName) {
  const slug = slugify(tagName);
  try {
    const data = await fetchCMS(`/api/tags?filters[slug][$eq]=${slug}`);
    if (data.data && data.data.length > 0) return data.data[0].id;
  } catch { /* ignore */ }

  try {
    const created = await fetchCMS("/api/tags", {
      method: "POST",
      body: JSON.stringify({ data: { name: tagName, slug } }),
    });
    return created.data?.id;
  } catch (e) {
    console.warn(`  Warning: Could not create tag "${tagName}": ${e.message}`);
    return null;
  }
}

async function findOrCreateDepartment(name, description = "") {
  const slug = slugify(name);
  try {
    const data = await fetchCMS(`/api/departments?filters[slug][$eq]=${slug}`);
    if (data.data && data.data.length > 0) {
      return data.data[0].documentId || data.data[0].id;
    }
  } catch { /* ignore */ }

  try {
    const created = await fetchCMS("/api/departments", {
      method: "POST",
      body: JSON.stringify({ data: { name, slug, description } }),
    });
    return created.data?.documentId || created.data?.id;
  } catch (e) {
    console.warn(`  Warning: Could not create department "${name}": ${e.message}`);
    return null;
  }
}

/* ---------- Main --------------------------------------------------------- */

async function main() {
  console.log("=== Colaberry Enterprise Agent Catalog Import ===\n");

  // Step 1: Discover all agent .md files from catalog directories
  const allAgents = [];

  const dirs = readdirSync(catalogPath).filter((d) => {
    const full = join(catalogPath, d);
    return statSync(full).isDirectory() && CATEGORY_MAP[d];
  });

  console.log(`Found ${dirs.length} category directories:\n`);

  for (const dir of dirs) {
    const dirPath = join(catalogPath, dir);
    const mdFiles = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
    const { industry, department } = CATEGORY_MAP[dir];

    console.log(`  ${dir}/ → ${industry} (${mdFiles.length} agents)`);

    for (const file of mdFiles) {
      const content = readFileSync(join(dirPath, file), "utf8");
      const { name, sections } = parseAgentMd(content, file);
      const { status, trigger } = extractStatus(sections.status);
      const slug = slugify(basename(file, ".md"));

      allAgents.push({
        slug,
        name,
        description: (sections.purpose || "").slice(0, 220),
        whatItDoes: sections.purpose || "",
        longDescription: content, // Full markdown for detail page
        industry,
        status,
        source: "internal",
        sourceName: "Colaberry Enterprise",
        verified: true,
        visibility: "public",
        inputs: extractBullets(sections.input),
        outputs: extractBullets(sections.output),
        orchestration: extractBullets(sections["how it works"]),
        useCases: extractBullets(sections["use cases"]),
        tools: extractBullets(sections["integration points"]),
        executionModes: trigger ? `Trigger: ${trigger}` : "",
        coreTasks: department,
        categoryDir: dir,
        tagName: dir.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      });
    }
  }

  console.log(`\nTotal agents discovered: ${allAgents.length}\n`);

  // Category breakdown
  const cats = {};
  for (const a of allAgents) {
    cats[a.industry] = (cats[a.industry] || 0) + 1;
  }
  console.log("Category breakdown:");
  for (const [cat, count] of Object.entries(cats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log();

  if (!baseUrl && !dryRun) {
    console.error("Missing CMS URL. Set --url or NEXT_PUBLIC_CMS_URL.");
    process.exit(1);
  }
  if (!token && !dryRun) {
    console.error("Missing CMS token. Set --token or CMS_API_TOKEN.");
    process.exit(1);
  }

  // Fetch existing CMS agents for deduplication
  let existingAgents = [];
  if (!dryRun) {
    console.log("Fetching existing CMS agents...");
    existingAgents = await fetchAllCMSAgents();
    console.log(`  Found ${existingAgents.length} existing agents.\n`);
  }

  const existingBySlug = new Map();
  for (const a of existingAgents) {
    existingBySlug.set(a.slug, a);
  }

  // Create tags for each category
  const tagIds = {};
  if (!dryRun) {
    console.log("Creating/finding category tags...");
    for (const dir of dirs) {
      const tagName = dir.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      tagIds[dir] = await findOrCreateTag(tagName);
      console.log(`  Tag "${tagName}" → id: ${tagIds[dir]}`);
      await sleep(100);
    }
    // Also create "Colaberry Enterprise" tag
    tagIds["colaberry-enterprise"] = await findOrCreateTag("Colaberry Enterprise");
    console.log();

    // Create departments for each category
    console.log("Creating/finding departments...");
    for (const dir of dirs) {
      const { department: deptName, industry } = CATEGORY_MAP[dir];
      const deptId = await findOrCreateDepartment(deptName, `${industry} department for Colaberry Enterprise agents`);
      CATEGORY_MAP[dir].departmentId = deptId;
      console.log(`  Department "${deptName}" → id: ${deptId}`);
      await sleep(100);
    }
    console.log();
  }

  let created = 0, updated = 0, skipped = 0, failed = 0;

  // Step 2: Import each agent
  for (const agent of allAgents) {
    const existing = existingBySlug.get(agent.slug);

    if (dryRun) {
      const status = existing ? "EXISTS" : "NEW";
      console.log(`  [${status}] ${agent.name} → ${agent.industry}`);
      if (status === "NEW") created++;
      else skipped++;
      continue;
    }

    // Build CMS payload
    const tags = [tagIds[agent.categoryDir], tagIds["colaberry-enterprise"]].filter(Boolean);

    const payload = {
      data: {
        name: agent.name,
        slug: agent.slug,
        description: agent.description,
        whatItDoes: agent.whatItDoes,
        longDescription: agent.longDescription,
        industry: agent.industry,
        status: agent.status,
        source: agent.source,
        sourceName: agent.sourceName,
        verified: agent.verified,
        visibility: agent.visibility,
        inputs: agent.inputs,
        outputs: agent.outputs,
        orchestration: agent.orchestration,
        useCases: agent.useCases,
        tools: agent.tools,
        executionModes: agent.executionModes,
        coreTasks: agent.coreTasks,
        department: CATEGORY_MAP[agent.categoryDir]?.departmentId || null,
      },
    };

    try {
      if (existing) {
        await fetchCMS(`/api/agents/${existing.documentId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        console.log(`  [UPDATED] ${agent.name}`);
        updated++;
      } else {
        await fetchCMS("/api/agents", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        console.log(`  [CREATED] ${agent.name}`);
        created++;
      }
    } catch (e) {
      console.error(`  [FAILED] ${agent.name}: ${e.message}`);
      failed++;
    }

    await sleep(200);
  }

  console.log("\n=== Import Summary ===");
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed:  ${failed}`);
  console.log(`  Total:   ${allAgents.length}`);

  if (dryRun) {
    console.log("\n[DRY RUN] No changes were made to the CMS.");
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
