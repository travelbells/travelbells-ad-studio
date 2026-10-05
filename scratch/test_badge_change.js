const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('http://127.0.0.1:3006', { waitUntil: 'networkidle0' });

  // 1. Enter prompt "WORKING IN ONTRARIO"
  await page.type('#quick-tagline-input', 'WORKING IN ONTRARIO');
  await page.click('.hero-submit-btn');

  // Wait 4 seconds for full campaign generation
  await new Promise(r => setTimeout(r, 4500));

  // 2. Type "early" in the badge input
  const badgeInput = await page.$('#canvas-badge-input');
  if (badgeInput) {
    await page.evaluate(el => el.value = '', badgeInput);
    await badgeInput.type('early');
  }

  // Wait 2.5 seconds for live re-render
  await new Promise(r => setTimeout(r, 3000));

  // 3. Take screenshot of canvas-render-box
  const canvasBox = await page.$('#canvas-render-box');
  if (canvasBox) {
    const screenshotPath = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424/fixed_badge_rerender.png';
    await canvasBox.screenshot({ path: screenshotPath });
    console.log("Screenshot of fixed re-render saved to:", screenshotPath);
  }

  await browser.close();
})();
