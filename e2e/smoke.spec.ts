import { test, expect } from "@playwright/test";

/* ──────────────────────────────────────────────────────────────────────
 * Colaberry AI — Production Smoke Tests
 * Run: BASE_URL=https://colaberry.ai npx playwright test
 * ────────────────────────────────────────────────────────────────────── */

// ── 1. Homepage ──────────────────────────────────────────────────────

test.describe("Homepage", () => {
  test("loads with 200 and correct title", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Colaberry AI/i);
  });

  test("renders hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("has no SkillNet references in visible text", async ({ page }) => {
    await page.goto("/");
    const body = await page.locator("body").textContent();
    expect(body?.toLowerCase()).not.toContain("skillnet");
  });

  test("dark mode toggle works", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
    // Find and click the theme toggle button
    const toggle = page.locator('button[aria-label*="theme"], button[aria-label*="mode"], button[aria-label*="Toggle"]').first();
    if (await toggle.isVisible()) {
      await toggle.click();
      await expect(html).not.toHaveClass(/dark/);
      await toggle.click();
      await expect(html).toHaveClass(/dark/);
    }
  });
});

// ── 2. Catalog Pages ─────────────────────────────────────────────────

const catalogs = [
  { name: "Agents", path: "/aixcelerator/agents", minCards: 10 },
  { name: "MCP Servers", path: "/aixcelerator/mcp", minCards: 10 },
  { name: "Skills", path: "/aixcelerator/skills", minCards: 10 },
  { name: "Tools", path: "/aixcelerator/tools", minCards: 5 },
  { name: "Podcasts", path: "/resources/podcasts", minCards: 5 },
];

for (const { name, path, minCards } of catalogs) {
  test.describe(`${name} Catalog`, () => {
    test(`${name} listing loads with 200`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
    });

    test(`${name} has at least ${minCards} cards`, async ({ page }) => {
      await page.goto(path);
      // Cards use .catalog-card or article/a elements in grid
      const cards = page.locator(".catalog-card, .stagger-grid > a, .stagger-grid > article, .stagger-grid > div > a");
      await expect(cards.first()).toBeVisible({ timeout: 10_000 });
      expect(await cards.count()).toBeGreaterThanOrEqual(minCards);
    });
  });
}

// ── 3. Detail Pages ──────────────────────────────────────────────────

const detailPages = [
  { name: "Agent detail", path: "/aixcelerator/agents/access-control-guardian-agent" },
  { name: "Skill detail", path: "/aixcelerator/skills/web-search" },
  { name: "MCP detail", path: "/aixcelerator/mcp/github" },
];

for (const { name, path } of detailPages) {
  test(`${name} page loads`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });
}

// ── 4. Platform Pages ────────────────────────────────────────────────

test.describe("Platform Pages", () => {
  test("Ontology page loads", async ({ page }) => {
    const res = await page.goto("/aixcelerator/ontology");
    expect(res?.status()).toBe(200);
  });

  test("Ecosystem Graph page loads", async ({ page }) => {
    const res = await page.goto("/aixcelerator/ecosystem");
    expect(res?.status()).toBe(200);
  });

  test("Solution Stacks page loads", async ({ page }) => {
    const res = await page.goto("/aixcelerator/solution-stacks");
    expect(res?.status()).toBe(200);
  });

  test("Request Demo page loads", async ({ page }) => {
    const res = await page.goto("/request-demo");
    expect(res?.status()).toBe(200);
    // Form may use form tag or div-based wizard
    await expect(page.locator("form, [role='form'], input[type='email'], input[name='email']").first()).toBeVisible({ timeout: 10_000 });
  });

  test("Search page loads", async ({ page }) => {
    const res = await page.goto("/search?q=agent");
    expect(res?.status()).toBe(200);
  });
});

// ── 5. SEO & AEO ────────────────────────────────────────────────────

test.describe("SEO & AEO", () => {
  test("sitemap.xml returns valid XML", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("<loc>");
  });

  test("robots.txt allows crawlers", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("User-agent:");
    expect(body).toContain("Sitemap:");
  });

  test("llms.txt returns AI manifest", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Colaberry AI");
    expect(body.toLowerCase()).not.toContain("skillnet");
  });

  test("homepage has JSON-LD structured data", async ({ page }) => {
    await page.goto("/");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd.first()).toBeAttached();
    const content = await jsonLd.first().textContent();
    expect(content).toContain("FAQPage");
  });

  test("homepage has Open Graph meta tags", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:title"]')).toBeAttached();
    await expect(page.locator('meta[property="og:description"]')).toBeAttached();
    await expect(page.locator('meta[property="og:image"]')).toBeAttached();
  });
});

// ── 6. Redirects ─────────────────────────────────────────────────────

test.describe("Legacy Redirects", () => {
  test("/episodes redirects to /resources/podcasts", async ({ request }) => {
    const res = await request.get("/episodes", { maxRedirects: 0 });
    expect([301, 308]).toContain(res.status());
    expect(res.headers()["location"]).toContain("/resources/podcasts");
  });
});

// ── 7. Security Headers ──────────────────────────────────────────────

test.describe("Security Headers", () => {
  test("has essential security headers", async ({ request }) => {
    const res = await request.get("/");
    const headers = res.headers();
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-xss-protection"]).toBe("0");
    expect(headers["referrer-policy"]).toBeTruthy();
  });

  test("does not expose X-Powered-By", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-powered-by"]).toBeUndefined();
  });
});

// ── 8. IP Clearance ──────────────────────────────────────────────────

test.describe("IP Clearance", () => {
  const pagesToCheck = [
    "/",
    "/aixcelerator/ontology",
    "/aixcelerator/skills",
    "/llms.txt",
  ];

  for (const path of pagesToCheck) {
    test(`${path} has no SkillNet references`, async ({ request }) => {
      const res = await request.get(path);
      const body = await res.text();
      expect(body.toLowerCase()).not.toContain("skillnet-powered");
      expect(body.toLowerCase()).not.toContain("skillnet knowledge graph");
    });
  }

  test("no ZBrain agents in catalog", async ({ page }) => {
    await page.goto("/aixcelerator/agents");
    const body = await page.locator("body").textContent();
    expect(body?.toLowerCase()).not.toContain("zbrain");
  });
});

// ── 9. Forms ─────────────────────────────────────────────────────────

test.describe("Forms", () => {
  test("Book a Demo form renders all fields", async ({ page }) => {
    await page.goto("/request-demo");
    await expect(page.locator('input[name="name"], input[placeholder*="name" i]').first()).toBeVisible();
    await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
  });
});

// ── 10. Responsive ───────────────────────────────────────────────────

test.describe("Responsive", () => {
  test("homepage renders on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("navigation hamburger visible on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const hamburger = page.locator('button[aria-label*="menu" i], button[aria-label*="Toggle menu"]').first();
    await expect(hamburger).toBeVisible();
  });
});
