const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('http://127.0.0.1:3006', { waitUntil: 'networkidle0' });

  // Take screenshot of the badge editor bar area
  const badgeBar = await page.$('.badge-editor-bar');
  if (badgeBar) {
    const screenshotPath = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424/badge_editor_ui.png';
    await badgeBar.screenshot({ path: screenshotPath });
    console.log("Badge bar screenshot saved to:", screenshotPath);
  }

  const fullScreenshotPath = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424/badge_editor_full_page.png';
  await page.screenshot({ path: fullScreenshotPath, fullPage: false });
  console.log("Full UI screenshot saved to:", fullScreenshotPath);

  await browser.close();
})();
