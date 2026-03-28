/**
 * Generate Release-1.0 Review Document (.docx)
 * Run: node scripts/generate-release-review.mjs
 */
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
  PageBreak, Tab, TabStopPosition, TabStopType, Header, Footer,
  ImageRun, PageNumber, NumberFormat,
} from "docx";
import fs from "fs";
import path from "path";

/* ── Colors ── */
const CORAL = "DC2626";
const ZINC_900 = "18181B";
const ZINC_700 = "3F3F46";
const ZINC_600 = "52525B";
const ZINC_400 = "A1A1AA";
const ZINC_200 = "E4E4E7";
const ZINC_100 = "F4F4F5";
const ZINC_50 = "FAFAFA";
const WHITE = "FFFFFF";

/* ── Helper: styled paragraph ── */
function p(text, opts = {}) {
  const runs = [];
  if (typeof text === "string") {
    runs.push(new TextRun({ text, size: opts.size || 22, font: "Calibri", color: opts.color || ZINC_900, bold: opts.bold, italics: opts.italics }));
  } else if (Array.isArray(text)) {
    text.forEach(t => {
      if (typeof t === "string") runs.push(new TextRun({ text: t, size: opts.size || 22, font: "Calibri", color: opts.color || ZINC_900, bold: opts.bold }));
      else runs.push(new TextRun({ size: 22, font: "Calibri", color: ZINC_900, ...t }));
    });
  }
  return new Paragraph({
    children: runs,
    spacing: { after: opts.after ?? 120, before: opts.before ?? 0, line: opts.line ?? 276 },
    alignment: opts.align,
    indent: opts.indent,
    heading: opts.heading,
    bullet: opts.bullet,
  });
}

/* ── Helper: heading ── */
function h1(text) { return p(text, { heading: HeadingLevel.HEADING_1, size: 36, bold: true, color: ZINC_900, after: 200, before: 300 }); }
function h2(text) { return p(text, { heading: HeadingLevel.HEADING_2, size: 28, bold: true, color: ZINC_900, after: 160, before: 240 }); }
function h3(text) { return p(text, { heading: HeadingLevel.HEADING_3, size: 24, bold: true, color: ZINC_700, after: 120, before: 180 }); }

/* ── Helper: bullet ── */
function bullet(text, level = 0) {
  const runs = [];
  if (typeof text === "string") {
    runs.push(new TextRun({ text, size: 22, font: "Calibri", color: ZINC_900 }));
  } else if (Array.isArray(text)) {
    text.forEach(t => {
      if (typeof t === "string") runs.push(new TextRun({ text: t, size: 22, font: "Calibri", color: ZINC_900 }));
      else runs.push(new TextRun({ size: 22, font: "Calibri", color: ZINC_900, ...t }));
    });
  }
  return new Paragraph({ children: runs, bullet: { level }, spacing: { after: 60, line: 276 } });
}

/* ── Helper: table ── */
function makeTable(headers, rows, colWidths) {
  const headerCells = headers.map((h, i) => new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, font: "Calibri", color: WHITE })], spacing: { after: 40, before: 40 }, alignment: AlignmentType.LEFT })],
    shading: { type: ShadingType.SOLID, color: ZINC_900 },
    width: colWidths ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
  }));

  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 20, font: "Calibri", color: ZINC_900 })], spacing: { after: 40, before: 40 } })],
      shading: ri % 2 === 0 ? { type: ShadingType.SOLID, color: ZINC_50 } : undefined,
      width: colWidths ? { size: colWidths[ci], type: WidthType.PERCENTAGE } : undefined,
      margins: { top: 40, bottom: 40, left: 80, right: 80 },
    })),
  }));

  return new Table({
    rows: [new TableRow({ children: headerCells, tableHeader: true }), ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

/* ── Helper: spacer ── */
function spacer(pts = 200) { return new Paragraph({ spacing: { after: pts } }); }

/* ── Helper: divider ── */
function divider() {
  return new Paragraph({
    children: [new TextRun({ text: "", size: 2 })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ZINC_200 } },
    spacing: { after: 200, before: 200 },
  });
}

/* ── Helper: status badge text ── */
function status(s) {
  if (s === "done") return { text: " DONE ", bold: true, color: "166534", size: 20 };
  if (s === "partial") return { text: " PARTIAL ", bold: true, color: "B45309", size: 20 };
  if (s === "missing") return { text: " MISSING ", bold: true, color: CORAL, size: 20 };
  if (s === "roadmap") return { text: " ROADMAP ", bold: true, color: ZINC_600, size: 20 };
  return { text: ` ${s} `, bold: true, size: 20 };
}

/* ══════════════════════════════════════════════════════════════════
   DOCUMENT CONTENT
   ══════════════════════════════════════════════════════════════════ */

const sections = [];

/* ── COVER PAGE ── */
sections.push({
  properties: {},
  children: [
    spacer(600),
    new Paragraph({
      children: [new TextRun({ text: "COLABERRY AI", size: 56, bold: true, font: "Calibri", color: ZINC_900 })],
      alignment: AlignmentType.CENTER, spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Release 1.0 Review Document", size: 40, font: "Calibri", color: ZINC_600 })],
      alignment: AlignmentType.CENTER, spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "_______________", size: 28, color: CORAL })],
      alignment: AlignmentType.CENTER, spacing: { after: 300 },
    }),
    spacer(200),
    new Paragraph({
      children: [new TextRun({ text: "Platform: ", size: 24, font: "Calibri", color: ZINC_600 }), new TextRun({ text: "colaberry.ai", size: 24, font: "Calibri", color: ZINC_900, bold: true })],
      alignment: AlignmentType.CENTER, spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Environment: ", size: 24, font: "Calibri", color: ZINC_600 }), new TextRun({ text: "GCP Cloud Run (Production)", size: 24, font: "Calibri", color: ZINC_900, bold: true })],
      alignment: AlignmentType.CENTER, spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Date: ", size: 24, font: "Calibri", color: ZINC_600 }), new TextRun({ text: "March 28, 2026", size: 24, font: "Calibri", color: ZINC_900, bold: true })],
      alignment: AlignmentType.CENTER, spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Prepared for: ", size: 24, font: "Calibri", color: ZINC_600 }), new TextRun({ text: "Ram Katamaraja, CEO", size: 24, font: "Calibri", color: ZINC_900, bold: true })],
      alignment: AlignmentType.CENTER, spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Prepared by: ", size: 24, font: "Calibri", color: ZINC_600 }), new TextRun({ text: "Sai Tejesh, Lead Developer", size: 24, font: "Calibri", color: ZINC_900, bold: true })],
      alignment: AlignmentType.CENTER, spacing: { after: 80 },
    }),
    spacer(400),
    new Paragraph({
      children: [new TextRun({ text: "CONFIDENTIAL", size: 20, font: "Calibri", color: ZINC_400, italics: true })],
      alignment: AlignmentType.CENTER,
    }),
  ],
});

