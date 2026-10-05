const puppeteer = require('puppeteer');

(async () => {
  console.log("=================================================");
  console.log("🧪 DIAGNOSING BROWSER FETCH & CONSOLE ERRORS 🧪");
  console.log("=================================================");

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });

  page.on('console', msg => console.log(' BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log(' BROWSER PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.log(' BROWSER REQUEST FAILED:', req.url(), req.failure().errorText));
  page.on('response', res => {
    if (res.url().includes('/api/')) {
      console.log(` BROWSER API RESPONSE [${res.status()}]: ${res.url()}`);
    }
  });

  console.log("1. Navigating to http://127.0.0.1:3007 ...");
  await page.goto('http://127.0.0.1:3007', { waitUntil: 'networkidle2' });

  console.log("2. Typing user message into #quick-tagline-input ...");
  const testInput = "Work Permit Ending? Don't Exit, Upgrade to Study Visa with PGWP pathway in Canada";
  await page.evaluate((val) => {
    const el = document.getElementById('quick-tagline-input');
    if (el) el.value = val;
  }, testInput);

  console.log("3. Clicking Auto-Generate Creative button ...");
  await page.click('.hero-submit-btn');

  console.log("4. Waiting 4 seconds to observe fetch & response ...");
  await new Promise(resolve => setTimeout(resolve, 4000));

  console.log("5. Testing 9:16 Story Tab ...");
  const storyBtn = await page.$('button[onclick*="story"]');
  if (storyBtn) {
    await storyBtn.click();
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log("5. Checking rendered graphic image inside #canvas-render-box ...");
  const boxState = await page.evaluate(() => {
    const box = document.getElementById('canvas-render-box');
    const img = box ? box.querySelector('img') : null;
    return {
      hasImg: !!img,
      imgSrcFull: img ? img.src : '',
      naturalWidth: img ? img.naturalWidth : 0,
      naturalHeight: img ? img.naturalHeight : 0,
      complete: img ? img.complete : false
    };
  });

  console.log("   Graphic Box Final State:", JSON.stringify(boxState, null, 2));
  await page.screenshot({ path: 'scratch/live_ui_diagnostics.png', fullPage: true });

  await browser.close();
})();
