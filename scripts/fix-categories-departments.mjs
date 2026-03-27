#!/usr/bin/env node

/**
 * Fix CMS Categories & Departments for Go-Live
 *
 * Creates 9 categories (matching README directories), creates 8 proper
 * departments for the "Departments" category, links departments → categories,
 * and reassigns the 24 department agents to their correct departments.
 *
 * Usage:
 *   node scripts/fix-categories-departments.mjs --dry-run   # Preview
 *   node scripts/fix-categories-departments.mjs              # Execute
 *   node scripts/fix-categories-departments.mjs --url <url> --token <token>
 */

const args = process.argv.slice(2);
function getArg(name, fallback = "") {
  const idx = args.indexOf(name);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : fallback;
}
const dryRun = args.includes("--dry-run");

const urlOverride = getArg("--url");
const tokenOverride = getArg("--token");
if (urlOverride) process.env.NEXT_PUBLIC_CMS_URL = urlOverride;
if (tokenOverride) process.env.CMS_API_TOKEN = tokenOverride;

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

/* ── README-defined structure ────────────────────────────────────── */

// 9 Categories (matching README directory names)
const CATEGORIES = [
  { name: "Intelligence",  slug: "intelligence",  description: "Core Cory AI decision-making agents", order: 1 },
  { name: "Assistant",     slug: "assistant",     description: "Query pipeline and data analysis agents", order: 2 },
  { name: "Super Agents",  slug: "super-agents",  description: "High-level orchestrators coordinating department agents", order: 3 },
  { name: "Departments",   slug: "departments",   description: "Department-specific operational agents (8 depts x 3 agents)", order: 4 },
  { name: "Admissions",    slug: "admissions",    description: "Admissions funnel, lead qualification, and conversation agents", order: 5 },
  { name: "OpenClaw",      slug: "openclaw",      description: "LinkedIn and multi-platform engagement automation agents", order: 6 },
  { name: "Reporting",     slug: "reporting",     description: "Analytics, reporting, and visualization agents", order: 7 },
  { name: "Security",      slug: "security",      description: "Security monitoring, audit, and threat detection agents", order: 8 },
  { name: "Services",      slug: "services",      description: "Direct service agents for campaigns, curriculum, and platform ops", order: 9 },
];

// Category → Department mapping
// Each category has one department, except "Departments" which has 8
const CATEGORY_DEPARTMENTS = {
  intelligence:  [{ name: "Strategic Intelligence",  slug: "strategic-intelligence" }],
  assistant:     [{ name: "Data & Analytics",        slug: "data-analytics" }],
  "super-agents": [{ name: "Agent Orchestration",    slug: "agent-orchestration" }],
  admissions:    [{ name: "Admissions Operations",   slug: "admissions-operations" }],
  openclaw:      [{ name: "LinkedIn Automation",     slug: "linkedin-automation" }],
  reporting:     [{ name: "Business Intelligence",   slug: "business-intelligence" }],
  security:      [{ name: "Platform Security",       slug: "platform-security" }],
  services:      [{ name: "Service Automation",      slug: "service-automation" }],
  departments: [
    { name: "Education",      slug: "education" },
    { name: "Finance",        slug: "finance" },
    { name: "Growth",         slug: "growth" },
    { name: "Infrastructure", slug: "infrastructure" },
    { name: "Intelligence",   slug: "intelligence-dept" },
    { name: "Marketing",      slug: "marketing" },
    { name: "Operations",     slug: "operations" },
    { name: "Orchestration",  slug: "orchestration" },
  ],
};