/* ── TABLE OF CONTENTS PAGE ── */
sections.push({
  properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
  children: [
    h1("Table of Contents"),
    spacer(100),
    p("1.  Executive Summary", { size: 24, color: ZINC_700 }),
    p("2.  Platform Overview & Codebase Metrics", { size: 24, color: ZINC_700 }),
    p("3.  Feature Inventory", { size: 24, color: ZINC_700 }),
    p("    3.1  Homepage", { size: 22, color: ZINC_600, indent: { left: 360 } }),
    p("    3.2  AIXcelerator Platform (Agents, MCP, Skills, Tools)", { size: 22, color: ZINC_600, indent: { left: 360 } }),
    p("    3.3  Resources (Podcasts, Books, Articles)", { size: 22, color: ZINC_600, indent: { left: 360 } }),
    p("    3.4  Industries & Solutions", { size: 22, color: ZINC_600, indent: { left: 360 } }),
    p("    3.5  AEO (Answer Engine Optimization)", { size: 22, color: ZINC_600, indent: { left: 360 } }),
    p("    3.6  Global Podcast Player", { size: 22, color: ZINC_600, indent: { left: 360 } }),
    p("4.  Architecture & Infrastructure", { size: 24, color: ZINC_700 }),
    p("5.  Design System", { size: 24, color: ZINC_700 }),
    p("6.  Security & QA Sign-Off", { size: 24, color: ZINC_700 }),
    p("7.  Ram Feedback Compliance Matrix", { size: 24, color: ZINC_700 }),
    p("8.  Known Gaps & Roadmap Items", { size: 24, color: ZINC_700 }),
    p("9.  Deployment & Go-Live Checklist", { size: 24, color: ZINC_700 }),
  ],
});

/* ── 1. EXECUTIVE SUMMARY ── */
sections.push({
  properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
  children: [
    h1("1. Executive Summary"),
    p("Colaberry AI (colaberry.ai) is an enterprise AI platform built to serve as the primary digital presence for Colaberry, positioning the company as a thought leader in the AI space. The platform is designed as a destination for people, LLMs, and AI agents."),
    spacer(80),
    p("Release 1.0 delivers a production-ready platform with:", { bold: true }),
    spacer(40),

    makeTable(
      ["Metric", "Value"],
      [
        ["Total Pages", "84 statically generated + dynamic routes"],
        ["Content Types", "5 (Agents, MCP Servers, Skills, Tools, Podcasts)"],
        ["MCP Servers Cataloged", "1,500+"],
        ["Agent Profiles", "135+"],
        ["Skills Indexed", "400+"],
        ["Podcast Episodes", "246+"],
        ["Industry Workspaces", "8"],
        ["API Endpoints", "17"],
        ["React Components", "54"],
        ["TypeScript Lines", "38,259"],
        ["Git Commits", "410 over 2.5 months"],
        ["QA Verdict", "GO FOR LAUNCH (11-agent audit)"],
        ["npm Vulnerabilities", "0 (high+)"],
      ],
      [50, 50],
    ),

    spacer(120),
    h2("Key Achievements"),
    bullet("Enterprise-grade AI catalog with 3-layer knowledge graph ontology for all 5 content types"),
    bullet("Answer Engine Optimization (AEO) -- optimized for ChatGPT, Claude, Perplexity, not just Google"),
    bullet("Global podcast player with persistent playback across page navigation"),
    bullet("Left sidebar navigation (ChatGPT-style) with bottom search bar"),
    bullet("Full dark/light mode with zinc monochrome + coral accent design system"),
    bullet("5-layer bot defense protecting all forms while allowing AI crawlers"),
    bullet("12-agent security audit passed with GO verdict"),
    bullet("Docker + GCP Cloud Run production deployment pipeline"),

    spacer(120),
    h2("Development Timeline"),
    makeTable(
      ["Date", "Milestone"],
      [
        ["Jan 13, 2026", "Initial commit -- project kickoff"],
        ["Jan 22", "Podcast system with company tags, transcripts"],
        ["Feb 2", "MCP catalog first version (25 servers)"],
        ["Feb 6", "Infinite scroll pagination, LLM-friendly detail pages"],
        ["Feb 17", "Left sidebar navigation, Ask bar, Skills catalog"],
        ["Feb 19", "Skills from ClawhHub integration"],
        ["Mar 3", "Podcast UI polish -- subscribe, search, mobile fixes"],
        ["Mar 7", "Enriched MCP detail pages (Smithery-level quality)"],
        ["Mar 12", "MCP deduplication, 1,500+ servers"],
        ["Mar 18", "3-layer ontology for all content types"],
        ["Mar 25", "IP clearance audit (15 agents) + security hardening"],
        ["Mar 27", "QA sign-off (11 agents), production deployment"],
        ["Mar 28", "Global podcast player, logo update, Release 1.0"],
      ],
      [25, 75],
    ),
  ],
});

