const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("Direct HTML rendering proof...");
  const htmlPath = path.join(__dirname, 'public', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1200, deviceScaleFactor: 2 });

  await page.setContent(htmlContent);

  const artifactDir = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424';
  const UIOutPath = path.join(artifactDir, 'bullet_editor_live_proof.png');
  await page.screenshot({ path: UIOutPath, fullPage: true });
  console.log("Saved bullet_editor_live_proof.png");

  // Trigger modal
  await page.evaluate(() => {
    openDirectPublishModal();
  });
  await new Promise(r => setTimeout(r, 500));

  const ModalOutPath = path.join(artifactDir, 'direct_publisher_modal_proof.png');
  await page.screenshot({ path: ModalOutPath });
  console.log("Saved direct_publisher_modal_proof.png");

  await browser.close();
  console.log("Completed!");
})();
