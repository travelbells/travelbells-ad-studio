const fs = require('fs');
const path = require('path');
const { getPuppeteerBrowser } = require('./server.js');

async function run() {
  console.log("Fetching shared Puppeteer browser instance from server.js...");
  const browser = await getPuppeteerBrowser();
  if (!browser) {
    console.error("Could not get browser instance");
    process.exit(1);
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  const files = ['punjabi_creative_proof.svg', 'hindi_creative_proof.svg', 'arabic_creative_proof.svg'];

  for (const f of files) {
    const svgPath = path.join(__dirname, f);
    if (!fs.existsSync(svgPath)) continue;
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    await page.setContent(`<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;}</style></head><body>${svgContent}</body></html>`, { waitUntil: 'networkidle0' });
    
    const pngName = f.replace('.svg', '.png');
    const pngPath = path.join(__dirname, pngName);
    const pngBuffer = await page.screenshot({ type: 'png' });
    fs.writeFileSync(pngPath, pngBuffer);
    console.log(`✅ Saved PNG Screenshot: ${pngPath} (${pngBuffer.length} bytes)`);
  }

  await page.close();
  console.log("Done rendering PNG proofs!");
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