/* ── 2. PLATFORM OVERVIEW ── */
sections.push({
  properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
  children: [
    h1("2. Platform Overview & Codebase Metrics"),

    h2("2.1 Tech Stack"),
    makeTable(
      ["Layer", "Technology", "Version"],
      [
        ["Framework", "Next.js (Pages Router)", "16.2.1"],
        ["UI Library", "React", "19.2.3"],
        ["Language", "TypeScript (strict)", "5.x"],
        ["Styling", "Tailwind CSS + PostCSS", "4.x"],
        ["CMS", "Strapi v5 (headless)", "v5"],
        ["Deployment", "Docker + GCP Cloud Run", "--"],
        ["DNS/CDN", "Cloudflare", "--"],
        ["Transcription", "Deepgram API", "Pay-As-You-Go"],
        ["Graphs", "react-force-graph-2d", "Latest"],
        ["Charts", "Recharts", "Latest"],
        ["Newsletter", "Substack (colaberry.online)", "--"],
      ],
      [30, 45, 25],
    ),

    spacer(160),
    h2("2.2 Codebase Structure"),
    makeTable(
      ["Directory", "Contents", "Count"],
      [
        ["src/pages/", "Page routes (tsx + ts)", "81 files"],
        ["src/components/", "React components", "54 files"],
        ["src/lib/", "Utility modules", "23 files"],
        ["src/data/", "Static data files", "17 files"],
        ["src/styles/", "Global CSS + design tokens", "2,896 lines"],
        ["src/contexts/", "React contexts", "2 files"],
        ["src/hooks/", "Custom hooks", "2 files"],
        [".claude/agents/", "AI audit agents", "21 agents"],
        [".claude/skills/", "Reusable workflows", "5 skills"],
        ["docs/", "Architecture, ADRs, runbooks", "12+ files"],
      ],
      [30, 45, 25],
    ),

    spacer(160),
    h2("2.3 Dependencies (Minimal Attack Surface)"),
    p("Only 7 production dependencies -- intentionally minimal for security:"),
    bullet("next, react, react-dom -- core framework"),
    bullet("@google/genai, openai -- AI provider SDKs"),
    bullet("react-force-graph-2d, recharts -- visualization"),
    bullet("sanitize-html -- XSS prevention"),
    bullet("docx -- document generation"),
    spacer(80),
    p([{ text: "0 npm audit vulnerabilities", bold: true, color: "166534" }, " (high or critical)."]),
  ],
});

/* ── 3. FEATURE INVENTORY ── */
sections.push({
  properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
  children: [
    h1("3. Feature Inventory"),

    h2("3.1 Homepage (colaberry.ai)"),
    p("The homepage positions Colaberry as an enterprise AI platform with 7 major sections:"),
    spacer(40),
    makeTable(
      ["Section", "Description"],
      [
        ["Hero", "Animated dark gradient mesh with floating content-type constellation nodes, headline, 'Request Demo' CTA"],
        ["Trust Metrics", "4 animated counters: Industries (8+), Agent profiles, MCP servers, Skills indexed"],
        ["Catalog Explorer", "'Explore the catalog' with 3-column CatalogCard grid for Agents, MCPs, Skills"],
        ["Signal Dashboard", "Tabbed view of latest/trending across all content types (Agents, Skills, MCPs, Podcasts, Use Cases)"],
        ["Platform Tabs", "Observability, Security, Workspaces, Developer capability tabs"],
        ["MCP Integrations", "'Connect your stack' panel with 12 enterprise integration chips (Slack, Teams, Salesforce, etc.)"],
        ["Resources Quick Links", "'Explore next' panel linking to Trust Before Intelligence book and Podcasts"],
      ],
      [25, 75],
    ),
    spacer(80),
    p([{ text: "Structured Data: ", bold: true }, "WebSite schema with SearchAction + FAQPage schema with 3 enterprise-focused questions for AI citation."]),

    spacer(200),
    h2("3.2 AIXcelerator Platform"),
    p("The AIXcelerator workspace (/aixcelerator) is the core platform catalog housing all AI assets. Every content type follows the 3-Layer Ontology Pattern:"),
    spacer(40),
    bullet([{ text: "Layer 1 -- Taxonomy: ", bold: true }, "SVG ontology diagram showing category hierarchy"]),
    bullet([{ text: "Layer 2 -- Relation Graph: ", bold: true }, "Interactive ForceGraph2D with search, filter, fullscreen"]),
    bullet([{ text: "Layer 3 -- Collections: ", bold: true }, "Curated groupings with embedded graphs"]),
    spacer(120),

    h3("Content Types (5)"),
    makeTable(
      ["Type", "Count", "Categories", "Routes (6 each)"],
      [
        ["Agents", "135+", "8 categories", "Listing, Detail, Ontology, Graph, Collections, Collection Detail"],
        ["MCP Servers", "1,500+", "9 categories", "Listing, Detail, Ontology, Graph, Collections, Collection Detail"],
        ["Skills", "400+", "10 categories", "Listing, Detail, Ontology, Graph, Collections, Collection Detail"],
        ["Tools", "TBD", "12 categories", "Listing, Detail, Ontology, Graph, Collections, Collection Detail"],
        ["Podcasts", "246+", "8 categories", "Listing, Detail, Ontology, Graph, Collections, Collection Detail"],
      ],
      [18, 14, 18, 50],
    ),
    spacer(80),
    p([{ text: "Total: 30 content-type routes", bold: true }, " + 5 platform-level pages (Hub, Ontology, Ecosystem, Solution Stacks listing + detail)."]),

    spacer(120),
    h3("MCP Server Detail Page (Richest in Platform)"),
    p("Each MCP server detail page includes 12 specialized components:"),
    bullet("EnrichedToolCard -- detailed tool information with parameters"),
    bullet("ConnectSidebar -- connection instructions and quick-start"),
    bullet("PerformanceTab -- latency, throughput, reliability metrics"),
    bullet("UsageTab -- usage statistics and trends"),
    bullet("GitHubStats -- repository stars, forks, issues, last commit"),
    bullet("CodeBlock / TabbedCodeBlock -- syntax-highlighted install commands"),
    bullet("SpecCard -- API specification details"),
    bullet("StickyTabBar -- Overview, Hosting, API, Performance, Usage tabs"),
    bullet("JSON-LD structured data (SoftwareApplication + HowTo schemas)"),

    spacer(120),
    h3("Platform-Level Knowledge Graph"),
    bullet([{ text: "Platform Ontology (/aixcelerator/ontology): ", bold: true }, "SVG diagram showing all 5 content types and their relationships"]),
    bullet([{ text: "Ecosystem Graph (/aixcelerator/ecosystem): ", bold: true }, "Interactive force-graph with cross-type edges, directional particles, frosted-glass controls"]),
    bullet([{ text: "Solution Stacks: ", bold: true }, "Pre-configured agent+MCP+skill combinations for enterprise use cases"]),
    spacer(80),
    p("Cross-type relations mapped: Agent USES Skill, Agent CONNECTS_VIA MCP, Podcast DISCUSSES Agent/MCP/Skill"),
  ],
});

