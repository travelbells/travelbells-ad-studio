const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      pipe: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process'
      ]
    });
    console.log("Puppeteer browser launched with pipe: true!");
    await browser.close();
  } catch (e) {
    console.error("Puppeteer pipe error:", e);
  }
})();
