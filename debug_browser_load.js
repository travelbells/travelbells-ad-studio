const puppeteer = require('puppeteer');

(async () => {
  console.log("Debugging browser page load...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  page.on('requestfailed', req => console.error('FAILED REQ:', req.url(), req.failure() ? req.failure().errorText : ''));

  try {
    const response = await page.goto('http://127.0.0.1:3007', { waitUntil: 'load', timeout: 10000 });
    console.log("Response status:", response.status());
  } catch (err) {
    console.error("Goto error:", err.message);
  }

  await browser.close();
})();