/* ── 3.3 - 3.6 ── */
sections.push({
  properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
  children: [
    h2("3.3 Resources"),

    h3("Podcasts (/resources/podcasts)"),
    p("Full-featured podcast platform with enterprise-grade features:"),
    makeTable(
      ["Feature", "Implementation"],
      [
        ["Episode Listing", "Infinite scroll (IntersectionObserver), 24 per page, hero episode with play overlay"],
        ["Episode Detail", "Full transcript (Deepgram timed + HTML fallback), share buttons, platform links, company tags"],
        ["Global Player", "Single <audio> in _app.tsx persists across navigation. GlobalMiniPlayer bar on all pages."],
        ["Search", "Query parameter (?q=) searching title, tags, companies. Company chip examples when collapsed."],
        ["Type Filter", "Internal / External / All podcast filtering"],
        ["Company Pages", "/resources/podcasts/company?slug=X -- filter by company"],
        ["Tag Pages", "/resources/podcasts/tag/[tag] -- filter by hashtag"],
        ["Subscribe", "Email forms on listing sidebar + detail page. 'Podcast notifications' consent text."],
        ["Bot Protection", "Honeypot + IP rate limiting + bot-defense.ts (5-layer)"],
        ["Platform Links", "Apple Podcasts, Spotify, YouTube, Substack, X/Twitter, RSS"],
        ["Auto-play on Detail", "Episode auto-loads into global player when detail page mounts"],
        ["Crash Recovery", "localStorage persists episode + position every 2s, restores on page reload"],
        ["Browse By Company", "Sidebar section with separator, links to company filter page"],
      ],
      [25, 75],
    ),

    spacer(120),
    h3("Other Resources"),
    makeTable(
      ["Resource", "Route", "Status"],
      [
        ["Books", "/resources/books", "Live -- 'Trust Before Intelligence' featured"],
        ["White Papers", "/resources/white-papers", "Live -- hero + content"],
        ["Case Studies", "/resources/case-studies", "Built (hidden from nav)"],
        ["Articles", "/resources/articles + /articles/[slug]", "Built (hidden from nav)"],
      ],
      [25, 40, 35],
    ),

    spacer(200),
    h2("3.4 Industries & Solutions"),
    p("8 industry workspaces with domain-specific agent/use-case counts:"),
    makeTable(
      ["Industry", "Route"],
      [
        ["Agriculture", "/industries/agriculture"],
        ["Energy", "/industries/energy"],
        ["Utilities", "/industries/utilities"],
        ["Healthcare & Life Sciences", "/industries/healthcare-life-sciences"],
        ["Climate Tech", "/industries/climate-tech"],
        ["Manufacturing", "/industries/manufacturing"],
        ["Fintech", "/industries/fintech"],
        ["Supply Chain", "/industries/supply-chain"],
      ],
      [50, 50],
    ),
    spacer(80),
    p([{ text: "Solutions page", bold: true }, " (/solutions) exists with packaged enterprise offerings. Currently hidden from navigation pending content finalization."]),

    spacer(200),
    h2("3.5 AEO (Answer Engine Optimization)"),
    p("colaberry.ai is built AEO-first -- optimized for AI answer engines, not just traditional SEO:"),
    spacer(40),
    makeTable(
      ["Feature", "Route/File", "Purpose"],
      [
        ["/llms.txt", "src/pages/llms.txt.ts", "Dynamic AI crawler manifest with live CMS catalog counts"],
        ["/llms-full.txt", "src/pages/llms-full.txt.ts", "Complete content index with summaries for all items"],
        ["/robots.txt", "src/pages/robots.txt.ts", "Welcomes GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot"],
        ["FAQ Schema", "src/pages/index.tsx", "FAQPage JSON-LD with 3 enterprise AI questions"],
        ["AeoQuickAnswer", "src/components/AeoQuickAnswer.tsx", "Answer-optimized blocks (<300 words) for AI citation"],
        ["/sitemap.xml", "src/pages/sitemap.xml.ts", "Dynamic sitemap with all CMS content + lastmod dates"],
        ["JSON-LD", "All detail pages", "SoftwareApplication, HowTo, WebSite, FAQPage schemas"],
        ["Bot Defense", "src/lib/bot-defense.ts", "5-layer protection: allows AI crawlers on GET, blocks spam on POST"],
      ],
      [20, 35, 45],
    ),

    spacer(200),
    h2("3.6 Global Podcast Player"),
    p("Implemented March 28, 2026 -- directly addressing Ram's Comment #22 and #23 feedback (playback stops when navigating between listing and detail pages):"),
    spacer(40),
    bullet([{ text: "Architecture: ", bold: true }, "Single <audio> element in _app.tsx wrapped in PodcastPlayerProvider React Context"]),
    bullet([{ text: "Persistence: ", bold: true }, "Audio survives Next.js Pages Router page transitions (mount/unmount cycles)"]),
    bullet([{ text: "GlobalMiniPlayer: ", bold: true }, "Fixed bottom bar with cover art, title, time, play/pause, stop. Hidden on the detail page of current episode."]),
    bullet([{ text: "Crash Recovery: ", bold: true }, "localStorage saves episode metadata + position every 2 seconds. Restores on page reload."]),
    bullet([{ text: "State Sync: ", bold: true }, "AudioPlayerUI syncs play/pause/time state from external audio on mount via useEffect initial sync"]),
  ],
});

