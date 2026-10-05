const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('http://127.0.0.1:3006', { waitUntil: 'networkidle0' });

  // 1. Click "✨ Generate AI Photo" button in AI Custom Image Studio
  const generateBtn = await page.$('#btn-generate-ai-photo');
  if (generateBtn) {
    await generateBtn.click();
    console.log("Clicked Generate AI Photo button");
  }

  // Wait 4 seconds for AI image generation
  await new Promise(r => setTimeout(r, 4500));

  // 2. Click "🚀 Apply as Active Creative Photo"
  const applyBtn = await page.$('#ai-photo-actions button');
  if (applyBtn) {
    await applyBtn.click();
    console.log("Clicked Apply as Active Creative Photo");
  }

  // Wait 3.5 seconds for creative re-render across 3 formats
  await new Promise(r => setTimeout(r, 4000));

  // 3. Take screenshot of canvas-render-box
  const canvasBox = await page.$('#canvas-render-box');
  if (canvasBox) {
    const screenshotPath = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424/ai_photo_applied_preview.png';
    await canvasBox.screenshot({ path: screenshotPath });
    console.log("Screenshot of applied AI photo saved to:", screenshotPath);
  }

  await browser.close();
})();
