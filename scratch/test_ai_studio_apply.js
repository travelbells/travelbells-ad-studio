const puppeteer = require('puppeteer');
const path = require('path');
const os = require('os');
const fs = require('fs');

(async () => {
  console.log("Launching AI Custom Image Studio test browser...");
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'puppeteer_ai_studio_'));
  
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: tempDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  console.log("Navigating to http://127.0.0.1:3007 ...");
  await page.goto('http://127.0.0.1:3007', { waitUntil: 'networkidle2' });

  // Click AI Photo Generator preset "Graduate Student"
  console.log("Clicking AI photo preset chip 'Graduate Student'...");
  await page.click('.ai-preset-chips-row button:nth-child(2)');

  // Wait 4 seconds for AI photo generation
  await new Promise(r => setTimeout(r, 4000));

  // Check if AI variations are rendered
  const variationCount = await page.evaluate(() => {
    const cards = document.querySelectorAll('#ai-photo-result-container button');
    return cards.length;
  });
  console.log("Rendered AI variation cards count:", variationCount);

  // Click "Apply to Creative" on variation #2
  console.log("Clicking 'Apply to Creative' on variation #2...");
  const applyBtn = await page.$('#ai-photo-result-container button:nth-child(1)');
  if (applyBtn) {
    await applyBtn.click();
    await new Promise(r => setTimeout(r, 3000));
  }

  // Check main graphic preview box image
  const mainImgInfo = await page.evaluate(() => {
    const img = document.querySelector('#canvas-render-box img');
    return img ? {
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      srcStart: img.src ? img.src.substring(0, 60) : null
    } : null;
  });

  console.log("Main graphic preview info after applying AI photo:", mainImgInfo);

  await page.screenshot({ path: '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424/ai_studio_applied_result.png', fullPage: true });

  await browser.close();
  console.log("\nAI Studio Apply test finished cleanly!");
})();