/* ── 4. ARCHITECTURE ── */
sections.push({
  properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
  children: [
    h1("4. Architecture & Infrastructure"),

    h2("4.1 Deployment Architecture"),
    makeTable(
      ["Component", "Service", "Region"],
      [
        ["Frontend (Next.js)", "colaberry-ai-prod (Cloud Run)", "us-east1"],
        ["CMS (Strapi v5)", "colaberry-ai-cms-prod (Cloud Run)", "us-east1"],
        ["DNS / CDN", "Cloudflare", "Global"],
        ["Domain", "colaberry.ai", "--"],
        ["Dev Environment", "dev.colaberry.ai", "us-east1"],
        ["Build Pipeline", "Cloud Build (auto-trigger on push)", "--"],
        ["Container", "Docker multi-stage, Alpine, non-root user", "--"],
      ],
      [30, 45, 25],
    ),

    spacer(160),
    h2("4.2 Security Headers"),
    p("Applied to all routes via next.config.ts:"),
    bullet("X-Frame-Options: DENY"),
    bullet("X-Content-Type-Options: nosniff"),
    bullet("X-XSS-Protection: 0 (modern CSP preferred)"),
    bullet("Referrer-Policy: strict-origin-when-cross-origin"),
    bullet("Permissions-Policy: camera=(), microphone=(), geolocation=()"),
    bullet("Content-Security-Policy (production mode)"),
    bullet("Strict-Transport-Security: max-age=63072000; includeSubDomains; preload"),
    bullet("X-Powered-By header removed (OWASP A05)"),

    spacer(160),
    h2("4.3 API Routes (17 Endpoints)"),
    makeTable(
      ["Category", "Endpoints", "Protection"],
      [
        ["Catalog Data", "/api/mcps, /api/podcasts, /api/tools", "Rate limited, cached"],
        ["Newsletter", "/api/newsletter-subscribe, -unsubscribe, -send, -report, -template-preview", "Bot defense, rate limited"],
        ["Forms", "/api/demo-request", "5-layer bot defense, email validation"],
        ["Telemetry", "/api/mcp-telemetry, /api/seed-telemetry, /api/seed-telemetry-bulk", "Admin auth required"],
        ["External", "/api/github-stats, /api/catalog-health", "Cached, error-handled"],
        ["Sync", "/api/sync-mcp-registry, /api/cron/buzzsprout-sync", "Auth protected"],
        ["Logging", "/api/podcast-log", "Fire-and-forget analytics"],
      ],
      [20, 50, 30],
    ),

    spacer(160),
    h2("4.4 URL Architecture"),
    p("SEO-friendly, LLM-readable URL structure:"),
    bullet("/aixcelerator/agents/[slug] -- Agent profiles"),
    bullet("/aixcelerator/mcp/[slug] -- MCP server profiles"),
    bullet("/aixcelerator/skills/[slug] -- Skill profiles"),
    bullet("/aixcelerator/tools/[slug] -- Tool profiles"),
    bullet("/resources/podcasts/[slug] -- Podcast episodes"),
    bullet("/industries/[industry] -- Industry workspaces"),
    spacer(80),
    p("Legacy URL redirects (301 permanent):"),
    bullet("/episodes -> /resources/podcasts"),
    bullet("/episodes/[slug] -> /resources/podcasts/[slug]"),
    bullet("MCP slug aliases for descriptive URLs"),
  ],
});

/* ── 5. DESIGN SYSTEM ── */
sections.push({
  properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
  children: [
    h1("5. Design System"),

    h2("5.1 Monochrome + Coral Accent"),
    p("The design system uses a zinc monochrome palette with coral (#DC2626) as the sole accent color. This creates a premium, enterprise-grade appearance."),
    spacer(40),
    makeTable(
      ["Token", "Light Mode", "Dark Mode"],
      [
        ["Background", "#FFFFFF", "#09090B (zinc-950)"],
        ["Surface", "#FAFAFA (zinc-50)", "#18181B (zinc-900)"],
        ["Text Primary", "#18181B (zinc-900)", "#FAFAFA (zinc-50)"],
        ["Text Muted", "#52525B (zinc-600)", "#A1A1AA (zinc-400)"],
        ["Border", "#E4E4E7 (zinc-200)", "#3F3F46 (zinc-700)"],
        ["Accent (Coral)", "#DC2626", "#F87171"],
      ],
      [30, 35, 35],
    ),
    spacer(80),
    p([{ text: "Forbidden colors: ", bold: true, color: CORAL }, "emerald, green, blue, amber, slate. Coral used ONLY for CTAs and small accent dots."]),

    spacer(160),
    h2("5.2 Dark Mode (Default)"),
    bullet("Toggle via .dark class on <html>, persisted in localStorage"),
    bullet("CSS custom properties swap between :root and .dark blocks in globals.css"),
    bullet("All components use dark: Tailwind variants"),
    bullet("Dark mode is the enterprise default"),

    spacer(160),
    h2("5.3 Typography"),
    bullet("Font: Inter (loaded via next/font/google, variable --font-inter)"),
    bullet("Scale: display-2xl (4.5rem) down to body-xs (0.75rem)"),
    bullet("All text elements resolve to Inter"),

    spacer(160),
    h2("5.4 Component Standards"),
    makeTable(
      ["Class", "Purpose", "Rules"],
      [
        [".catalog-card", "Listing cards", "1px border, no hover lift, no glassmorphism"],
        [".surface-panel", "Filter/search panels", "Zinc surface with border"],
        [".chip-brand", "Active filter", "Coral accent fill"],
        [".chip-neutral", "Default filter", "Zinc scale"],
        [".detail-section", "Content sections on detail pages", "Consistent spacing"],
        [".reveal", "Scroll animations", "0.4s, translateY(12px), cubic-bezier(0.16,1,0.3,1)"],
        [".stagger-grid", "Card grid animations", "Never nested inside .reveal"],
      ],
      [22, 30, 48],
    ),
  ],
});