// 24 Department agents → correct department (from README)
const AGENT_DEPARTMENT_MAP = {
  // Education (3)
  "curriculum-improvement-agent": "Education",
  "mentor-matching-agent":        "Education",
  "student-success-agent":        "Education",
  // Finance (3)
  "cost-optimization-agent":      "Finance",
  "revenue-forecast-agent":       "Finance",
  "scholarship-allocation-agent": "Finance",
  // Growth (3)
  "growth-experiment-agent":      "Growth",
  "growth-opportunity-scanner-agent": "Growth",
  "growth-partnership-agent":     "Growth",
  // Infrastructure (3)
  "ai-model-performance-agent":   "Infrastructure",
  "security-monitoring-agent":    "Infrastructure",
  "system-health-agent":          "Infrastructure",
  // Intelligence (3)
  "anomaly-detection-agent":      "Intelligence",
  "insight-narrative-agent":      "Intelligence",
  "strategic-planning-agent":     "Intelligence",
  // Marketing (3)
  "audience-segmentation-agent":  "Marketing",
  "campaign-performance-agent":   "Marketing",
  "content-generation-agent":     "Marketing",
  // Operations (3)
  "quality-assurance-agent":      "Operations",
  "task-assignment-agent":        "Operations",
  "workflow-optimization-agent":  "Operations",
  // Orchestration (3)
  "agent-hiring-agent":           "Orchestration",
  "agent-performance-agent":      "Orchestration",
  "decision-simulation-agent":    "Orchestration",
};

/* ── CMS Helpers ─────────────────────────────────────────────────── */

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
    throw new Error(`CMS ${res.status} ${options.method || "GET"} ${path}: ${body.slice(0, 300)}`);
  }
  const text = await res.text();
  if (!text) return { data: null };
  return JSON.parse(text);
}

async function findBySlug(collection, slug) {
  const data = await fetchCMS(`/api/${collection}?filters[slug][$eq]=${slug}`);
  return data.data?.[0] || null;
}

async function fetchAll(collection, extraParams = "") {
  const all = [];
  let page = 1;
  while (true) {
    const data = await fetchCMS(
      `/api/${collection}?pagination[page]=${page}&pagination[pageSize]=100&pagination[withCount]=true${extraParams}`
    );
    all.push(...(data.data || []));
    if (all.length >= (data.meta?.pagination?.total || 0)) break;
    page++;
  }
  return all;
}

/* ── Main ────────────────────────────────────────────────────────── */

