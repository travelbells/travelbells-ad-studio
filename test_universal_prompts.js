const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const testPrompts = [
  'Need work permit after graduation in Ontario for international students',
  'Are you asylum seeker, know your rights, always choose authorized consultant for your refugee claim',
  'Hiring construction workers and electricians with LMIA job offer in Alberta'
];

(async () => {
  console.log("Testing Universal Prompt Engine with 3 random user prompts...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const artifactDir = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424';

  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    console.log(`\nTesting Prompt ${i + 1}: "${prompt}"`);

    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1100, deviceScaleFactor: 2 });
    await page.goto('http://127.0.0.1:3007', { waitUntil: 'networkidle0' });

    await page.evaluate(() => {
      document.querySelector('#quick-tagline-input').value = '';
    });
    await page.type('#quick-tagline-input', prompt);
    await page.click('.hero-submit-btn');

    await new Promise(r => setTimeout(r, 3500));

    const imgElement = await page.$('#main-canvas-img');
    const outPath = path.join(artifactDir, `universal_prompt_${i + 1}_proof.png`);

    if (imgElement) {
      await imgElement.screenshot({ path: outPath });
      console.log(`Saved proof ${i + 1} to: ${outPath}`);
    }

    await page.close();
  }

  await browser.close();
  console.log("\nFinished testing all prompts!");
})();
