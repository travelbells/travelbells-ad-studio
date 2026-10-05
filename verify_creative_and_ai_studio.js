const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("Starting screenshot verification for refined layout...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 2 });

  await page.goto('http://127.0.0.1:3007', { waitUntil: 'networkidle0' });

  // Type exact target prompt
  await page.type('#quick-tagline-input', 'DO NOT LET YOUR CANADIAN STATUS EXPIRE');
  await page.click('.hero-submit-btn');

  await new Promise(r => setTimeout(r, 3500));

  // Switch to 16:9 Landscape Banner
  const fmtPills = await page.$$('.fmt-pill');
  if (fmtPills.length >= 3) {
    await fmtPills[2].click();
    await new Promise(r => setTimeout(r, 1000));
  }

  // Capture UI screenshot
  await page.screenshot({ path: path.join(__dirname, 'ui_refined_layout.png'), fullPage: true });
  console.log("Saved ui_refined_layout.png");

  // Also element screenshot of just the graphic preview card
  const previewCard = await page.$('#graphic-preview-container');
  if (previewCard) {
    await previewCard.screenshot({ path: path.join(__dirname, 'creative_preview_only.png') });
    console.log("Saved creative_preview_only.png");
  }

  await browser.close();
  console.log("Verification finished!");
})();
