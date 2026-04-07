#!/usr/bin/env node
/**
 * Capture brand-preview page as a PDF for sales presentations.
 * Usage: node scripts/capture-brand-pdf.js
 * Requires: dev server running on localhost:3000
 */
const puppeteer = require("puppeteer");
const path = require("path");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set viewport wide enough for the full layout
  await page.setViewport({ width: 1280, height: 900 });

  // Navigate to brand-preview and wait for full render
  await page.goto("http://localhost:3000/brand-preview", {
    waitUntil: "networkidle0",
    timeout: 30000,
  });

  // Force dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
  });

  // Wait a moment for styles to apply
  await new Promise((r) => setTimeout(r, 1000));

  const outPath = path.resolve(__dirname, "../docs/ColaberryAI-Research-Labs-Logo-V7.pdf");

  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:8px;color:#a1a1aa;text-align:center;width:100%;">ColaberryAI Research Labs — Logo Design V7 — Confidential</div>',
    footerTemplate: '<div style="font-size:8px;color:#a1a1aa;text-align:center;width:100%;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
  });

  console.log(`PDF saved to: ${outPath}`);
  await browser.close();
})();
