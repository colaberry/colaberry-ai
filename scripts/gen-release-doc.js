const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, LevelFormat, PageNumber, PageBreak, TableOfContents } = require("docx");

const CORAL = "DC2626";
const ZINC900 = "18181B";
const ZINC50 = "FAFAFA";
const ZINC200 = "E4E4E7";
const ZINC400 = "A1A1AA";
const ZINC600 = "71717A";

const border = { style: BorderStyle.SINGLE, size: 1, color: ZINC200 };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function hCell(text, width, align) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: ZINC900, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ alignment: align || AlignmentType.LEFT, children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 18 })] })]
  });
}

function dCell(text, width, opts) {
  const runs = [];
  if (opts && opts.bold) {
    runs.push(new TextRun({ text, bold: true, font: "Arial", size: 18 }));
  } else if (opts && opts.code) {
    runs.push(new TextRun({ text, font: "Courier New", size: 16, color: ZINC600 }));
  } else {
    runs.push(new TextRun({ text, font: "Arial", size: 18 }));
  }
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    shading: opts && opts.alt ? { fill: "FAFAFA", type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({ children: runs })]
  });
}

function makeTable(headers, rows, widths) {
  const tw = widths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: tw, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ children: headers.map((h, i) => hCell(h, widths[i])) }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => {
          if (typeof cell === "object") return dCell(cell.text, widths[ci], cell);
          return dCell(cell, widths[ci], { alt: ri % 2 === 1 });
        })
      }))
    ]
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 32, color: CORAL })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 26, color: ZINC900 })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 22, color: ZINC600 })]
  });
}

function p(text) {
  return new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text, font: "Arial", size: 20 })] });
}

function bp(label, text) {
  return new Paragraph({ spacing: { after: 80 }, children: [
    new TextRun({ text: label, bold: true, font: "Arial", size: 20 }),
    new TextRun({ text, font: "Arial", size: 20 })
  ]});
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 20 })]
  });
}

function bullet2(text) {
  return new Paragraph({
    numbering: { reference: "bullets2", level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 20 })]
  });
}

function spacer() {
  return new Paragraph({ spacing: { after: 80 } });
}

// Read all commits
const commits = fs.readFileSync("/tmp/release-commits.txt", "utf8").trim().split("\n");

// Categorize commits
const categories = {
  "Security & Hardening": [],
  "Features & Enhancements": [],
  "UI/UX & Design": [],
  "Bug Fixes": [],
  "Infrastructure & DevOps": [],
  "Documentation & QA": [],
  "Merge & Maintenance": [],
};

commits.forEach(line => {
  const lower = line.toLowerCase();
  if (/merge|revert/.test(lower)) categories["Merge & Maintenance"].push(line);
  else if (/security|xss|csp|pentest|vuln|sanitiz|hardening|bot.defense|ip.spoof|cvr|audit|timing/.test(lower)) categories["Security & Hardening"].push(line);
  else if (/fix|bug|typo|issue|broken|error|lint|override/.test(lower)) categories["Bug Fixes"].push(line);
  else if (/docker|cloud.run|deploy|ci|build|env|dockerfile|production security/.test(lower)) categories["Infrastructure & DevOps"].push(line);
  else if (/qa|sign.off|claude\.md|readme|doc|architecture|spec|constitution/.test(lower)) categories["Documentation & QA"].push(line);
  else if (/theme|dark.mode|animation|polish|redesign|responsive|mobile|premium|enterprise|contrast|icon|logo|font|watermark|footer|header|menu|nav|sidebar/.test(lower)) categories["UI/UX & Design"].push(line);
  else categories["Features & Enhancements"].push(line);
});

