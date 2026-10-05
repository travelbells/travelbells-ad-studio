const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('http://127.0.0.1:3006', { waitUntil: 'networkidle0' });

  // 1. Enter prompt "EXPRESS ENTRY PR DRAW"
  await page.type('#quick-tagline-input', 'EXPRESS ENTRY PR DRAW');
  await page.click('.hero-submit-btn');

  // Wait 4.5 seconds for campaign generation
  await new Promise(r => setTimeout(r, 4500));

  // 2. Click "📜 CICC Seal" watermark chip
  const ciccChip = await page.$('.watermark-chip:nth-child(3)');
  if (ciccChip) {
    await ciccChip.click();
    console.log("Clicked CICC Seal watermark chip");
  }

  // Wait 2.5 seconds for live re-render
  await new Promise(r => setTimeout(r, 3000));

  // 3. Take screenshot of canvas-render-box
  const canvasBox = await page.$('#canvas-render-box');
  if (canvasBox) {
    const screenshotPath = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424/cicc_watermark_preview.png';
    await canvasBox.screenshot({ path: screenshotPath });
    console.log("Screenshot of CICC watermark saved to:", screenshotPath);
  }

  await browser.close();
})();