async function main() {
  console.log("=== Fix Categories & Departments for Go-Live ===\n");

  if (!baseUrl && !dryRun) {
    console.error("Missing CMS URL. Set --url or NEXT_PUBLIC_CMS_URL.");
    process.exit(1);
  }
  if (!token && !dryRun) {
    console.error("Missing CMS token. Set --token or CMS_API_TOKEN.");
    process.exit(1);
  }

  if (dryRun) {
    console.log("[DRY RUN] No changes will be made.\n");
    console.log("Categories to create (9):");
    for (const c of CATEGORIES) console.log(`  ${c.order}. ${c.name} (${c.slug})`);
    console.log("\nDepartments to create/update:");
    for (const [catSlug, depts] of Object.entries(CATEGORY_DEPARTMENTS)) {
      for (const d of depts) console.log(`  ${d.name} → category: ${catSlug}`);
    }
    console.log(`\nAgent reassignments (${Object.keys(AGENT_DEPARTMENT_MAP).length}):`);
    for (const [slug, dept] of Object.entries(AGENT_DEPARTMENT_MAP)) {
      console.log(`  ${slug} → ${dept}`);
    }
    return;
  }

  // ── Step 1: Create 9 Categories ─────────────────────────────────
  console.log("Step 1: Creating 9 categories...\n");
  const categoryIds = {}; // slug → documentId

  for (const cat of CATEGORIES) {
    const existing = await findBySlug("categories", cat.slug);
    if (existing) {
      categoryIds[cat.slug] = existing.documentId || existing.id;
      console.log(`  [EXISTS] ${cat.name} → ${categoryIds[cat.slug]}`);
    } else {
      const created = await fetchCMS("/api/categories", {
        method: "POST",
        body: JSON.stringify({ data: { name: cat.name, slug: cat.slug, description: cat.description } }),
      });
      categoryIds[cat.slug] = created.data?.documentId || created.data?.id;
      console.log(`  [CREATED] ${cat.name} → ${categoryIds[cat.slug]}`);
    }
    await sleep(150);
  }

  // ── Step 2: Create/Update Departments & Link to Categories ──────
  console.log("\nStep 2: Creating/updating departments & linking to categories...\n");
  const departmentIds = {}; // name → documentId

  for (const [catSlug, depts] of Object.entries(CATEGORY_DEPARTMENTS)) {
    const categoryId = categoryIds[catSlug];
    for (const dept of depts) {
      const existing = await findBySlug("departments", dept.slug);
      if (existing) {
        // Update to link to correct category
        const docId = existing.documentId || existing.id;
        await fetchCMS(`/api/departments/${docId}`, {
          method: "PUT",
          body: JSON.stringify({ data: { category: categoryId } }),
        });
        departmentIds[dept.name] = docId;
        console.log(`  [UPDATED] ${dept.name} → category: ${catSlug} (${docId})`);
      } else {
        const created = await fetchCMS("/api/departments", {
          method: "POST",
          body: JSON.stringify({
            data: {
              name: dept.name,
              slug: dept.slug,
              description: `${dept.name} department for Colaberry Enterprise agents`,
              category: categoryId,
            },
          }),
        });
        departmentIds[dept.name] = created.data?.documentId || created.data?.id;
        console.log(`  [CREATED] ${dept.name} → category: ${catSlug} (${departmentIds[dept.name]})`);
      }
      await sleep(150);
    }
  }

  // ── Step 3: Reassign 24 Department Agents ───────────────────────
  console.log("\nStep 3: Reassigning 24 department agents to correct departments...\n");

  const allAgents = await fetchAll("agents", "&populate[department][fields][0]=name");
  let reassigned = 0, notFound = 0, alreadyCorrect = 0;

  for (const [agentSlug, deptName] of Object.entries(AGENT_DEPARTMENT_MAP)) {
    const agent = allAgents.find((a) => a.slug === agentSlug);
    if (!agent) {
      console.log(`  [NOT FOUND] ${agentSlug}`);
      notFound++;
      continue;
    }

    const currentDept = agent.department?.name || "(none)";
    const targetDeptId = departmentIds[deptName];

    if (!targetDeptId) {
      console.log(`  [ERROR] Department "${deptName}" not found for ${agentSlug}`);
      notFound++;
      continue;
    }

    if (currentDept === deptName) {
      console.log(`  [OK] ${agentSlug} already in ${deptName}`);
      alreadyCorrect++;
      continue;
    }

    const docId = agent.documentId || agent.id;
    await fetchCMS(`/api/agents/${docId}`, {
      method: "PUT",
      body: JSON.stringify({ data: { department: targetDeptId } }),
    });
    console.log(`  [REASSIGNED] ${agentSlug}: ${currentDept} → ${deptName}`);
    reassigned++;
    await sleep(150);
  }

  // ── Step 4: Check if Cross-Functional still has agents ──────────
  console.log("\nStep 4: Checking Cross-Functional department...\n");
  const crossFunc = await findBySlug("departments", "cross-functional");
  if (crossFunc) {
    const cfId = crossFunc.documentId || crossFunc.id;
    // Re-fetch agents to check remaining
    const remaining = await fetchAll("agents", `&filters[department][slug][$eq]=cross-functional`);
    if (remaining.length === 0) {
      console.log("  Cross-Functional has 0 agents — deleting...");
      await fetchCMS(`/api/departments/${cfId}`, { method: "DELETE" });
      console.log("  [DELETED] Cross-Functional department");
    } else {
      console.log(`  Cross-Functional still has ${remaining.length} agents — keeping.`);
      for (const a of remaining) console.log(`    - ${a.name} (${a.slug})`);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────
  console.log("\n=== Summary ===");
  console.log(`  Categories created/verified: ${CATEGORIES.length}`);
  console.log(`  Departments created/updated: ${Object.keys(departmentIds).length}`);
  console.log(`  Agents reassigned: ${reassigned}`);
  console.log(`  Already correct: ${alreadyCorrect}`);
  console.log(`  Not found: ${notFound}`);

  // ── Final Verification ──────────────────────────────────────────
  console.log("\n=== Final Verification ===\n");
  const finalCats = await fetchAll("categories");
  console.log(`Categories: ${finalCats.length}`);
  for (const c of finalCats) console.log(`  - ${c.name} (${c.slug})`);

  const finalDepts = await fetchAll("departments", "&populate[category][fields][0]=name&populate[agents][count]=true");
  console.log(`\nDepartments: ${finalDepts.length}`);
  for (const d of finalDepts) {
    const catName = d.category?.name || "(no category)";
    const agentCount = d.agents?.count ?? "?";
    console.log(`  - ${d.name} → category: ${catName}, agents: ${agentCount}`);
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