const commitSections = [];
Object.entries(categories).forEach(([cat, items]) => {
  if (items.length === 0) return;
  commitSections.push(h3(`${cat} (${items.length} commits)`));
  // Build table rows
  const rows = items.map(line => {
    const hash = line.substring(0, 7);
    const msg = line.substring(8);
    return [hash, msg];
  });
  commitSections.push(makeTable(["Hash", "Message"], rows, [1400, 7960]));
  commitSections.push(spacer());
});

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullets2", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2013", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 20 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, font: "Arial", color: CORAL }, paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial" }, paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 22, bold: true, font: "Arial", color: ZINC600 }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: CORAL, space: 4 } },
          children: [
            new TextRun({ text: "Colaberry AI", bold: true, font: "Arial", size: 18, color: CORAL }),
            new TextRun({ text: "  |  Release 1.0 Production Release Notes", font: "Arial", size: 18, color: ZINC400 })
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 1, color: ZINC200, space: 4 } },
          children: [
            new TextRun({ text: "Confidential  |  Page ", font: "Arial", size: 16, color: ZINC400 }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: ZINC400 })
          ]
        })]
      })
    },
    children: [
      // ===== TITLE PAGE =====
      new Paragraph({ spacing: { before: 2400 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: "Release 1.0", bold: true, font: "Arial", size: 64, color: CORAL })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "Production Release Notes", font: "Arial", size: 36, color: ZINC900 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "colaberry.ai \u2014 The go-to destination for agents, MCPs, and AI knowledge", font: "Arial", size: 22, color: ZINC600 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 2, color: CORAL, space: 8 } },
        spacing: { before: 200, after: 80 },
        children: [new TextRun({ text: "March 27, 2026", font: "Arial", size: 22, color: ZINC400 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "405 commits  |  53+ pages  |  38+ components", font: "Arial", size: 20, color: ZINC400 })]
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ===== TABLE OF CONTENTS =====
      new Paragraph({
        spacing: { after: 300 },
        children: [new TextRun({ text: "Table of Contents", bold: true, font: "Arial", size: 32, color: CORAL })]
      }),
      new TableOfContents("TOC", { hyperlink: true, headingStyleRange: "1-3" }),
      new Paragraph({ children: [new PageBreak()] }),

      // ===== 1. RELEASE OVERVIEW =====
      h1("1. Release Overview"),
      makeTable(
        ["Property", "Value"],
        [
          ["Version", "Release 1.0"],
          ["Release Date", "March 27, 2026"],
          ["Domain", "colaberry.ai"],
          ["Branch", "Release-1.0"],
          ["Total Commits", "405"],
          ["Infrastructure", "Docker + GCP Cloud Run (us-east1)"],
          ["CMS", "Strapi v5 headless (colaberry-ai-cms-prod)"],
          ["CI/CD", "Cloud Build auto-deploy on push"],
        ],
        [3200, 6160]
      ),

      // ===== 2. TECH STACK =====
      new Paragraph({ children: [new PageBreak()] }),
      h1("2. Tech Stack"),
      makeTable(
        ["Technology", "Details"],
        [
          ["Framework", "Next.js 16.2.1 (Pages Router) with React 19.2.3"],
          ["Language", "TypeScript 5 (strict mode)"],
          ["Styling", "Tailwind CSS 4 + PostCSS"],
          ["Fonts", "Inter via next/font/google"],
          ["CMS", "Strapi v5 headless"],
          ["Deployment", "Docker + GCP Cloud Run"],
          ["DNS", "Cloudflare"],
          ["Newsletter", "Substack integration (colaberry.online)"],
          ["Podcast Transcripts", "Deepgram API"],
        ],
        [3200, 6160]
      ),

      // ===== 3. PLATFORM FEATURES =====
      new Paragraph({ children: [new PageBreak()] }),
      h1("3. Platform Features"),

      h2("3.1 AI Agent Catalog"),
      bullet("135+ enterprise AI agents with full detail pages"),
      bullet("Category filtering, search, department badges"),
      bullet("StickyTabBar navigation on detail pages"),
      bullet("Publisher bar with agent metadata"),

      h2("3.2 MCP Server Catalog"),
      bullet("300+ MCP (Model Context Protocol) servers"),
      bullet("Category-based filtering and search"),
      bullet("Detailed server profiles with integration info"),
      bullet("API-based infinite scroll for 4000+ entries"),

      h2("3.3 Skills Catalog"),
      bullet("400+ AI skills across 10-category taxonomy"),
      bullet("Skills detail pages with capability descriptions"),
      bullet("Agent reviews system (agents review skills)"),

      h2("3.4 Knowledge Graph & Ontology"),
      bullet("3-Layer Ontology Pattern (Taxonomy \u2192 Relation Graph \u2192 Collections)"),
      bullet("Interactive force-graph visualizations (react-force-graph-2d)"),
      bullet("SVG ontology diagrams for all 5 content types"),
      bullet("Cross-type relationship mapping"),
      bullet("CMS-managed collections with static fallback"),

      h2("3.5 Industry Workspaces"),
      bullet("8 domain-specific industry pages"),
      bullet("Agent and use-case counts per industry"),

      h2("3.6 Resources"),
      bullet("Podcasts with episode player and Deepgram transcripts"),
      bullet("Books listing (Trust Before Intelligence)"),
      bullet("White papers"),
      bullet("Buzzsprout sync for podcast episodes"),

      h2("3.7 Enterprise Features"),
      bullet("Book a Demo form with multi-layer bot defense"),
      bullet("Newsletter integration (Substack API via colaberry.online)"),
      bullet("Dark mode (default) with light mode toggle"),
      bullet("Cookie compliance banner"),
      bullet("Scroll-triggered counting animations"),
      bullet("Guided tour for MCP detail pages"),

      // ===== 4. DESIGN SYSTEM =====
      new Paragraph({ children: [new PageBreak()] }),
      h1("4. Design System"),
      p("The Colaberry AI design system follows a strict monochrome + coral accent approach:"),
      makeTable(
        ["Token", "Light Mode", "Dark Mode"],
        [
          ["Background", "#FFFFFF", "#09090B (zinc-950)"],
          ["Surface", "#FAFAFA (zinc-50)", "#18181B (zinc-900)"],
          ["Text Primary", "#18181B (zinc-900)", "#FAFAFA (zinc-50)"],
          ["Text Muted", "#52525B (zinc-600)", "#A1A1AA (zinc-400)"],
          ["Border", "#E4E4E7 (zinc-200)", "#3F3F46 (zinc-700)"],
          ["Accent (coral)", "#DC2626", "#F87171"],
        ],
        [2400, 3480, 3480]
      ),
      spacer(),
      bullet("Inter font family throughout"),
      bullet("Dark mode as default enterprise theme"),
      bullet("Component library: 38+ React components"),
      bullet("Locked theming standard: zinc + coral only"),
      bullet("Forbidden colors: emerald, blue, amber, slate"),

      // ===== 5. AEO =====
      h1("5. AEO (Answer Engine Optimization)"),
      p("colaberry.ai is built for AI answer engines (ChatGPT, Claude, Perplexity), not just Google:"),
      makeTable(
        ["Feature", "Route", "Purpose"],
        [
          ["/llms.txt", "/llms.txt", "Dynamic AI crawler manifest with live CMS stats"],
          ["/llms-full.txt", "/llms-full.txt", "Complete content index with summaries"],
          ["robots.txt", "/robots.txt", "Welcomes GPTBot, ClaudeBot, PerplexityBot"],
          ["FAQ Schema", "/", "FAQPage JSON-LD for direct AI citation"],
          ["Quick Answers", "Catalog pages", "AeoQuickAnswer components"],
        ],
        [2400, 2400, 4560]
      ),

      // ===== 6. SECURITY =====
      new Paragraph({ children: [new PageBreak()] }),
      h1("6. Security"),
      p("Comprehensive security auditing with 12 specialized agents:"),
      bullet("12-agent security audit completed (GO result)"),
      bullet("HTML sanitization with allowed URL schemes (http, https, mailto)"),
      bullet("Multi-layer bot defense for forms (AEO-safe)"),
      bullet("Timing-safe comparisons for authentication"),
      bullet("XSS protection headers"),
      bullet("Dockerfile hardening (non-root user, minimal image)"),
      bullet("IP clearance audit (15 agents) \u2014 all third-party references cleared"),
      bullet("CRITICAL fixes: IP spoofing, XSS on tools page, email header injection"),
      bullet("Next.js upgraded to patch 5 CVEs"),
      bullet("25 security vulnerabilities fixed across API routes, Docker, and CSP"),

      // ===== 7. QA =====
      h1("7. Quality Assurance"),
      bullet("Playwright e2e smoke tests for production go-live"),
      bullet("TypeScript strict mode \u2014 0 errors"),
      bullet("ESLint \u2014 0 warnings"),
      bullet("Production build \u2014 SUCCESS"),
      bullet("12-agent QA audit sign-off (March 27, 2026)"),
      bullet("WCAG 2.2 Level AA accessibility audit"),
      bullet("Core Web Vitals optimization (LCP, CLS, INP)"),
      bullet("API performance testing (28 Postman test cases)"),

      // ===== 8. INFRASTRUCTURE =====
      h1("8. Infrastructure"),
      makeTable(
        ["Environment", "Service", "URL"],
        [
          ["Production (Frontend)", "colaberry-ai-prod", "colaberry.ai"],
          ["Production (CMS)", "colaberry-ai-cms-prod", "cms.colaberry.ai"],
          ["Staging (Frontend)", "colaberry-ai-staging", "dev.colaberry.ai"],
          ["Staging (CMS)", "colaberry-ai-cms-staging", "dev-cms.colaberry.ai"],
        ],
        [2800, 3200, 3360]
      ),
      spacer(),
      bullet("Region: us-east1 (GCP Cloud Run)"),
      bullet("CI/CD: Cloud Build auto-deploy on push to Release-1.0"),
      bullet("DNS: Cloudflare (4 A records + CNAME for cms/www)"),
      bullet("SSL: GCP managed certificates (Let's Encrypt)"),
      bullet("Container: Docker with non-root user"),

      // ===== 9. ROUTES =====
      new Paragraph({ children: [new PageBreak()] }),
      h1("9. Routes & Pages (53+)"),
      makeTable(
        ["Route", "Description"],
        [
          ["/", "Homepage with trending agents, FAQ schema"],
          ["/aixcelerator", "Platform hub"],
          ["/aixcelerator/agents", "Agent catalog (135+)"],
          ["/aixcelerator/agents/[slug]", "Agent detail page"],
          ["/aixcelerator/agents/ontology", "Agent ontology graph"],
          ["/aixcelerator/mcp", "MCP server catalog (300+)"],
          ["/aixcelerator/mcp/[slug]", "MCP detail page"],
          ["/aixcelerator/skills", "Skills catalog (400+)"],
          ["/aixcelerator/skills/[slug]", "Skill detail page"],
          ["/aixcelerator/skills/ontology", "Skills ontology graph"],
          ["/aixcelerator/ontology", "Platform knowledge graph"],
          ["/aixcelerator/ecosystem", "Platform ecosystem"],
          ["/aixcelerator/solution-stacks", "Solution stacks"],
          ["/industries", "8 industry workspaces"],
          ["/industries/[industry]", "Industry detail page"],
          ["/resources/podcasts", "Podcast episodes"],
          ["/resources/podcasts/[slug]", "Podcast detail + player"],
          ["/resources/books", "Books listing"],
          ["/resources/white-papers", "White papers"],
          ["/request-demo", "Book a Demo form"],
          ["/privacy", "Privacy policy"],
          ["/terms", "Terms of service"],
          ["/sitemap.xml", "Dynamic sitemap"],
          ["/robots.txt", "Bot-friendly robots.txt"],
          ["/llms.txt", "AI crawler manifest"],
          ["/llms-full.txt", "Complete AI content index"],
        ],
        [4000, 5360]
      ),

      // ===== 10. KEY COMMITS =====
      new Paragraph({ children: [new PageBreak()] }),
      h1("10. Key Commits (Release Highlights)"),
      makeTable(
        ["Hash", "Description"],
        [
          ["2212eb6", "Fix lint errors + ontology dark mode contrast"],
          ["df22ca8", "IP clearance + security hardening for go-live"],
          ["d5d0c75", "Security: bot-defense fix + timing attack + Dockerfile hardening"],
          ["e150d28", "Add Playwright e2e smoke tests for production go-live"],
          ["99bb3ed", "Premium agent detail: StickyTabBar, publisher bar, tab scroll"],
          ["4cb19e7", "Multi-layer bot defense for forms (AEO-safe)"],
          ["821cd2e", "Polish SVG ontology diagrams with coral theme accents"],
          ["1500bef", "Launch polish: featured signals, LLM files, contrast fixes"],
          ["c0c8d57", "Fix CRITICAL IP spoofing + upgrade Next.js to patch 5 CVEs"],
          ["2779a85", "Fix 25 security vulnerabilities across API routes, Docker, and CSP"],
          ["8eb13c9", "Optimize Core Web Vitals: LCP, CLS, ISR, bundle size"],
          ["07da7d0", "Add vizuara-inspired hero animations: floating nodes, ring pulse"],
          ["d4d23c6", "Default to dark mode for premium AI platform feel"],
          ["1669de4", "Complete SkillNet pattern for all 5 content types + SDD framework"],
          ["024d5ec", "Add MCP detail page redesign, telemetry, tools, guided tour"],
        ],
        [1400, 7960]
      ),

      // ===== 11. POST-LAUNCH =====
      h1("11. Post-Launch Tasks"),
      makeTable(
        ["Task", "Owner", "Status"],
        [
          ["Submit sitemap to Google Search Console", "Sai", "Pending"],
          ["Set up Cloud Monitoring alerts + uptime check", "Sai", "Pending"],
          ["Request Google re-index of colaberry.ai", "Sai", "Pending"],
          ["LinkedIn launch announcement", "Amitav", "Pending"],
          ["Webhook setup for demo form email capture", "Ali", "Pending"],
          ["CMS admin access provisioning", "Amitav / Ram", "Pending"],
        ],
        [4800, 2400, 2160]
      ),

      // ===== 12. FULL COMMIT HISTORY =====
      new Paragraph({ children: [new PageBreak()] }),
      h1("12. Full Commit History (405 commits)"),
      p("All commits on the Release-1.0 branch, categorized by type:"),
      spacer(),
      ...commitSections,
    ]
  }]
});

const outPath = "/Users/colaberry016gmail.com/Desktop/Projects/colaberry-ai-fork/docs/Release-1.0-Production-Release.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log("Created:", outPath, `(${(buffer.length / 1024).toFixed(0)} KB)`);
});
