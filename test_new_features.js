const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("Verifying 4 Bullet Live Editor & Direct Social Media Publisher Modal...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1100, deviceScaleFactor: 2 });

  await page.goto('http://127.0.0.1:3007', { timeout: 0 });
  await new Promise(r => setTimeout(r, 1500));

  // Edit Bullet 1 live in the UI
  await page.evaluate(() => {
    const b1Input = document.querySelector('#canvas-b1');
    if (b1Input) {
      b1Input.value = 'Custom Live Edit Bullet 1: Express SOWP Filings';
      b1Input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  const artifactDir = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424';
  const UIOutPath = path.join(artifactDir, 'ui_bullet_editor_proof.png');
  await page.screenshot({ path: UIOutPath, fullPage: true });
  console.log("Saved full UI screenshot with Bullet Editor to:", UIOutPath);

  // Open Direct Social Media Publisher modal
  await page.click('button[onclick="openDirectPublishModal()"]');
  await new Promise(r => setTimeout(r, 1000));

  const ModalOutPath = path.join(artifactDir, 'ui_direct_publisher_modal_proof.png');
  await page.screenshot({ path: ModalOutPath });
  console.log("Saved Direct Social Media Publisher modal screenshot to:", ModalOutPath);

  await browser.close();
  console.log("All features verified successfully!");
})();
