const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching test browser...");
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      `--user-data-dir=/tmp/test_chrome_${Date.now()}`
    ]
  });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  console.log("Navigating to http://127.0.0.1:3007 ...");
  await page.goto('http://127.0.0.1:3007', { waitUntil: 'networkidle2' });

  // Type prompt into #quick-tagline-input
  const promptText = "Work Permit Ending? Don't Exit, Upgrade to Study Visa with PGWP pathway in Canada";
  console.log("Typing prompt into #quick-tagline-input:", promptText);
  
  await page.evaluate(() => {
    const input = document.getElementById('quick-tagline-input');
    if (input) input.value = '';
  });
  await page.type('#quick-tagline-input', promptText);

  // Click auto-generate button
  console.log("Clicking auto-generate button...");
  await page.click('.hero-submit-btn');

  // Wait 8 seconds for generation
  await new Promise(r => setTimeout(r, 8000));

  // Take screenshot of whole page
  await page.screenshot({ path: '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424/test_result_after_generate.png', fullPage: true });

  // Check the image in #canvas-render-box
  const imgInfo = await page.evaluate(() => {
    const img = document.querySelector('#canvas-render-box img');
    if (!img) return { found: false };
    return {
      found: true,
      srcStart: img.src ? img.src.substring(0, 80) : null,
      srcLength: img.src ? img.src.length : 0,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight
    };
  });

  console.log("Image evaluation result:", JSON.stringify(imgInfo, null, 2));

  // Also check format buttons: 1:1 Feed Post (square), 9:16 Story (vertical), 16:9 Banner (horizontal)
  const formatTabResults = {};
  
  // Test clicking on each format tab
  const tabs = [
    { name: '1:1 Feed Post', selector: '[data-format="square"]' },
    { name: '9:16 Story', selector: '[data-format="vertical"]' },
    { name: '16:9 Banner', selector: '[data-format="horizontal"]' }
  ];

  for (const tab of tabs) {
    const tabEl = await page.$(tab.selector);
    if (tabEl) {
      console.log(`Clicking format tab: ${tab.name}`);
      await tabEl.click();
      await new Promise(r => setTimeout(r, 2000));
      const res = await page.evaluate(() => {
        const img = document.querySelector('#canvas-render-box img');
        return img ? { naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, complete: img.complete, srcLength: img.src.length } : null;
      });
      formatTabResults[tab.name] = res;
    } else {
      formatTabResults[tab.name] = "Tab selector not found";
    }
  }

  console.log("Format Tab Results:", JSON.stringify(formatTabResults, null, 2));

  await browser.close();
})();
