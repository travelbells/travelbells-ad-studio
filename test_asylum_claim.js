const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("Testing exact user prompt: ARE YOU ASYLUM SEEKER...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1100, deviceScaleFactor: 2 });

  await page.goto('http://127.0.0.1:3007', { waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    document.querySelector('#quick-tagline-input').value = '';
  });
  await page.type('#quick-tagline-input', 'ARE YOU ASYLUM SEEKER,KNOW YOUR RIGHTS,ALWAYS CHOOSE AUTHORIZED CONSULTANT FOR YOUR REFUGEE CLAIM');
  await page.click('.hero-submit-btn');

  await new Promise(r => setTimeout(r, 4000));

  // Capture 1:1 Feed Post preview
  const imgElement = await page.$('#main-canvas-img');
  const artifactDir = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424';
  const outputPath1x1 = path.join(artifactDir, 'asylum_claim_1x1_proof.png');

  if (imgElement) {
    await imgElement.screenshot({ path: outputPath1x1 });
    console.log("Saved 1:1 asylum ad preview to:", outputPath1x1);
  }

  // Switch to 16:9 Landscape Banner
  const fmtPills = await page.$$('.fmt-pill');
  if (fmtPills.length >= 3) {
    await fmtPills[2].click();
    await new Promise(r => setTimeout(r, 1200));

    const outputPath16x9 = path.join(artifactDir, 'asylum_claim_16x9_proof.png');
    await imgElement.screenshot({ path: outputPath16x9 });
    console.log("Saved 16:9 asylum ad preview to:", outputPath16x9);
  }

  await browser.close();
})();