/* ── 6. SECURITY & QA ── */
sections.push({
  properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
  children: [
    h1("6. Security & QA Sign-Off"),

    h2("6.1 QA Sign-Off Summary (March 27, 2026)"),
    p([{ text: "VERDICT: GO FOR LAUNCH", bold: true, color: "166534", size: 26 }]),
    spacer(40),
    makeTable(
      ["Metric", "Result"],
      [
        ["Build", "0 errors, 0 warnings"],
        ["Static Pages Generated", "84/84"],
        ["npm Audit Vulnerabilities", "0 (high+)"],
        ["Production Dependencies", "7 (minimal attack surface)"],
        ["Agents Audited", "11"],
        ["Critical Findings", "3 (all addressed)"],
        ["High Findings", "9 (all addressed)"],
        ["Medium Findings", "9"],
        ["Low Findings", "30"],
      ],
      [40, 60],
    ),

    spacer(160),
    h2("6.2 Security Audit Agents (11)"),
    makeTable(
      ["Agent", "Scope", "Result"],
      [
        ["Secrets Scanner", "API keys, tokens, .env files in git", "PASS"],
        ["Input Sanitization", "XSS, email injection, CSP headers", "PASS (with fixes)"],
        ["Rate Limiting", "API routes, brute force protection", "PASS"],
        ["Auth Architecture", "Admin route auth, timing-safe comparisons", "PASS"],
        ["API Security", "CORS, security headers, error leakage", "PASS"],
        ["File Uploads", "Upload validation, path traversal, MIME checks", "PASS (N/A -- no uploads)"],
        ["Dependencies", "npm audit, Dockerfile hardening, supply chain", "PASS"],
        ["OWASP Pentest", "Top 10 penetration testing", "PASS"],
        ["WCAG 2.2", "Accessibility Level AA audit", "7 findings (non-blocking)"],
        ["Core Web Vitals", "LCP, INP, CLS, PageSpeed", "PASS"],
        ["API Performance", "Response time, best practices", "PASS"],
      ],
      [22, 40, 38],
    ),

    spacer(160),
    h2("6.3 IP Clearance Audit (15 Agents)"),
    p("Comprehensive intellectual property audit conducted before go-live:"),
    makeTable(
      ["Source Checked", "Risk Level", "Action Taken"],
      [
        ["SkillNet / openkg.cn", "HIGH", "5 user-facing refs removed from SEO/OG/llms.txt"],
        ["ZBrain", "HIGH", "10 branded agents checked in prod CMS"],
        ["Together.ai", "LOW", "Design comments removed, legitimate API use retained"],
        ["Smithery", "LOW", "1 comment removed, third-party data refs retained"],
        ["Moveworks", "CLEAN", "Zero references"],
        ["Pipedream", "LOW", "Only in data file"],
        ["Vizuara", "LOW", "Design comments removed"],
        ["Arize / Sanalabs / GenAI.works", "CLEAN", "Zero references"],
        ["General brand audit", "HIGH", "ClawHub data file flagged, third-party licenses reviewed"],
      ],
      [30, 18, 52],
    ),

    spacer(160),
    h2("6.4 Bot Defense (5-Layer)"),
    makeTable(
      ["Layer", "Mechanism", "Purpose"],
      [
        ["1", "Honeypot field", "Catches basic bots that fill all fields"],
        ["2", "Time-based check", "Rejects submissions < 3 seconds"],
        ["3", "JS-generated HMAC token", "Proves JavaScript executed (blocks curl/wget)"],
        ["4", "User-agent filtering", "Blocks known bot UAs on form POST"],
        ["5", "Cloudflare Turnstile (future)", "Invisible CAPTCHA slot"],
      ],
      [10, 35, 55],
    ),
    spacer(80),
    p([{ text: "AEO-Safe: ", bold: true }, "AI crawlers (GPTBot, ClaudeBot, etc.) are allowed on GET requests. Bot defense only activates on POST (form submissions)."]),
  ],
});

