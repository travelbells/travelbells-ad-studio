const puppeteer = require('puppeteer');
const path = require('path');
const os = require('os');
const fs = require('fs');

(async () => {
  console.log("Launching test browser...");
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'puppeteer_test_ui_'));
  
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: tempDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  console.log("Navigating to http://127.0.0.1:3007 ...");
  await page.goto('http://127.0.0.1:3007', { waitUntil: 'networkidle2' });

  // Test 1: User's exact prompt from screenshot/request
  const promptText = "Work Permit Ending? Don't Exit, Upgrade to Study Visa with PGWP pathway in Canada";
  console.log(`\n--- TEST 1: Typing prompt: "${promptText}" ---`);

  await page.evaluate(() => {
    const input = document.getElementById('quick-tagline-input');
    if (input) input.value = '';
  });
  await page.type('#quick-tagline-input', promptText);

  console.log("Clicking auto-generate button...");
  await page.click('.hero-submit-btn');

  // Wait 4 seconds for generation
  await new Promise(r => setTimeout(r, 4000));

  // Check 1:1 Feed Post preview image
  const feedImg = await page.evaluate(() => {
    const img = document.querySelector('#canvas-render-box img');
    return img ? {
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      srcStart: img.src.substring(0, 60),
      srcLength: img.src.length
    } : null;
  });
  console.log("1:1 Feed Post Image Info:", feedImg);

  await page.screenshot({ path: '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424/live_ui_1_1_feed.png' });

  // Click 9:16 Story format tab
  console.log("\nClicking '9:16 Story / TikTok (1080×1920)' format tab...");
  const storyBtn = await page.$('.fmt-pill:nth-child(2)');
  if (storyBtn) {
    await storyBtn.click();
    await new Promise(r => setTimeout(r, 1500));
    const storyImg = await page.evaluate(() => {
      const img = document.querySelector('#canvas-render-box img');
      return img ? { naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, complete: img.complete } : null;
    });
    console.log("9:16 Story Image Info:", storyImg);
    await page.screenshot({ path: '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424/live_ui_9_16_story.png' });
  }

  // Click 16:9 Banner format tab
  console.log("\nClicking '16:9 Banner (1200×630)' format tab...");
  const bannerBtn = await page.$('.fmt-pill:nth-child(3)');
  if (bannerBtn) {
    await bannerBtn.click();
    await new Promise(r => setTimeout(r, 1500));
    const bannerImg = await page.evaluate(() => {
      const img = document.querySelector('#canvas-render-box img');
      return img ? { naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, complete: img.complete } : null;
    });
    console.log("16:9 Banner Image Info:", bannerImg);
    await page.screenshot({ path: '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424/live_ui_16_9_banner.png' });
  }

  // Test 2: Custom short courses prompt
  console.log(`\n--- TEST 2: Testing custom prompt: "Short term courses in Canada" ---`);
  await page.evaluate(() => {
    const input = document.getElementById('quick-tagline-input');
    if (input) input.value = '';
  });
  await page.type('#quick-tagline-input', 'Short term courses in Canada');
  await page.click('.hero-submit-btn');
  await new Promise(r => setTimeout(r, 4000));

  const test2Img = await page.evaluate(() => {
    const img = document.querySelector('#canvas-render-box img');
    return img ? { naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, complete: img.complete } : null;
  });
  console.log("Short term courses Image Info:", test2Img);

  await browser.close();
  console.log("\nAll live UI tests completed successfully!");
})();
