const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("Capturing proof screenshots for 4-Bullet Editor & Direct Social Media Publisher...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1200, deviceScaleFactor: 2 });

  await page.goto('http://127.0.0.1:3007', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  const artifactDir = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424';
  const UIOutPath = path.join(artifactDir, 'bullet_editor_live_proof.png');
  await page.screenshot({ path: UIOutPath, fullPage: true });
  console.log("Saved full UI screenshot to:", UIOutPath);

  // Trigger modal
  await page.evaluate(() => {
    openDirectPublishModal();
  });
  await new Promise(r => setTimeout(r, 800));

  const ModalOutPath = path.join(artifactDir, 'direct_publisher_modal_proof.png');
  await page.screenshot({ path: ModalOutPath });
  console.log("Saved modal screenshot to:", ModalOutPath);

  await browser.close();
  console.log("Done!");
})();
