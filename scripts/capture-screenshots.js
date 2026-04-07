const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://www.colaberry.ai';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots-notebooklm');

const PAGES = [
  { name: 'homepage', path: '/' },
  { name: 'agents-catalog', path: '/aixcelerator/agents' },
  { name: 'agent-detail', path: '/aixcelerator/agents/access-control-guardian-agent' },
  { name: 'mcp-catalog', path: '/aixcelerator/mcp' },
  { name: 'skills-catalog', path: '/aixcelerator/skills' },
  { name: 'podcasts', path: '/resources/podcasts' },
  { name: 'ontology', path: '/aixcelerator/ontology' },
  { name: 'request-demo', path: '/request-demo' },
];

async function scrollFullPage(page) {
  await page.evaluate(async () => {
    const totalHeight = document.body.scrollHeight;
    let currentPos = 0;
    while (currentPos < totalHeight) {
      currentPos += 400;
      window.scrollTo(0, currentPos);
      await new Promise(r => setTimeout(r, 200));
    }
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 500));
  });
}

async function capturePageSections(page, pageName, mode) {
  const viewportHeight = 826;
  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const sections = Math.ceil(totalHeight / (viewportHeight * 0.8));

  for (let i = 0; i < Math.min(sections, 6); i++) {
    const scrollY = i * viewportHeight * 0.8;
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await new Promise(r => setTimeout(r, 600));

    const filename = `${pageName}-${mode}-section${i + 1}.png`;
    await page.screenshot({ path: path.join(OUTPUT_DIR, filename), type: 'png' });
    console.log(`  Captured: ${filename}`);
  }
}

async function toggleDarkMode(page) {
  await page.evaluate(() => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
  await new Promise(r => setTimeout(r, 500));
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1486, height: 826 },
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  for (const { name, path: pagePath } of PAGES) {
    const url = `${BASE_URL}${pagePath}`;
    console.log(`\nCapturing: ${name} (${url})`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 1000));

    // Dismiss cookie banner if present
    await page.evaluate(() => {
      const banner = document.querySelector('[class*="cookie"], [id*="cookie"], [class*="consent"], [id*="consent"]');
      if (banner) banner.remove();
      // Also try removing by common cookie banner patterns
      document.querySelectorAll('div').forEach(el => {
        if (el.textContent.includes('Cookie Settings') && el.offsetHeight > 0 && el.offsetHeight < 400) {
          el.remove();
        }
      });
    });

    // Ensure light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    await new Promise(r => setTimeout(r, 300));

    // Scroll to trigger lazy loading
    await scrollFullPage(page);

    // Light mode screenshots
    console.log(`  Light mode...`);
    await capturePageSections(page, name, 'light');

    // Switch to dark mode
    await toggleDarkMode(page);
    await new Promise(r => setTimeout(r, 500));

    // Dark mode screenshots
    console.log(`  Dark mode...`);
    await capturePageSections(page, name, 'dark');

    // Reset to light for next page
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
  }

  await browser.close();

  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png'));
  console.log(`\nDone! ${files.length} screenshots saved to: ${OUTPUT_DIR}`);
})();