/* ── 7. RAM FEEDBACK COMPLIANCE ── */
sections.push({
  properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
  children: [
    h1("7. Ram Feedback Compliance Matrix"),
    p("All 35 feedback comments from Ram Katamaraja (Jan 7 -- Mar 18, 2026) audited against the codebase by 4 parallel analysis agents:"),
    spacer(80),

    makeTable(
      ["Overall Status", "Count", "%"],
      [
        ["DONE", "45 items", "72%"],
        ["PARTIAL", "12 items", "19%"],
        ["MISSING (Roadmap)", "5 items", "8%"],
      ],
      [35, 30, 35],
    ),

    spacer(160),
    h2("7.1 Podcast Feedback (Comments #8, #12, #17, #18, #22, #23)"),
    makeTable(
      ["Item", "Status", "Notes"],
      [
        ["Company hashtag organization", "DONE", "Browse by Company section + company filter page"],
        ["Transcript visibility", "DONE", "Deepgram timed + HTML fallback"],
        ["Share icons visible", "DONE", "LinkedIn, X, Facebook always visible"],
        ["Internal/External separation", "DONE", "Type filter toggle"],
        ["Search with company examples", "DONE", "Company chip examples shown"],
        ["Infinite scroll pagination", "DONE", "IntersectionObserver, 24/page"],
        ["Podcast on homepage", "DONE", "Signal cards with latest + trending"],
        ["Playback persists across pages", "DONE", "Global player (Mar 28 fix)"],
        ["Subscribe forms (both pages)", "DONE", "Listing sidebar + detail page"],
        ["'Podcast notifications' text", "DONE", "Changed from 'marketing communications'"],
        ["Bot protection for subscribe", "DONE", "5-layer defense"],
        ["Separator before Browse By Company", "DONE", "border-t divider"],
        ["Platform links (Apple, Spotify...)", "DONE", "6 platforms supported"],
        ["Mobile menu left-aligned", "DONE", "Hamburger before logo"],
        ["Auto-posting to social channels", "MISSING", "Roadmap -- backend/workflow"],
        ["Chrome plug-in", "MISSING", "Roadmap -- extension"],
        ["Podcast generation automation", "MISSING", "Roadmap -- pipeline"],
      ],
      [35, 12, 53],
    ),

    spacer(160),
    h2("7.2 Platform Feedback (Comments #6, #13, #16, #20, #27, #28, #29, #30, #32, #34)"),
    makeTable(
      ["Item", "Status", "Notes"],
      [
        ["Use Cases catalog", "DONE", "Built (hidden from nav)"],
        ["1,500+ MCP servers", "DONE", "Up from 25 in Feb"],
        ["Infinite scroll on all catalogs", "DONE", "All 5 content types"],
        ["LLM-friendly detail pages", "DONE", "JSON-LD + semantic HTML"],
        ["Skills catalog", "DONE", "400+ skills with ontology"],
        ["Enriched MCP details (Smithery-level)", "DONE", "12 specialized components"],
        ["MCP deduplication", "DONE", "3-key dedup logic"],
        ["Filter MCP by tools", "DONE", "Tool filter dropdown"],
        ["3-layer ontology visualization", "DONE", "All 5 content types"],
        ["Agents + Skills catalogs", "DONE", "Full feature parity with MCP"],
        ["Chatbot for exploration", "PARTIAL", "/assistant page exists -- guided prompts only"],
        ["Descriptive MCP URLs", "PARTIAL", "Dedup prefers short slugs, CMS data quality varies"],
        ["External links not 404", "PARTIAL", "GitHub validated, other links unchecked"],
      ],
      [35, 12, 53],
    ),

    spacer(160),
    h2("7.3 UI/UX Feedback (Comments #0, #2, #9, #18, #19, #22, #23, #31)"),
    makeTable(
      ["Item", "Status", "Notes"],
      [
        ["Enterprise positioning", "DONE", "Hero, signal cards, 'Book a Demo'"],
        ["Dark/light mode", "DONE", "Toggle in header, localStorage persistence"],
        ["Left sidebar navigation", "DONE", "ChatGPT-style, Cmd+B toggle"],
        ["Ask bar at bottom", "DONE", "Fixed bar on catalog pages"],
        [".ai domain live", "DONE", "colaberry.ai on Cloud Run"],
        ["Streamlined menu items", "DONE", "4 top-level + hidden routes"],
        ["Mobile hamburger left-aligned", "DONE", "Gmail/YouTube pattern"],
        ["Industries (8 workspaces)", "DONE", "Including Agriculture, Manufacturing, Supply Chain"],
        ["Oil & Gas industry", "PARTIAL", "Merged into 'Energy' -- not separate"],
        ["Biotech industry", "PARTIAL", "Merged into 'Healthcare' -- not separate"],
        ["Ask bar + MiniPlayer overlap", "PARTIAL", "Both fixed-bottom, can overlap on catalog pages"],
      ],
      [35, 12, 53],
    ),

    spacer(160),
    h2("7.4 Content & AEO (Comments #4, #10, #11)"),
    makeTable(
      ["Item", "Status", "Notes"],
      [
        ["Books page", "DONE", "'Trust Before Intelligence' featured"],
        ["Case Studies & White Papers", "DONE", "Pages built (case studies hidden from nav)"],
        ["Industries & Solutions", "DONE", "8 industries live, solutions built"],
        ["News / Updates aggregator", "DONE", "/updates with GAI Insights"],
        ["llms.txt + llms-full.txt", "DONE", "Dynamic AI manifests"],
        ["robots.txt welcomes AI bots", "DONE", "5 AI crawlers explicitly allowed"],
        ["FAQ Schema", "DONE", "3 questions in JSON-LD"],
        ["AeoQuickAnswer blocks", "DONE", "On 4 catalog pages"],
        ["Central documentation", "DONE", "docs/ with architecture, ADRs, runbooks"],
        ["Architecture diagrams (publishable)", "PARTIAL", "In-app SVGs only, no PDF export"],
        ["Sitemap completeness", "PARTIAL", "Main routes done, ontology/graph pages missing"],
      ],
      [35, 12, 53],
    ),
  ],
});

