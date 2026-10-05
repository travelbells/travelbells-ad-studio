const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("Generating brand new creative example to validate layout...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1100, deviceScaleFactor: 2 });

  await page.goto('http://127.0.0.1:3007', { waitUntil: 'networkidle0' });

  // Clear existing input and type a brand new prompt
  await page.evaluate(() => {
    document.querySelector('#quick-tagline-input').value = '';
  });
  await page.type('#quick-tagline-input', 'EXPRESS ENTRY PR DRAW FOR SKILLED TRADES & HEALTHCARE WORKERS');
  await page.click('.hero-submit-btn');

  // Wait for auto-generation
  await new Promise(r => setTimeout(r, 4000));

  // Select 16:9 Landscape Banner tab
  const fmtPills = await page.$$('.fmt-pill');
  if (fmtPills.length >= 3) {
    await fmtPills[2].click();
    await new Promise(r => setTimeout(r, 1200));
  }

  // Capture canvas image element screenshot
  const imgElement = await page.$('#main-canvas-img');
  const artifactDir = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424';
  const outputPath = path.join(artifactDir, 'new_creative_example_proof.png');
  const localPath = path.join(__dirname, 'new_creative_example_proof.png');

  if (imgElement) {
    await imgElement.screenshot({ path: localPath });
    fs.copyFileSync(localPath, outputPath);
    console.log("Successfully saved brand new creative screenshot to:", outputPath);
  } else {
    console.error("Could not find #main-canvas-img");
  }

  await browser.close();
})();