/* ── 8. KNOWN GAPS ── */
sections.push({
  properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
  children: [
    h1("8. Known Gaps & Roadmap Items"),

    h2("8.1 Roadmap Items (Ram acknowledged as future)"),
    makeTable(
      ["Item", "Ram Comment", "Priority", "Notes"],
      [
        ["Auto-posting to social channels", "#8 (Jan 22)", "Medium", "LinkedIn, Reddit, Instagram, YouTube, TikTok -- backend/workflow"],
        ["Chrome plug-in for podcast submission", "#8, #12", "Low", "Browser extension for link submission"],
        ["Podcast generation automation", "#12 (Feb 2)", "Medium", "Buzzsprout import exists; full generation pipeline TBD"],
        ["Conversational chatbot", "#16 (Feb 6)", "High", "/assistant page exists as placeholder"],
        ["Strapi write API for content posting", "#9 (Jan 24)", "Medium", "CMS config -- Ali's API posting workflow"],
      ],
      [30, 18, 12, 40],
    ),

    spacer(160),
    h2("8.2 Partial Items (Quick Fixes Available)"),
    makeTable(
      ["Item", "Current State", "Fix Needed"],
      [
        ["Ask bar + MiniPlayer overlap", "Both z-index at bottom", "Offset Ask bar when MiniPlayer visible"],
        ["Oil & Gas / Biotech industries", "Merged into Energy / Healthcare", "Add as explicit sub-entries or labels"],
        ["Sitemap missing ontology pages", "Main routes indexed", "Add 15+ ontology/graph/collection URLs"],
        ["External link validation (non-GitHub)", "GitHub links validated", "Add link checker for CMS source URLs"],
        ["MCP non-descriptive slugs", "Dedup prefers short slugs", "CMS data cleanup for remaining bad slugs"],
        ["Search visibility (Ask bar examples)", "Has placeholder text", "Add descriptive example queries"],
      ],
      [30, 35, 35],
    ),

    spacer(160),
    h2("8.3 Hidden Routes (Built but Not in Navigation)"),
    p("These 5 routes are fully implemented but hidden via RELEASE_HIDDEN_PATHS until approved:"),
    makeTable(
      ["Route", "Content", "Readiness"],
      [
        ["/aixcelerator/tools", "Tools catalog with ontology/graph/collections", "Content pending"],
        ["/use-cases", "Use Cases listing + detail pages", "CMS content needed"],
        ["/solutions", "Packaged enterprise solutions", "Content finalization needed"],
        ["/resources/articles", "Articles listing + detail pages", "CMS content needed"],
        ["/resources/case-studies", "Case studies linked to industries", "Content finalization needed"],
      ],
      [30, 40, 30],
    ),
    spacer(80),
    p([{ text: "To reveal: ", bold: true }, "Set NEXT_PUBLIC_SHOW_ALL_NAV=true or remove paths from RELEASE_HIDDEN_PATHS in Layout.tsx."]),
  ],
});

/* ── 9. DEPLOYMENT CHECKLIST ── */
sections.push({
  properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
  children: [
    h1("9. Deployment & Go-Live Checklist"),
    spacer(40),

    makeTable(
      ["#", "Task", "Status"],
      [
        ["1", "TypeScript check (npx tsc --noEmit) -- 0 errors", "DONE"],
        ["2", "ESLint check (npm run lint)", "DONE"],
        ["3", "Production build (npm run build) -- 84/84 pages", "DONE"],
        ["4", "11-agent QA audit -- GO FOR LAUNCH", "DONE"],
        ["5", "15-agent IP clearance audit", "DONE"],
        ["6", "SkillNet references removed from user-facing content", "DONE"],
        ["7", "Security headers configured (6 headers)", "DONE"],
        ["8", "Bot defense active on all form endpoints", "DONE"],
        ["9", "Docker multi-stage build, Alpine, non-root", "DONE"],
        ["10", "Cloud Run prod deployment (colaberry-ai-prod)", "DONE"],
        ["11", "colaberry.ai DNS pointing to Cloud Run", "DONE"],
        ["12", "dev.colaberry.ai verified", "DONE"],
        ["13", "www.colaberry.ai domain mapping", "IN PROGRESS"],
        ["14", "Legacy /episodes redirect (301)", "DONE"],
        ["15", "Sitemap submitted to Google Search Console", "PENDING"],
        ["16", "Cloud Monitoring alerts + uptime check", "PENDING"],
        ["17", "LinkedIn launch announcement", "PENDING"],
      ],
      [8, 62, 30],
    ),

    spacer(200),
    divider(),
    spacer(100),

    new Paragraph({
      children: [new TextRun({ text: "Document prepared by Sai Tejesh", size: 22, font: "Calibri", color: ZINC_600, italics: true })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: "Colaberry AI -- Release 1.0 -- March 28, 2026", size: 22, font: "Calibri", color: ZINC_600, italics: true })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({ text: "Generated with Claude Code", size: 20, font: "Calibri", color: ZINC_400, italics: true })],
      alignment: AlignmentType.CENTER, spacing: { before: 80 },
    }),
  ],
});

/* ══════════════════════════════════════════════════════════════════
   BUILD DOCUMENT
   ══════════════════════════════════════════════════════════════════ */

const doc = new Document({
  creator: "Sai Tejesh",
  title: "Colaberry AI -- Release 1.0 Review Document",
  description: "Comprehensive review document for Colaberry AI Release 1.0 go-live",
  styles: {
    default: {
      heading1: { run: { size: 36, bold: true, font: "Calibri", color: ZINC_900 }, paragraph: { spacing: { before: 360, after: 200 } } },
      heading2: { run: { size: 28, bold: true, font: "Calibri", color: ZINC_900 }, paragraph: { spacing: { before: 280, after: 160 } } },
      heading3: { run: { size: 24, bold: true, font: "Calibri", color: ZINC_700 }, paragraph: { spacing: { before: 200, after: 120 } } },
      document: { run: { size: 22, font: "Calibri", color: ZINC_900 }, paragraph: { spacing: { line: 276 } } },
    },
  },
  sections,
});

const outPath = path.resolve("docs/Release-1.0-Review-Document.docx");
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buffer);
console.log(`\n  Release 1.0 Review Document generated at:\n  ${outPath}\n  Size: ${(buffer.length / 1024).toFixed(1)} KB\n`);
